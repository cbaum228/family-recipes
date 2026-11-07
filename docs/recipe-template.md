# Canonical Markdown Recipe Template

Copy the fenced Markdown block below into **a new file** under `_recipes/<unique-slug>.md`. Replace every example value with the actual recipe's data. The block represents the *file contents*, including YAML front matter.

The example file defaults to `needs-reconstruction` to avoid accidentally publishing its incomplete sample instructions. Change it to `ready-to-test` only when you've replaced **all** its example text with a complete recipe. Recipes may be contributed in US customary measurements or metric. The cookbook stores ingredient amounts only as **g** (mass) or **ml** (volume); original US quantities should be preserved in `note` and below the recipe.

For a complete, untested recipe use `ready-to-test`; only use `tested` after explicit successful cooking feedback. If required ingredients or steps are unknown, use `needs-reconstruction` and state what is missing.

```md
---
slug: "example-cinnamon-muffins"
title: "Example Cinnamon Muffins"
description: "One-sentence description of the finished dish."
status: needs-reconstruction
category: "Breakfast"
cuisine: "American"
servings: 12
yield_unit: "muffins"
pan_size: "standard 12-cup muffin pan"
nutrition_verified: false
historically_cooked: false
tags:
- "baking"
- "breakfast"
produce: []
ingredients:
- name: "All-purpose flour"
  amount: 240
  unit: g
  shopping_key: "all purpose flour"
  shopping_name: "All-purpose flour"
  aisle: "Baking"
  note: "Original: 2 US cups spooned and leveled; 240 g is an approximate mass conversion."
- name: "Whole milk"
  amount: 237
  unit: ml
  shopping_key: "whole milk"
  shopping_name: "Whole milk"
  aisle: "Dairy"
  note: "Original: 1 US cup; 237 ml is the US-volume conversion."
steps:
- "Preheat the oven to the recipe's actual temperature, if known."
- "Write the original verified preparation method here; do not invent missing measurements or steps."
---

## Original measurements

- 2 cups all-purpose flour
- 1 cup whole milk

## Cooking and verification notes

- Source: supplied by household contributor; this is a TEMPLATE, not a complete recipe.
- Yield: 12 muffins is illustrative; confirm the real yield.
- Missing ingredients or steps must be identified before this is used as a complete recipe.
- If optional frosting, toppings, or serving sides are not supplied, document them but do not invent or add them to the base ingredient quantities.
- Nutrition has not been verified.

## History

- **Version 0.1:** Transcribed from the contributor's supplied recipe. Original measurements preserved; metric values estimated where necessary.
```

## Field reference

| Field | Purpose |
|---|---|
| `slug` | Unique kebab-case ID matching the file name; do not change casually because plans and cooking records refer to it |
| `status` | `ready-to-test`, `tested`, or `needs-reconstruction` |
| `servings` | Baseline count for scaling; each normal main-dish serving is one full-size portion |
| `yield_unit` | Optional label for things like `bars`, `cookies`, `muffins`; omit for ordinary meal servings |
| `pan_size` | Optional recipe page label for baking pan size |
| `amount` / `unit` | Required numeric ingredient amount and either `g` or `ml` |
| `shopping_key` | Ingredient ID reused across recipes, paired with unit for pantry matching |
| `shopping_name` / `aisle` | Grocery display name and department |
| `note` | Original household measurement, brand/variant, and conversion certainty |
| `steps` | Complete preparation/cooking steps for a usable recipe |
| `nutrition_verified` | Always false unless nutritional data are actually verified |

**Important:** The sample above intentionally leaves out most ingredients and does **not** represent a cookable muffin recipe. Do not publish it as a real recipe; replace its ingredients, method, servings and notes with the supplied dish.

## Compatibility checklist

1. New filename in `_recipes/<slug>.md`; `slug` matches and isn't duplicated.
2. Valid YAML front matter between the opening and closing `---`.
3. All required ingredient fields present; canonical units strictly `g` or `ml`, positive finite amounts.
4. Original teaspoons, cups, cans, counts, pounds and ounces documented in `note` and/or the recipe body.
5. `shopping_key` and `unit` consistent with equivalent pantry ingredients elsewhere.
6. `steps` reflect the provided cooking process; any unclear or estimated values are clearly marked.
7. `servings` fits current UI scaling (0.5–50); baked-item `yield_unit` included when appropriate.
8. `nutrition_verified: false` unless genuinely verified.
9. Complete recipes appear in `assets/recipes.json` automatically; `needs-reconstruction` archives are intentionally excluded from the shopping/planner catalog.
10. Public content only. Don't commit household-private data, tokens, or uploaded photos unless explicitly intended for publication.
