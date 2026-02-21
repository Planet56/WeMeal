import json

try:
    with open("off_debug.json", "r") as f:
        data = json.load(f)
        product = data.get("product", {})
        print("Allergens Tags:", product.get("allergens_tags"))
        print("\nAllergens:", product.get("allergens"))
        print("\nAllergens Hierarchy:", product.get("allergens_hierarchy"))
        print("\nIngredients Analysis Tags:", product.get("ingredients_analysis_tags"))
        print("\nIngredients Text:", product.get("ingredients_text"))
except Exception as e:
    print(e)
