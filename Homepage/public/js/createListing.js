document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------
    // Toggle between Product and Service forms
    // --------------------------------------------
    const productRadio = document.getElementById('productRadio');
    const serviceRadio = document.getElementById('serviceRadio');
    const productForm = document.getElementById('productForm');
    const serviceForm = document.getElementById('serviceForm');

    // PRELOAD CORRECT FORM FROM SERVER
    const listingType = window.listingTypeFromServer;

    if (listingType === "service") {
        serviceRadio.checked = true;
        serviceForm.style.display = 'block';
        productForm.style.display = 'none';
    } else {
        productRadio.checked = true;
        productForm.style.display = 'block';
        serviceForm.style.display = 'none';
    }

    productRadio.addEventListener('change', () => {
        if (productRadio.checked) {
            productForm.style.display = 'block';
            serviceForm.style.display = 'none';

            serviceForm.querySelectorAll('[required]').forEach(field => {
                field.removeAttribute('required');
            });

            productForm.querySelectorAll(
                'input[name="brand"], input[name="model"], input[name="productName"], input[name="price"]'
            ).forEach(field => {
                field.setAttribute('required', 'required');
            });
        }
    });

    serviceRadio.addEventListener('change', () => {
        if (serviceRadio.checked) {
            serviceForm.style.display = 'block';
            productForm.style.display = 'none';

            productForm.querySelectorAll('[required]').forEach(field => {
                field.removeAttribute('required');
            });

            serviceForm.querySelector('input[name="serviceName"]').setAttribute('required', 'required');
        }
    });


    // --------------------------------------------
    // CLIENT-SIDE VALIDATION
    // --------------------------------------------

    const MAX_PRICE = 99999.99;

    // Ski dimension limits
    const MIN_LENGTH = 50;   // cm
    const MAX_LENGTH = 250;  // cm

    const MIN_WIDTH = 40;   // mm
    const MAX_WIDTH = 200;  // mm


    // Product form validation
    productForm.addEventListener("submit", (e) => {

        // PRICE VALIDATION
        const priceInput = document.getElementById("product_price");
        const priceValue = parseFloat(priceInput.value);

        if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
            e.preventDefault();
            showClientMessage(
                "danger",
                `❌ Price must be between 0.01 and ${MAX_PRICE.toLocaleString()}.`
            );

            markInvalidField(priceInput);
            priceInput.focus();

            return;
        }

        // SKI LENGTH VALIDATION
        const lengthInput = document.getElementById("product_length");
        if (lengthInput.value.trim() !== "") {
            const lengthValue = parseFloat(lengthInput.value);

            if (isNaN(lengthValue) || lengthValue < MIN_LENGTH || lengthValue > MAX_LENGTH) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    `❌ Ski Length must be between ${MIN_LENGTH} cm and ${MAX_LENGTH} cm.`
                );

                markInvalidField(lengthInput);
                lengthInput.focus();

                return;
            }
        }

        // SKI WIDTH VALIDATION
        const widthInput = document.getElementById("product_width");
        if (widthInput.value.trim() !== "") {
            const widthValue = parseFloat(widthInput.value);

            if (isNaN(widthValue) || widthValue < MIN_WIDTH || widthValue > MAX_WIDTH) {
                e.preventDefault();
                showClientMessage(
                    "danger",
                    `❌ Ski Width must be between ${MIN_WIDTH} mm and ${MAX_WIDTH} mm.`
                );

                markInvalidField(widthInput);
                widthInput.focus();

                return;
            }
        }

    });


    // Service form validation
    serviceForm.addEventListener("submit", (e) => {
        const priceInput = document.getElementById("service_price");

        if (priceInput.value.trim() === "") return; // allow no price

        const priceValue = parseFloat(priceInput.value);

        if (isNaN(priceValue) || priceValue <= 0 || priceValue > MAX_PRICE) {
            e.preventDefault();
            showClientMessage(
                "danger",
                `❌ Price must be between 0.01 and ${MAX_PRICE.toLocaleString()}, or left blank.`
            );

            markInvalidField(priceInput);
            priceInput.focus();

        }
    });

});

function showClientMessage(type, text) {
    const container = document.getElementById("clientMessageContainer");

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

function markInvalidField(inputElement) {
    inputElement.classList.add("is-invalid");

    // Remove red border as soon as user edits the field
    inputElement.addEventListener("input", () => {
        inputElement.classList.remove("is-invalid");
    }, { once: true });
}
