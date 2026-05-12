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

function togglePanType(side, type) {
    panTypes[side] = type;
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
        const scaled = ing.amount * multiplier;
        const pricing = ingredientPrices[ing.name] || { price: 0, pkg: 1000 };
        const itemCost = (scaled / pricing.pkg) * pricing.price;
        totalCost += itemCost;

        const li = document.createElement('li');
        li.className = 'ingredient-item';
        
        let displayAmount = scaled.toFixed(scaled > 10 ? 0 : 1);
        let extraInfo = '';

        // Special handling for Eggs (szt)
        if (ing.unit === 'szt' && !Number.isInteger(scaled)) {
            const whole = Math.floor(scaled);
            const fraction = scaled - whole;
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

    // Oddzielne podliczanie kosztów
    const ingredientsCost = totalCost;
    const servings = parseInt(elements.servingsInput.value) || 1;
    const laborPerServing = parseFloat(elements.laborCost.value) || 0;
    const laborTotalCost = laborPerServing * servings;
    const totalOverallCost = ingredientsCost + laborTotalCost;

    animateValue(elements.totalIngredientsPrice, parseFloat(elements.totalIngredientsPrice.textContent) || 0, ingredientsCost, 500);
    animateValue(elements.totalLaborPrice, parseFloat(elements.totalLaborPrice.textContent) || 0, laborTotalCost, 500);
    animateValue(elements.totalPrice, parseFloat(elements.totalPrice.textContent) || 0, totalOverallCost, 500);
    animateValue(elements.pricePerServing, parseFloat(elements.pricePerServing.textContent) || 0, totalOverallCost / servings, 500);

    document.querySelectorAll('.amount').forEach(el => { 
        el.classList.add('pop'); 
        setTimeout(() => el.classList.remove('pop'), 200); 
    });
}
