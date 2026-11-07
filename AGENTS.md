# Family Recipes — contributor agent instructions

This is the public family cookbook, deployed from GitHub Pages at https://cbaum228.github.io/family-recipes/.
The recipe source of truth is in `_recipes/*.md`; Jekyll generates the site and `assets/recipes.json`.
Read `docs/chatgpt-recipe-prompt.md` and `docs/recipe-template.md` before authoring a recipe.

## Recipe-writing rules

- Never commit pantry contents, Firebase household records, family information, credentials, personal photos, API tokens, or private backups. The repository and website are public.
- Search existing `_recipes/*.md` first. Update the existing recipe if it is the same dish; do not create duplicates.
- Keep complete front matter with `slug`, `title`, `description`, `status`, `category`, `cuisine`, `servings`, `nutrition_verified`, `tags`, `produce`, `ingredients`, and `steps`.
- `slug` must match the filename: `_recipes/<slug>.md`, kebab-case, unique. Use UTF-8.
- `status: ready-to-test` is for complete usable recipes not confirmed and validated; `status: tested` only when the cook explicitly confirms the recipe worked; `needs-reconstruction` when essential data remains missing. Use `historically_cooked: true` only for an actual reported cook.
- Each ingredient entry must have a `name`, numeric `amount`, `unit` (only `g` or `ml`), `shopping_key`, `shopping_name`, and `aisle`. The shopping and pantry code matches normalized shopping key **plus unit**, so follow keys used for the same ingredient elsewhere. Never use item counts, cups, tsp, oz, lb, or `each` as canonical units.
- Convert original US volume/count measures with standard ingredient-specific approximations. Keep the *exact original amounts* in ingredient `note` and an `Original US measurements` or `Cooking notes` section. Do not present approximated weights as verified. Distinguish fluid ounces (ml) from weight ounces (g).
- Eggs originally specified by count are recorded as an estimated edible mass in grams; original egg count goes in `note`.
- All nutrition is unverified by default: `nutrition_verified: false`. Do not invent calories or macros. Only treat cooked yield and nutrition as verified when user provides evidence.
- For ordinary main dishes, one `servings` unit means one normal full-size portion (not a combined household meal). For bars, cookies or cupcakes, optionally use `yield_unit` such as `bars` or `muffins`. Numeric `servings` must support the site's 0.5-to-50 scaler; for large batches ask how to split or flag unsupported scale.
- Preserve oven temperature, pan dimensions, cooking method, critical food-safety instructions, ingredient variants, and all deliberate changes. Do not invent frosting, toppings, serving size, optional ingredients, water quantities, or results without distinguishing the additions.
- If a source recipe lacks crucial ingredients or cooking steps, ask one specific question or create a `needs-reconstruction` archive, never a falsely complete entry. Avoid unnecessary questions when best-effort conversions can be labeled.
- Keep recipe history in Markdown after front matter. Mark `tested` only with user's explicit cooking confirmation.
- Validate YAML, ingredient fields, schema compatibility and JS/Jekyll references if changed. Verify newly added recipe appears in the generated catalog when build checks are available.
- Prefer changes only to the recipe Markdown; modify Jekyll templates or JavaScript when truly needed for schema compatibility. Preserve other recipes and do not overwrite unrelated content.
- If granted GitHub **write** capability, commit and report the exact commit and recipe URL. If only GitHub **read** is available, do not claim to have committed: return a complete ready-to-save `.md` file and instructions to use the GitHub web editor or a write-capable Codex workflow.

Full copy/paste contributor instructions: `docs/chatgpt-recipe-prompt.md`.
