# Copy/paste prompt for adding recipes with ChatGPT

This is a reusable prompt for any contributor, including a family member using the ChatGPT mobile app. The first time, connect or otherwise grant access to the **GitHub account that belongs to the contributor**; ChatGPT does not inherit someone else's login or repository permissions.

## Paste this into a new ChatGPT chat

```text
I help maintain our public Family Recipes cookbook.

GitHub repository: https://github.com/cbaum228/family-recipes
Live website: https://cbaum228.github.io/family-recipes/
Recipe files: _recipes/*.md

I am giving you a recipe in text, screenshots, or photos. Please turn it into a cookbook-compatible Markdown recipe and, ONLY IF you have authorized GitHub write tools or a configured Codex environment, publish it to that repository. Otherwise, give me the COMPLETE new/updated Markdown file so I can paste it into GitHub myself. Never claim it was committed unless you can provide a real commit or PR link.

FIRST read the actual repository files:
- AGENTS.md
- docs/recipe-template.md
- CONTRIBUTING.md
- _recipes/pumpkin-bars.md (example with original US measurements)
- assets/recipes.json and _layouts/recipe.html only if compatibility is uncertain
Check existing _recipes files for duplicates and consistent shopping_key naming.

Recipe standards:
1. Preserve the original ingredient measurements and instructions exactly in the recipe's notes. I might give cups, teaspoons, eggs, ounces, or cans; convert them to approximate grams/milliliters for the machine-readable ingredient fields, noting estimates and assumptions. Do not silently replace 1 cup with 1 gram value without preserving the original.
2. Each ingredient needs: name, amount (number), unit (g or ml), shopping_key, shopping_name, and aisle. Reuse standardized shopping keys from existing recipes wherever possible so pantry subtraction and shopping lists work.
3. Store complete ingredients and cooking steps. Keep meaningful temperatures, pan dimensions, equipment settings, cooking times, substitutions and special instructions. Do NOT invent unspecified frosting, toppings, exact counts, macros, cooked yield, or missing ingredients.
4. Use status: ready-to-test for a complete but not-yet-verified recipe; tested only if I explicitly say we've made and validated it. If critical information is missing, ask one focused question or prepare a needs-reconstruction entry instead of pretending it is complete. Set nutrition_verified: false unless reliable totals have been supplied and checked.
5. One normal meal serving means one full-size individual portion. For cookies, bars, muffins and other baked goods, use yield_unit and an appropriate count. Treat estimated yields as estimates.
6. In the recipe body, include a clearly labeled original-measurement section, cooking notes, uncertainties, and an update history. Keep any actual cooked changes or feedback separate from untested suggestions.
7. This repository is PUBLIC. Never add private pantry records, grocery shopping history, Firebase credentials, tokens, family identifying information, or photos unless I explicitly request public posting.
8. Update an existing recipe rather than creating a second near-duplicate. Only edit other code when needed for compatibility; preserve existing files.

After drafting, verify the YAML and catalog structure. If you can write: commit the recipe (or create a PR) and tell me the exact file URL, commit/PR link and what is unverified. If you cannot write: output the entire .md file without omissions, the exact filename, and the short GitHub phone-browser steps for saving it.

Here is my recipe:
[Paste the full recipe, or attach its photos/screenshots here.]

My changes or cooking notes (optional):
[Actual modifications, quantities, outcomes, brand names, substitutions or 'none'.]
```

For a quick follow-up in the **same** chat, simply say: **"Add this recipe to our Family Recipes cookbook using the repository contributor instructions"** and paste or attach the recipe. Confirm that the assistant actually used the repo instructions rather than relying only on memory.

## What she needs once (before trying to publish)

1. **Her own GitHub account.** You can create one at https://github.com/signup.
2. **Repository collaborator access.** The owner invites the GitHub username at https://github.com/cbaum228/family-recipes/settings/access via Settings → Collaborators → Add people. She accepts the invite on her account.
3. **Her own ChatGPT GitHub connection.** In ChatGPT → Settings → Plugins (or Apps, where shown), find GitHub, connect **her** GitHub account, and permit access to `cbaum228/family-recipes`. The standard GitHub connection is **read-only**; it lets ChatGPT inspect the repo, not necessarily save files.
4. **For direct GitHub publishing from AI:** Use a **write-capable Codex/Work environment** or another authorized write integration. Codex Cloud environments are configured on desktop/web and can be used from mobile afterwards, subject to her plan and app availability. Review the generated change before merging.
5. **Without write access:** She can still produce the entire Markdown file using this prompt. On GitHub in a phone browser (desktop site if necessary), open the repository → `_recipes` → **Add file → Create new file**, enter `new-slug.md`, paste the Markdown, and commit. For updating a recipe, open its file, select the pencil/edit option, paste the revised content and commit. No GitHub command line required.

## Simple recipe intake (optional)

She doesn't need to fill out a form; photos and copied text are fine. When details are available, useful context is:

- Recipe title and where it came from (family, cookbook, personal experiment)
- Ingredients with their original measurements
- Steps, temperatures, times, equipment and pan size
- Number of servings/bars/cookies/etc., or "not sure"
- Whether we've made it, and any measured modifications
- Extras, optional toppings or frosting (do not assume)

**Privacy:** Do not upload private grocery or household data into the public repository. A ChatGPT account, a GitHub collaborator invitation and a Firebase household login are three separate kinds of access.

## Help links

- [GitHub collaborator invitation instructions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)
- [Connect GitHub to ChatGPT](https://help.openai.com/en/articles/11145903-connecting-github-to-chatgpt)
- [Codex Cloud setup](https://help.openai.com/en/articles/20001545-using-codex-cloud)
