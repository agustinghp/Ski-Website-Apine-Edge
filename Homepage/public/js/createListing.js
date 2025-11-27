document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------
    // CLIENT-SIDE VALIDATION
    // --------------------------------------------

    const MAX_PRICE = 99999.99;

    // Character limits
    const MAX_BRAND_LENGTH = 50;
    const MAX_PRODUCT_NAME_LENGTH = 50;
    const MAX_MODEL_LENGTH = 50;
    const MAX_DESCRIPTION_LENGTH = 5000;

    // Ski dimension limits
    const MIN_SKI_LENGTH = 50;   // cm
    const MAX_SKI_LENGTH = 250;  // cm

    const MIN_SKI_WIDTH = 40;   // mm
    const MAX_SKI_WIDTH = 200;  // mm

    // Snowboard dimension limits
    const MIN_SNOWBOARD_LENGTH = 100;   // cm
    const MAX_SNOWBOARD_LENGTH = 200;  // cm

    const MIN_SNOWBOARD_WIDTH = 200;   // mm
    const MAX_SNOWBOARD_WIDTH = 300;  // mm

    // Helmet size limits
    const MIN_HELMET_SIZE = 48;   // cm
    const MAX_HELMET_SIZE = 65;   // cm

    // Boot size limits
    const MIN_BOOT_SIZE = 3;   // US size
    const MAX_BOOT_SIZE = 16;  // US size

    // Poles length limits
    const MIN_POLES_LENGTH = 80;   // cm
    const MAX_POLES_LENGTH = 160;  // cm

    // Helper function to check for scientific notation
    function containsScientificNotation(value) {
        if (typeof value !== 'string') return false;
        return /[eE]/.test(value);
    }

    // Helper function to validate numeric input (no scientific notation)
    function isValidNumericInput(value) {
        if (!value || typeof value !== 'string') return false;
        const trimmed = value.trim();
        // Check for scientific notation
        if (containsScientificNotation(trimmed)) return false;
        // Check if it's a valid number
        const num = parseFloat(trimmed);
        return !isNaN(num) && isFinite(num);
    }

    // Product form validation
    const productForm = document.querySelector('form[action="/create-listing/product"]');
    if (productForm) {
        productForm.addEventListener("submit", (e) => {

            // BRAND VALIDATION (REQUIRED, TRIMMED, LENGTH)
            const brandSelect = document.getElementById("brand");
            const customBrandInput = document.getElementById("customBrand");
            const brandValue = brandSelect ? brandSelect.value.trim() : '';
            
            if (!brandValue || brandValue === '') {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    "Brand is required. Please select a brand from the list or choose 'Other' to enter a custom brand."
                );
                markInvalidField(brandSelect);
                if (brandSelect) brandSelect.focus();
                return;
            }

            // If "Other" is selected, validate custom brand input
            if (brandValue === 'Other') {
                const customBrandValue = customBrandInput ? customBrandInput.value.trim() : '';
                
                if (!customBrandValue) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Custom brand is required when 'Other' is selected. Please enter a brand name."
                    );
                    markInvalidField(customBrandInput);
                    if (customBrandInput) customBrandInput.focus();
                    return;
                }

                if (customBrandValue.length > MAX_BRAND_LENGTH) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Custom brand cannot exceed ${MAX_BRAND_LENGTH} characters.`
                    );
                    markInvalidField(customBrandInput);
                    if (customBrandInput) customBrandInput.focus();
                    return;
                }
            }

            // PRODUCT NAME VALIDATION (REQUIRED, TRIMMED, LENGTH)
            const productNameInput = document.getElementById("productName");
            const productNameValue = productNameInput ? productNameInput.value.trim() : '';
            
            if (!productNameValue) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    "Product Name is required and cannot be empty or contain only spaces."
                );
                markInvalidField(productNameInput);
                if (productNameInput) productNameInput.focus();
                return;
            }

            if (productNameValue.length > MAX_PRODUCT_NAME_LENGTH) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    `Product Name cannot exceed ${MAX_PRODUCT_NAME_LENGTH} characters.`
                );
                markInvalidField(productNameInput);
                if (productNameInput) productNameInput.focus();
                return;
            }

            // MODEL VALIDATION (OPTIONAL, TRIMMED, LENGTH)
            const modelInput = document.getElementById("model");
            if (modelInput && modelInput.value.trim().length > MAX_MODEL_LENGTH) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    `Model cannot exceed ${MAX_MODEL_LENGTH} characters.`
                );
                markInvalidField(modelInput);
                modelInput.focus();
                return;
            }

            // DESCRIPTION VALIDATION (OPTIONAL, LENGTH)
            const descriptionInput = document.getElementById("productDescription");
            if (descriptionInput && descriptionInput.value.length > MAX_DESCRIPTION_LENGTH) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
                );
                markInvalidField(descriptionInput);
                descriptionInput.focus();
                return;
            }

            // PRICE VALIDATION (NO SCIENTIFIC NOTATION)
            const priceInput = document.getElementById("price");
            const priceValueStr = priceInput ? priceInput.value.trim() : '';
            
            if (!priceValueStr) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    "Price is required."
                );
                markInvalidField(priceInput);
                if (priceInput) priceInput.focus();
                return;
            }

            // Check for scientific notation
            if (containsScientificNotation(priceValueStr)) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    "Price cannot use scientific notation. Please enter a regular number."
                );
                markInvalidField(priceInput);
                if (priceInput) priceInput.focus();
                return;
            }

            const priceValue = parseFloat(priceValueStr);

            if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    `Price must be between 0.01 and ${MAX_PRICE.toLocaleString()}.`
                );

                markInvalidField(priceInput);
                if (priceInput) priceInput.focus();

                return;
            }

            // PRODUCT TYPE VALIDATION
            const productTypeInput = document.querySelector('input[name="productType"]:checked');
            const productType = productTypeInput ? productTypeInput.value : 'ski';

            if (productType === 'ski') {
                // SKI LENGTH VALIDATION (REQUIRED, NO SCIENTIFIC NOTATION)
                const lengthInput = document.getElementById("skiLength");
                const lengthValueStr = lengthInput ? lengthInput.value.trim() : '';
                
                if (!lengthValueStr) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Ski Length is required."
                    );

                    if (lengthInput) {
                        markInvalidField(lengthInput);
                        lengthInput.focus();
                    }

                    return;
                }

                if (containsScientificNotation(lengthValueStr)) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Ski Length cannot use scientific notation. Please enter a regular number."
                    );
                    markInvalidField(lengthInput);
                    if (lengthInput) lengthInput.focus();
                    return;
                }

                const lengthValue = parseFloat(lengthValueStr);
                if (isNaN(lengthValue) || lengthValue < MIN_SKI_LENGTH || lengthValue > MAX_SKI_LENGTH) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Ski Length must be between ${MIN_SKI_LENGTH} cm and ${MAX_SKI_LENGTH} cm.`
                    );

                    markInvalidField(lengthInput);
                    if (lengthInput) lengthInput.focus();

                    return;
                }

                // SKI WIDTH VALIDATION (REQUIRED, NO SCIENTIFIC NOTATION)
                const widthInput = document.getElementById("skiWidth");
                const widthValueStr = widthInput ? widthInput.value.trim() : '';
                
                if (!widthValueStr) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Ski Width is required."
                    );

                    if (widthInput) {
                        markInvalidField(widthInput);
                        widthInput.focus();
                    }

                    return;
                }

                if (containsScientificNotation(widthValueStr)) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Ski Width cannot use scientific notation. Please enter a regular number."
                    );
                    markInvalidField(widthInput);
                    if (widthInput) widthInput.focus();
                    return;
                }

                const widthValue = parseFloat(widthValueStr);
                if (isNaN(widthValue) || widthValue < MIN_SKI_WIDTH || widthValue > MAX_SKI_WIDTH) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Ski Width must be between ${MIN_SKI_WIDTH} mm and ${MAX_SKI_WIDTH} mm.`
                    );

                    markInvalidField(widthInput);
                    if (widthInput) widthInput.focus();

                    return;
                }
            } else if (productType === 'snowboard') {
                // SNOWBOARD LENGTH VALIDATION (REQUIRED, NO SCIENTIFIC NOTATION)
                const lengthInput = document.getElementById("snowboardLength");
                const lengthValueStr = lengthInput ? lengthInput.value.trim() : '';
                
                if (!lengthValueStr) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Snowboard Length is required."
                    );

                    if (lengthInput) {
                        markInvalidField(lengthInput);
                        lengthInput.focus();
                    }

                    return;
                }

                if (containsScientificNotation(lengthValueStr)) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Snowboard Length cannot use scientific notation. Please enter a regular number."
                    );
                    markInvalidField(lengthInput);
                    if (lengthInput) lengthInput.focus();
                    return;
                }

                const lengthValue = parseFloat(lengthValueStr);
                if (isNaN(lengthValue) || lengthValue < MIN_SNOWBOARD_LENGTH || lengthValue > MAX_SNOWBOARD_LENGTH) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Snowboard Length must be between ${MIN_SNOWBOARD_LENGTH} cm and ${MAX_SNOWBOARD_LENGTH} cm.`
                    );

                    markInvalidField(lengthInput);
                    if (lengthInput) lengthInput.focus();

                    return;
                }

                // SNOWBOARD WIDTH VALIDATION (REQUIRED, NO SCIENTIFIC NOTATION)
                const widthInput = document.getElementById("snowboardWidth");
                const widthValueStr = widthInput ? widthInput.value.trim() : '';
                
                if (!widthValueStr) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Snowboard Width is required."
                    );

                    if (widthInput) {
                        markInvalidField(widthInput);
                        widthInput.focus();
                    }

                    return;
                }

                if (containsScientificNotation(widthValueStr)) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Snowboard Width cannot use scientific notation. Please enter a regular number."
                    );
                    markInvalidField(widthInput);
                    if (widthInput) widthInput.focus();
                    return;
                }

                const widthValue = parseFloat(widthValueStr);
                if (isNaN(widthValue) || widthValue < MIN_SNOWBOARD_WIDTH || widthValue > MAX_SNOWBOARD_WIDTH) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Snowboard Width must be between ${MIN_SNOWBOARD_WIDTH} mm and ${MAX_SNOWBOARD_WIDTH} mm.`
                    );

                    markInvalidField(widthInput);
                    if (widthInput) widthInput.focus();

                    return;
                }
            } else if (productType === 'helmet') {
                // HELMET SIZE VALIDATION (REQUIRED, NO SCIENTIFIC NOTATION)
                const helmetSizeInput = document.getElementById("helmetSize");
                const helmetSizeValueStr = helmetSizeInput ? helmetSizeInput.value.trim() : '';
                
                if (!helmetSizeValueStr) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Helmet Size is required."
                    );

                    if (helmetSizeInput) {
                        markInvalidField(helmetSizeInput);
                        helmetSizeInput.focus();
                    }

                    return;
                }

                if (containsScientificNotation(helmetSizeValueStr)) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Helmet Size cannot use scientific notation. Please enter a regular number."
                    );
                    markInvalidField(helmetSizeInput);
                    if (helmetSizeInput) helmetSizeInput.focus();
                    return;
                }

                const helmetSizeValue = parseFloat(helmetSizeValueStr);
                if (isNaN(helmetSizeValue) || helmetSizeValue < MIN_HELMET_SIZE || helmetSizeValue > MAX_HELMET_SIZE) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Helmet Size must be between ${MIN_HELMET_SIZE} cm and ${MAX_HELMET_SIZE} cm.`
                    );

                    markInvalidField(helmetSizeInput);
                    if (helmetSizeInput) helmetSizeInput.focus();

                    return;
                }
            } else if (productType === 'boots') {
                // BOOT TYPE VALIDATION (REQUIRED)
                const bootTypeInput = document.querySelector('input[name="bootType"]:checked');
                if (!bootTypeInput) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Please select a boot type (Ski Boots or Snowboard Boots)."
                    );
                    return;
                }

                // BOOT SIZE VALIDATION (REQUIRED, NO SCIENTIFIC NOTATION)
                const bootSizeInput = document.getElementById("bootSize");
                const bootSizeValueStr = bootSizeInput ? bootSizeInput.value.trim() : '';
                
                if (!bootSizeValueStr) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Boot Size is required."
                    );

                    if (bootSizeInput) {
                        markInvalidField(bootSizeInput);
                        bootSizeInput.focus();
                    }

                    return;
                }

                if (containsScientificNotation(bootSizeValueStr)) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Boot Size cannot use scientific notation. Please enter a regular number."
                    );
                    markInvalidField(bootSizeInput);
                    if (bootSizeInput) bootSizeInput.focus();
                    return;
                }

                const bootSizeValue = parseFloat(bootSizeValueStr);
                if (isNaN(bootSizeValue) || bootSizeValue < MIN_BOOT_SIZE || bootSizeValue > MAX_BOOT_SIZE) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Boot Size must be between ${MIN_BOOT_SIZE} and ${MAX_BOOT_SIZE} (US size).`
                    );

                    markInvalidField(bootSizeInput);
                    if (bootSizeInput) bootSizeInput.focus();

                    return;
                }
            } else if (productType === 'poles') {
                // POLES LENGTH VALIDATION (REQUIRED, NO SCIENTIFIC NOTATION)
                const polesLengthInput = document.getElementById("polesLength");
                const polesLengthValueStr = polesLengthInput ? polesLengthInput.value.trim() : '';
                
                if (!polesLengthValueStr) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Pole Length is required."
                    );

                    if (polesLengthInput) {
                        markInvalidField(polesLengthInput);
                        polesLengthInput.focus();
                    }

                    return;
                }

                if (containsScientificNotation(polesLengthValueStr)) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Pole Length cannot use scientific notation. Please enter a regular number."
                    );
                    markInvalidField(polesLengthInput);
                    if (polesLengthInput) polesLengthInput.focus();
                    return;
                }

                const polesLengthValue = parseFloat(polesLengthValueStr);
                if (isNaN(polesLengthValue) || polesLengthValue < MIN_POLES_LENGTH || polesLengthValue > MAX_POLES_LENGTH) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Pole Length must be between ${MIN_POLES_LENGTH} cm and ${MAX_POLES_LENGTH} cm.`
                    );

                    markInvalidField(polesLengthInput);
                    if (polesLengthInput) polesLengthInput.focus();

                    return;
                }
            } else if (['goggles', 'gloves', 'jackets', 'pants'].includes(productType)) {
                // CLOTHING SIZE VALIDATION (REQUIRED)
                const clothingSizeInput = document.getElementById("clothingSize");
                if (!clothingSizeInput || !clothingSizeInput.value.trim()) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        "Size is required."
                    );

                    if (clothingSizeInput) {
                        markInvalidField(clothingSizeInput);
                        clothingSizeInput.focus();
                    }

                    return;
                }
            }
            // 'other' type doesn't need validation

        });
    }

    // Service form validation
    const serviceForm = document.querySelector('form[action="/create-listing/service"]');
    if (serviceForm) {
        serviceForm.addEventListener("submit", (e) => {
            const priceInput = document.getElementById("servicePrice");

            if (priceInput && priceInput.value.trim() === "") return; // allow no price

            if (priceInput) {
                const priceValue = parseFloat(priceInput.value);

                if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
                    e.preventDefault();
                    showClientMessage(
                        "danger",
                        `Price must be between 0.01 and ${MAX_PRICE.toLocaleString()}, or left blank.`
                    );

                    markInvalidField(priceInput);
                    priceInput.focus();
                }
            }
        });
    }

});

function showClientMessage(type, text) {
    // Try to find existing message container or create one
    let container = document.getElementById("clientMessageContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "clientMessageContainer";
        const form = document.querySelector('form[action="/create-listing/product"]') || document.querySelector('form[action="/create-listing/service"]');
        if (form) {
            form.insertBefore(container, form.firstChild);
        }
    }

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

function markInvalidField(inputElement) {
    if (!inputElement) return;
    
    inputElement.classList.add("is-invalid");

    // Remove red border as soon as user edits the field
    inputElement.addEventListener("input", () => {
        inputElement.classList.remove("is-invalid");
    }, { once: true });
}
