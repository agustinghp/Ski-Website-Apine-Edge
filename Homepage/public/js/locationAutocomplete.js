console.log("Using new PlaceAutocompleteElement API");

document.addEventListener("DOMContentLoaded", () => {
    const auto = document.getElementById("autocomplete");
    const latField = document.getElementById("latitude");
    const lngField = document.getElementById("longitude");
    const locationField = document.getElementById("location"); // city, state

    if (!auto) {
        console.warn("Autocomplete element not found.");
        return;
    }

    if (!latField || !lngField || !locationField) {
        console.warn("Hidden form fields not found.");
        return;
    }

    auto.addEventListener("gmpx-placechange", async () => {
        try {
            const place = auto.value;

            if (!place) {
                console.error("Place data missing.");
                return;
            }

            // ---------------------------------
            // 1. Save exact lat/lng
            // ---------------------------------
            if (place.location) {
                const lat = typeof place.location.lat === 'function' 
                    ? place.location.lat() 
                    : place.location.lat;
                const lng = typeof place.location.lng === 'function' 
                    ? place.location.lng() 
                    : place.location.lng;

                latField.value = lat;
                lngField.value = lng;
            } else {
                console.error("Location coordinates not found in place object.");
                return;
            }

            // ---------------------------------
            // 2. Extract City + State
            // ---------------------------------
            const components = place.addressComponents || [];

            let city = "";
            let state = "";

            // Try different ways to get city and state
            components.forEach(c => {
                // Handle both object formats
                const types = c.types || [];
                const shortText = c.shortText || c.short_name || "";
                const longText = c.longText || c.long_name || "";

                if (types.includes("locality") || types.includes("sublocality") || types.includes("sublocality_level_1")) {
                    city = city || shortText || longText;
                }
                if (types.includes("administrative_area_level_1")) {
                    state = state || shortText || longText;
                }
            });

            // Fallback: if we don't have city/state, try to parse from formatted address
            if (!city || !state) {
                const formattedAddress = place.formattedAddress || place.formatted_address || "";
                // Try to extract city and state from formatted address
                // This is a fallback - the addressComponents should work for most cases
                console.warn("Could not extract city/state from components, using formatted address as fallback");
            }

            // Format as "City, State" or just use what we have
            let cityState = "";
            if (city && state) {
                cityState = `${city}, ${state}`;
            } else if (city) {
                cityState = city;
            } else if (state) {
                cityState = state;
            } else {
                // Last resort: use a shortened version of the formatted address
                const formattedAddress = place.formattedAddress || place.formatted_address || "";
                // Try to extract just city and state from the end of the address
                const parts = formattedAddress.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    cityState = `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
                } else {
                    cityState = formattedAddress;
                }
            }

            locationField.value = cityState;

            console.log("Saved location:", cityState);
            console.log("Lat/Lng:", latField.value, lngField.value);
        } catch (error) {
            console.error("Error processing place selection:", error);
        }
    });
});
