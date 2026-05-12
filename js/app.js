document.addEventListener('DOMContentLoaded', () => {
    // Próbujemy załadować dane z pamięci, jeśli nie ma - dodajemy pusty wiersz
    loadFromStorage();
    if (elements.customIngredientsList.children.length === 0) {
        addIngredientRow();
    }
    
    // Global Click Listeners
    elements.addIngredientBtn.addEventListener('click', addIngredientRow);
    elements.tabRecipe.addEventListener('click', () => switchStage('recipe'));
    elements.tabPricing.addEventListener('click', () => switchStage('pricing'));
    elements.goToPricingBtn.addEventListener('click', () => switchStage('pricing'));
    elements.backToRecipeBtn.addEventListener('click', () => switchStage('recipe'));
    elements.laborCost.addEventListener('input', calculate);

    // Pan Toggle Buttons
    document.querySelectorAll('.pan-type-btn').forEach(btn => {
        btn.addEventListener('click', () => togglePanType(btn.dataset.side, btn.dataset.type));
    });

    // Universal Input Listener
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

    calculate();
});
