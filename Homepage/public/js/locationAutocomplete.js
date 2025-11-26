// Wait for both DOM and Google Maps API to be ready
function initAutocomplete() {
    const input = document.getElementById("autocomplete");
    const latField = document.getElementById("latitude");
    const lngField = document.getElementById("longitude");
    const locationField = document.getElementById("location"); // city, state

    if (!input) {
        console.warn("Autocomplete input not found.");
        return;
    }

    if (!latField || !lngField || !locationField) {
        console.warn("Hidden form fields not found.");
        return;
    }

    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        setTimeout(initAutocomplete, 100);
        return;
    }

    // Check if PlaceAutocompleteElement is available
    if (!google.maps.places.PlaceAutocompleteElement) {
        console.error("PlaceAutocompleteElement not available. Make sure you're using the latest Google Maps API.");
        return;
    }

    // Create the PlaceAutocompleteElement
    const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();

    // Get the parent container
    const parentDiv = input.parentElement;
    
    // Set placeholder
    autocompleteElement.setAttribute('placeholder', input.getAttribute('placeholder') || 'Enter your location');
    
    // Create a wrapper div with relative positioning
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.display = 'block';
    
    // Replace the input with wrapper, then add autocomplete element inside
    parentDiv.replaceChild(wrapper, input);
    wrapper.appendChild(autocompleteElement);
    
    // Style the autocomplete element
    autocompleteElement.style.width = '100%';
    autocompleteElement.style.display = 'block';
    
    // Create a white background overlay positioned absolutely behind
    const backgroundOverlay = document.createElement('div');
    backgroundOverlay.style.position = 'absolute';
    backgroundOverlay.style.top = '0';
    backgroundOverlay.style.left = '0';
    backgroundOverlay.style.right = '0';
    backgroundOverlay.style.height = '100%';
    backgroundOverlay.style.minHeight = 'calc(1.5em + 0.75rem + 2px)';
    backgroundOverlay.style.backgroundColor = '#fff';
    backgroundOverlay.style.border = '1px solid #ced4da';
    backgroundOverlay.style.borderRadius = '0.375rem';
    backgroundOverlay.style.pointerEvents = 'none';
    backgroundOverlay.style.zIndex = '1';
    
    // Don't add border to autocomplete element - let the overlay handle it
    // The filter will invert colors, so we want the overlay border to show through
    
    // Make autocomplete element appear above overlay
    autocompleteElement.style.position = 'relative';
    autocompleteElement.style.zIndex = '2';
    autocompleteElement.style.backgroundColor = 'transparent';
    
    // Insert background overlay first (so it's behind)
    wrapper.insertBefore(backgroundOverlay, autocompleteElement);
    
    // Try to make the internal input transparent background and dark text
    const tryMakeTransparent = () => {
        try {
            const shadowRoot = autocompleteElement.shadowRoot || 
                              autocompleteElement.openOrClosedShadowRoot ||
                              autocompleteElement.__shadowRoot;
            if (shadowRoot) {
                const internalInput = shadowRoot.querySelector('input');
                if (internalInput) {
                    internalInput.style.backgroundColor = 'transparent';
                    internalInput.style.background = 'transparent';
                    internalInput.style.color = '#212529';
                    internalInput.style.setProperty('color', '#212529', 'important');
                    return true;
                }
            }
        } catch (err) {
            // Can't access
        }
        return false;
    };
    
    // Try multiple times to make it transparent
    setTimeout(() => tryMakeTransparent(), 100);
    setTimeout(() => tryMakeTransparent(), 500);
    setTimeout(() => tryMakeTransparent(), 1000);
    setTimeout(() => tryMakeTransparent(), 2000);
    
    autocompleteElement.addEventListener('focus', tryMakeTransparent);
    autocompleteElement.addEventListener('input', tryMakeTransparent);
    autocompleteElement.addEventListener('gmp-placeselect', tryMakeTransparent);
    
    // Also try to inject a style tag into shadow DOM if accessible
    const tryInjectStyle = () => {
        try {
            const shadowRoot = autocompleteElement.shadowRoot || 
                              autocompleteElement.openOrClosedShadowRoot ||
                              autocompleteElement.__shadowRoot;
            if (shadowRoot) {
                const existingStyle = shadowRoot.querySelector('style[data-custom-override]');
                if (!existingStyle) {
                    const styleTag = document.createElement('style');
                    styleTag.setAttribute('data-custom-override', 'true');
                    styleTag.textContent = `
                        input {
                            background-color: transparent !important;
                            background: transparent !important;
                            color: #212529 !important;
                        }
                    `;
                    shadowRoot.appendChild(styleTag);
                    return true;
                }
            }
        } catch (err) {
            // Can't access
        }
        return false;
    };
    
    setTimeout(() => tryInjectStyle(), 200);
    setTimeout(() => tryInjectStyle(), 1000);
    
    // Create a hidden input for form submission
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'autocomplete';
    hiddenInput.name = 'autocomplete';
    parentDiv.appendChild(hiddenInput);
    
    // Update hidden input whenever autocomplete value changes
    const updateHiddenInput = () => {
        const value = autocompleteElement.value || '';
        hiddenInput.value = value;
    };
    
    // Listen for input changes and place selection
    autocompleteElement.addEventListener('input', updateHiddenInput);
    autocompleteElement.addEventListener('change', updateHiddenInput);
    
    // Listen for place selection
    autocompleteElement.addEventListener('gmp-placeselect', async (event) => {
        try {
            const place = event.place;

            if (!place) {
                console.error("Place data missing.");
                return;
            }

            // Fetch place details with all needed fields
            await place.fetchFields({ 
                fields: ['location', 'addressComponents', 'formattedAddress'] 
            });

            // ---------------------------------
            // 1. Save exact lat/lng
            // ---------------------------------
            let lat, lng;
            
            if (place.location) {
                lat = place.location.lat;
                lng = place.location.lng;
            } else {
                console.error("Location coordinates not found in place object.");
                return;
            }

            latField.value = lat;
            lngField.value = lng;

            // Update the hidden input
            updateHiddenInput();

            // ---------------------------------
            // 2. Extract City + State
            // ---------------------------------
            const components = place.addressComponents || [];
            let city = "";
            let state = "";

            // Extract city and state from address components
            components.forEach(c => {
                const types = c.types || [];

                // Get text values
                const shortName = c.shortText || "";
                const longName = c.longText || "";

                // City: prefer locality, fallback to sublocality
                if (!city && (types.includes("locality") || types.includes("sublocality") || types.includes("sublocality_level_1"))) {
                    city = longName || shortName;
                }
                
                // State: administrative_area_level_1 (use short name for state code like "MA")
                if (!state && types.includes("administrative_area_level_1")) {
                    state = shortName || longName;
                }
            });

            // Format as "City, State"
            let cityState = "";
            if (city && state) {
                cityState = `${city}, ${state}`;
            } else if (city) {
                cityState = city;
            } else if (state) {
                cityState = state;
            } else {
                // Last resort: try to parse from formatted address
                const formattedAddress = place.formattedAddress || "";
                if (formattedAddress) {
                    // Try to extract city and state from the end of the address
                    const parts = formattedAddress.split(',').map(p => p.trim());
                    if (parts.length >= 2) {
                        const lastPart = parts[parts.length - 1];
                        const secondLastPart = parts[parts.length - 2];
                        
                        // If last part looks like a country, use second-to-last and third-to-last
                        if (lastPart.match(/^(USA|United States)$/i)) {
                            cityState = parts.length >= 3 
                                ? `${parts[parts.length - 3]}, ${parts[parts.length - 2].split(' ')[0]}` 
                                : secondLastPart;
                        } else {
                            // Extract state code from last part (might be "State ZIP")
                            const stateMatch = lastPart.match(/^([A-Z]{2})\s/);
                            if (stateMatch) {
                                cityState = `${secondLastPart}, ${stateMatch[1]}`;
                            } else {
                                cityState = `${secondLastPart}, ${lastPart.split(' ')[0]}`;
                            }
                        }
                    } else {
                        cityState = formattedAddress;
                    }
                }
            }

            locationField.value = cityState;
        } catch (error) {
            console.error("❌ Error processing place selection:", error);
        }
    });

    // Add form validation
    const form = parentDiv.closest('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            // Update hidden input one more time before submission
            updateHiddenInput();
            
            // Check if location is selected
            if (!locationField.value || !latField.value || !lngField.value) {
                e.preventDefault();
                alert('Please select a location from the autocomplete suggestions.');
                autocompleteElement.focus();
                return false;
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutocomplete);
} else {
    // DOM is already ready, but wait for Google Maps API
    initAutocomplete();
}
