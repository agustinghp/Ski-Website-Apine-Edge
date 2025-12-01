// Advanced Search JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const productTypeSelect = document.getElementById('productType');
    const categoryFilters = document.querySelectorAll('.category-filters');
    
    // Initialize dual-range sliders
    initDualRangeSliders();
    
    // Initialize price inputs
    initPriceInputs();
    
    // Initialize size buttons
    initSizeButtons();
    
    // Initialize brand buttons
    initBrandButtons();
    
    // Initialize brand collapse hint text
    initBrandCollapseHint();
    
    // Initialize filters collapse functionality
    initFiltersCollapse();
    
    // Initialize custom brand functionality
    initCustomBrands();
    
    // Restore custom brands from server-side rendering
    restoreCustomBrands();
    
    // Initialize reset buttons
    initResetButtons();
    
    // Handle product type change
    if (productTypeSelect) {
        productTypeSelect.addEventListener('change', handleProductTypeChange);
        // Trigger on page load if product type is already selected
        // Note: Brands are already rendered server-side, so we don't need to reload them
        // But we still need to show/hide category filters
        if (productTypeSelect.value) {
            const selectedType = productTypeSelect.value;
            categoryFilters.forEach(filter => {
                filter.classList.remove('active');
            });
            const targetFilter = document.getElementById(`${selectedType}-filters`);
            if (targetFilter) {
                targetFilter.classList.add('active');
            }
        }
    }
    
    // Function to show/hide category-specific filters
    async function handleProductTypeChange() {
        const selectedType = productTypeSelect.value;
        
        // Hide all category filters
        categoryFilters.forEach(filter => {
            filter.classList.remove('active');
        });
        
        // Show relevant filter section
        if (selectedType) {
            const targetFilter = document.getElementById(`${selectedType}-filters`);
            if (targetFilter) {
                targetFilter.classList.add('active');
            }
        }
        
        // Update brands based on selected product type
        await updateBrandsForCategory(selectedType);
    }
    
    // Function to update brand buttons based on category
    async function updateBrandsForCategory(category) {
        const brandContainer = document.getElementById('brand-buttons-container');
        if (!brandContainer) return;
        
        try {
            // Preserve custom brands before updating
            const customBrandsContainer = document.getElementById('custom-brands-container');
            const existingCustomBrands = [];
            if (customBrandsContainer) {
                const customButtons = customBrandsContainer.querySelectorAll('.custom-brand-button');
                customButtons.forEach(btn => {
                    existingCustomBrands.push({
                        name: btn.dataset.brand,
                        selected: btn.classList.contains('selected')
                    });
                });
            }
            
            // Get currently selected regular brands
            const selectedBrands = Array.from(document.querySelectorAll('.brand-button.selected'))
                .map(btn => btn.dataset.brand);
            
            // Fetch brands for the selected category
            const categoryParam = category || '';
            const response = await fetch(`/search/api/brands/${categoryParam}`);
            const data = await response.json();
            const brands = data.brands || [];
            
            // Clear existing brand buttons
            brandContainer.innerHTML = '';
            
            // Create new brand buttons
            if (brands.length === 0) {
                if (!category || category === '') {
                    brandContainer.innerHTML = '<p class="text-muted small mb-0">Select a product type to see available brands</p>';
                } else {
                    brandContainer.innerHTML = '<p class="text-muted small mb-0">No brands available for this category</p>';
                }
            } else {
                brands.forEach(brand => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'brand-button';
                    button.dataset.brand = brand;
                    button.textContent = brand;
                    
                    // Preserve selection if brand was previously selected and exists in new category
                    if (selectedBrands.includes(brand)) {
                        button.classList.add('selected');
                    }
                    
                    brandContainer.appendChild(button);
                });
                
                // Re-initialize brand button event listeners
                initBrandButtons();
            }
            
            // Restore custom brands
            if (customBrandsContainer && existingCustomBrands.length > 0) {
                // Clear existing custom brands
                customBrandsContainer.innerHTML = '';
                
                // Recreate custom brands
                existingCustomBrands.forEach(customBrand => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'custom-brand-button';
                    if (customBrand.selected) {
                        button.classList.add('selected');
                    }
                    button.dataset.brand = customBrand.name;
                    button.textContent = customBrand.name;
                    
                    // Create delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'custom-brand-delete';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.setAttribute('aria-label', 'Remove brand');
                    
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        button.remove();
                        updateBrandInput();
                    });
                    
                    button.addEventListener('click', function(e) {
                        if (e.target === deleteBtn || deleteBtn.contains(e.target)) {
                            return;
                        }
                        this.classList.toggle('selected');
                        updateBrandInput();
                    });
                    
                    button.appendChild(deleteBtn);
                    customBrandsContainer.appendChild(button);
                });
            }
            
            // Update brand input to reflect current selection
            updateBrandInput();
            
        } catch (error) {
            console.error('Error fetching brands:', error);
            brandContainer.innerHTML = '<p class="text-muted small mb-0">Error loading brands. Please try again.</p>';
        }
    }
    
    // Initialize all dual-range sliders
    function initDualRangeSliders() {
        const sliders = document.querySelectorAll('.range-slider-container');
        sliders.forEach(container => {
            const minSlider = container.querySelector('.range-slider-min-input');
            const maxSlider = container.querySelector('.range-slider-max-input');
            const minTextInput = container.querySelector('.range-slider-min-input-text');
            const maxTextInput = container.querySelector('.range-slider-max-input-text');
            const track = container.querySelector('.range-slider-track');
            const minHidden = container.querySelector('input[type="hidden"][name*="min"]');
            const maxHidden = container.querySelector('input[type="hidden"][name*="max"]');
            
            if (minSlider && maxSlider && minTextInput && maxTextInput && track) {
                // Get min/max from text inputs (they have the HTML5 min/max attributes)
                const min = parseFloat(minTextInput.min) || parseFloat(minSlider.min);
                const max = parseFloat(maxTextInput.max) || parseFloat(maxSlider.max);
                const step = parseFloat(minTextInput.step) || parseFloat(minSlider.step) || 1;
                
                // Set initial values from hidden inputs if they exist, otherwise use defaults
                let initialMin, initialMax;
                
                if (minHidden && minHidden.value) {
                    initialMin = parseFloat(minHidden.value);
                } else if (minSlider.value) {
                    initialMin = parseFloat(minSlider.value);
                } else {
                    initialMin = min;
                }
                
                if (maxHidden && maxHidden.value) {
                    initialMax = parseFloat(maxHidden.value);
                } else if (maxSlider.value) {
                    initialMax = parseFloat(maxSlider.value);
                } else {
                    initialMax = max;
                }
                
                // For price sliders, round slider values to step 10, but keep text input as-is
                if (minTextInput.dataset.type === 'price') {
                    minSlider.value = Math.round(initialMin / 10) * 10;
                    minTextInput.value = initialMin; // Keep original value for text input
                } else {
                    minSlider.value = initialMin;
                    minTextInput.value = initialMin;
                }
                
                if (maxTextInput.dataset.type === 'price') {
                    maxSlider.value = Math.round(initialMax / 10) * 10;
                    maxTextInput.value = initialMax; // Keep original value for text input
                } else {
                    maxSlider.value = initialMax;
                    maxTextInput.value = initialMax;
                }
                
                updateSlider(minSlider, maxSlider, minTextInput, maxTextInput, track, min, max, container);
                
                // Handle slider changes
                minSlider.addEventListener('input', function() {
                    let val = parseFloat(this.value);
                    if (val > parseFloat(maxSlider.value)) {
                        val = parseFloat(maxSlider.value);
                    }
                    // For price sliders, round to step 10 when sliding
                    if (minTextInput.dataset.type === 'price') {
                        val = Math.round(val / 10) * 10;
                    }
                    this.value = val;
                    minTextInput.value = val;
                    updateSlider(minSlider, maxSlider, minTextInput, maxTextInput, track, min, max, container);
                    if (minHidden) minHidden.value = val;
                });
                
                maxSlider.addEventListener('input', function() {
                    let val = parseFloat(this.value);
                    if (val < parseFloat(minSlider.value)) {
                        val = parseFloat(minSlider.value);
                    }
                    // For price sliders, round to step 10 when sliding
                    if (maxTextInput.dataset.type === 'price') {
                        val = Math.round(val / 10) * 10;
                    }
                    this.value = val;
                    maxTextInput.value = val;
                    updateSlider(minSlider, maxSlider, minTextInput, maxTextInput, track, min, max, container);
                    if (maxHidden) maxHidden.value = val;
                });
                
                // Validation function for text inputs
                function validateMinInput() {
                    let val = parseFloat(minTextInput.value);
                    if (isNaN(val) || minTextInput.value === '') {
                        val = parseFloat(minSlider.value);
                    } else {
                        // Clamp to absolute min/max range
                        if (val < min) val = min;
                        if (val > max) val = max;
                        
                        // Ensure min <= max (if min > max, set min to max)
                        const maxVal = parseFloat(maxTextInput.value || maxSlider.value);
                        if (val > maxVal) val = maxVal;
                        
                        // Round to step (price uses step=10, others use their step)
                        const textStep = (minTextInput.dataset.type === 'price') ? 10 : step;
                        val = Math.round(val / textStep) * textStep;
                    }
                    
                    // For price, both text input and slider round to step 10
                    let sliderVal = val;
                    if (minTextInput.dataset.type === 'price') {
                        sliderVal = Math.round(val / 10) * 10;
                        val = sliderVal; // Also update val to match
                    }
                    
                    minTextInput.value = val;
                    minSlider.value = sliderVal;
                    updateSlider(minSlider, maxSlider, minTextInput, maxTextInput, track, min, max, container);
                    if (minHidden) minHidden.value = val;
                }
                
                function validateMaxInput() {
                    let val = parseFloat(maxTextInput.value);
                    if (isNaN(val) || maxTextInput.value === '') {
                        val = parseFloat(maxSlider.value);
                    } else {
                        // Clamp to absolute min/max range
                        if (val < min) val = min;
                        if (val > max) val = max;
                        
                        // Ensure max >= min (if max < min, set max to min)
                        const minVal = parseFloat(minTextInput.value || minSlider.value);
                        if (val < minVal) val = minVal;
                        
                        // Round to step (price uses step=10, others use their step)
                        const textStep = (maxTextInput.dataset.type === 'price') ? 10 : step;
                        val = Math.round(val / textStep) * textStep;
                    }
                    
                    // For price, both text input and slider round to step 10
                    let sliderVal = val;
                    if (maxTextInput.dataset.type === 'price') {
                        sliderVal = Math.round(val / 10) * 10;
                        val = sliderVal; // Also update val to match
                    }
                    
                    maxTextInput.value = val;
                    maxSlider.value = sliderVal;
                    updateSlider(minSlider, maxSlider, minTextInput, maxTextInput, track, min, max, container);
                    if (maxHidden) maxHidden.value = val;
                }
                
                // Handle blur to validate values
                minTextInput.addEventListener('blur', validateMinInput);
                maxTextInput.addEventListener('blur', validateMaxInput);
                
                // Handle Enter key to validate values
                minTextInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        validateMinInput();
                        this.blur();
                    }
                });
                
                maxTextInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        validateMaxInput();
                        this.blur();
                    }
                });
            }
        });
    }
    
    // Update slider visual state
    function updateSlider(minSlider, maxSlider, minTextInput, maxTextInput, track, min, max, container) {
        const minVal = parseFloat(minSlider.value);
        const maxVal = parseFloat(maxSlider.value);
        
        // Update text inputs (they already have the numeric value, just ensure they're synced)
        minTextInput.value = minVal;
        maxTextInput.value = maxVal;
        
        // Update track position
        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;
        
        track.style.left = minPercent + '%';
        track.style.width = (maxPercent - minPercent) + '%';
        
        // Update input positions to prevent overlap
        if (minPercent > maxPercent - 2) {
            minSlider.style.zIndex = '3';
        } else {
            minSlider.style.zIndex = '2';
        }
        
        if (maxPercent < minPercent + 2) {
            maxSlider.style.zIndex = '3';
        } else {
            maxSlider.style.zIndex = '2';
        }
    }
    
    // Initialize price inputs with validation
    function initPriceInputs() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        if (!minPriceInput || !maxPriceInput) return;
        
        const MAX_PRICE = 99999.99;
        const MIN_PRICE = 0;
        const SPINNER_INCREMENT = 10; // Amount to increment/decrement when using spinner buttons
        
        // Track previous values to detect spinner clicks
        let minPrevValue = parseFloat(minPriceInput.value) || 0;
        let maxPrevValue = parseFloat(maxPriceInput.value) || 1000;
        let minIsTyping = false;
        let maxIsTyping = false;
        
        // Track when user is typing vs using spinner
        minPriceInput.addEventListener('keydown', function() {
            minIsTyping = true;
        });
        
        maxPriceInput.addEventListener('keydown', function() {
            maxIsTyping = true;
        });
        
        // Handle spinner button clicks for min price
        minPriceInput.addEventListener('input', function() {
            const currentVal = parseFloat(this.value) || 0;
            const diff = Math.abs(currentVal - minPrevValue);
            
            // If change is exactly 0.01 and user wasn't typing, it's a spinner click
            if (!minIsTyping && Math.abs(diff - 0.01) < 0.001) {
                const direction = currentVal > minPrevValue ? 1 : -1;
                const newVal = minPrevValue + (direction * SPINNER_INCREMENT);
                
                // Clamp to valid range
                let clampedVal = newVal;
                if (clampedVal < MIN_PRICE) clampedVal = MIN_PRICE;
                if (clampedVal > MAX_PRICE) clampedVal = MAX_PRICE;
                
                // Ensure min <= max
                const maxVal = parseFloat(maxPriceInput.value) || 1000;
                if (clampedVal > maxVal) clampedVal = maxVal;
                
                this.value = clampedVal.toFixed(2);
                minPrevValue = clampedVal;
            } else {
                minPrevValue = currentVal;
            }
            minIsTyping = false;
        });
        
        // Handle spinner button clicks for max price
        maxPriceInput.addEventListener('input', function() {
            const currentVal = parseFloat(this.value) || 1000;
            const diff = Math.abs(currentVal - maxPrevValue);
            
            // If change is exactly 0.01 and user wasn't typing, it's a spinner click
            if (!maxIsTyping && Math.abs(diff - 0.01) < 0.001) {
                const direction = currentVal > maxPrevValue ? 1 : -1;
                const newVal = maxPrevValue + (direction * SPINNER_INCREMENT);
                
                // Clamp to valid range
                let clampedVal = newVal;
                if (clampedVal < MIN_PRICE) clampedVal = MIN_PRICE;
                if (clampedVal > MAX_PRICE) clampedVal = MAX_PRICE;
                
                // Ensure max >= min
                const minVal = parseFloat(minPriceInput.value) || 0;
                if (clampedVal < minVal) clampedVal = minVal;
                
                this.value = clampedVal.toFixed(2);
                maxPrevValue = clampedVal;
            } else {
                maxPrevValue = currentVal;
            }
            maxIsTyping = false;
        });
        
        // Handle mouse wheel (which can trigger spinner behavior)
        minPriceInput.addEventListener('wheel', function(e) {
            if (document.activeElement === this) {
                e.preventDefault();
                const currentVal = parseFloat(this.value) || 0;
                const direction = e.deltaY > 0 ? -1 : 1;
                const newVal = currentVal + (direction * SPINNER_INCREMENT);
                
                // Clamp to valid range
                let clampedVal = newVal;
                if (clampedVal < MIN_PRICE) clampedVal = MIN_PRICE;
                if (clampedVal > MAX_PRICE) clampedVal = MAX_PRICE;
                
                // Ensure min <= max
                const maxVal = parseFloat(maxPriceInput.value) || 1000;
                if (clampedVal > maxVal) clampedVal = maxVal;
                
                this.value = clampedVal.toFixed(2);
                minPrevValue = clampedVal;
            }
        });
        
        maxPriceInput.addEventListener('wheel', function(e) {
            if (document.activeElement === this) {
                e.preventDefault();
                const currentVal = parseFloat(this.value) || 1000;
                const direction = e.deltaY > 0 ? -1 : 1;
                const newVal = currentVal + (direction * SPINNER_INCREMENT);
                
                // Clamp to valid range
                let clampedVal = newVal;
                if (clampedVal < MIN_PRICE) clampedVal = MIN_PRICE;
                if (clampedVal > MAX_PRICE) clampedVal = MAX_PRICE;
                
                // Ensure max >= min
                const minVal = parseFloat(minPriceInput.value) || 0;
                if (clampedVal < minVal) clampedVal = minVal;
                
                this.value = clampedVal.toFixed(2);
                maxPrevValue = clampedVal;
            }
        });
        
        // Validation function for min price
        function validateMinPrice() {
            let val = parseFloat(minPriceInput.value);
            if (isNaN(val) || minPriceInput.value === '') {
                val = MIN_PRICE;
            } else {
                // Clamp to absolute min/max range
                if (val < MIN_PRICE) val = MIN_PRICE;
                if (val > MAX_PRICE) val = MAX_PRICE;
                
                // Ensure min <= max
                const maxVal = parseFloat(maxPriceInput.value);
                if (!isNaN(maxVal) && val > maxVal) {
                    val = maxVal;
                }
            }
            minPriceInput.value = val.toFixed(2);
            minPrevValue = val;
        }
        
        // Validation function for max price
        function validateMaxPrice() {
            let val = parseFloat(maxPriceInput.value);
            if (isNaN(val) || maxPriceInput.value === '') {
                val = 1000; // Default max
            } else {
                // Clamp to absolute min/max range
                if (val < MIN_PRICE) val = MIN_PRICE;
                if (val > MAX_PRICE) val = MAX_PRICE;
                
                // Ensure max >= min
                const minVal = parseFloat(minPriceInput.value);
                if (!isNaN(minVal) && val < minVal) {
                    val = minVal;
                }
            }
            maxPriceInput.value = val.toFixed(2);
            maxPrevValue = val;
        }
        
        // Handle blur to validate values
        minPriceInput.addEventListener('blur', validateMinPrice);
        maxPriceInput.addEventListener('blur', validateMaxPrice);
        
        // Handle Enter key to validate values
        minPriceInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                validateMinPrice();
                this.blur();
            }
        });
        
        maxPriceInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                validateMaxPrice();
                this.blur();
            }
        });
    }
    
    // Initialize reset buttons for sliders and price inputs
    function initResetButtons() {
        // Handle slider reset buttons
        document.querySelectorAll('.slider-reset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const defaultMin = parseFloat(this.dataset.min);
                const defaultMax = parseFloat(this.dataset.max);
                
                // Find the slider container - it's a sibling of the d-flex div
                const flexDiv = this.closest('.d-flex');
                let container = null;
                if (flexDiv && flexDiv.nextElementSibling && flexDiv.nextElementSibling.classList.contains('range-slider-container')) {
                    container = flexDiv.nextElementSibling;
                } else {
                    // Fallback: find in parent
                    const parent = this.closest('.filter-group, .col-md-6');
                    container = parent ? parent.querySelector('.range-slider-container') : null;
                }
                if (!container) return;
                
                const minSlider = container.querySelector('.range-slider-min-input');
                const maxSlider = container.querySelector('.range-slider-max-input');
                const minTextInput = container.querySelector('.range-slider-min-input-text');
                const maxTextInput = container.querySelector('.range-slider-max-input-text');
                const minHidden = container.querySelector('input[type="hidden"][name*="min"]');
                const maxHidden = container.querySelector('input[type="hidden"][name*="max"]');
                const track = container.querySelector('.range-slider-track');
                
                if (minSlider && maxSlider && minTextInput && maxTextInput && track) {
                    const min = parseFloat(minSlider.min);
                    const max = parseFloat(maxSlider.max);
                    
                    // Reset to default values
                    let resetMin = defaultMin;
                    let resetMax = defaultMax;
                    
                    minSlider.value = resetMin;
                    maxSlider.value = resetMax;
                    minTextInput.value = resetMin;
                    maxTextInput.value = resetMax;
                    
                    // Update hidden inputs
                    if (minHidden) minHidden.value = resetMin;
                    if (maxHidden) maxHidden.value = resetMax;
                    
                    // Update slider visual state
                    updateSlider(minSlider, maxSlider, minTextInput, maxTextInput, track, min, max, container);
                }
            });
        });
        
        // Handle price reset button
        document.querySelectorAll('.price-reset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const defaultMin = parseFloat(this.dataset.min);
                const defaultMax = parseFloat(this.dataset.max);
                
                const minPriceInput = document.getElementById('minPrice');
                const maxPriceInput = document.getElementById('maxPrice');
                
                if (minPriceInput && maxPriceInput) {
                    minPriceInput.value = defaultMin.toFixed(2);
                    maxPriceInput.value = defaultMax.toFixed(2);
                }
            });
        });
    }
    
    // Initialize size buttons functionality
    function initSizeButtons() {
        // Initialize buttons from their current DOM state (set by server-side template)
        // The template already sets the 'selected' class based on clothingSizes array
        // We just need to sync the hidden input with the button states for the active category
        
        // Get the active product type
        const productTypeSelect = document.getElementById('productType');
        const activeCategory = productTypeSelect ? productTypeSelect.value : '';
        
        // Only update the hidden input for the active category
        if (activeCategory && ['goggles', 'gloves', 'jackets', 'pants'].includes(activeCategory)) {
            const buttons = document.querySelectorAll(`.size-button[data-category="${activeCategory}"]`);
            if (buttons.length > 0) {
                // Update the hidden input based on current button states
                updateSizeInput(activeCategory);
            }
        }
        
        // Handle size button clicks
        document.querySelectorAll('.size-button').forEach(button => {
            button.addEventListener('click', function() {
                this.classList.toggle('selected');
                updateSizeInput(this.dataset.category);
            });
        });
        
        // Handle Select All buttons
        document.querySelectorAll('.select-all-sizes').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                const buttons = document.querySelectorAll(`.size-button[data-category="${category}"]`);
                buttons.forEach(button => {
                    button.classList.add('selected');
                });
                updateSizeInput(category);
            });
        });
        
        // Handle Deselect All buttons
        document.querySelectorAll('.deselect-all-sizes').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                const buttons = document.querySelectorAll(`.size-button[data-category="${category}"]`);
                buttons.forEach(button => {
                    button.classList.remove('selected');
                });
                updateSizeInput(category);
            });
        });
    }
    
    // Update hidden input with selected sizes
    function updateSizeInput(category) {
        const buttons = document.querySelectorAll(`.size-button[data-category="${category}"]`);
        const selectedSizes = Array.from(buttons)
            .filter(btn => btn.classList.contains('selected'))
            .map(btn => btn.dataset.size);
        
        const hiddenInput = document.querySelector(`.clothing-sizes-input[data-category="${category}"]`);
        if (hiddenInput) {
            // Update the hidden input value for initialization purposes
            hiddenInput.value = selectedSizes.join(',');
            
            // For form submission, we need to create multiple hidden inputs
            // Since Express handles arrays from multiple inputs with the same name, we'll create/update hidden inputs
            const container = hiddenInput.closest('.filter-group');
            
            // Remove existing hidden inputs for this category (but keep the .clothing-sizes-input)
            container.querySelectorAll(`input[name="clothingSizes"]`).forEach(input => {
                if (input.dataset.category === category && !input.classList.contains('clothing-sizes-input')) {
                    input.remove();
                }
            });
            
            // Create new hidden inputs for each selected size
            // Express automatically parses multiple inputs with same name as array
            selectedSizes.forEach(size => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'clothingSizes';
                input.value = size;
                input.dataset.category = category;
                container.appendChild(input);
            });
        }
    }
    
    // Initialize brand buttons functionality
    function initBrandButtons() {
        // Initialize buttons from their current DOM state (set by server-side template)
        // The template already sets the 'selected' class based on brands array
        // We just need to sync the hidden input with the button states
        
        // Update the hidden input based on current button states
        updateBrandInput();
        
        // Handle brand button clicks
        document.querySelectorAll('.brand-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling up
                this.classList.toggle('selected');
                updateBrandInput();
            });
        });
        
        // Handle Select All brands button
        document.querySelectorAll('.select-all-brands').forEach(btn => {
            btn.addEventListener('click', function() {
                const buttons = document.querySelectorAll('.brand-button, .custom-brand-button');
                buttons.forEach(button => {
                    button.classList.add('selected');
                });
                updateBrandInput();
            });
        });
        
        // Handle Deselect All brands button
        document.querySelectorAll('.deselect-all-brands').forEach(btn => {
            btn.addEventListener('click', function() {
                const buttons = document.querySelectorAll('.brand-button, .custom-brand-button');
                buttons.forEach(button => {
                    button.classList.remove('selected');
                });
                updateBrandInput();
            });
        });
    }
    
    // Initialize brand collapse hint text
    function initBrandCollapseHint() {
        const brandCollapse = document.getElementById('brand-collapse');
        const brandToggleBtn = document.querySelector('.brand-toggle-btn');
        const brandHint = document.querySelector('.brand-hint');
        const brandControlButtons = document.querySelector('.brand-control-buttons');
        
        if (brandCollapse && brandToggleBtn && brandHint) {
            // Update hint text and control buttons visibility based on current state
            function updateBrandSectionState() {
                const isExpanded = brandToggleBtn.getAttribute('aria-expanded') === 'true';
                brandHint.textContent = isExpanded ? '(click to collapse)' : '(click to expand)';
                
                // Hide/show control buttons based on collapse state using CSS class
                if (brandControlButtons) {
                    if (isExpanded) {
                        brandControlButtons.classList.add('show');
                    } else {
                        brandControlButtons.classList.remove('show');
                    }
                }
            }
            
            // Listen for collapse events
            brandCollapse.addEventListener('shown.bs.collapse', function() {
                updateBrandSectionState();
            });
            
            brandCollapse.addEventListener('hidden.bs.collapse', function() {
                updateBrandSectionState();
            });
            
            // Set initial state immediately (before any animations)
            // Check if collapse is already shown (has 'show' class)
            const isInitiallyExpanded = brandCollapse.classList.contains('show');
            if (isInitiallyExpanded) {
                brandControlButtons?.classList.add('show');
            }
            
            // Also update on next frame to catch any Bootstrap initialization
            requestAnimationFrame(() => {
                updateBrandSectionState();
            });
        }
    }
    
    // Initialize filters collapse functionality
    function initFiltersCollapse() {
        const filtersCollapse = document.getElementById('filters-collapse');
        const filtersToggleBtn = document.querySelector('.filters-toggle-btn');
        const filtersHint = document.querySelector('.filters-hint');
        
        if (filtersCollapse && filtersToggleBtn && filtersHint) {
            // Update hint text based on current state
            function updateHintText() {
                const isExpanded = filtersToggleBtn.getAttribute('aria-expanded') === 'true';
                filtersHint.textContent = isExpanded ? '(click to collapse)' : '(click to expand)';
            }
            
            // Update aria-expanded attribute when collapse state changes
            filtersCollapse.addEventListener('shown.bs.collapse', function() {
                filtersToggleBtn.setAttribute('aria-expanded', 'true');
                updateHintText();
            });
            
            filtersCollapse.addEventListener('hidden.bs.collapse', function() {
                filtersToggleBtn.setAttribute('aria-expanded', 'false');
                updateHintText();
            });
            
            // Set initial hint text
            updateHintText();
        }
    }
    
    // Update hidden inputs with selected brands (including custom brands)
    function updateBrandInput() {
        // Get regular brand buttons
        const buttons = document.querySelectorAll('.brand-button');
        const selectedBrands = Array.from(buttons)
            .filter(btn => btn.classList.contains('selected'))
            .map(btn => btn.dataset.brand);
        
        // Get custom brand buttons
        const customButtons = document.querySelectorAll('.custom-brand-button');
        const selectedCustomBrands = Array.from(customButtons)
            .filter(btn => btn.classList.contains('selected'))
            .map(btn => btn.dataset.brand);
        
        // Get ALL custom brands (selected or not) for preservation
        const allCustomBrands = Array.from(customButtons)
            .map(btn => btn.dataset.brand);
        
        // Combine all selected brands
        const allSelectedBrands = [...selectedBrands, ...selectedCustomBrands];
        
        const hiddenInput = document.querySelector('.brands-input');
        const filterGroup = hiddenInput ? hiddenInput.closest('.filter-group') : null;
        
        if (hiddenInput && filterGroup) {
            // Update the hidden input value for initialization purposes
            hiddenInput.value = allSelectedBrands.join(',');
            
            // Remove existing hidden inputs for brands (but keep the .brands-input)
            filterGroup.querySelectorAll(`input[name="brands"]`).forEach(input => {
                if (!input.classList.contains('brands-input')) {
                    input.remove();
                }
            });
            
            // Create new hidden inputs for each selected brand
            // Express automatically parses multiple inputs with same name as array
            allSelectedBrands.forEach(brand => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'brands';
                input.value = brand;
                filterGroup.appendChild(input);
            });
            
            // Store all custom brands separately (selected or not) for preservation
            // Remove existing customBrands inputs
            filterGroup.querySelectorAll(`input[name="customBrands"]`).forEach(input => {
                input.remove();
            });
            
            // Create hidden inputs for all custom brands
            allCustomBrands.forEach(brand => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'customBrands';
                input.value = brand;
                filterGroup.appendChild(input);
            });
        }
    }
    
    // Initialize custom brand functionality
    function initCustomBrands() {
        const addCustomBrandBtn = document.getElementById('add-custom-brand-btn');
        const customBrandInputContainer = document.getElementById('custom-brand-input-container');
        const customBrandInput = document.getElementById('custom-brand-input');
        const addCustomBrandSubmit = document.getElementById('add-custom-brand-submit');
        const cancelCustomBrand = document.getElementById('cancel-custom-brand');
        
        if (!addCustomBrandBtn || !customBrandInputContainer || !customBrandInput) return;
        
        // Show custom brand input UI
        addCustomBrandBtn.addEventListener('click', function() {
            customBrandInputContainer.style.display = 'block';
            customBrandInput.focus();
            addCustomBrandBtn.style.display = 'none';
        });
        
        // Hide custom brand input UI
        function hideCustomBrandInput() {
            customBrandInputContainer.style.display = 'none';
            customBrandInput.value = '';
            addCustomBrandBtn.style.display = 'inline-block';
        }
        
        // Cancel button
        if (cancelCustomBrand) {
            cancelCustomBrand.addEventListener('click', hideCustomBrandInput);
        }
        
        // Add custom brand function
        function addCustomBrand() {
            const brandName = customBrandInput.value.trim();
            
            if (!brandName) {
                return;
            }
            
            // Check if brand already exists (regular or custom)
            const existingBrands = Array.from(document.querySelectorAll('.brand-button, .custom-brand-button'))
                .map(btn => btn.dataset.brand.toLowerCase());
            
            if (existingBrands.includes(brandName.toLowerCase())) {
                alert('This brand is already in the list.');
                customBrandInput.focus();
                return;
            }
            
            // Validate length (max 50 characters to match database)
            if (brandName.length > 50) {
                alert('Brand name cannot exceed 50 characters.');
                customBrandInput.focus();
                return;
            }
            
            // Create custom brand button
            createCustomBrandButton(brandName);
            
            // Clear input and hide UI
            hideCustomBrandInput();
        }
        
        // Add button click
        if (addCustomBrandSubmit) {
            addCustomBrandSubmit.addEventListener('click', addCustomBrand);
        }
        
        // Enter key press
        customBrandInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCustomBrand();
            } else if (e.key === 'Escape') {
                hideCustomBrandInput();
            }
        });
    }
    
    // Create a custom brand button
    function createCustomBrandButton(brandName) {
        const customBrandsContainer = document.getElementById('custom-brands-container');
        if (!customBrandsContainer) return;
        
        // Create button element
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'custom-brand-button selected'; // Automatically select new custom brands
        button.dataset.brand = brandName;
        button.textContent = brandName;
        
        // Create delete button (X)
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'custom-brand-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.setAttribute('aria-label', 'Remove brand');
        
        // Handle delete button click
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering brand selection
            button.remove();
            updateBrandInput();
            // CSS :empty will automatically hide the container when it becomes empty
        });
        
        // Handle brand button click (select/deselect)
        button.addEventListener('click', function(e) {
            // Don't toggle if clicking the delete button
            if (e.target === deleteBtn || deleteBtn.contains(e.target)) {
                return;
            }
            this.classList.toggle('selected');
            updateBrandInput();
        });
        
        // Append delete button to brand button
        button.appendChild(deleteBtn);
        
        // Show container if it was hidden
        customBrandsContainer.style.display = '';
        
        // Append to container
        customBrandsContainer.appendChild(button);
        
        // Update brand input
        updateBrandInput();
    }
    
    // Restore custom brands that were rendered server-side
    function restoreCustomBrands() {
        const customBrandsContainer = document.getElementById('custom-brands-container');
        if (!customBrandsContainer) return;
        
        // Get existing custom brand buttons that were rendered server-side
        const existingCustomButtons = customBrandsContainer.querySelectorAll('.custom-brand-button');
        
        existingCustomButtons.forEach(button => {
            const brandName = button.dataset.brand;
            const isSelected = button.classList.contains('selected');
            
            // Remove the old button
            button.remove();
            
            // Recreate it with proper event handlers
            const newButton = document.createElement('button');
            newButton.type = 'button';
            newButton.className = 'custom-brand-button';
            if (isSelected) {
                newButton.classList.add('selected');
            }
            newButton.dataset.brand = brandName;
            newButton.textContent = brandName;
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'custom-brand-delete';
            deleteBtn.innerHTML = '×';
            deleteBtn.setAttribute('aria-label', 'Remove brand');
            
            // Handle delete button click
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                newButton.remove();
                updateBrandInput();
            });
            
            // Handle brand button click (select/deselect)
            newButton.addEventListener('click', function(e) {
                if (e.target === deleteBtn || deleteBtn.contains(e.target)) {
                    return;
                }
                this.classList.toggle('selected');
                updateBrandInput();
            });
            
            newButton.appendChild(deleteBtn);
            customBrandsContainer.appendChild(newButton);
        });
        
        // Update brand input to reflect restored custom brands
        if (existingCustomButtons.length > 0) {
            updateBrandInput();
        }
    }
    
    // Handle form submission - ensure hidden inputs are populated
    const searchForm = document.getElementById('advanced-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            // Update hidden inputs with slider/text input values
            const sliders = document.querySelectorAll('.range-slider-container');
            sliders.forEach(container => {
                const minSlider = container.querySelector('.range-slider-min-input');
                const maxSlider = container.querySelector('.range-slider-max-input');
                const minTextInput = container.querySelector('.range-slider-min-input-text');
                const maxTextInput = container.querySelector('.range-slider-max-input-text');
                const minHidden = container.querySelector('input[type="hidden"][name*="min"]');
                const maxHidden = container.querySelector('input[type="hidden"][name*="max"]');
                
                // Use text input value if available, otherwise slider value
                const minVal = minTextInput ? minTextInput.value : (minSlider ? minSlider.value : '');
                const maxVal = maxTextInput ? maxTextInput.value : (maxSlider ? maxSlider.value : '');
                
                if (minHidden && minVal) {
                    minHidden.value = minVal;
                }
                if (maxHidden && maxVal) {
                    maxHidden.value = maxVal;
                }
            });
            
            // Ensure size inputs are updated for the active category only
            const productTypeSelect = document.getElementById('productType');
            const activeCategory = productTypeSelect ? productTypeSelect.value : '';
            if (activeCategory && ['goggles', 'gloves', 'jackets', 'pants'].includes(activeCategory)) {
                const buttons = document.querySelectorAll(`.size-button[data-category="${activeCategory}"]`);
                if (buttons.length > 0) {
                    updateSizeInput(activeCategory);
                }
            }
            
            // Ensure brand inputs are updated (this also updates customBrands)
            updateBrandInput();
            
            // Also ensure customBrands hidden input is updated
            const customBrandsHidden = document.getElementById('custom-brands-hidden');
            const allCustomBrands = Array.from(document.querySelectorAll('.custom-brand-button'))
                .map(btn => btn.dataset.brand);
            
            if (customBrandsHidden) {
                customBrandsHidden.value = allCustomBrands.join(',');
                
                // Also create/update hidden inputs for customBrands array
                const filterGroup = customBrandsHidden.closest('.filter-group');
                if (filterGroup) {
                    // Remove existing customBrands inputs
                    filterGroup.querySelectorAll(`input[name="customBrands"]`).forEach(input => {
                        if (input.id !== 'custom-brands-hidden') {
                            input.remove();
                        }
                    });
                    
                    // Create hidden inputs for each custom brand
                    allCustomBrands.forEach(brand => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'customBrands';
                        input.value = brand;
                        filterGroup.appendChild(input);
                    });
                }
            }
        });
    }
});

// Initialize radius input validation
    initRadiusInput();

    function initRadiusInput() {
        const radiusInput = document.getElementById('searchRadius');
        if (!radiusInput) return;

        radiusInput.addEventListener('change', function() {
            if (this.value && this.value < 1) {
                this.value = 1; // Minimum 1 mile
            }
            // Ensure whole number
            if (this.value) {
                this.value = Math.floor(parseFloat(this.value));
            }
        });
    }
