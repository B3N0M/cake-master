function renderPricingRows() {
    const ingredients = parseCustomIngredients();
    elements.pricingIngredientsList.innerHTML = '';
    
    ingredients.forEach(ing => {
        if (!ing.name) return;
        const row = document.createElement('div');
        row.className = 'pricing-row';
        
        // Ustawienie domyślnej wielkości opakowania jeśli brak zapisanej ceny
        const defaultPkg = defaultPackageSizes[ing.name] || 1000;
        const saved = ingredientPrices[ing.name] || { price: 0, pkg: defaultPkg };
        
        row.innerHTML = `
            <span class="ing-name-label">${ing.name} (${ing.unit})</span>
            <input type="number" placeholder="Wlk. op." class="ing-pkg-size" value="${saved.pkg}" min="0">
            <input type="number" placeholder="Cena op." class="ing-pkg-price" value="${saved.price}" step="0.01" min="0">
        `;
        
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                if (e.target.value < 0) e.target.value = 0;
                ingredientPrices[ing.name] = {
                    price: parseFloat(row.querySelector('.ing-pkg-price').value) || 0,
                    pkg: parseFloat(row.querySelector('.ing-pkg-size').value) || 1
                };
                calculate();
            });
        });
        
        elements.pricingIngredientsList.appendChild(row);
    });
}

function initAutocomplete(input, listContainer) {
    input.addEventListener('input', () => {
        const value = input.value.toLowerCase();
        listContainer.innerHTML = '';
        if (!value) return;

        const matches = commonIngredients.filter(ing => ing.toLowerCase().includes(value)).slice(0, 5);
        matches.forEach(match => {
            const li = document.createElement('div');
            li.className = 'autocomplete-item';
            li.textContent = match;
            li.addEventListener('click', () => {
                input.value = match;
                listContainer.innerHTML = '';
                
                const unitSelect = input.closest('.ingredient-row').querySelector('.ing-unit');
                const lowerMatch = match.toLowerCase();
                
                let foundUnit = 'g';
                for (const [keyword, unit] of Object.entries(unitMap)) {
                    if (lowerMatch.includes(keyword)) {
                        foundUnit = unit;
                        break;
                    }
                }
                unitSelect.value = foundUnit;
                calculate();
            });
            listContainer.appendChild(li);
        });
    });
    document.addEventListener('click', (e) => { if (e.target !== input) listContainer.innerHTML = ''; });
}

function addIngredientRow() {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <div class="autocomplete-container"><input type="text" placeholder="Nazwa" class="ing-name"><div class="autocomplete-list"></div></div>
        <input type="number" placeholder="Ilość" class="ing-amount" min="0">
        <select class="ing-unit">
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="szt">szt</option>
            <option value="szkl.">szkl.</option>
            <option value="szczypta">szczypta</option>
            <option value="łyżeczka">łyżeczka</option>
            <option value="łyżka">łyżka</option>
        </select>
        <button class="btn-remove">&times;</button>
    `;
    const nameInput = row.querySelector('.ing-name');
    const amountInput = row.querySelector('.ing-amount');
    
    initAutocomplete(nameInput, row.querySelector('.autocomplete-list'));
    
    amountInput.addEventListener('input', (e) => {
        if (e.target.value < 0) e.target.value = 0;
        calculate();
    });

    row.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
    row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); calculate(); });
    elements.customIngredientsList.appendChild(row);
}

function parseCustomIngredients() {
    const rows = elements.customIngredientsList.querySelectorAll('.ingredient-row');
    const ingredients = [];
    rows.forEach(row => {
        const name = row.querySelector('.ing-name').value;
        const amount = parseFloat(row.querySelector('.ing-amount').value);
        const unit = row.querySelector('.ing-unit').value;
        if (!isNaN(amount)) ingredients.push({ name, amount, unit });
    });
    return ingredients;
}
