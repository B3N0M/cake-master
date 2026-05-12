const recipes = {
    'biszkopt': {
        name: 'Klasyczny Biszkopt Puszysty',
        baseDia: 20,
        ingredients: [
            { name: 'Jajka (L)', amount: 5, unit: 'szt', pricePerUnit: 1.2 },
            { name: 'Cukier', amount: 150, unit: 'g', pricePerUnit: 0.005 },
            { name: 'Mąka pszenna', amount: 150, unit: 'g', pricePerUnit: 0.003 },
            { name: 'Skrobia ziemniaczana', amount: 30, unit: 'g', pricePerUnit: 0.008 }
        ]
    },
    'krem-maslany': {
        name: 'Krem Maślany (Szwajcarski)',
        baseDia: 20,
        ingredients: [
            { name: 'Białka jaj', amount: 150, unit: 'g', pricePerUnit: 0.02 },
            { name: 'Cukier', amount: 250, unit: 'g', pricePerUnit: 0.005 },
            { name: 'Masło (min. 82%)', amount: 400, unit: 'g', pricePerUnit: 0.045 },
            { name: 'Wanilia (ekstrakt)', amount: 5, unit: 'ml', pricePerUnit: 0.5 }
        ]
    },
    'ganache': {
        name: 'Ganache Czekoladowy',
        baseDia: 20,
        ingredients: [
            { name: 'Czekolada deserowa', amount: 200, unit: 'g', pricePerUnit: 0.06 },
            { name: 'Śmietanka 36%', amount: 200, unit: 'ml', pricePerUnit: 0.025 }
        ]
    }
};

const commonIngredients = [
    'Mąka pszenna', 'Mąka tortowa', 'Mąka ziemniaczana', 'Mąka krupczatka', 'Mąka migdałowa',
    'Cukier biały', 'Cukier puder', 'Cukier trzcinowy', 'Cukier waniliowy',
    'Masło', 'Masło klarowane', 'Margaryna',
    'Mleko', 'Mleko skondensowane', 'Mleko kokosowe',
    'Śmietanka 30%', 'Śmietanka 36%', 'Śmietana 18%',
    'Jajka (L)', 'Jajka (M)', 'Białka jaj', 'Żółtka jaj',
    'Czekolada gorzka', 'Czekolada mleczna', 'Czekolada biała', 'Kakao',
    'Proszek do pieczenia', 'Soda oczyszczona', 'Sól',
    'Żelatyna', 'Agar', 'Pektyna',
    'Twaróg sernikowy', 'Mascarpone', 'Ricotta',
    'Olej roślinny', 'Olej kokosowy',
    'Miód', 'Syrop klonowy', 'Syrop z agawy',
    'Drożdże świeże', 'Drożdże suszone',
    'Ekstrakt z wanilii', 'Pasta z wanilii', 'Aromat migdałowy'
];

const elements = {
    recipeSelect: document.getElementById('recipe-select'),
    ingredientsList: document.getElementById('ingredients-list'),
    multiplierBadge: document.getElementById('multiplier-badge'),
    totalPrice: document.getElementById('total-price'),
    servingsInput: document.getElementById('servings-target'),
    previewBase: document.getElementById('preview-base'),
    previewTarget: document.getElementById('preview-target'),
    customIngredientsList: document.getElementById('custom-ingredients-list'),
    addIngredientBtn: document.getElementById('add-ingredient-btn'),
    
    // Stages & Tabs
    tabRecipe: document.getElementById('tab-recipe'),
    tabPricing: document.getElementById('tab-pricing'),
    recipeStage: document.getElementById('recipe-stage'),
    pricingStage: document.getElementById('pricing-stage'),
    pricingIngredientsList: document.getElementById('pricing-ingredients-list'),
    goToPricingBtn: document.getElementById('go-to-pricing'),
    backToRecipeBtn: document.getElementById('back-to-recipe'),

    // Nowe pola dla form
    baseDia: document.getElementById('base-dia'),
    baseWidth: document.getElementById('base-width'),
    baseHeight: document.getElementById('base-height'),
    targetDia: document.getElementById('target-dia'),
    targetWidth: document.getElementById('target-width'),
    targetHeight: document.getElementById('target-height'),
    baseRoundInputs: document.getElementById('base-round-inputs'),
    baseRectInputs: document.getElementById('base-rect-inputs'),
    targetRoundInputs: document.getElementById('target-round-inputs'),
    targetRectInputs: document.getElementById('target-rect-inputs'),
    pricePerServing: document.getElementById('price-per-serving-val'),
    eggWeight: document.getElementById('egg-weight-val')
};

