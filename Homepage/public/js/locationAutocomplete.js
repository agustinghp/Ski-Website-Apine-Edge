// Helper function to show Bootstrap alert messages (like the message partial)
function showMessage(type, text) {
    // Find the card-body where messages are displayed
    const cardBody = document.querySelector('.card-body');
    if (!cardBody) return;
    
    // Remove any existing client-side messages
    const existingMessage = cardBody.querySelector('.client-message-alert');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create the alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show client-message-alert`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${text}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert at the top of card-body (where {{> message}} appears)
    const form = cardBody.querySelector('form');
    if (form) {
        cardBody.insertBefore(alertDiv, form);
    } else {
        cardBody.insertBefore(alertDiv, cardBody.firstChild);
    }
    
    // Scroll to the message
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

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
        let value = '';
        
        // Try to get value from shadow DOM
        try {
            const shadowRoot = autocompleteElement.shadowRoot || 
                              autocompleteElement.openOrClosedShadowRoot ||
                              autocompleteElement.__shadowRoot;
            if (shadowRoot) {
                const internalInput = shadowRoot.querySelector('input');
                if (internalInput) {
                    value = internalInput.value || '';
                    currentInputValue = value;
                }
            }
        } catch (err) {
            // Can't access shadow DOM
        }
        
        // Fallback to direct value property
        if (!value) {
            value = autocompleteElement.value || '';
            currentInputValue = value;
        }
        
        hiddenInput.value = value;
    };
    
    // Listen for input changes and place selection
    autocompleteElement.addEventListener('input', updateHiddenInput);
    autocompleteElement.addEventListener('change', updateHiddenInput);
    
    // Also listen for any other events that might indicate value changes
    autocompleteElement.addEventListener('gmp-suggestionsupdate', updateHiddenInput);
    
    // Handler function for place selection (used by both events)
    const handlePlaceSelection = async (event) => {
        console.log('Place selected event fired:', event);
        console.log('Event details:', {
            placePrediction: event.placePrediction,
            place: event.place,
            target: event.target
        });
        
        try {
            let place = null;
            
            // Try new API first (gmp-select with placePrediction)
            if (event.placePrediction && typeof event.placePrediction.toPlace === 'function') {
                place = await event.placePrediction.toPlace();
                console.log('Got place from placePrediction.toPlace()');
            }
            // Fallback to old API (gmp-placeselect with place)
            else if (event.place) {
                place = event.place;
                console.log('Got place from event.place');
            }

            if (!place) {
                console.error("Place data missing. Event structure:", event);
                return;
            }
            
            console.log('Place object:', place);

            // Fetch place details with all needed fields
            await place.fetchFields({ 
                fields: ['location', 'addressComponents', 'formattedAddress'] 
            });

            // ---------------------------------
            // 1. Save exact lat/lng
            // ---------------------------------
            let lat, lng;
            
            if (place.location) {
                // lat() and lng() are methods, not properties
                lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
                lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
            } else {
                console.error("Location coordinates not found in place object.");
                return;
            }

            // Re-fetch fields to ensure we have the latest references
            const currentLatField = document.getElementById('latitude');
            const currentLngField = document.getElementById('longitude');
            const currentLocationField = document.getElementById('location');
            
            if (currentLatField) {
                currentLatField.value = lat;
                console.log('Set latitude:', lat);
            }
            if (currentLngField) {
                currentLngField.value = lng;
                console.log('Set longitude:', lng);
            }

            // Update the hidden input
            updateHiddenInput();

            // ---------------------------------
            // 2. Extract City + State
            // ---------------------------------
            // State name to abbreviation mapping (fallback)
            const stateAbbreviations = {
                'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
                'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
                'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
                'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
                'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
                'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
                'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
                'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
                'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
                'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
                'district of columbia': 'DC'
            };
            
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
                
                // State: administrative_area_level_1 (always use short name for state code like "CO")
                if (!state && types.includes("administrative_area_level_1")) {
                    // Prefer shortName (abbreviation)
                    if (shortName) {
                        state = shortName.toUpperCase();
                    } else if (longName) {
                        // If we only have longName, try to convert it to abbreviation
                        const longNameLower = longName.toLowerCase();
                        state = stateAbbreviations[longNameLower] || longName;
                        // If it's already 2 characters, uppercase it; otherwise keep as-is (will be full name)
                        if (state.length === 2) {
                            state = state.toUpperCase();
                        }
                    }
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
                            // Extract state code from last part (might be "State ZIP" or "CO ZIP")
                            const stateMatch = lastPart.match(/^([A-Z]{2})\s/);
                            if (stateMatch) {
                                // Found two-letter state code
                                cityState = `${secondLastPart}, ${stateMatch[1]}`;
                            } else {
                                // Try to extract state abbreviation from full state name
                                // This is a fallback - ideally we'd have the abbreviation from address components
                                const stateAbbr = lastPart.split(' ')[0];
                                // If it looks like a state abbreviation (2 letters), use it
                                if (stateAbbr.length === 2 && /^[A-Z]{2}$/.test(stateAbbr.toUpperCase())) {
                                    cityState = `${secondLastPart}, ${stateAbbr.toUpperCase()}`;
                                } else {
                                    // Use the city only if we can't determine state abbreviation
                                    cityState = secondLastPart;
                                }
                            }
                        }
                    } else {
                        cityState = formattedAddress;
                    }
                }
            }

            if (currentLocationField) {
                currentLocationField.value = cityState;
                console.log('Set location:', cityState);
            }
            
            // Also update the hidden autocomplete input with the formatted address
            if (hiddenInput) {
                hiddenInput.value = place.formattedAddress || cityState || autocompleteElement.value;
            }
            
            console.log('Place selection completed successfully');
        } catch (error) {
            console.error("❌ Error processing place selection:", error);
        }
    };
    
    // Listen for both new and old events
    autocompleteElement.addEventListener('gmp-select', handlePlaceSelection);
    // Also listen for deprecated event as fallback
    autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelection);

    // Track the current input value from suggestions update event
    let currentInputValue = '';
    
    // Listen for suggestions update to track the input value
    autocompleteElement.addEventListener('gmp-suggestionsupdate', (event) => {
        // The event doesn't directly expose the value, but we can track it from input events
        console.log('Suggestions updated:', event);
    });
    
    // Helper function to get the value from the autocomplete element
    const getAutocompleteValue = () => {
        // Try to get value from the hidden input first (updated by input/change events)
        if (hiddenInput && hiddenInput.value) {
            return hiddenInput.value;
        }
        
        // Try to access the shadow DOM
        try {
            const shadowRoot = autocompleteElement.shadowRoot || 
                              autocompleteElement.openOrClosedShadowRoot ||
                              autocompleteElement.__shadowRoot;
            if (shadowRoot) {
                const internalInput = shadowRoot.querySelector('input');
                if (internalInput && internalInput.value) {
                    return internalInput.value;
                }
            }
        } catch (err) {
            console.error('Error accessing shadow DOM:', err);
        }
        
        // Fallback to tracked value or direct value property
        return currentInputValue || autocompleteElement.value || '';
    };

    // Helper function to geocode an address
    const geocodeAddress = async (address) => {
        return new Promise((resolve, reject) => {
            if (!google || !google.maps || !google.maps.Geocoder) {
                reject(new Error('Google Maps Geocoder not available'));
                return;
            }
            
            // State name to abbreviation mapping (fallback)
            const stateAbbreviations = {
                'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
                'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
                'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
                'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
                'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
                'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
                'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
                'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
                'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
                'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
                'district of columbia': 'DC'
            };
            
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                    const result = results[0];
                    const location = result.geometry.location;
                    const lat = location.lat();
                    const lng = location.lng();
                    
                    // Extract city and state from address components
                    const components = result.address_components || [];
                    let city = "";
                    let state = "";
                    
                    components.forEach(c => {
                        const types = c.types || [];
                        const shortName = c.short_name || "";
                        const longName = c.long_name || "";
                        
                        if (!city && (types.includes("locality") || types.includes("sublocality") || types.includes("sublocality_level_1"))) {
                            city = longName || shortName;
                        }
                        
                        if (!state && types.includes("administrative_area_level_1")) {
                            // Always prefer short_name (abbreviation)
                            if (shortName) {
                                state = shortName.toUpperCase();
                            } else if (longName) {
                                // If we only have longName, try to convert it to abbreviation
                                const longNameLower = longName.toLowerCase();
                                state = stateAbbreviations[longNameLower] || longName;
                                // If it's already 2 characters, uppercase it; otherwise keep as-is (will be full name)
                                if (state.length === 2) {
                                    state = state.toUpperCase();
                                }
                            }
                        }
                    });
                    
                    let cityState = "";
                    if (city && state) {
                        cityState = `${city}, ${state}`;
                    } else if (city) {
                        cityState = city;
                    } else if (state) {
                        cityState = state;
                    } else {
                        cityState = result.formatted_address || address;
                    }
                    
                    resolve({ lat, lng, location: cityState, formattedAddress: result.formatted_address });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    };

    // Add form validation
    const form = parentDiv.closest('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Always prevent default first, we'll submit manually if validation passes
            
            // Re-fetch the fields in case they were moved or recreated
            const currentLatField = document.getElementById('latitude');
            const currentLngField = document.getElementById('longitude');
            const currentLocationField = document.getElementById('location');
            
            // Update hidden input one more time before submission
            updateHiddenInput();
            
            // Check if location is selected - use the current field references
            let hasLat = currentLatField && currentLatField.value && currentLatField.value.trim() !== '';
            let hasLng = currentLngField && currentLngField.value && currentLngField.value.trim() !== '';
            let hasLocation = currentLocationField && currentLocationField.value && currentLocationField.value.trim() !== '';
            
            // If fields are empty, try to get value from autocomplete and geocode it
            if ((!hasLat || !hasLng || !hasLocation)) {
                const autocompleteValue = getAutocompleteValue();
                console.log('Autocomplete value from shadow DOM:', autocompleteValue);
                
                if (autocompleteValue && autocompleteValue.trim() !== '') {
                    try {
                        console.log('Attempting to geocode:', autocompleteValue);
                        const geocodeResult = await geocodeAddress(autocompleteValue);
                        
                        // Set the values from geocoding
                        if (currentLatField) currentLatField.value = geocodeResult.lat;
                        if (currentLngField) currentLngField.value = geocodeResult.lng;
                        if (currentLocationField) currentLocationField.value = geocodeResult.location;
                        
                        hasLat = true;
                        hasLng = true;
                        hasLocation = true;
                        
                        console.log('Geocoding successful:', geocodeResult);
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        showMessage('danger', 'Please select a location from the autocomplete suggestions. We could not find the location you entered.');
                        autocompleteElement.focus();
                        return false;
                    }
                } else {
                    // No value in autocomplete
                    showMessage('danger', 'Please select a location from the autocomplete suggestions.');
                    autocompleteElement.focus();
                    return false;
                }
            }
            
            // Debug logging
            console.log('Form submission validation (final):', {
                hasLat,
                hasLng,
                hasLocation,
                latValue: currentLatField?.value,
                lngValue: currentLngField?.value,
                locationValue: currentLocationField?.value
            });
            
            // If we still don't have the required values, prevent submission
            if (!hasLocation || !hasLat || !hasLng) {
                showMessage('danger', 'Please select a location from the autocomplete suggestions.');
                autocompleteElement.focus();
                return false;
            }
            
            // All validation passed, submit the form
            form.submit();
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
