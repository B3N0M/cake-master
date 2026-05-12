const elements = {
    recipeSelect: document.getElementById('recipe-select'),
    ingredientsList: document.getElementById('ingredients-list'),
    multiplierBadge: document.getElementById('multiplier-badge'),
    totalPrice: document.getElementById('total-price'),
    totalIngredientsPrice: document.getElementById('total-ingredients-price'),
    totalLaborPrice: document.getElementById('total-labor-price'),
    servingsInput: document.getElementById('servings-target'),
    previewBase: document.getElementById('preview-base'),
    previewTarget: document.getElementById('preview-target'),
    customIngredientsList: document.getElementById('custom-ingredients-list'),
    addIngredientBtn: document.getElementById('add-ingredient-btn'),
    
    tabRecipe: document.getElementById('tab-recipe'),
    tabPricing: document.getElementById('tab-pricing'),
    recipeStage: document.getElementById('recipe-stage'),
    pricingStage: document.getElementById('pricing-stage'),
    pricingIngredientsList: document.getElementById('pricing-ingredients-list'),
    goToPricingBtn: document.getElementById('go-to-pricing'),
    backToRecipeBtn: document.getElementById('back-to-recipe'),

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
    eggWeight: document.getElementById('egg-weight-val'),
    laborCost: document.getElementById('labor-cost')
};

let activeStage = 'recipe';
let panTypes = { base: 'round', target: 'round' };
let ingredientPrices = {}; 

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

const defaultPackageSizes = {
    'Mąka pszenna': 1000,
    'Mąka tortowa': 1000,
    'Cukier biały': 1000,
    'Cukier puder': 400,
    'Masło': 200,
    'Mascarpone': 250,
    'Śmietanka 30%': 500,
    'Śmietanka 36%': 500,
    'Jajka (L)': 10,
    'Jajka (M)': 10,
    'Czekolada gorzka': 100,
    'Czekolada mleczna': 100,
    'Czekolada biała': 100,
    'Twaróg sernikowy': 1000,
    'Kakao': 100,
    'Olej roślinny': 1000,
    'Mleko': 1000,
    'Proszek do pieczenia': 30,
    'Cukier waniliowy': 16,
    'Żelatyna': 50
};

const commonIngredients = [
    'Mąka pszenna', 'Mąka tortowa', 'Mąka ziemniaczana', 'Mąka migdałowa',
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
    'Miód', 'Syrop klonowy', 'Ekstrakt z wanilii'
];

const unitMap = {
    'jajka': 'szt',
    'jajo': 'szt',
    'mleko': 'ml',
    'śmietanka': 'ml',
    'olej': 'ml',
    'woda': 'ml',
    'mąka': 'g',
    'cukier': 'g',
    'sól': 'szczypta',
    'proszek': 'łyżeczka',
    'soda': 'łyżeczka'
};
