# Implementation Plan - Weekly Meal Planner & AI Generation

## Goal
Implement a **Weekly Meal Planner** that allows users to:
1.  View a 7-day meal plan (Lunch & Dinner).
2.  **Automatically generate** a full week of meals using "AI" (smart randomization based on preferences).
3.  Add all ingredients from the week to the shopping list.

## User Review Required
> [!NOTE]
> The "AI" is a local algorithm that selects recipes based on tags (Vegetarian, etc.) and avoids repetition. It runs entirely in the browser.

## Proposed Changes

### HTML (`index.html`)
#### [MODIFY] index.html
-   Add a new view/page `<div id="page-planning" class="page">`.
-   Add "Planning" icon to the `<nav class="bottom-nav">`.
-   Structure the planning page with:
    -   Header with "Générer la semaine" button (magic wand icon).
    -   7-day grid container.
    -   "Ajouter à ma liste" button at the bottom.

### CSS (`index.css`)
#### [MODIFY] index.css
-   Add styles for `.planning-grid`, `.day-card`, `.meal-slot`.
-   Add animation for the "Generating" state.

### JavaScript (`script.js`)
#### [MODIFY] script.js
-   **State**: Add `weeklyPlan` to `state` object (persisted in localStorage).
-   **Logic**:
    -   `generateWeeklyPlan()`:
        -   Filter recipes by user preferences (Veggie/Vegan/Gluten-Free).
        -   Randomly assign recipes to Mon-Sun (Lunch/Dinner).
        -   Ensure variety (don't repeat same main ingredient too often if possible - optional advanced logic, basic random first).
    -   `renderPlanning()`: Display the grid.
    -   `addWeeklyPlanToShoppingList()`: Aggregate ingredients.

## Verification Plan
### Manual Verification
-   Click "Planning" tab -> confirm view opens.
-   Click "Générer" -> confirm grid fills with recipes.
-   Check consistency with "Vegetarian" mode (if on, only veggie recipes generated).
-   Click "Ajouter à la liste" -> check Shopping List tab for ingredients.
