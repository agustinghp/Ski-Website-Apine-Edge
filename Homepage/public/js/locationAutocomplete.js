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

    if (!input || !latField || !lngField || !locationField) {
        return;
    }

    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        setTimeout(initAutocomplete, 100);
        return;
    }

    if (!google.maps.places.PlaceAutocompleteElement) {
        return;
    }

    // Create the PlaceAutocompleteElement
    const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();
    
    // Get the parent container
    const parentDiv = input.parentElement;
    
    // Set placeholder
    autocompleteElement.setAttribute('placeholder', input.getAttribute('placeholder') || 'Enter your location');
    
    // Force light theme - try multiple ways
    try {
        autocompleteElement.setAttribute('theme', 'light');
    } catch (e) {}
    
    // Set CSS variables directly on the element
    autocompleteElement.style.setProperty('--gmpx-color-surface', '#fff', 'important');
    autocompleteElement.style.setProperty('--gmpx-color-on-surface', '#212529', 'important');
    autocompleteElement.style.setProperty('--gmpx-color-on-surface-variant', '#212529', 'important');
    autocompleteElement.style.setProperty('--gmpx-color-primary', '#0d6efd', 'important');
    autocompleteElement.style.setProperty('--gmpx-color-outline', '#ced4da', 'important');
    autocompleteElement.style.setProperty('--gmpx-color-on-primary', '#fff', 'important');
    
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
    
    // Make autocomplete element appear above overlay
    autocompleteElement.style.position = 'relative';
    autocompleteElement.style.zIndex = '2';
    autocompleteElement.style.backgroundColor = 'transparent';
    
    // Insert background overlay first (so it's behind)
    wrapper.insertBefore(backgroundOverlay, autocompleteElement);
    
    // Function to force text color on input element
    const forceTextColor = (input) => {
        if (!input) return;
        
        // Set all possible color properties
        input.style.color = '#212529';
        input.style.setProperty('color', '#212529', 'important');
        input.style.setProperty('-webkit-text-fill-color', '#212529', 'important');
        
        // Also set computed style directly if possible
        try {
            const computedStyle = window.getComputedStyle(input);
            if (computedStyle.color === 'rgb(255, 255, 255)' || computedStyle.color === 'white') {
                input.style.setProperty('color', '#212529', 'important');
                input.style.setProperty('-webkit-text-fill-color', '#212529', 'important');
            }
        } catch (e) {
            // Ignore errors
        }
    };
    
    // Try to make the internal input transparent background and dark text
    const tryMakeTransparent = () => {
        try {
            const shadowRoot = autocompleteElement.shadowRoot || 
                              autocompleteElement.openOrClosedShadowRoot ||
                              autocompleteElement.__shadowRoot;
            if (shadowRoot) {
                // Find all input elements (there might be multiple)
                const inputs = shadowRoot.querySelectorAll('input');
                inputs.forEach(input => {
                    // Ensure background is transparent
                    input.style.backgroundColor = 'transparent';
                    input.style.background = 'transparent';
                    input.style.setProperty('background-color', 'transparent', 'important');
                    input.style.setProperty('background', 'transparent', 'important');
                    
                    // Force text color
                    forceTextColor(input);
                });
                
                return inputs.length > 0;
            }
        } catch (err) {
            // Can't access
        }
        return false;
    };
    
    // Use MutationObserver to watch for changes in shadow DOM
    const setupMutationObserver = () => {
        try {
            const shadowRoot = autocompleteElement.shadowRoot || 
                              autocompleteElement.openOrClosedShadowRoot ||
                              autocompleteElement.__shadowRoot;
            if (shadowRoot) {
                const observer = new MutationObserver(() => {
                    tryMakeTransparent();
                });
                
                observer.observe(shadowRoot, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
                
                return true;
            }
        } catch (err) {
            // Can't access
        }
        return false;
    };
    
    // Set up periodic check as fallback (every 500ms for first 10 seconds, then every 2 seconds)
    let checkCount = 0;
    const maxQuickChecks = 20; // 10 seconds at 500ms intervals
    const periodicCheck = setInterval(() => {
        tryMakeTransparent();
        checkCount++;
        if (checkCount >= maxQuickChecks) {
            // After initial period, check less frequently
            clearInterval(periodicCheck);
            setInterval(tryMakeTransparent, 2000);
        }
    }, 500);
    
    // Try multiple times to make it transparent and ensure text is visible
    setTimeout(() => {
        tryMakeTransparent();
        setupMutationObserver();
    }, 100);
    setTimeout(() => {
        tryMakeTransparent();
        setupMutationObserver();
    }, 500);
    setTimeout(() => {
        tryMakeTransparent();
        setupMutationObserver();
    }, 1000);
    setTimeout(() => {
        tryMakeTransparent();
        setupMutationObserver();
    }, 2000);
    
    // Also try on various events
    autocompleteElement.addEventListener('focus', tryMakeTransparent);
    autocompleteElement.addEventListener('input', tryMakeTransparent);
    autocompleteElement.addEventListener('click', tryMakeTransparent);
    autocompleteElement.addEventListener('keydown', tryMakeTransparent);
    autocompleteElement.addEventListener('keyup', tryMakeTransparent);
    autocompleteElement.addEventListener('gmp-suggestionsupdate', tryMakeTransparent);
    
    // Also try to inject a style tag into shadow DOM if accessible
    const tryInjectStyle = () => {
        try {
            const shadowRoot = autocompleteElement.shadowRoot || 
                              autocompleteElement.openOrClosedShadowRoot ||
                              autocompleteElement.__shadowRoot;
            if (shadowRoot) {
                // Remove existing style if present to re-inject
                const existingStyle = shadowRoot.querySelector('style[data-custom-override]');
                if (existingStyle) {
                    existingStyle.remove();
                }
                
                const styleTag = document.createElement('style');
                styleTag.setAttribute('data-custom-override', 'true');
                styleTag.textContent = `
                    input,
                    input[type="text"],
                    input[autocomplete],
                    input[placeholder] {
                        background-color: transparent !important;
                        background: transparent !important;
                        color: #212529 !important;
                        -webkit-text-fill-color: #212529 !important;
                        caret-color: #212529 !important;
                    }
                    input:focus,
                    input:focus-visible,
                    input:active {
                        background-color: transparent !important;
                        background: transparent !important;
                        color: #212529 !important;
                        -webkit-text-fill-color: #212529 !important;
                        caret-color: #212529 !important;
                        outline-color: #0d6efd !important;
                    }
                    input::placeholder {
                        color: #6c757d !important;
                        -webkit-text-fill-color: #6c757d !important;
                        opacity: 1 !important;
                    }
                    input::-webkit-input-placeholder {
                        color: #6c757d !important;
                        -webkit-text-fill-color: #6c757d !important;
                        opacity: 1 !important;
                    }
                    input::-moz-placeholder {
                        color: #6c757d !important;
                        opacity: 1 !important;
                    }
                    input:-ms-input-placeholder {
                        color: #6c757d !important;
                        opacity: 1 !important;
                    }
                `;
                shadowRoot.appendChild(styleTag);
                return true;
            }
        } catch (err) {
            // Can't access
        }
        return false;
    };
    
    setTimeout(() => tryInjectStyle(), 200);
    setTimeout(() => tryInjectStyle(), 1000);
    setTimeout(() => tryInjectStyle(), 2000);
    setTimeout(() => tryInjectStyle(), 3000);
    
    // Create a hidden input for form submission
    // Check if this is advanced search form (which uses locationName instead of autocomplete)
    const formForCheck = parentDiv.closest('form');
    const isAdvancedSearch = formForCheck && (formForCheck.id === 'advanced-search-form' || formForCheck.action.includes('advanced-search'));
    const hiddenInputName = isAdvancedSearch ? 'locationName' : 'autocomplete';
    
    // Check if hidden input already exists (for advanced search)
    let hiddenInput = document.getElementById('locationNameHidden') || document.querySelector(`input[name="${hiddenInputName}"][type="hidden"]`);
    
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = isAdvancedSearch ? 'locationNameHidden' : 'autocomplete';
        hiddenInput.name = hiddenInputName;
        parentDiv.appendChild(hiddenInput);
    }
    
    // Store the formatted address when a place is selected
    let storedFormattedAddress = null;
    let placeJustSelected = false;
    
    // Update hidden input whenever autocomplete value changes
    const updateHiddenInput = () => {
        // If we have a stored formatted address (from place selection), use that for register form
        if (storedFormattedAddress && hiddenInput && hiddenInput.name === 'autocomplete' && placeJustSelected) {
            hiddenInput.value = storedFormattedAddress;
            // Reset flag after a short delay to allow for normal updates
            setTimeout(() => {
                placeJustSelected = false;
            }, 100);
            return;
        }
        
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
    autocompleteElement.addEventListener('input', () => {
        // Only clear stored formatted address if place wasn't just selected
        if (!placeJustSelected) {
            storedFormattedAddress = null;
        }
        updateHiddenInput();
    });
    autocompleteElement.addEventListener('change', () => {
        // Only clear stored formatted address if place wasn't just selected
        if (!placeJustSelected) {
            storedFormattedAddress = null;
        }
        updateHiddenInput();
    });
    
    // Also listen for any other events that might indicate value changes
    autocompleteElement.addEventListener('gmp-suggestionsupdate', updateHiddenInput);
    
    // Handler function for place selection
    const handlePlaceSelection = async (event) => {
        try {
            let place = null;
            
            if (event.placePrediction && typeof event.placePrediction.toPlace === 'function') {
                place = await event.placePrediction.toPlace();
            } else if (event.place) {
                place = event.place;
            }

            if (!place) {
                return;
            }

            // Fetch place details with all needed fields
            await place.fetchFields({ 
                fields: ['location', 'addressComponents', 'formattedAddress'] 
            });

            // Save exact lat/lng
            let lat, lng;
            
            if (place.location) {
                lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
                lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
            } else {
                return;
            }

            const currentLatField = document.getElementById('latitude');
            const currentLngField = document.getElementById('longitude');
            const currentLocationField = document.getElementById('location');
            
            if (currentLatField) currentLatField.value = lat;
            if (currentLngField) currentLngField.value = lng;

            // Update the hidden input
            updateHiddenInput();

            // Extract City + State
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

            if (currentLocationField) currentLocationField.value = cityState;
            if (hiddenInput) {
                // For advanced search, use cityState; for register, use formatted address
                const formForCheck = parentDiv.closest('form');
                const isAdvancedSearch = formForCheck && (formForCheck.id === 'advanced-search-form' || formForCheck.action.includes('advanced-search'));
                if (isAdvancedSearch) {
                    hiddenInput.value = cityState || place.formattedAddress || '';
                    storedFormattedAddress = null; // Clear for advanced search
                    placeJustSelected = false;
                } else {
                    // Store formatted address for register form
                    storedFormattedAddress = place.formattedAddress || null;
                    placeJustSelected = true; // Set flag to preserve formatted address
                    hiddenInput.value = place.formattedAddress || cityState || autocompleteElement.value;
                }
            }
            
            // Also update locationNameHidden if it exists (for advanced search)
            const locationNameHidden = document.getElementById('locationNameHidden');
            if (locationNameHidden) {
                locationNameHidden.value = cityState || place.formattedAddress || '';
            }
        } catch (error) {
            console.error("Error processing place selection:", error);
        }
    };
    
    autocompleteElement.addEventListener('gmp-select', handlePlaceSelection);

    let currentInputValue = '';
    
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
            // Can't access shadow DOM
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
                    
                    resolve({ lat, lng, location: cityState });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    };

    // Form validation
    const formForValidation = parentDiv.closest('form');
    if (formForValidation) {
        // Check if location is required (check original input's required attribute)
        const isLocationRequired = input.hasAttribute('required');
        
        formForValidation.addEventListener('submit', async (e) => {
            // If location is not required, allow form to submit normally
            if (!isLocationRequired) {
                // Still try to geocode if there's a value, but don't block submission
                const currentLatField = document.getElementById('latitude');
                const currentLngField = document.getElementById('longitude');
                const currentLocationField = document.getElementById('location');
                
                updateHiddenInput();
                
                const autocompleteValue = getAutocompleteValue();
                if (autocompleteValue && autocompleteValue.trim() !== '') {
                    const hasLat = currentLatField && currentLatField.value && currentLatField.value.trim() !== '';
                    const hasLng = currentLngField && currentLngField.value && currentLngField.value.trim() !== '';
                    
                    if (!hasLat || !hasLng) {
                        try {
                            const geocodeResult = await geocodeAddress(autocompleteValue);
                            if (currentLatField) currentLatField.value = geocodeResult.lat;
                            if (currentLngField) currentLngField.value = geocodeResult.lng;
                            if (currentLocationField) currentLocationField.value = geocodeResult.location;
                            
                            // Update locationName field if it exists (for advanced search)
                            const locationNameHidden = document.getElementById('locationNameHidden');
                            if (locationNameHidden) {
                                locationNameHidden.value = geocodeResult.location || geocodeResult.formattedAddress;
                            }
                            // Also update the main hidden input if it's for advanced search
                            if (hiddenInput && hiddenInput.name === 'locationName') {
                                hiddenInput.value = geocodeResult.location || geocodeResult.formattedAddress;
                            }
                        } catch (error) {
                            // Silently fail for optional location
                            console.log('Could not geocode location, but continuing with form submission');
                        }
                    }
                }
                // Allow form to submit normally
                return true;
            }
            
            // Location is required - validate it
            e.preventDefault();
            
            // Re-fetch the fields in case they were moved or recreated
            const currentLatField = document.getElementById('latitude');
            const currentLngField = document.getElementById('longitude');
            const currentLocationField = document.getElementById('location');
            
            // Update hidden input one more time before submission
            updateHiddenInput();
            
            // Ensure formatted address is set for register form if we have it stored
            if (hiddenInput && hiddenInput.name === 'autocomplete' && storedFormattedAddress) {
                hiddenInput.value = storedFormattedAddress;
            }
            
            let hasLat = currentLatField && currentLatField.value && currentLatField.value.trim() !== '';
            let hasLng = currentLngField && currentLngField.value && currentLngField.value.trim() !== '';
            let hasLocation = currentLocationField && currentLocationField.value && currentLocationField.value.trim() !== '';
            
            // If fields are empty, try to get value from autocomplete and geocode it
            if ((!hasLat || !hasLng || !hasLocation)) {
                const autocompleteValue = getAutocompleteValue();
                
                if (autocompleteValue && autocompleteValue.trim() !== '') {
                    try {
                        const geocodeResult = await geocodeAddress(autocompleteValue);
                        
                        if (currentLatField) currentLatField.value = geocodeResult.lat;
                        if (currentLngField) currentLngField.value = geocodeResult.lng;
                        if (currentLocationField) currentLocationField.value = geocodeResult.location;
                        
                        // Update the hidden input with formatted address for registration
                        if (hiddenInput && hiddenInput.name === 'autocomplete') {
                            storedFormattedAddress = geocodeResult.formattedAddress || null;
                            hiddenInput.value = geocodeResult.formattedAddress || geocodeResult.location || autocompleteValue;
                        }
                        
                        hasLat = true;
                        hasLng = true;
                        hasLocation = true;
                    } catch (error) {
                        showMessage('danger', 'Please select a location from the autocomplete suggestions. We could not find the location you entered.');
                        autocompleteElement.focus();
                        return false;
                    }
                } else {
                    showMessage('danger', 'Please select a location from the autocomplete suggestions.');
                    autocompleteElement.focus();
                    return false;
                }
            }
            
            if (!hasLocation || !hasLat || !hasLng) {
                showMessage('danger', 'Please select a location from the autocomplete suggestions.');
                autocompleteElement.focus();
                return false;
            }
            
            formForValidation.submit();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutocomplete);
} else {
    initAutocomplete();
}