let activeStage = 'recipe';
let panTypes = { base: 'round', target: 'round' };
let ingredientPrices = {}; // { nazwa: { price: X, pkg: Y } }

function switchStage(stage) {
    activeStage = stage;
    if (stage === 'recipe') {
        elements.recipeStage.style.display = 'block';
        elements.pricingStage.style.display = 'none';
        elements.tabRecipe.classList.add('active');
        elements.tabPricing.classList.remove('active');
    } else {
        elements.recipeStage.style.display = 'none';
        elements.pricingStage.style.display = 'block';
        elements.tabRecipe.classList.remove('active');
        elements.tabPricing.classList.add('active');
        renderPricingRows();
    }
    calculate();
}

function renderPricingRows() {
    const ingredients = parseCustomIngredients();
    elements.pricingIngredientsList.innerHTML = '';
    
    ingredients.forEach(ing => {
        if (!ing.name) return;
        const row = document.createElement('div');
        row.className = 'pricing-row';
        
        const saved = ingredientPrices[ing.name] || { price: 0, pkg: 1 };
        
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

function togglePanType(side, type) {
    panTypes[side] = type;
    
    // UI Updates
    document.querySelectorAll(`.pan-type-btn[data-side="${side}"]`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    if (side === 'base') {
        elements.baseRoundInputs.style.display = type === 'round' ? 'block' : 'none';
        elements.baseRectInputs.style.display = type === 'rect' ? 'block' : 'none';
    } else {
        elements.targetRoundInputs.style.display = type === 'round' ? 'block' : 'none';
        elements.targetRectInputs.style.display = type === 'rect' ? 'block' : 'none';
    }
    calculate();
}

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

function initAutocomplete(input, listContainer) {
    const unitMap = {
        'jajka': 'szt',
        'jajo': 'szt',
        'mleko': 'ml',
        'śmietanka': 'ml',
        'olej': 'ml',
        'woda': 'ml',
        'sok': 'ml',
        'ekstrakt': 'ml',
        'aromat': 'ml'
    };

    input.addEventListener('input', () => {
        const value = input.value.toLowerCase();
        listContainer.innerHTML = '';
        if (!value) return;

        const matches = commonIngredients.filter(ing => ing.toLowerCase().includes(value)).slice(0, 5);
        matches.forEach(match => {
            const li = document.createElement('div');
            li.className = 'autocomplete-item'; // PRZYWRÓCONE PODŚWIETLANIE
            li.textContent = match;
            li.addEventListener('click', () => {
                input.value = match;
                listContainer.innerHTML = '';
                
                // Inteligentne ustawianie jednostki
                const unitSelect = input.closest('.ingredient-row').querySelector('.ing-unit');
                const lowerMatch = match.toLowerCase();
                
                let foundUnit = 'g'; // Domyślna jednostka
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
            <option value="szkl">szkl.</option>
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
    calculate();
}

function parseCustomIngredients() {
    const rows = elements.customIngredientsList.querySelectorAll('.ingredient-row');
    const ingredients = [];
    rows.forEach(row => {
        const name = row.querySelector('.ing-name').value || 'Składnik';
        const amount = parseFloat(row.querySelector('.ing-amount').value);
        const unit = row.querySelector('.ing-unit').value;
        if (!isNaN(amount)) ingredients.push({ name, amount, unit, pricePerUnit: 0 });
    });
    return ingredients;
}

function drawSlices(container, type, count, w, h) {
    // Zawsze czyścimy przed rysowaniem
    container.querySelectorAll('.slice-line').forEach(l => l.remove());
    
    if (!count || count <= 1) return;

    if (type === 'round') {
        // Linie promieniowe dla okrągłego
        for (let i = 0; i < count; i++) {
            const line = document.createElement('div');
            line.className = 'slice-line radial';
            line.style.transform = `rotate(${(360 / count) * i}deg)`;
            container.appendChild(line);
        }
    } else {
        // Siatka dla prostokąta - ulepszony algorytm
        const targetW = parseFloat(w) || 20;
        const targetH = parseFloat(h) || 20;
        const ratio = targetW / targetH;
        
        let cols = Math.round(Math.sqrt(count * ratio));
        if (cols < 1) cols = 1;
        let rows = Math.ceil(count / cols);
        
        // Pionowe
        for (let i = 1; i < cols; i++) {
            const line = document.createElement('div');
            line.className = 'slice-line vertical';
            line.style.left = `${(100 / cols) * i}%`;
            container.appendChild(line);
        }
        // Poziome
        for (let i = 1; i < rows; i++) {
            const line = document.createElement('div');
            line.className = 'slice-line horizontal';
            line.style.top = `${(100 / rows) * i}%`;
            container.appendChild(line);
        }
    }
}

function calculate() {
    let recipe = { name: 'Twój Przepis', ingredients: parseCustomIngredients() };

    const areaBase = getArea('base');
    const areaTarget = getArea('target');
    const multiplier = areaTarget / areaBase;
    
    elements.multiplierBadge.textContent = `x${multiplier.toFixed(2)}`;
    
    const containerHeight = 220;
    const padding = 40;
    const safeSpace = containerHeight - padding;
    
    const bDia = parseFloat(elements.baseDia.value) || 0;
    const bW = parseFloat(elements.baseWidth.value) || 0;
    const bH = parseFloat(elements.baseHeight.value) || 0;
    const tDia = parseFloat(elements.targetDia.value) || 0;
    const tW = parseFloat(elements.targetWidth.value) || 0;
    const tH = parseFloat(elements.targetHeight.value) || 0;

    const baseMax = panTypes.base === 'round' ? bDia : Math.max(bW, bH);
    const targetMax = panTypes.target === 'round' ? tDia : Math.max(tW, tH);
    const absoluteMax = Math.max(baseMax, targetMax, 1);

    const scaleFactor = safeSpace / absoluteMax;
    
    // Wymiary Bazy
    let wBase, hBase;
    if (panTypes.base === 'round') {
        wBase = hBase = bDia * scaleFactor;
    } else {
        wBase = bW * scaleFactor;
        hBase = bH * scaleFactor;
    }
    
    elements.previewBase.style.width = `${wBase}px`;
    elements.previewBase.style.height = `${hBase}px`;
    elements.previewBase.style.borderRadius = panTypes.base === 'round' ? '50%' : '4px';
    
    // Wymiary Targetu
    let wTarget, hTarget;
    if (panTypes.target === 'round') {
        wTarget = hTarget = tDia * scaleFactor;
    } else {
        wTarget = tW * scaleFactor;
        hTarget = tH * scaleFactor;
    }
    
    elements.previewTarget.style.width = `${wTarget}px`;
    elements.previewTarget.style.height = `${hTarget}px`;
    elements.previewTarget.style.borderRadius = panTypes.target === 'round' ? '50%' : '4px';

    // Rysujemy porcje TYLKO na Twoim torcie dla czytelności
    const servings = parseInt(elements.servingsInput.value) || 12;
    
    // Czyścimy bazę (zostaje czysty kształt dla porównania)
    elements.previewBase.querySelectorAll('.slice-line').forEach(l => l.remove());
    
    // Twój tort
    drawSlices(elements.previewTarget, panTypes.target, servings, tW || tDia, tH || tDia);

    renderIngredients(recipe, multiplier);
}

function renderIngredients(recipe, multiplier) {
    elements.ingredientsList.innerHTML = '';
    let totalCost = 0;
    
    if (recipe.ingredients.length === 0) {
        elements.ingredientsList.innerHTML = '<li class="ingredient-item">Wpisz składniki po lewej...</li>';
        elements.totalPrice.textContent = '0.00';
        elements.pricePerServing.textContent = '0.00';
        return;
    }

    recipe.ingredients.forEach(ing => {
        if (!ing.name) return;
        
        const scaledAmount = ing.amount * multiplier;
        
        // Obliczanie kosztu na podstawie wyceny
        const pricing = ingredientPrices[ing.name] || { price: 0, pkg: 1000 };
        const itemCost = (scaledAmount / pricing.pkg) * pricing.price;
        totalCost += itemCost;

        const li = document.createElement('li');
        li.className = 'ingredient-item';
        
        let displayAmount = scaledAmount.toFixed(scaledAmount > 10 ? 0 : 1);
        let extraInfo = '';

        // Specjalne traktowanie dla JAJEK (jednostka 'szt')
        if (ing.unit === 'szt' && !Number.isInteger(scaledAmount)) {
            const whole = Math.floor(scaledAmount);
            const fraction = scaledAmount - whole;
            const eggWeight = parseFloat(elements.eggWeight.value) || 50;
            const grams = Math.round(fraction * eggWeight);
            
            if (whole > 0) {
                displayAmount = `${whole}`;
                extraInfo = ` + ${grams}g (rozmącone)`;
            } else {
                displayAmount = `${grams}g`;
                extraInfo = ` (rozmącone)`;
            }
        }

        li.innerHTML = `
            <span>${ing.name}</span>
            <div>
                <span class="amount">${displayAmount}</span>
                <span class="unit">${ing.unit}${extraInfo}</span>
            </div>
        `;
        elements.ingredientsList.appendChild(li);
    });

    animateValue(elements.totalPrice, parseFloat(elements.totalPrice.textContent) || 0, totalCost, 500);
    
    const servings = parseInt(elements.servingsInput.value) || 12;
    const costPerServing = totalCost / servings;
    animateValue(elements.pricePerServing, parseFloat(elements.pricePerServing.textContent) || 0, costPerServing, 500);

    document.querySelectorAll('.amount').forEach(el => { 
        el.classList.add('pop'); 
        setTimeout(() => el.classList.remove('pop'), 200); 
    });
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const startVal = isNaN(start) ? 0 : start;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * (end - startVal) + startVal).toFixed(end > 0 ? 2 : 2);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
    addIngredientRow();
    elements.addIngredientBtn.addEventListener('click', addIngredientRow);
    
    // Stage navigation
    elements.tabRecipe.addEventListener('click', () => switchStage('recipe'));
    elements.tabPricing.addEventListener('click', () => switchStage('pricing'));
    elements.goToPricingBtn.addEventListener('click', () => switchStage('pricing'));
    elements.backToRecipeBtn.addEventListener('click', () => switchStage('recipe'));

    // Toggle Buttons
    document.querySelectorAll('.pan-type-btn').forEach(btn => {
        btn.addEventListener('click', () => togglePanType(btn.dataset.side, btn.dataset.type));
    });

    // Inputs
    const inputElements = [
        elements.baseDia, elements.baseWidth, elements.baseHeight, 
        elements.targetDia, elements.targetWidth, elements.targetHeight, elements.servingsInput
    ];

    inputElements.forEach(el => {
        if (el) {
            el.addEventListener('input', (e) => {
                if (e.target.type === 'number' && e.target.value < 0) e.target.value = 0;
                calculate();
            });
            el.addEventListener('change', calculate);
        }
    });

    // Egg size buttons
    document.querySelectorAll('.egg-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.egg-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            elements.eggWeight.value = btn.dataset.size;
            calculate();
        });
    });

    calculate();
});
