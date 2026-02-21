// ============================================
// WeMeal - Recipe Database V3
// With quantities, vegetarian/vegan flags
// ============================================

window.recipesDatabase = [
    // --- SALADS ---
    {
        id: 1, name: "Salade Fraîcheur d'Été", emoji: "🥗", category: "salad", time: "15 min", calories: 280, sugar: 4, servings: 2,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: false, isGlutenFree: true,
        weather: ["sunny", "hot"], season: ["summer", "spring"],
        ingredients: [
            { name: "salade", qty: "1 tête" }, { name: "tomates", qty: "3" }, { name: "concombre", qty: "1/2" },
            { name: "feta", qty: "100g" }, { name: "olives", qty: "50g" }, { name: "huile d'olive", qty: "2 c.s." }
        ],
        steps: ["Laver et essorer la salade", "Couper les tomates et le concombre en dés", "Émietter la feta", "Ajouter les olives", "Assaisonner"]
    },
    {
        id: 14, name: "Taboulé Libanais", emoji: "🥗", category: "salad", time: "20 min", calories: 220, sugar: 3, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: true, isGlutenFree: true,
        weather: ["sunny", "hot"], season: ["summer", "spring"],
        ingredients: [
            { name: "persil", qty: "1 gros bouquet" }, { name: "boulghour", qty: "50g" }, { name: "tomates", qty: "4" },
            { name: "citron", qty: "2" }, { name: "menthe", qty: "1 bouquet" }, { name: "oignon blanc", qty: "1" }
        ],
        steps: ["Hacher finement le persil et la menthe", "Couper tomates en dés", "Mélanger avec boulghour fin", "Assaisonner généreusement"]
    },
    // --- PASTA ---
    {
        id: 2, name: "Pasta Soleil", emoji: "🍝", category: "pasta", time: "25 min", calories: 520, sugar: 8, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ["sunny", "cloudy"], season: ["summer", "spring", "fall"],
        ingredients: [
            { name: "pâtes", qty: "400g" }, { name: "tomates cerises", qty: "300g" }, { name: "basilic", qty: "1 bouquet" },
            { name: "parmesan", qty: "80g" }, { name: "ail", qty: "2 gousses" }
        ],
        steps: ["Cuire les pâtes", "Sauter l'ail et tomates", "Mélanger", "Garnir de basilic"]
    },
    {
        id: 10, name: "Risotto Champignons", emoji: "🍝", category: "pasta", time: "40 min", calories: 450, sugar: 4, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: false, isVegetarian: true, isVegan: false, isGlutenFree: true,
        weather: ["cold", "rainy", "cloudy"], season: ["fall", "winter"],
        ingredients: [
            { name: "riz arborio", qty: "300g" }, { name: "champignons", qty: "250g" }, { name: "oignon", qty: "1" },
            { name: "vin blanc", qty: "10cl" }, { name: "parmesan", qty: "60g" }, { name: "bouillon", qty: "1L" }
        ],
        steps: ["Suer les oignons", "Nacrer le riz", "Ajouter bouillon petit à petit", "Mantecare au parmesan"]
    },
    // --- SOUPS ---
    {
        id: 12, name: "Gazpacho Andalou", emoji: "🍲", category: "soup", time: "15 min", calories: 180, sugar: 9, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: true, isGlutenFree: true,
        weather: ["hot", "sunny"], season: ["summer"],
        ingredients: [
            { name: "tomates", qty: "1kg" }, { name: "concombre", qty: "1/2" }, { name: "poivron", qty: "1" },
            { name: "ail", qty: "1 gousse" }, { name: "vinaigre", qty: "2 c.s." }, { name: "huile d'olive", qty: "3 c.s." }
        ],
        steps: ["Couper les légumes", "Mixer finement", "Assaisonner", "Servir très frais"]
    },
    {
        id: 4, name: "Velouté de Potimarron", emoji: "🍲", category: "soup", time: "40 min", calories: 250, sugar: 8, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: true, isVegetarian: true, isVegan: false, isGlutenFree: true,
        weather: ["rainy", "cold"], season: ["fall", "winter"],
        ingredients: [
            { name: "potimarron", qty: "1kg" }, { name: "oignon", qty: "1" }, { name: "crème", qty: "15cl" },
            { name: "muscade", qty: "1 pincée" }, { name: "bouillon", qty: "50cl" }
        ],
        steps: ["Couper le potimarron", "Cuire dans le bouillon", "Mixer", "Ajouter la crème"]
    },
    // --- MEAT ---
    {
        id: 13, name: "Brochettes de Poulet Citron", emoji: "🍖", category: "meat", time: "30 min", calories: 350, sugar: 2, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["sunny", "hot"], season: ["summer"],
        ingredients: [
            { name: "poulet", qty: "600g" }, { name: "citron", qty: "2" }, { name: "poivron", qty: "2" },
            { name: "oignon", qty: "1" }, { name: "origan", qty: "1 c.c." }
        ],
        steps: ["Couper poulet et légumes", "Mariner au citron", "Monter les brochettes", "Griller 15 min"]
    },
    {
        id: 6, name: "Tartiflette Savoyarde", emoji: "🍖", category: "meat", time: "50 min", calories: 680, sugar: 2, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: false, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["cold", "snowy"], season: ["winter"],
        ingredients: [
            { name: "reblochon", qty: "1" }, { name: "pommes de terre", qty: "1kg" }, { name: "lardons", qty: "200g" },
            { name: "oignons", qty: "2" }, { name: "crème", qty: "20cl" }
        ],
        steps: ["Cuire patates", "Rissoler lardons/oignons", "Monter le plat", "Enfourner avec reblochon"]
    },
    {
        id: 11, name: "Poulet Rôti du Dimanche", emoji: "🍖", category: "meat", time: "1h 15", calories: 420, sugar: 1, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["cold", "cloudy", "rainy"], season: ["winter", "fall", "spring"],
        ingredients: [
            { name: "poulet", qty: "1.5kg" }, { name: "ail", qty: "1 tête" }, { name: "thym", qty: "4 branches" },
            { name: "pommes de terre", qty: "800g" }, { name: "beurre", qty: "50g" }
        ],
        steps: ["Assaisonner le poulet", "Enfourner à 200°C", "Arroser souvent", "Cuire les pommes de terre autour"]
    },
    {
        id: 17, name: "Parmentier de Canard", emoji: "🍖", category: "meat", time: "60 min", calories: 550, sugar: 3, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ["cold", "rainy"], season: ["fall", "winter"],
        ingredients: [
            { name: "confit canard", qty: "4 cuisses" }, { name: "pommes de terre", qty: "1kg" }, { name: "lait", qty: "20cl" },
            { name: "échalotes", qty: "3" }, { name: "persil", qty: "1 bouquet" }
        ],
        steps: ["Effilocher le canard", "Faire une purée", "Monter le parmentier", "Gratiner au four"]
    },
    {
        id: 18, name: "Chili con Carne", emoji: "🍖", category: "meat", time: "45 min", calories: 400, sugar: 5, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["cold", "rainy"], season: ["winter", "fall"],
        ingredients: [
            { name: "boeuf haché", qty: "500g" }, { name: "haricots rouges", qty: "400g" }, { name: "tomates", qty: "400g" },
            { name: "poivron", qty: "1" }, { name: "cumin", qty: "1 c.c." }, { name: "piment", qty: "1/2 c.c." }
        ],
        steps: ["Saisir la viande", "Ajouter légumes et épices", "Mijoter 30 min", "Ajouter haricots"]
    },
    {
        id: 27, name: "Tacos Mexicains", emoji: "🍖", category: "meat", time: "25 min", calories: 450, sugar: 3, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["sunny", "hot"], season: ["summer", "spring"],
        ingredients: [
            { name: "tortillas maïs", qty: "8" }, { name: "boeuf", qty: "400g" }, { name: "avocat", qty: "2" },
            { name: "salsa", qty: "150g" }, { name: "citron vert", qty: "2" }
        ],
        steps: ["Cuire la viande épicée", "Chauffer tortillas", "Garnir avec salsa et avocat"]
    },
    {
        id: 28, name: "Curry Vert Thaï", emoji: "🍖", category: "meat", time: "40 min", calories: 420, sugar: 6, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["rainy", "cloudy"], season: ["all"],
        ingredients: [
            { name: "lait coco", qty: "400ml" }, { name: "pâte curry vert", qty: "3 c.s." }, { name: "poulet", qty: "500g" },
            { name: "bambou", qty: "100g" }, { name: "basilic thaï", qty: "1 bouquet" }
        ],
        steps: ["Chauffer pâte curry", "Ajouter lait coco", "Cuire poulet dedans", "Finir avec herbes"]
    },
    // --- FISH ---
    {
        id: 15, name: "Ceviche de Daurade", emoji: "🐟", category: "fish", time: "20 min", calories: 210, sugar: 4, servings: 2,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["hot", "sunny"], season: ["summer"],
        ingredients: [
            { name: "daurade", qty: "300g" }, { name: "citron vert", qty: "4" }, { name: "coriandre", qty: "1 bouquet" },
            { name: "piment", qty: "1" }, { name: "oignon rouge", qty: "1/2" }
        ],
        steps: ["Couper le poisson en dés", "Mariner dans le citron 15 min", "Ajouter les aromates", "Servir frais"]
    },
    {
        id: 5, name: "Poke Bowl Saumon", emoji: "🐟", category: "fish", time: "20 min", calories: 410, sugar: 5, servings: 2,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["sunny", "cloudy"], season: ["spring", "summer"],
        ingredients: [
            { name: "riz vinaigré", qty: "200g" }, { name: "saumon", qty: "200g" }, { name: "avocat", qty: "1" },
            { name: "mangue", qty: "1/2" }, { name: "edamame", qty: "100g" }
        ],
        steps: ["Cuire le riz", "Couper poisson et fruits", "Assembler le bowl", "Sauce sésame"]
    },
    {
        id: 26, name: "Pad Thai Crevettes", emoji: "🐟", category: "fish", time: "30 min", calories: 480, sugar: 12, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: false, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["sunny", "cloudy"], season: ["all"],
        ingredients: [
            { name: "nouilles riz", qty: "250g" }, { name: "crevettes", qty: "300g" }, { name: "cacahuètes", qty: "50g" },
            { name: "germes soja", qty: "100g" }, { name: "oeuf", qty: "2" }
        ],
        steps: ["Tremper nouilles", "Sauter crevettes", "Ajouter nouilles et sauce", "Garnir cacahuètes"]
    },
    {
        id: 29, name: "Sushi Bowl", emoji: "🐟", category: "fish", time: "20 min", calories: 380, sugar: 4, servings: 2,
        glycemicIndex: "medium", diabeticFriendly: true, isVegetarian: false, isVegan: false, isGlutenFree: true,
        weather: ["sunny"], season: ["all"],
        ingredients: [
            { name: "riz sushis", qty: "200g" }, { name: "saumon cru", qty: "200g" }, { name: "avocat", qty: "1" },
            { name: "concombre", qty: "1/2" }, { name: "algue nori", qty: "2 feuilles" }
        ],
        steps: ["Riz vinaigré", "Couper poisson", "Dresser le bol", "Sauce soja wasabi"]
    },
    // --- VEGGIE ---
    {
        id: 8, name: "Dahl de Lentilles", emoji: "🥬", category: "veggie", time: "35 min", calories: 310, sugar: 3, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: true, isGlutenFree: true,
        weather: ["cloudy", "rainy", "cold"], season: ["winter", "fall"],
        ingredients: [
            { name: "lentilles corail", qty: "300g" }, { name: "lait de coco", qty: "400ml" }, { name: "tomates", qty: "400g" },
            { name: "curry", qty: "2 c.s." }, { name: "riz", qty: "200g" }
        ],
        steps: ["Cuire les lentilles avec épices", "Ajouter lait de coco", "Servir avec riz"]
    },
    {
        id: 9, name: "Avocado Toast Royal", emoji: "🥬", category: "veggie", time: "10 min", calories: 340, sugar: 2, servings: 2,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: false,
        weather: ["sunny", "cloudy"], season: ["spring", "summer"],
        ingredients: [
            { name: "pain complet", qty: "2 tranches" }, { name: "avocat", qty: "1" }, { name: "oeuf", qty: "2" },
            { name: "saumon fumé", qty: "50g" }, { name: "graines", qty: "1 c.s." }
        ],
        steps: ["Toaster le pain", "Écraser l'avocat", "Ajouter saumon et oeuf poché", "Saupoudrer de graines"]
    },
    {
        id: 19, name: "Gratin de Chou-fleur", emoji: "🥬", category: "veggie", time: "40 min", calories: 280, sugar: 4, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, isVegetarian: true, isVegan: false,
        weather: ["cold", "cloudy"], season: ["winter"],
        ingredients: [
            { name: "chou-fleur", qty: "1" }, { name: "béchamel", qty: "50cl" }, { name: "muscade", qty: "1 pincée" },
            { name: "gruyère", qty: "100g" }, { name: "jambon", qty: "2 tranches" }
        ],
        steps: ["Cuire chou-fleur vapeur", "Faire la béchamel", "Napper et parsemer de fromage", "Gratiner"]
    },
    {
        id: 20, name: "Quiche aux Asperges", emoji: "🥬", category: "veggie", time: "45 min", calories: 320, sugar: 3, servings: 6,
        glycemicIndex: "medium", diabeticFriendly: true, isVegetarian: true, isVegan: false,
        weather: ["sunny", "cloudy"], season: ["spring"],
        ingredients: [
            { name: "pâte brisée", qty: "1" }, { name: "asperges vertes", qty: "1 botte" }, { name: "oeufs", qty: "3" },
            { name: "crème", qty: "20cl" }, { name: "chèvre", qty: "100g" }
        ],
        steps: ["Blanchir les asperges", "Battre oeufs et crème", "Disposer sur la pâte", "Cuire au four"]
    },
    {
        id: 21, name: "Wok de Légumes", emoji: "🥬", category: "veggie", time: "15 min", calories: 190, sugar: 6, servings: 2,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: true,
        weather: ["cloudy", "sunny"], season: ["spring", "summer"],
        ingredients: [
            { name: "carottes", qty: "2" }, { name: "pois gourmands", qty: "100g" }, { name: "champignons", qty: "150g" },
            { name: "sauce soja", qty: "2 c.s." }, { name: "gingembre", qty: "1 morceau" }
        ],
        steps: ["Couper légumes en julienne", "Sauter au wok feu vif", "Déglacer sauce soja", "Servir croquant"]
    },
    {
        id: 30, name: "Buddha Bowl Vegan", emoji: "🥬", category: "veggie", time: "25 min", calories: 380, sugar: 6, servings: 2,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: true,
        weather: ["sunny", "cloudy"], season: ["all"],
        ingredients: [
            { name: "quinoa", qty: "150g" }, { name: "pois chiches", qty: "200g" }, { name: "patate douce", qty: "1" },
            { name: "avocat", qty: "1" }, { name: "tahini", qty: "2 c.s." }
        ],
        steps: ["Cuire quinoa", "Rôtir pois chiches et patate douce", "Assembler le bol", "Arroser de tahini"]
    },
    {
        id: 31, name: "Curry de Légumes", emoji: "🥬", category: "veggie", time: "35 min", calories: 320, sugar: 8, servings: 4,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: true,
        weather: ["rainy", "cold"], season: ["fall", "winter"],
        ingredients: [
            { name: "lait de coco", qty: "400ml" }, { name: "pâte curry", qty: "2 c.s." }, { name: "aubergine", qty: "1" },
            { name: "courgette", qty: "1" }, { name: "poivron", qty: "1" }, { name: "riz basmati", qty: "200g" }
        ],
        steps: ["Revenir les légumes", "Ajouter pâte curry et lait coco", "Mijoter 20 min", "Servir avec riz"]
    },
    // --- DESSERTS ---
    {
        id: 7, name: "Smoothie Bowl Rouge", emoji: "🍰", category: "dessert", time: "10 min", calories: 290, sugar: 22, servings: 1,
        glycemicIndex: "medium", diabeticFriendly: true, isVegetarian: true, isVegan: true, isGlutenFree: true,
        weather: ["sunny", "hot"], season: ["summer", "spring"],
        ingredients: [
            { name: "banane", qty: "1" }, { name: "fraises", qty: "150g" }, { name: "lait d'amande", qty: "10cl" },
            { name: "granola", qty: "30g" }, { name: "chia", qty: "1 c.s." }
        ],
        steps: ["Mixer les fruits", "Verser dans un bol", "Ajouter les toppings"]
    },
    {
        id: 16, name: "Crumble aux Pommes", emoji: "🍰", category: "dessert", time: "50 min", calories: 380, sugar: 25, servings: 6,
        glycemicIndex: "medium", diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ["rainy", "cold", "cloudy"], season: ["fall", "winter"],
        ingredients: [
            { name: "pommes", qty: "6" }, { name: "farine", qty: "150g" }, { name: "beurre", qty: "100g" },
            { name: "sucre roux", qty: "100g" }, { name: "cannelle", qty: "1 c.c." }
        ],
        steps: ["Couper les pommes", "Préparer la pâte sablée", "Recouvrir les fruits", "Cuire au four"]
    },
    {
        id: 22, name: "Mousse au Chocolat", emoji: "🍰", category: "dessert", time: "20 min", calories: 350, sugar: 18, servings: 4,
        glycemicIndex: "medium", diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ["rainy", "cold", "cloudy"], season: ["winter", "fall", "spring", "summer"],
        ingredients: [
            { name: "chocolat noir", qty: "200g" }, { name: "oeufs", qty: "4" }, { name: "sel", qty: "1 pincée" },
            { name: "sucre vanillé", qty: "1 sachet" }
        ],
        steps: ["Fondre le chocolat", "Monter les blancs en neige", "Incorporer les jaunes au chocolat", "Mélanger délicatement"]
    },
    {
        id: 23, name: "Tarte Tatin", emoji: "🍰", category: "dessert", time: "50 min", calories: 400, sugar: 35, servings: 8,
        glycemicIndex: "high", diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ["cold", "rainy"], season: ["fall", "winter"],
        ingredients: [
            { name: "pommes", qty: "8" }, { name: "pâte feuilletée", qty: "1" }, { name: "beurre", qty: "80g" },
            { name: "sucre", qty: "150g" }, { name: "crème fraîche", qty: "10cl" }
        ],
        steps: ["Caraméliser pommes et beurre", "Couvrir de pâte", "Cuire au four", "Retourner tiède"]
    },
    {
        id: 3, name: "Tarte aux Fraises", emoji: "🍰", category: "dessert", time: "45 min", calories: 380, sugar: 28, servings: 6,
        glycemicIndex: "medium", diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ["sunny"], season: ["spring", "summer"],
        ingredients: [
            { name: "pâte sablée", qty: "1" }, { name: "fraises", qty: "500g" }, { name: "crème pâtissière", qty: "30cl" },
            { name: "nappage", qty: "5cl" }
        ],
        steps: ["Cuire fond de tarte", "Garnir de crème", "Disposer les fraises", "Napper"]
    },
    {
        id: 24, name: "Cookies Avoine Choco", emoji: "🍰", category: "dessert", time: "25 min", calories: 180, sugar: 10, servings: 12,
        glycemicIndex: "low", diabeticFriendly: true, endometriosisFriendly: true, isVegetarian: true, isVegan: true, isGlutenFree: false,
        weather: ["cloudy", "rainy"], season: ["all"],
        ingredients: [
            { name: "flocons d'avoine", qty: "200g" }, { name: "banane", qty: "2" }, { name: "pépites chocolat", qty: "100g" },
            { name: "miel", qty: "2 c.s." }
        ],
        steps: ["Écraser banane", "Mélanger avec avoine", "Ajouter pépites", "Cuire 15 min au four"]
    },
    {
        id: 25, name: "Pancakes Banane", emoji: "🍰", category: "dessert", time: "15 min", calories: 220, sugar: 12, servings: 2,
        glycemicIndex: "medium", diabeticFriendly: true, isVegetarian: true, isVegan: false,
        weather: ["cloudy", "rainy", "sunny"], season: ["all"],
        ingredients: [
            { name: "banane", qty: "1" }, { name: "oeufs", qty: "2" }, { name: "farine", qty: "80g" },
            { name: "levure", qty: "1/2 sachet" }, { name: "sirop d'érable", qty: "2 c.s." }
        ],
        steps: ["Écraser banane", "Mélanger oeufs et farine", "Cuire à la poêle", "Servir chaud"]
    }
];
// 25+ New Vegan & Vegetarian Recipes
const newRecipes = [
    {
        id: 'rec_v1',
        name: 'Curry de Pois Chiches',
        category: 'veggie',
        emoji: '🥘',
        weather: ['all'],
        season: ['all'],
        time: '30 min',
        calories: 450,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 4,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Pois chiches', qty: '400g' },
            { name: 'Lait de coco', qty: '400ml' },
            { name: 'Épinards', qty: '200g' },
            { name: 'Oignon', qty: '1' },
            { name: 'Ail', qty: '2 gousses' }
        ],
        steps: [
            'Faire revenir oignon et ail.',
            'Ajouter les pois chiches et le lait de coco.',
            'Laisser mijoter 15 min.',
            'Ajouter les épinards en fin de cuisson.'
        ]
    },
    {
        id: 'rec_v2',
        name: 'Salade de Quinoa Avocat',
        category: 'salad',
        emoji: '🥗',
        weather: ['sunny'],
        season: ['summer', 'spring'],
        time: '15 min',
        calories: 380,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 2,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Quinoa cuit', qty: '200g' },
            { name: 'Avocat', qty: '1' },
            { name: 'Tomates cerises', qty: '10' },
            { name: 'Concombre', qty: '1/2' }
        ],
        steps: [
            'Couper les légumes en dés.',
            'Mélanger avec le quinoa.',
            'Assaisonner avec citron et huile d\'olive.'
        ]
    },
    {
        id: 'rec_v3',
        name: 'Dahl de Lentilles Corail',
        category: 'soup',
        emoji: '🍲',
        weather: ['rainy', 'cold'],
        season: ['fall', 'winter'],
        time: '25 min',
        calories: 420,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 3,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Lentilles corail', qty: '200g' },
            { name: 'Tomates concassées', qty: '400g' },
            { name: 'Cumin', qty: '1 c.à.c' },
            { name: 'Coriandre', qty: 'QS' }
        ],
        steps: [
            'Rincer les lentilles.',
            'Cuire avec les tomates et épices 20 min.',
            'Servir avec de la coriandre fraîche.'
        ]
    },
    {
        id: 'rec_v4',
        name: 'Wraps Végétariens',
        category: 'sandwich',
        emoji: '🌯',
        weather: ['sunny', 'cloudy'],
        season: ['all'],
        time: '10 min',
        calories: 350,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'medium',
        sugar: 4,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Tortillas blé complet', qty: '2' },
            { name: 'Hummus', qty: '50g' },
            { name: 'Carottes râpées', qty: '100g' },
            { name: 'Feta', qty: '30g' }
        ],
        steps: [
            'Etaler le hummus sur les tortillas.',
            'Ajouter les légumes et la feta.',
            'Rouler serré.'
        ]
    },
    {
        id: 'rec_v5',
        name: 'Chili Sin Carne',
        category: 'meat',
        emoji: '🌶️',
        weather: ['cold'],
        season: ['winter', 'fall'],
        time: '40 min',
        calories: 500,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 5,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Haricots rouges', qty: '400g' },
            { name: 'Maïs', qty: '150g' },
            { name: 'Poivron', qty: '1' },
            { name: 'Oignon', qty: '1' }
        ],
        steps: [
            'Faire revenir oignon et poivron.',
            'Ajouter haricots, maïs et tomates.',
            'Mijoter 30 min avec épices chili.'
        ]
    },
    {
        id: 'rec_v6',
        name: 'Pâtes Pesto Basilic',
        category: 'pasta',
        emoji: '🍝',
        weather: ['sunny'],
        season: ['summer'],
        time: '15 min',
        calories: 550,
        isVegetarian: true,
        isVegan: false, // Parmesan
        glycemicIndex: 'medium',
        sugar: 2,
        diabeticFriendly: false,
        ingredients: [
            { name: 'Pâtes', qty: '200g' },
            { name: 'Pesto', qty: '3 c.à.s' },
            { name: 'Pignons', qty: '1 poignée' },
            { name: 'Parmesan', qty: 'QS' }
        ],
        steps: [
            'Cuire les pâtes al dente.',
            'Mélanger avec le pesto.',
            'Saupoudrer de parmesan et pignons.'
        ]
    },
    {
        id: 'rec_v7',
        name: 'Soupe de Potimarron',
        category: 'soup',
        emoji: '🥣',
        weather: ['cold', 'rainy'],
        season: ['fall', 'winter'],
        time: '35 min',
        calories: 250,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'medium',
        sugar: 6, // Citrouille a du sucre
        diabeticFriendly: true,
        ingredients: [
            { name: 'Potimarron', qty: '1/2' },
            { name: 'Pomme de terre', qty: '1' },
            { name: 'Oignon', qty: '1' },
            { name: 'Bouillon légumes', qty: '500ml' }
        ],
        steps: [
            'Couper les légumes.',
            'Cuire dans le bouillon 25 min.',
            'Mixer jusqu\'à consistance lisse.'
        ]
    },
    {
        id: 'rec_v8',
        name: 'Tofu Sauté aux Légumes',
        category: 'veggie',
        emoji: '🥡',
        weather: ['all'],
        season: ['all'],
        time: '20 min',
        calories: 400,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 3,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Tofu ferme', qty: '200g' },
            { name: 'Brocoli', qty: '200g' },
            { name: 'Sauce soja', qty: '2 c.à.s' },
            { name: 'Sésame', qty: '1 c.à.c' }
        ],
        steps: [
            'Couper le tofu en dés.',
            'Faire sauter avec le brocoli.',
            'Déglacer à la sauce soja.'
        ]
    },
    {
        id: 'rec_v9',
        name: 'Risotto aux Champignons',
        category: 'rice',
        emoji: '🥘',
        weather: ['rainy', 'cold'],
        season: ['fall', 'winter'],
        time: '40 min',
        calories: 600,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'high',
        sugar: 2,
        diabeticFriendly: false,
        ingredients: [
            { name: 'Riz arborio', qty: '200g' },
            { name: 'Champignons', qty: '300g' },
            { name: 'Vin blanc', qty: '100ml' },
            { name: 'Parmesan', qty: '50g' }
        ],
        steps: [
            'Faire revenir les champignons.',
            'Ajouter le riz puis le vin.',
            'Ajouter bouillon louche par louche.'
        ]
    },
    {
        id: 'rec_v10',
        name: 'Smoothie Bowl Rouge',
        category: 'dessert',
        emoji: '🍓',
        weather: ['sunny'],
        season: ['summer'],
        time: '10 min',
        calories: 300,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'medium',
        sugar: 15,
        diabeticFriendly: false,
        ingredients: [
            { name: 'Fraises', qty: '200g' },
            { name: 'Banane', qty: '1' },
            { name: 'Lait d\'amande', qty: '100ml' },
            { name: 'Granola', qty: '30g' }
        ],
        steps: [
            'Mixer les fruits avec le lait.',
            'Verser dans un bol.',
            'Garnir de granola.'
        ]
    },
    {
        id: 'rec_v11',
        name: 'Lasagnes Aubergine',
        category: 'pasta',
        emoji: '🍆',
        weather: ['rainy', 'cloudy'],
        season: ['all'],
        time: '50 min',
        calories: 380,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'low',
        sugar: 4,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Aubergines', qty: '2' },
            { name: 'Sauce tomate', qty: '500g' },
            { name: 'Mozzarella', qty: '200g' },
            { name: 'Parmesan', qty: '50g' }
        ],
        steps: ['Trancher aubergines', 'Griller les tranches', 'Alterner couches sauce/aubergine/fromage', 'Gratiner 25 min']
    },
    {
        id: 'rec_v12',
        name: 'Salade de Lentilles Tiède',
        category: 'salad',
        emoji: '🥗',
        weather: ['cloudy'],
        season: ['fall', 'spring'],
        time: '20 min',
        calories: 320,
        isVegetarian: true,
        isVegan: true,
        glutenFree: true,
        glycemicIndex: 'low',
        sugar: 2,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Lentilles vertes', qty: '250g' },
            { name: 'Carotte', qty: '1' },
            { name: 'Oignon rouge', qty: '1/2' },
            { name: 'Vinaigrette moutarde', qty: '3 c.s.' }
        ],
        steps: ['Cuire lentilles', 'Couper légumes fin', 'Mélanger tiède avec sauce']
    },
    {
        id: 'rec_v13',
        name: 'Curry Rouge Tofu',
        category: 'veggie',
        emoji: '🥘',
        weather: ['rainy', 'cold'],
        season: ['winter'],
        time: '30 min',
        calories: 410,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 4,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Tofu fumé', qty: '200g' },
            { name: 'Pâte curry rouge', qty: '2 c.c.' },
            { name: 'Lait coco', qty: '200ml' },
            { name: 'Haricots verts', qty: '150g' }
        ],
        steps: ['Dorer tofu', 'Ajouter pâte et lait', 'Mijoter avec haricots 15 min']
    },
    {
        id: 'rec_v14',
        name: 'Omelette Champignons',
        category: 'veggie',
        emoji: '🍳',
        weather: ['cloudy', 'rainy'],
        season: ['fall'],
        time: '10 min',
        calories: 280,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'low',
        sugar: 1,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Oeufs', qty: '3' },
            { name: 'Champignons', qty: '100g' },
            { name: 'Persil', qty: 'QS' },
            { name: 'Beurre', qty: '10g' }
        ],
        steps: ['Sauter champignons', 'Battre oeufs', 'Cuire baveux', 'Plier']
    },
    {
        id: 'rec_v15',
        name: 'Gnocchis Patate Douce',
        category: 'pasta',
        emoji: '🍠',
        weather: ['cold'],
        season: ['winter'],
        time: '45 min',
        calories: 350,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'medium',
        sugar: 5,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Patate douce', qty: '500g' },
            { name: 'Farine', qty: '200g' },
            { name: 'Sauge', qty: '5 feuilles' },
            { name: 'Huile olive', qty: '2 c.s.' }
        ],
        steps: ['Cuire patate écraser', 'Mélanger farine', 'Façonner gnocchis', 'Pocher et poêler sage']
    },
    {
        id: 'rec_v16',
        name: 'Soupe Miso Tofu',
        category: 'soup',
        emoji: '🥣',
        weather: ['rainy', 'cold'],
        season: ['all'],
        time: '15 min',
        calories: 120,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 1,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Pâte miso', qty: '2 c.s.' },
            { name: 'Tofu soyeux', qty: '100g' },
            { name: 'Algue wakame', qty: '1 c.s.' },
            { name: 'Ciboulette', qty: 'QS' }
        ],
        steps: ['Chauffer eau (pas bouillir)', 'Dissoudre miso', 'Ajouter tofu et algues', 'Servir chaud']
    },
    {
        id: 'rec_v17',
        name: 'Burger Végétal',
        category: 'sandwich',
        emoji: '🍔',
        weather: ['sunny'],
        season: ['summer'],
        time: '25 min',
        calories: 550,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'medium',
        sugar: 6,
        diabeticFriendly: false,
        ingredients: [
            { name: 'Pain burger', qty: '2' },
            { name: 'Steak soja', qty: '2' },
            { name: 'Cheddar', qty: '2 tranches' },
            { name: 'Tomate', qty: '1' }
        ],
        steps: ['Cuire steaks', 'Fondre fromage', 'Toaster pain', 'Monter burger']
    },
    {
        id: 'rec_v18',
        name: 'Risotto Asperges',
        category: 'rice',
        emoji: '🍚',
        weather: ['sunny'],
        season: ['spring'],
        time: '40 min',
        calories: 450,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'medium',
        sugar: 3,
        diabeticFriendly: false,
        ingredients: [
            { name: 'Riz arborio', qty: '200g' },
            { name: 'Asperges vertes', qty: '1 botte' },
            { name: 'Parmesan', qty: '50g' },
            { name: 'Bouillon', qty: '1L' }
        ],
        steps: ['Cuire pointes asperges', 'Risotto classique avec tiges', 'Finir avec pointes et parmesan']
    },
    {
        id: 'rec_v19',
        name: 'Falafels Maison',
        category: 'veggie',
        emoji: '🧆',
        weather: ['sunny', 'hot'],
        season: ['summer'],
        time: '40 min',
        calories: 380,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'low',
        sugar: 2,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Pois chiches secs', qty: '250g' },
            { name: 'Persil', qty: '1 bouquet' },
            { name: 'Ail', qty: '3 gousses' },
            { name: 'Cumin', qty: '1 c.c.' }
        ],
        steps: ['Mixer pois trempés', 'Former boules', 'Frire ou four', 'Servir avec sauce']
    },
    {
        id: 'rec_v20',
        name: 'Pizza Margarita',
        category: 'pasta',
        emoji: '🍕',
        weather: ['sunny'],
        season: ['all'],
        time: '20 min',
        calories: 600,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'high',
        sugar: 4,
        diabeticFriendly: false,
        ingredients: [
            { name: 'Pâte pizza', qty: '1' },
            { name: 'Sauce tomate', qty: '100g' },
            { name: 'Mozzarella', qty: '1 boule' },
            { name: 'Basilic', qty: 'QS' }
        ],
        steps: ['Etaler pâte', 'Garnir', 'Cuire four très chaud 10 min', 'Basilic frais']
    },
    {
        id: 'rec_v21',
        name: 'Gratin Dauphinois',
        category: 'veggie',
        emoji: '🥔',
        weather: ['cold', 'rainy'],
        season: ['winter'],
        time: '1h15',
        calories: 500,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'medium',
        sugar: 3,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Pommes de terre', qty: '1kg' },
            { name: 'Crème', qty: '50cl' },
            { name: 'Ail', qty: '1 gousse' },
            { name: 'Beurre', qty: '20g' }
        ],
        steps: ['Frotter plat ail', 'Trancher patates fines', 'Couvrir crème', 'Cuire lent four']
    },
    {
        id: 'rec_v22',
        name: 'Shakshuka',
        category: 'veggie',
        emoji: '🥘',
        weather: ['sunny', 'cloudy'],
        season: ['summer', 'spring'],
        time: '25 min',
        calories: 320,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'low',
        sugar: 5,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Oeufs', qty: '3' },
            { name: 'Poivrons', qty: '2' },
            { name: 'Tomates', qty: '4' },
            { name: 'Oignon', qty: '1' }
        ],
        steps: ['Mijoter légumes', 'Creuser puits', 'Casser oeufs dedans', 'Cuire blanc']
    },
    {
        id: 'rec_v23',
        name: 'Banana Bread Vegan',
        category: 'dessert',
        emoji: '🍞',
        weather: ['rainy'],
        season: ['all'],
        time: '50 min',
        calories: 280,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'medium',
        sugar: 15,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Bananes mûres', qty: '3' },
            { name: 'Farine', qty: '200g' },
            { name: 'Lait soja', qty: '50ml' },
            { name: 'Cannelle', qty: '1 c.c.' }
        ],
        steps: ['Ecraser bananes', 'Mélanger tout', 'Moule à cake', 'Cuire 45 min']
    },
    {
        id: 'rec_v24',
        name: 'Moussaka Végétarienne',
        category: 'veggie',
        emoji: '🍆',
        weather: ['sunny', 'hot'],
        season: ['summer'],
        time: '1h',
        calories: 420,
        isVegetarian: true,
        isVegan: false,
        glycemicIndex: 'low',
        sugar: 6,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Aubergines', qty: '3' },
            { name: 'Lentilles', qty: '200g' },
            { name: 'Tomates', qty: '400g' },
            { name: 'Béchamel', qty: '30cl' }
        ],
        steps: ['Griller aubergines', 'Sauce lentilles tomate', 'Monter couches', 'Gratiner']
    },
    {
        id: 'rec_v25',
        name: 'Carpaccio Ananas',
        category: 'dessert',
        emoji: '🍍',
        weather: ['hot', 'sunny'],
        season: ['summer'],
        time: '10 min',
        calories: 150,
        isVegetarian: true,
        isVegan: true,
        glycemicIndex: 'medium',
        sugar: 20,
        diabeticFriendly: true,
        ingredients: [
            { name: 'Ananas', qty: '1' },
            { name: 'Menthe', qty: 'QS' },
            { name: 'Citron vert', qty: '1' },
            { name: 'Sirop érable', qty: '1 c.s.' }
        ],
        steps: ['Trancher fin', 'Mariner citron sirop', 'Parsemer menthe', 'Frais']
    },

    // ===== ASIAN / ASIATIQUE =====
    {
        id: 'asian_1', name: 'Pad Thaï au Poulet', emoji: '🍜', category: 'asian', cuisine: 'thai',
        time: '30 min', calories: 480, sugar: 8, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'hot', 'cloudy'], season: ['summer', 'spring', 'all'],
        keywords: ['asiatique', 'thai', 'thaïlandais', 'nouilles', 'exotique'],
        ingredients: [
            { name: 'Nouilles de riz', qty: '400g' }, { name: 'Poulet', qty: '300g' },
            { name: 'Œufs', qty: '2' }, { name: 'Cacahuètes', qty: '50g' },
            { name: 'Sauce soja', qty: '3 c.s.' }, { name: 'Citron vert', qty: '2' }
        ],
        steps: ['Cuire nouilles', 'Sauter poulet', 'Ajouter œufs brouillés', 'Mélanger sauce soja et citron', 'Garnir cacahuètes']
    },
    {
        id: 'asian_2', name: 'Bo Bun Vietnamien', emoji: '🍜', category: 'asian', cuisine: 'vietnamese',
        time: '35 min', calories: 420, sugar: 6, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'hot'], season: ['summer', 'spring'],
        keywords: ['asiatique', 'vietnamien', 'bo bun', 'salade', 'frais'],
        ingredients: [
            { name: 'Vermicelles de riz', qty: '300g' }, { name: 'Bœuf', qty: '400g' },
            { name: 'Carottes', qty: '2' }, { name: 'Menthe', qty: '1 bouquet' },
            { name: 'Nems', qty: '8' }, { name: 'Sauce nuoc mam', qty: '4 c.s.' }
        ],
        steps: ['Cuire vermicelles', 'Griller bœuf mariné', 'Préparer légumes crus', 'Dresser en bol', 'Arroser de sauce']
    },
    {
        id: 'asian_3', name: 'Ramen au Porc', emoji: '🍜', category: 'asian', cuisine: 'japanese',
        time: '45 min', calories: 550, sugar: 5, servings: 2,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['asiatique', 'japonais', 'ramen', 'soupe', 'réconfortant'],
        ingredients: [
            { name: 'Nouilles ramen', qty: '200g' }, { name: 'Porc chashu', qty: '200g' },
            { name: 'Bouillon dashi', qty: '1L' }, { name: 'Œuf mollet', qty: '2' },
            { name: 'Algue nori', qty: '2 feuilles' }, { name: 'Oignons verts', qty: '2' }
        ],
        steps: ['Préparer bouillon', 'Cuire nouilles', 'Trancher porc', 'Dresser dans bol', 'Garnir œuf et nori']
    },
    {
        id: 'asian_4', name: 'Curry Vert Thaï', emoji: '🍛', category: 'asian', cuisine: 'thai',
        time: '35 min', calories: 380, sugar: 4, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'cloudy'], season: ['winter', 'fall', 'all'],
        keywords: ['asiatique', 'thai', 'curry', 'épicé', 'coco'],
        ingredients: [
            { name: 'Poulet', qty: '500g' }, { name: 'Lait de coco', qty: '400ml' },
            { name: 'Pâte curry vert', qty: '3 c.s.' }, { name: 'Aubergines', qty: '2' },
            { name: 'Basilic thaï', qty: '1 bouquet' }, { name: 'Riz jasmin', qty: '300g' }
        ],
        steps: ['Faire revenir pâte curry', 'Ajouter poulet', 'Verser lait coco', 'Cuire aubergines', 'Servir avec riz']
    },
    {
        id: 'asian_5', name: 'Sushi Bowl', emoji: '🍣', category: 'asian', cuisine: 'japanese',
        time: '25 min', calories: 380, sugar: 5, servings: 2,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'hot'], season: ['summer', 'spring'],
        keywords: ['asiatique', 'japonais', 'sushi', 'poisson', 'healthy', 'bowl'],
        ingredients: [
            { name: 'Riz sushi', qty: '200g' }, { name: 'Saumon frais', qty: '200g' },
            { name: 'Avocat', qty: '1' }, { name: 'Concombre', qty: '1' },
            { name: 'Sauce soja', qty: '2 c.s.' }, { name: 'Graines de sésame', qty: '1 c.s.' }
        ],
        steps: ['Cuire riz vinaigré', 'Trancher saumon et légumes', 'Dresser en bol', 'Assaisonner']
    },

    // ===== CHINESE / CHINOIS =====
    {
        id: 'chinese_1', name: 'Poulet Kung Pao', emoji: '🍗', category: 'asian', cuisine: 'chinese',
        time: '25 min', calories: 420, sugar: 6, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'cloudy', 'all'], season: ['all'],
        keywords: ['chinois', 'asiatique', 'poulet', 'épicé', 'cacahuètes'],
        ingredients: [
            { name: 'Poulet', qty: '500g' }, { name: 'Cacahuètes', qty: '80g' },
            { name: 'Poivrons', qty: '2' }, { name: 'Piments séchés', qty: '6' },
            { name: 'Sauce soja', qty: '3 c.s.' }, { name: 'Gingembre', qty: '1 morceau' }
        ],
        steps: ['Couper poulet', 'Faire sauter avec gingembre', 'Ajouter légumes', 'Incorporer cacahuètes', 'Servir avec riz']
    },
    {
        id: 'chinese_2', name: 'Riz Cantonais', emoji: '🍚', category: 'asian', cuisine: 'chinese',
        time: '20 min', calories: 380, sugar: 3, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'cloudy', 'all'], season: ['all'],
        keywords: ['chinois', 'asiatique', 'riz', 'œuf', 'classique'],
        ingredients: [
            { name: 'Riz cuit', qty: '500g' }, { name: 'Œufs', qty: '3' },
            { name: 'Jambon', qty: '150g' }, { name: 'Petits pois', qty: '100g' },
            { name: 'Oignons verts', qty: '3' }, { name: 'Sauce soja', qty: '2 c.s.' }
        ],
        steps: ['Brouiller œufs', 'Sauter riz à feu vif', 'Ajouter jambon petits pois', 'Finir sauce soja']
    },
    {
        id: 'chinese_3', name: 'Nouilles Sautées au Bœuf', emoji: '🍜', category: 'asian', cuisine: 'chinese',
        time: '25 min', calories: 450, sugar: 5, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['cloudy', 'all'], season: ['all'],
        keywords: ['chinois', 'asiatique', 'nouilles', 'bœuf', 'sauté'],
        ingredients: [
            { name: 'Nouilles chinoises', qty: '400g' }, { name: 'Bœuf', qty: '300g' },
            { name: 'Brocoli', qty: '200g' }, { name: 'Sauce hoisin', qty: '3 c.s.' },
            { name: 'Ail', qty: '3 gousses' }, { name: 'Huile sésame', qty: '1 c.s.' }
        ],
        steps: ['Cuire nouilles', 'Sauter bœuf', 'Ajouter brocoli', 'Mélanger sauce', 'Servir chaud']
    },
    {
        id: 'chinese_4', name: 'Soupe Wonton', emoji: '🥟', category: 'asian', cuisine: 'chinese',
        time: '40 min', calories: 280, sugar: 2, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy'], season: ['winter', 'fall'],
        keywords: ['chinois', 'asiatique', 'soupe', 'ravioli', 'réconfortant'],
        ingredients: [
            { name: 'Wontons', qty: '20' }, { name: 'Bouillon poulet', qty: '1.5L' },
            { name: 'Bok choy', qty: '2' }, { name: 'Gingembre', qty: '1 morceau' },
            { name: 'Oignons verts', qty: '3' }, { name: 'Sauce soja', qty: '2 c.s.' }
        ],
        steps: ['Préparer bouillon', 'Cuire wontons', 'Ajouter légumes', 'Assaisonner', 'Servir fumant']
    },
    {
        id: 'chinese_5', name: 'Porc Aigre-Doux', emoji: '🍖', category: 'asian', cuisine: 'chinese',
        time: '35 min', calories: 480, sugar: 18, servings: 4,
        glycemicIndex: 'high', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'cloudy'], season: ['all'],
        keywords: ['chinois', 'asiatique', 'porc', 'sucré', 'classique'],
        ingredients: [
            { name: 'Porc', qty: '500g' }, { name: 'Ananas', qty: '200g' },
            { name: 'Poivrons', qty: '2' }, { name: 'Vinaigre de riz', qty: '3 c.s.' },
            { name: 'Ketchup', qty: '4 c.s.' }, { name: 'Sucre', qty: '2 c.s.' }
        ],
        steps: ['Frire porc pané', 'Préparer sauce aigre-douce', 'Sauter légumes', 'Enrober porc de sauce', 'Servir']
    },

    // ===== HEALTHY / LÉGER =====
    {
        id: 'healthy_1', name: 'Buddha Bowl Quinoa', emoji: '🥗', category: 'healthy', cuisine: 'modern',
        time: '25 min', calories: 380, sugar: 6, servings: 2,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['sunny', 'hot'], season: ['summer', 'spring'],
        keywords: ['healthy', 'sain', 'bowl', 'quinoa', 'végétarien', 'vegan', 'léger'],
        ingredients: [
            { name: 'Quinoa', qty: '150g' }, { name: 'Pois chiches', qty: '200g' },
            { name: 'Avocat', qty: '1' }, { name: 'Patate douce', qty: '1' },
            { name: 'Épinards', qty: '100g' }, { name: 'Sauce tahini', qty: '3 c.s.' }
        ],
        steps: ['Cuire quinoa', 'Rôtir pois chiches', 'Griller patate douce', 'Dresser en bol', 'Arroser tahini']
    },
    {
        id: 'healthy_2', name: 'Saumon Grillé Légumes', emoji: '🐟', category: 'healthy', cuisine: 'modern',
        time: '30 min', calories: 420, sugar: 4, servings: 2,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'cloudy'], season: ['all'],
        keywords: ['healthy', 'sain', 'poisson', 'saumon', 'léger', 'protéiné'],
        ingredients: [
            { name: 'Pavé saumon', qty: '2' }, { name: 'Asperges', qty: '200g' },
            { name: 'Courgettes', qty: '2' }, { name: 'Citron', qty: '1' },
            { name: 'Huile olive', qty: '2 c.s.' }, { name: 'Herbes de Provence', qty: '1 c.c.' }
        ],
        steps: ['Griller saumon', 'Faire sauter légumes', 'Assaisonner au citron', 'Servir chaud']
    },
    {
        id: 'healthy_3', name: 'Poke Bowl Thon', emoji: '🍣', category: 'healthy', cuisine: 'hawaiian',
        time: '20 min', calories: 400, sugar: 5, servings: 2,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'hot'], season: ['summer', 'spring'],
        keywords: ['healthy', 'poke', 'bowl', 'thon', 'hawaïen', 'frais'],
        ingredients: [
            { name: 'Thon frais', qty: '250g' }, { name: 'Riz sushi', qty: '200g' },
            { name: 'Edamame', qty: '100g' }, { name: 'Mangue', qty: '1' },
            { name: 'Sauce soja', qty: '2 c.s.' }, { name: 'Avocat', qty: '1' }
        ],
        steps: ['Mariner thon', 'Cuire riz', 'Couper légumes fruits', 'Dresser en bol', 'Assaisonner']
    },
    {
        id: 'healthy_4', name: 'Salade César Légère', emoji: '🥗', category: 'healthy', cuisine: 'american',
        time: '15 min', calories: 320, sugar: 3, servings: 2,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'hot'], season: ['summer', 'spring'],
        keywords: ['healthy', 'salade', 'césar', 'poulet', 'léger'],
        ingredients: [
            { name: 'Laitue romaine', qty: '1' }, { name: 'Poulet grillé', qty: '200g' },
            { name: 'Parmesan', qty: '40g' }, { name: 'Croûtons', qty: '50g' },
            { name: 'Sauce César allégée', qty: '3 c.s.' }, { name: 'Anchois', qty: '4' }
        ],
        steps: ['Griller poulet', 'Couper laitue', 'Mélanger sauce', 'Ajouter parmesan', 'Servir frais']
    },
    {
        id: 'healthy_5', name: 'Smoothie Bowl Açaï', emoji: '🫐', category: 'healthy', cuisine: 'modern',
        time: '10 min', calories: 280, sugar: 18, servings: 1,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: true, isVegan: true,
        weather: ['sunny', 'hot'], season: ['summer'],
        keywords: ['healthy', 'smoothie', 'bowl', 'fruits', 'petit-déjeuner', 'açaï'],
        ingredients: [
            { name: 'Açaï surgelé', qty: '100g' }, { name: 'Banane', qty: '1' },
            { name: 'Lait amande', qty: '100ml' }, { name: 'Granola', qty: '30g' },
            { name: 'Fruits rouges', qty: '50g' }, { name: 'Coco râpée', qty: '1 c.s.' }
        ],
        steps: ['Mixer açaï banane lait', 'Verser dans bol', 'Garnir granola fruits', 'Décorer coco']
    },

    // ===== WINTER / HIVER / RÉCONFORTANT =====
    {
        id: 'winter_1', name: 'Bœuf Bourguignon', emoji: '🍲', category: 'meat', cuisine: 'french',
        time: '2h30', calories: 580, sugar: 5, servings: 6,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'bœuf', 'mijoté', 'réconfortant', 'traditionnel'],
        ingredients: [
            { name: 'Bœuf bourguignon', qty: '1kg' }, { name: 'Vin rouge', qty: '75cl' },
            { name: 'Carottes', qty: '4' }, { name: 'Champignons', qty: '250g' },
            { name: 'Lardons', qty: '150g' }, { name: 'Oignons grelots', qty: '12' }
        ],
        steps: ['Faire revenir bœuf', 'Ajouter vin et légumes', 'Mijoter 2h', 'Ajouter champignons', 'Servir chaud']
    },
    {
        id: 'winter_2', name: 'Pot-au-Feu', emoji: '🍲', category: 'meat', cuisine: 'french',
        time: '3h', calories: 450, sugar: 4, servings: 8,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'bœuf', 'bouillon', 'traditionnel', 'famille'],
        ingredients: [
            { name: 'Bœuf à braiser', qty: '1.5kg' }, { name: 'Os à moelle', qty: '4' },
            { name: 'Poireaux', qty: '4' }, { name: 'Carottes', qty: '6' },
            { name: 'Navets', qty: '4' }, { name: 'Pommes de terre', qty: '8' }
        ],
        steps: ['Cuire viande 2h', 'Ajouter légumes', 'Cuire 1h de plus', 'Servir avec gros sel']
    },
    {
        id: 'winter_3', name: 'Fondue Savoyarde', emoji: '🧀', category: 'cheese', cuisine: 'french',
        time: '30 min', calories: 720, sugar: 2, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: false,
        weather: ['cold', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'fromage', 'savoie', 'convivial', 'montagne'],
        ingredients: [
            { name: 'Comté', qty: '300g' }, { name: 'Beaufort', qty: '300g' },
            { name: 'Emmental', qty: '200g' }, { name: 'Vin blanc', qty: '30cl' },
            { name: 'Ail', qty: '1 gousse' }, { name: 'Pain', qty: '1 boule' }
        ],
        steps: ['Frotter caquelon ail', 'Faire fondre fromages', 'Ajouter vin', 'Tremper pain']
    },
    {
        id: 'winter_4', name: 'Cassoulet Toulousain', emoji: '🍲', category: 'meat', cuisine: 'french',
        time: '3h', calories: 850, sugar: 3, servings: 8,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'haricots', 'confit', 'toulouse', 'traditionnel'],
        ingredients: [
            { name: 'Haricots blancs', qty: '600g' }, { name: 'Confit de canard', qty: '4 cuisses' },
            { name: 'Saucisses Toulouse', qty: '4' }, { name: 'Poitrine fumée', qty: '200g' },
            { name: 'Tomates', qty: '400g' }, { name: 'Chapelure', qty: '50g' }
        ],
        steps: ['Tremper haricots', 'Cuire avec viandes', 'Monter en caquelon', 'Gratiner au four']
    },
    {
        id: 'winter_5', name: 'Soupe à l\'Oignon', emoji: '🧅', category: 'soup', cuisine: 'french',
        time: '1h', calories: 380, sugar: 8, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: true, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'soupe', 'oignon', 'gratinée', 'bistrot'],
        ingredients: [
            { name: 'Oignons', qty: '1kg' }, { name: 'Bouillon bœuf', qty: '1.5L' },
            { name: 'Vin blanc', qty: '20cl' }, { name: 'Pain', qty: '4 tranches' },
            { name: 'Gruyère râpé', qty: '200g' }, { name: 'Beurre', qty: '50g' }
        ],
        steps: ['Caraméliser oignons', 'Ajouter bouillon', 'Mijoter 30 min', 'Gratiner avec pain fromage']
    },

    // ===== MEDITERRANEAN / MÉDITERRANÉEN =====
    {
        id: 'med_1', name: 'Moussaka Grecque', emoji: '🍆', category: 'meat', cuisine: 'greek',
        time: '1h30', calories: 520, sugar: 8, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'hot'], season: ['summer', 'fall'],
        keywords: ['grec', 'méditerranéen', 'aubergine', 'viande', 'gratiné'],
        ingredients: [
            { name: 'Aubergines', qty: '3' }, { name: 'Agneau haché', qty: '500g' },
            { name: 'Tomates', qty: '400g' }, { name: 'Béchamel', qty: '50cl' },
            { name: 'Cannelle', qty: '1 c.c.' }, { name: 'Feta', qty: '100g' }
        ],
        steps: ['Griller aubergines', 'Préparer viande sauce tomate', 'Monter couches', 'Napper béchamel', 'Gratiner']
    },
    {
        id: 'med_2', name: 'Paella Valenciana', emoji: '🥘', category: 'rice', cuisine: 'spanish',
        time: '1h', calories: 580, sugar: 4, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['sunny', 'hot'], season: ['summer', 'spring'],
        keywords: ['espagnol', 'méditerranéen', 'riz', 'fruits de mer', 'convivial'],
        ingredients: [
            { name: 'Riz bomba', qty: '400g' }, { name: 'Poulet', qty: '500g' },
            { name: 'Crevettes', qty: '300g' }, { name: 'Moules', qty: '500g' },
            { name: 'Safran', qty: '1 dose' }, { name: 'Poivrons', qty: '2' }
        ],
        steps: ['Saisir viandes', 'Ajouter riz et safran', 'Verser bouillon', 'Disposer fruits de mer', 'Cuire sans remuer']
    },
    {
        id: 'med_3', name: 'Falafel Houmous', emoji: '🧆', category: 'veggie', cuisine: 'lebanese',
        time: '30 min', calories: 380, sugar: 4, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['sunny', 'hot'], season: ['summer', 'spring'],
        keywords: ['libanais', 'méditerranéen', 'falafel', 'végétarien', 'vegan', 'pois chiches'],
        ingredients: [
            { name: 'Pois chiches secs', qty: '500g' }, { name: 'Persil', qty: '1 bouquet' },
            { name: 'Coriandre', qty: '1 bouquet' }, { name: 'Ail', qty: '4 gousses' },
            { name: 'Cumin', qty: '2 c.c.' }, { name: 'Pain pita', qty: '4' }
        ],
        steps: ['Mixer pois chiches herbes', 'Former boulettes', 'Frire', 'Servir avec houmous pita']
    },

    // ===== ITALIAN / ITALIEN =====
    {
        id: 'italian_1', name: 'Lasagnes Bolognaise', emoji: '🍝', category: 'pasta', cuisine: 'italian',
        time: '1h30', calories: 620, sugar: 8, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['cloudy', 'rainy', 'cold'], season: ['winter', 'fall'],
        keywords: ['italien', 'pâtes', 'lasagnes', 'bolognaise', 'gratiné', 'famille'],
        ingredients: [
            { name: 'Pâtes lasagnes', qty: '500g' }, { name: 'Bœuf haché', qty: '500g' },
            { name: 'Sauce tomate', qty: '500g' }, { name: 'Béchamel', qty: '50cl' },
            { name: 'Parmesan', qty: '100g' }, { name: 'Oignon', qty: '1' }
        ],
        steps: ['Préparer bolognaise', 'Cuire pâtes', 'Monter couches', 'Napper béchamel', 'Gratiner 30 min']
    },
    {
        id: 'italian_2', name: 'Osso Buco', emoji: '🍖', category: 'meat', cuisine: 'italian',
        time: '2h', calories: 520, sugar: 4, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy'], season: ['winter', 'fall'],
        keywords: ['italien', 'veau', 'mijoté', 'milan', 'traditionnel'],
        ingredients: [
            { name: 'Jarret veau', qty: '4 tranches' }, { name: 'Vin blanc', qty: '20cl' },
            { name: 'Tomates', qty: '400g' }, { name: 'Carottes', qty: '2' },
            { name: 'Céleri', qty: '2 branches' }, { name: 'Gremolata', qty: 'QS' }
        ],
        steps: ['Saisir jarrets', 'Ajouter légumes', 'Mouiller vin et tomates', 'Mijoter 2h', 'Servir avec gremolata']
    },
    {
        id: 'italian_3', name: 'Pizza Margherita', emoji: '🍕', category: 'pizza', cuisine: 'italian',
        time: '30 min', calories: 420, sugar: 4, servings: 2,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ['sunny', 'cloudy', 'all'], season: ['all'],
        keywords: ['italien', 'pizza', 'classique', 'tomate', 'mozzarella'],
        ingredients: [
            { name: 'Pâte pizza', qty: '1' }, { name: 'Sauce tomate', qty: '100g' },
            { name: 'Mozzarella', qty: '200g' }, { name: 'Basilic', qty: '1 bouquet' },
            { name: 'Huile olive', qty: '2 c.s.' }, { name: 'Origan', qty: '1 c.c.' }
        ],
        steps: ['Étaler pâte', 'Tartiner sauce', 'Ajouter mozzarella', 'Cuire 10 min four chaud', 'Garnir basilic']
    },

    // ===== INDIAN / INDIEN =====
    {
        id: 'indian_1', name: 'Tikka Masala', emoji: '🍛', category: 'asian', cuisine: 'indian',
        time: '40 min', calories: 480, sugar: 6, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'cloudy'], season: ['winter', 'fall', 'all'],
        keywords: ['indien', 'curry', 'poulet', 'épicé', 'crémeux'],
        ingredients: [
            { name: 'Poulet', qty: '600g' }, { name: 'Crème', qty: '20cl' },
            { name: 'Tomates', qty: '400g' }, { name: 'Épices tandoori', qty: '2 c.s.' },
            { name: 'Yaourt', qty: '150g' }, { name: 'Riz basmati', qty: '300g' }
        ],
        steps: ['Mariner poulet yaourt épices', 'Griller', 'Préparer sauce tomate épicée', 'Mélanger', 'Servir riz']
    },
    {
        id: 'indian_2', name: 'Dal Lentilles', emoji: '🍲', category: 'veggie', cuisine: 'indian',
        time: '35 min', calories: 320, sugar: 4, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['cold', 'rainy'], season: ['winter', 'fall'],
        keywords: ['indien', 'lentilles', 'végétarien', 'vegan', 'épicé', 'curry'],
        ingredients: [
            { name: 'Lentilles corail', qty: '300g' }, { name: 'Lait coco', qty: '200ml' },
            { name: 'Tomates', qty: '200g' }, { name: 'Curry', qty: '2 c.s.' },
            { name: 'Gingembre', qty: '1 morceau' }, { name: 'Naan', qty: '4' }
        ],
        steps: ['Cuire lentilles', 'Faire revenir épices', 'Ajouter tomates coco', 'Mijoter', 'Servir avec naan']
    },

    // ===== CUISINEAZ - LÉGUMES D'HIVER =====
    {
        id: 'caz_1', name: 'Poireaux Vinaigrette', emoji: '🥬', category: 'salad', cuisine: 'french',
        time: '25 min', calories: 180, sugar: 3, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['cold', 'rainy', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'poireaux', 'entrée', 'léger', 'vinaigrette'],
        ingredients: [
            { name: 'Poireaux', qty: '4' }, { name: 'Moutarde', qty: '1 c.s.' },
            { name: 'Vinaigre', qty: '2 c.s.' }, { name: 'Huile olive', qty: '4 c.s.' },
            { name: 'Échalote', qty: '1' }, { name: 'Persil', qty: '1 bouquet' }
        ],
        steps: ['Nettoyer et cuire poireaux', 'Préparer vinaigrette', 'Égoutter poireaux', 'Napper de sauce', 'Servir tiède']
    },
    {
        id: 'caz_2', name: 'Chou Rouge aux Pommes', emoji: '🍎', category: 'veggie', cuisine: 'french',
        time: '45 min', calories: 220, sugar: 12, servings: 6,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'chou', 'pommes', 'accompagnement', 'réconfortant'],
        ingredients: [
            { name: 'Chou rouge', qty: '1' }, { name: 'Pommes', qty: '2' },
            { name: 'Vinaigre de cidre', qty: '3 c.s.' }, { name: 'Sucre', qty: '2 c.s.' },
            { name: 'Oignon', qty: '1' }, { name: 'Beurre', qty: '30g' }
        ],
        steps: ['Émincer le chou', 'Couper pommes', 'Faire revenir oignon', 'Ajouter chou et pommes', 'Mijoter 40 min']
    },
    {
        id: 'caz_3', name: 'Chou Farci', emoji: '🥬', category: 'meat', cuisine: 'french',
        time: '1h30', calories: 450, sugar: 5, servings: 6,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'chou', 'farci', 'traditionnel', 'réconfortant'],
        ingredients: [
            { name: 'Chou vert', qty: '1' }, { name: 'Viande hachée', qty: '400g' },
            { name: 'Chair à saucisse', qty: '200g' }, { name: 'Oignon', qty: '1' },
            { name: 'Carottes', qty: '2' }, { name: 'Bouillon', qty: '50cl' }
        ],
        steps: ['Blanchir feuilles de chou', 'Préparer farce', 'Garnir feuilles', 'Reconstituer le chou', 'Braiser 1h']
    },
    {
        id: 'caz_4', name: 'Smashed Choux de Bruxelles', emoji: '🥬', category: 'veggie', cuisine: 'modern',
        time: '25 min', calories: 180, sugar: 4, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['cold', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['hiver', 'choux bruxelles', 'moderne', 'rôti', 'croustillant'],
        ingredients: [
            { name: 'Choux de Bruxelles', qty: '500g' }, { name: 'Huile olive', qty: '3 c.s.' },
            { name: 'Ail', qty: '2 gousses' }, { name: 'Parmesan', qty: '30g' },
            { name: 'Sel', qty: 'QS' }, { name: 'Poivre', qty: 'QS' }
        ],
        steps: ['Cuire choux à l\'eau', 'Écraser légèrement', 'Huiler et assaisonner', 'Rôtir au four 15 min', 'Saupoudrer parmesan']
    },
    {
        id: 'caz_5', name: 'Velouté de Panais', emoji: '🥣', category: 'soup', cuisine: 'french',
        time: '35 min', calories: 220, sugar: 8, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: true, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'panais', 'soupe', 'velouté', 'réconfortant'],
        ingredients: [
            { name: 'Panais', qty: '600g' }, { name: 'Pommes de terre', qty: '200g' },
            { name: 'Oignon', qty: '1' }, { name: 'Crème', qty: '10cl' },
            { name: 'Bouillon', qty: '80cl' }, { name: 'Noix de muscade', qty: '1 pincée' }
        ],
        steps: ['Éplucher légumes', 'Faire revenir oignon', 'Ajouter panais et pommes de terre', 'Couvrir de bouillon', 'Mixer et crémer']
    },

    // ===== CUISINEAZ - POISSONS D'HIVER =====
    {
        id: 'caz_6', name: 'Brandade de Cabillaud', emoji: '🐟', category: 'fish', cuisine: 'french',
        time: '40 min', calories: 380, sugar: 2, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy'], season: ['winter'],
        keywords: ['français', 'hiver', 'cabillaud', 'poisson', 'purée', 'traditionnel'],
        ingredients: [
            { name: 'Cabillaud', qty: '500g' }, { name: 'Pommes de terre', qty: '500g' },
            { name: 'Lait', qty: '20cl' }, { name: 'Huile olive', qty: '10cl' },
            { name: 'Ail', qty: '2 gousses' }, { name: 'Persil', qty: '1 bouquet' }
        ],
        steps: ['Pocher cabillaud', 'Cuire pommes de terre', 'Écraser ensemble', 'Monter à l\'huile', 'Gratiner au four']
    },
    {
        id: 'caz_7', name: 'Pavé de Saumon aux Poireaux', emoji: '🐟', category: 'fish', cuisine: 'french',
        time: '30 min', calories: 420, sugar: 3, servings: 2,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'cloudy', 'rainy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'saumon', 'poireaux', 'poisson', 'facile'],
        ingredients: [
            { name: 'Pavé de saumon', qty: '2' }, { name: 'Poireaux', qty: '3' },
            { name: 'Crème fraîche', qty: '15cl' }, { name: 'Beurre', qty: '20g' },
            { name: 'Citron', qty: '1' }, { name: 'Aneth', qty: '1 bouquet' }
        ],
        steps: ['Étuver poireaux', 'Cuire saumon à la poêle', 'Préparer sauce crème', 'Dresser', 'Garnir aneth']
    },
    {
        id: 'caz_8', name: 'Cabillaud Rôti Citron Romarin', emoji: '🐟', category: 'fish', cuisine: 'french',
        time: '25 min', calories: 280, sugar: 1, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cloudy', 'cold'], season: ['winter', 'fall', 'all'],
        keywords: ['français', 'poisson', 'cabillaud', 'citron', 'healthy', 'léger'],
        ingredients: [
            { name: 'Dos de cabillaud', qty: '4' }, { name: 'Citron', qty: '2' },
            { name: 'Ail', qty: '4 gousses' }, { name: 'Romarin', qty: '3 branches' },
            { name: 'Huile olive', qty: '3 c.s.' }, { name: 'Sel fleur', qty: 'QS' }
        ],
        steps: ['Préchauffer four', 'Disposer cabillaud', 'Arroser huile citron', 'Ajouter ail romarin', 'Rôtir 15 min']
    },
    {
        id: 'caz_9', name: 'Dos de Cabillaud aux Épinards', emoji: '🐟', category: 'fish', cuisine: 'french',
        time: '25 min', calories: 320, sugar: 2, servings: 2,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['français', 'poisson', 'épinards', 'healthy', 'léger'],
        ingredients: [
            { name: 'Cabillaud', qty: '2 pavés' }, { name: 'Épinards frais', qty: '400g' },
            { name: 'Crème', qty: '10cl' }, { name: 'Ail', qty: '1 gousse' },
            { name: 'Beurre', qty: '20g' }, { name: 'Noix de muscade', qty: '1 pincée' }
        ],
        steps: ['Faire tomber épinards', 'Crémer les épinards', 'Cuire cabillaud', 'Dresser sur lit d\'épinards', 'Servir chaud']
    },
    {
        id: 'caz_10', name: 'Mijoté de Poisson Curry Coco', emoji: '🐟', category: 'fish', cuisine: 'asian',
        time: '30 min', calories: 380, sugar: 4, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'cloudy'], season: ['winter', 'fall', 'all'],
        keywords: ['exotique', 'poisson', 'curry', 'coco', 'asiatique'],
        ingredients: [
            { name: 'Poisson blanc', qty: '600g' }, { name: 'Lait de coco', qty: '400ml' },
            { name: 'Pâte de curry', qty: '2 c.s.' }, { name: 'Poivrons', qty: '2' },
            { name: 'Coriandre', qty: '1 bouquet' }, { name: 'Riz basmati', qty: '300g' }
        ],
        steps: ['Faire revenir curry', 'Ajouter lait coco', 'Cuire poisson dans sauce', 'Ajouter légumes', 'Servir sur riz']
    },

    // ===== CUISINEAZ - PLATS RÉCONFORTANTS =====
    {
        id: 'caz_11', name: 'Tartiflette Facile', emoji: '🧀', category: 'cheese', cuisine: 'french',
        time: '45 min', calories: 650, sugar: 3, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['cold', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'fromage', 'reblochon', 'savoie', 'montagne'],
        ingredients: [
            { name: 'Pommes de terre', qty: '1kg' }, { name: 'Reblochon', qty: '1' },
            { name: 'Lardons', qty: '200g' }, { name: 'Oignons', qty: '2' },
            { name: 'Crème fraîche', qty: '20cl' }, { name: 'Vin blanc', qty: '10cl' }
        ],
        steps: ['Cuire pommes de terre', 'Rissoler lardons oignons', 'Monter le plat', 'Poser le reblochon', 'Gratiner 20 min']
    },
    {
        id: 'caz_12', name: 'Croziflette aux Lardons', emoji: '🧀', category: 'pasta', cuisine: 'french',
        time: '40 min', calories: 580, sugar: 3, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: false, isVegan: false,
        weather: ['cold', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'savoie', 'crozets', 'fromage', 'montagne'],
        ingredients: [
            { name: 'Crozets', qty: '400g' }, { name: 'Reblochon', qty: '1/2' },
            { name: 'Lardons', qty: '150g' }, { name: 'Crème', qty: '25cl' },
            { name: 'Oignon', qty: '1' }, { name: 'Vin blanc', qty: '10cl' }
        ],
        steps: ['Cuire crozets', 'Faire revenir lardons', 'Mélanger crème', 'Gratiner au reblochon', 'Servir chaud']
    },
    {
        id: 'caz_13', name: 'Ragoût de Bœuf Pommes de Terre', emoji: '🥘', category: 'meat', cuisine: 'french',
        time: '2h', calories: 520, sugar: 4, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'bœuf', 'mijoté', 'traditionnel', 'famille'],
        ingredients: [
            { name: 'Bœuf à braiser', qty: '800g' }, { name: 'Pommes de terre', qty: '1kg' },
            { name: 'Carottes', qty: '4' }, { name: 'Oignons', qty: '2' },
            { name: 'Bouillon', qty: '50cl' }, { name: 'Thym', qty: '3 branches' }
        ],
        steps: ['Saisir viande', 'Ajouter légumes', 'Mouiller au bouillon', 'Mijoter 2h', 'Ajuster l\'assaisonnement']
    },
    {
        id: 'caz_14', name: 'Boulettes de Bœuf aux Légumes', emoji: '🍖', category: 'meat', cuisine: 'french',
        time: '45 min', calories: 420, sugar: 5, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['français', 'boulettes', 'bœuf', 'légumes', 'famille'],
        ingredients: [
            { name: 'Bœuf haché', qty: '500g' }, { name: 'Pommes de terre', qty: '600g' },
            { name: 'Carottes', qty: '3' }, { name: 'Sauce tomate', qty: '400g' },
            { name: 'Oignon', qty: '1' }, { name: 'Herbes de Provence', qty: '1 c.c.' }
        ],
        steps: ['Former boulettes', 'Les saisir', 'Préparer sauce tomate', 'Ajouter légumes', 'Mijoter 30 min']
    },
    {
        id: 'caz_15', name: 'Rôti de Porc aux Pommes de Terre', emoji: '🍖', category: 'meat', cuisine: 'french',
        time: '1h30', calories: 480, sugar: 2, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: false, isVegan: false,
        weather: ['cold', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'porc', 'rôti', 'dimanche', 'famille'],
        ingredients: [
            { name: 'Rôti de porc', qty: '1.2kg' }, { name: 'Pommes de terre', qty: '1kg' },
            { name: 'Oignons', qty: '2' }, { name: 'Ail', qty: '4 gousses' },
            { name: 'Romarin', qty: '2 branches' }, { name: 'Moutarde', qty: '2 c.s.' }
        ],
        steps: ['Badigeonner rôti de moutarde', 'Disposer dans plat', 'Ajouter pommes de terre', 'Enfourner 1h15', 'Arroser régulièrement']
    },

    // ===== CUISINEAZ - RECETTES PAS CHÈRES =====
    {
        id: 'caz_16', name: 'Écrasé de Pommes de Terre', emoji: '🥔', category: 'veggie', cuisine: 'french',
        time: '25 min', calories: 280, sugar: 2, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ['cold', 'cloudy', 'all'], season: ['winter', 'fall', 'all'],
        keywords: ['français', 'accompagnement', 'pommes de terre', 'pas cher', 'facile'],
        ingredients: [
            { name: 'Pommes de terre', qty: '800g' }, { name: 'Beurre', qty: '50g' },
            { name: 'Huile olive', qty: '3 c.s.' }, { name: 'Ciboulette', qty: '1 bouquet' },
            { name: 'Sel', qty: 'QS' }, { name: 'Poivre', qty: 'QS' }
        ],
        steps: ['Cuire pommes de terre', 'Écraser grossièrement', 'Ajouter beurre huile', 'Assaisonner', 'Garnir ciboulette']
    },
    {
        id: 'caz_17', name: 'Pommes de Terre Boulangères', emoji: '🥔', category: 'veggie', cuisine: 'french',
        time: '1h', calories: 320, sugar: 3, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ['cold', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'pommes de terre', 'accompagnement', 'traditionnel'],
        ingredients: [
            { name: 'Pommes de terre', qty: '1.2kg' }, { name: 'Oignons', qty: '3' },
            { name: 'Bouillon', qty: '40cl' }, { name: 'Thym', qty: '4 branches' },
            { name: 'Beurre', qty: '40g' }, { name: 'Laurier', qty: '2 feuilles' }
        ],
        steps: ['Trancher pommes de terre et oignons', 'Disposer en couches', 'Verser bouillon', 'Parsemer de beurre', 'Cuire au four 50 min']
    },
    {
        id: 'caz_18', name: 'Curry de Chou Kale', emoji: '🥬', category: 'veggie', cuisine: 'indian',
        time: '30 min', calories: 280, sugar: 5, servings: 4,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['cold', 'rainy'], season: ['winter', 'fall'],
        keywords: ['indien', 'hiver', 'chou kale', 'curry', 'végétarien', 'vegan'],
        ingredients: [
            { name: 'Chou kale', qty: '300g' }, { name: 'Lait de coco', qty: '400ml' },
            { name: 'Pâte de curry', qty: '2 c.s.' }, { name: 'Oignon', qty: '1' },
            { name: 'Pois chiches', qty: '200g' }, { name: 'Riz basmati', qty: '250g' }
        ],
        steps: ['Faire revenir oignon', 'Ajouter curry', 'Verser coco', 'Ajouter kale et pois chiches', 'Mijoter 15 min']
    },
    {
        id: 'caz_19', name: 'Tatin de Chou Rouge à la Feta', emoji: '🥬', category: 'veggie', cuisine: 'french',
        time: '50 min', calories: 320, sugar: 8, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: true, isVegetarian: true, isVegan: false,
        weather: ['cold', 'cloudy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'chou rouge', 'feta', 'tatin', 'originalité'],
        ingredients: [
            { name: 'Chou rouge', qty: '1/2' }, { name: 'Pâte feuilletée', qty: '1' },
            { name: 'Feta', qty: '150g' }, { name: 'Miel', qty: '2 c.s.' },
            { name: 'Noix', qty: '50g' }, { name: 'Vinaigre balsamique', qty: '2 c.s.' }
        ],
        steps: ['Caraméliser chou au miel', 'Ajouter balsamique', 'Émietter feta', 'Recouvrir de pâte', 'Cuire et retourner']
    },

    // ===== CUISINEAZ - DESSERTS D'HIVER =====
    {
        id: 'caz_20', name: 'Pommes au Four Cannelle', emoji: '🍎', category: 'dessert', cuisine: 'french',
        time: '35 min', calories: 180, sugar: 22, servings: 4,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ['cold', 'rainy', 'snowy'], season: ['winter', 'fall'],
        keywords: ['français', 'hiver', 'pommes', 'dessert', 'cannelle', 'réconfortant'],
        ingredients: [
            { name: 'Pommes', qty: '4' }, { name: 'Beurre', qty: '40g' },
            { name: 'Sucre', qty: '4 c.s.' }, { name: 'Cannelle', qty: '1 c.c.' },
            { name: 'Raisins secs', qty: '30g' }, { name: 'Amandes', qty: '20g' }
        ],
        steps: ['Évider pommes', 'Garnir beurre sucre raisins', 'Saupoudrer cannelle', 'Enfourner 30 min', 'Servir tiède']
    },
    {
        id: 'caz_21', name: 'Pommes Caramélisées', emoji: '🍎', category: 'dessert', cuisine: 'french',
        time: '15 min', calories: 220, sugar: 28, servings: 4,
        glycemicIndex: 'high', diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ['cold', 'cloudy', 'all'], season: ['winter', 'fall'],
        keywords: ['français', 'dessert', 'pommes', 'caramel', 'rapide'],
        ingredients: [
            { name: 'Pommes', qty: '4' }, { name: 'Beurre', qty: '50g' },
            { name: 'Sucre', qty: '60g' }, { name: 'Cannelle', qty: '1/2 c.c.' },
            { name: 'Vanille', qty: '1 gousse' }, { name: 'Crème', qty: '5cl' }
        ],
        steps: ['Couper pommes en quartiers', 'Caraméliser sucre', 'Ajouter beurre', 'Sauter les pommes', 'Finir à la crème']
    },
    {
        id: 'caz_22', name: 'Galette des Rois Frangipane', emoji: '👑', category: 'dessert', cuisine: 'french',
        time: '1h', calories: 420, sugar: 25, servings: 8,
        glycemicIndex: 'high', diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ['cold', 'snowy'], season: ['winter'],
        keywords: ['français', 'hiver', 'galette', 'épiphanie', 'amande', 'frangipane', 'janvier'],
        ingredients: [
            { name: 'Pâte feuilletée', qty: '2' }, { name: 'Poudre d\'amandes', qty: '150g' },
            { name: 'Beurre', qty: '100g' }, { name: 'Sucre', qty: '100g' },
            { name: 'Œufs', qty: '2' }, { name: 'Rhum', qty: '1 c.s.' }
        ],
        steps: ['Préparer crème d\'amandes', 'Étaler première pâte', 'Garnir de frangipane', 'Recouvrir', 'Dorer et cuire 35 min']
    },
    {
        id: 'caz_23', name: 'Far aux Pommes Calvados', emoji: '🍎', category: 'dessert', cuisine: 'french',
        time: '50 min', calories: 350, sugar: 22, servings: 6,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: true, isVegan: false,
        weather: ['cold', 'rainy'], season: ['winter', 'fall'],
        keywords: ['français', 'breton', 'far', 'pommes', 'calvados', 'dessert'],
        ingredients: [
            { name: 'Pommes', qty: '3' }, { name: 'Farine', qty: '150g' },
            { name: 'Sucre', qty: '100g' }, { name: 'Œufs', qty: '4' },
            { name: 'Lait', qty: '50cl' }, { name: 'Calvados', qty: '3 c.s.' }
        ],
        steps: ['Préparer appareil', 'Trancher pommes', 'Disposer dans moule', 'Verser appareil', 'Cuire 45 min']
    },
    {
        id: 'caz_24', name: 'Gâteau aux Pommes Sans Œufs', emoji: '🍰', category: 'dessert', cuisine: 'french',
        time: '45 min', calories: 280, sugar: 24, servings: 8,
        glycemicIndex: 'medium', diabeticFriendly: false, isVegetarian: true, isVegan: true,
        weather: ['cold', 'cloudy', 'all'], season: ['winter', 'fall', 'all'],
        keywords: ['français', 'dessert', 'pommes', 'vegan', 'sans œufs', 'facile'],
        ingredients: [
            { name: 'Pommes', qty: '4' }, { name: 'Farine', qty: '250g' },
            { name: 'Sucre', qty: '150g' }, { name: 'Huile', qty: '8cl' },
            { name: 'Lait végétal', qty: '20cl' }, { name: 'Levure', qty: '1 sachet' }
        ],
        steps: ['Mélanger ingrédients secs', 'Ajouter liquides', 'Incorporer pommes', 'Verser en moule', 'Cuire 40 min']
    },
    {
        id: 'caz_25', name: 'Salade Détox Quinoa Avocat', emoji: '🥗', category: 'healthy', cuisine: 'modern',
        time: '20 min', calories: 320, sugar: 6, servings: 2,
        glycemicIndex: 'low', diabeticFriendly: true, isVegetarian: true, isVegan: true,
        weather: ['sunny', 'cloudy', 'all'], season: ['winter', 'spring', 'all'],
        keywords: ['healthy', 'détox', 'quinoa', 'avocat', 'pomme', 'léger', 'janvier'],
        ingredients: [
            { name: 'Quinoa', qty: '150g' }, { name: 'Avocat', qty: '1' },
            { name: 'Pomme verte', qty: '1' }, { name: 'Épinards', qty: '100g' },
            { name: 'Citron', qty: '1' }, { name: 'Huile olive', qty: '2 c.s.' }
        ],
        steps: ['Cuire quinoa', 'Couper avocat et pomme', 'Mélanger avec épinards', 'Assaisonner citron huile', 'Servir frais']
    }
];

// Add to database
recipesDatabase.push(...newRecipes);

// Expose globally for admin panel sync
window.recipesDatabase = recipesDatabase;
