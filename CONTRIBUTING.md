# Contribuer à MathDys

Merci de vouloir aider ! MathDys est fait pour les élèves dys : chaque changement doit rester **simple, lisible et utilisable au clavier**.

## Signaler un bug ou proposer une idée
- Dans MathDys : bouton **🐞 Signaler un bug** (en bas du cahier), ou Ctrl+K → « bug ».
- Ou par mail : **git.public@protonmail.com**, ou une *Issue* sur ce dépôt.

## Comment est fait le projet

Pas d'installation, pas de framework, pas de serveur : une page web statique.

| Fichier | Rôle |
|---|---|
| `index.html` | la structure de la page, les fenêtres (aide, réglages…) |
| `style.css` | l'apparence : thèmes, couleurs, impression |
| `app.js` | tout le fonctionnement, découpé en sections (sommaire en haut du fichier) |
| `sw.js`, `manifest.webmanifest` | mode hors ligne et installation comme application |
| `tests/` | tests automatiques (lancés par GitHub à chaque envoi) |

### Les grandes parties de `app.js`
- **Catalogue des symboles** (`CATALOG`) : chaque symbole ou formule est une ligne `[affichage, nom, LaTeX, raccourci, niveau, mots-clés]`. Ajouter un symbole = ajouter une ligne.
- **Types de blocs** (`BLOCKS`) : ligne de calcul, texte, opération posée, graphique, arbre, tableau, image. Chaque bloc a sa fonction `buildXxx(row, body)`.
- **Calcul** (`braceify`, `normLatex`, `compileExpr`) : transforme le LaTeX en expression calculable, sans `eval`.
- **Vérifier ses étapes** (`checkSteps`) : compare chaque ligne à la précédente en testant des valeurs au hasard.
- **Lecture à voix haute** (`latexToSpeech`) et **export** (`latexToUnicode`).
- **Clavier** : un seul gestionnaire `keydown` qui décide de chaque raccourci.
- **Auto-test** (`runSelfTest`) : ajoute `#test` à l'adresse du site pour le lancer.

## Versions
Le numéro de version est écrit à **trois endroits** qui doivent être identiques : `APP_VERSION` dans `app.js`, la balise `<meta name="mathdys-version">` dans `index.html`, et `VERSION` dans `sw.js`. Les liens vers `app.js?v=…` et `style.css?v=…` portent aussi ce numéro, pour que le navigateur ne mélange jamais deux versions. L'auto-test vérifie que la page et le code sont de la même version.

## Héberger l'éditeur de formules soi-même (facultatif)
MathDys charge d'abord la copie de MathLive 0.104.2 rangée dans `lib/mathlive/` ; si elle manque, il prend la même version sur jsDelivr. Cette copie est installée par l'action GitHub « Installer l'éditeur de formules » (onglet Actions → Run workflow), qui la télécharge depuis npm. Pour changer de version, modifier `VERSION` dans `.github/workflows/mathlive.yml` et la même version dans `index.html` (les deux balises `<script>` et le service worker), puis relancer l'action.

## Vérifier qu'on n'a rien cassé
- Ouvre le site avec `#test` à la fin de l'adresse : tout doit être ✅.
- Ou en local : `npm install --no-save playwright@1 && npx playwright install chromium && node tests/run-tests.mjs`
- Sur GitHub : onglet **Actions**, le test se lance tout seul à chaque envoi.

## Règles
- Tout doit marcher **au clavier**, et rester **lisible avec un lecteur d'écran** (attribut `aria-label`, `title`).
- Les contrastes de couleurs respectent le niveau **WCAG AA** (4,5:1).
- **Rien ne quitte l'ordinateur** de l'élève : pas de compte, pas de traceur, pas d'envoi de données.
- Les textes sont en français simple, avec des phrases courtes.

## Licence
En contribuant, tu acceptes que ton code soit publié sous la licence **GNU GPL v3** du projet.
