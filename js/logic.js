function getArea(side) {
    if (panTypes[side] === 'round') {
        const dia = parseFloat(elements[`${side}Dia`].value) || 20;
        return Math.PI * Math.pow(dia / 2, 2);
    } else {
        const w = parseFloat(elements[`${side}Width`].value) || 20;
        const h = parseFloat(elements[`${side}Height`].value) || 20;
        return w * h;
    }
}

function saveToStorage() {
    const data = {
        timestamp: Date.now(),
        activeStage: activeStage,
        panTypes: panTypes,
        inputs: {
            baseDia: elements.baseDia.value,
            baseWidth: elements.baseWidth.value,
            baseHeight: elements.baseHeight.value,
            targetDia: elements.targetDia.value,
            targetWidth: elements.targetWidth.value,
            targetHeight: elements.targetHeight.value,
            servingsInput: elements.servingsInput.value,
            laborCost: elements.laborCost.value
        },
        customIngredients: parseCustomIngredients(),
        ingredientPrices: ingredientPrices
    };
    localStorage.setItem('cakeMasterData', JSON.stringify(data));
}

function loadFromStorage() {
    const rawData = localStorage.getItem('cakeMasterData');
    if (!rawData) return;

    try {
        const data = JSON.parse(rawData);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - data.timestamp > fiveMinutes) {
            localStorage.removeItem('cakeMasterData');
            return;
        }

        // Przywracanie stanu
        if (data.activeStage) activeStage = data.activeStage;
        panTypes = data.panTypes || { base: 'round', target: 'round' };
        ingredientPrices = data.ingredientPrices || {};

        // Przywracanie pól input
        for (const [id, value] of Object.entries(data.inputs)) {
            const el = document.getElementById(id.replace('servingsInput', 'servings-target').replace('laborCost', 'labor-cost'));
            if (el) el.value = value;
        }

        // Przywracanie składników
        elements.customIngredientsList.innerHTML = '';
        if (data.customIngredients && data.customIngredients.length > 0) {
            data.customIngredients.forEach(ing => {
                const row = document.createElement('div');
                row.className = 'ingredient-row';
                row.innerHTML = `
                    <div class="autocomplete-container"><input type="text" placeholder="Nazwa" class="ing-name" value="${ing.name}"><div class="autocomplete-list"></div></div>
                    <input type="number" placeholder="Ilość" class="ing-amount" value="${ing.amount}" min="0">
                    <select class="ing-unit">
                        <option value="g" ${ing.unit === 'g' ? 'selected' : ''}>g</option>
                        <option value="ml" ${ing.unit === 'ml' ? 'selected' : ''}>ml</option>
                        <option value="szt" ${ing.unit === 'szt' ? 'selected' : ''}>szt</option>
                        <option value="szkl." ${ing.unit === 'szkl.' ? 'selected' : ''}>szkl.</option>
                        <option value="szczypta" ${ing.unit === 'szczypta' ? 'selected' : ''}>szczypta</option>
                        <option value="łyżeczka" ${ing.unit === 'łyżeczka' ? 'selected' : ''}>łyżeczka</option>
                        <option value="łyżka" ${ing.unit === 'łyżka' ? 'selected' : ''}>łyżka</option>
                    </select>
                    <button class="btn-remove">&times;</button>
                `;
                const nameInput = row.querySelector('.ing-name');
                const amountInput = row.querySelector('.ing-amount');
                initAutocomplete(nameInput, row.querySelector('.autocomplete-list'));
                amountInput.addEventListener('input', calculate);
                row.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
                row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); calculate(); });
                elements.customIngredientsList.appendChild(row);
            });
        }

        // Przywracanie etapu (zakładki)
        switchStage(activeStage);
        
        // Aktualizacja UI dla form
        togglePanType('base', panTypes.base);
        togglePanType('target', panTypes.target);
        
        calculate();
    } catch (e) {
        console.error("Błąd ładowania pamięci:", e);
    }
}

function calculate() {
    let recipe = { ingredients: parseCustomIngredients() };
    const areaBase = getArea('base');
    const areaTarget = getArea('target');
    const multiplier = areaTarget / areaBase;
    elements.multiplierBadge.textContent = `x${multiplier.toFixed(2)}`;
    
    // ... reszta obliczeń ...
    const containerHeight = 220;
    const padding = 40;
    const safeSpace = containerHeight - padding;
    
    const bDia = parseFloat(elements.baseDia.value) || 20;
    const bW = parseFloat(elements.baseWidth.value) || 20;
    const bH = parseFloat(elements.baseHeight.value) || 20;
    const tDia = parseFloat(elements.targetDia.value) || 24;
    const tW = parseFloat(elements.targetWidth.value) || 24;
    const tH = parseFloat(elements.targetHeight.value) || 24;

    const baseMax = panTypes.base === 'round' ? bDia : Math.max(bW, bH);
    const targetMax = panTypes.target === 'round' ? tDia : Math.max(tW, tH);
    const scaleFactor = safeSpace / Math.max(baseMax, targetMax, 1);
    
    if (panTypes.base === 'round') {
        elements.previewBase.style.width = elements.previewBase.style.height = `${bDia * scaleFactor}px`;
        elements.previewBase.style.borderRadius = '50%';
    } else {
        elements.previewBase.style.width = `${bW * scaleFactor}px`;
        elements.previewBase.style.height = `${bH * scaleFactor}px`;
        elements.previewBase.style.borderRadius = '4px';
    }

    if (panTypes.target === 'round') {
        elements.previewTarget.style.width = elements.previewTarget.style.height = `${tDia * scaleFactor}px`;
        elements.previewTarget.style.borderRadius = '50%';
    } else {
        elements.previewTarget.style.width = `${tW * scaleFactor}px`;
        elements.previewTarget.style.height = `${tH * scaleFactor}px`;
        elements.previewTarget.style.borderRadius = '4px';
    }

    renderIngredients(recipe, multiplier);
    saveToStorage(); // Zapisujemy po każdych obliczeniach
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * (end - start) + start).toFixed(2);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}
