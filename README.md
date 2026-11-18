# MathDys — cahier de maths pour les élèves multi-dys

![Tests](https://github.com/mathdys/mathdys.github.io/actions/workflows/tests.yml/badge.svg)

MathDys est un cahier de mathématiques en ligne pour prendre des notes **vite, au clavier, sans souris**.
Il est pensé pour les élèves dyspraxiques, dyslexiques et dyscalculiques, de la primaire au lycée.

👉 **Utiliser MathDys : https://mathdys.github.io/**

## Ce qu'il sait faire

**Écrire vite**
- **Écrire les maths comme on tape un SMS** : `3/4` donne une fraction, `x^2` une puissance, `rac` une racine, `inf` l'infini…
- **Ctrl+D recopie la ligne** : on corrige seulement ce qui change, idéal pour résoudre une équation étape par étape
- **Alignement automatique des `=`** d'une ligne à l'autre
- **Ctrl+K** pour trouver n'importe quel symbole par son nom
- **Calculatrice intégrée** (Ctrl+Entrée)
- **Vérifier ses étapes** (F9) : MathDys signale la ligne où une erreur s'est glissée, sans donner la réponse
- **Aide-mémoire** : les formules du programme (Pythagore, identités remarquables, dérivées…) dans Ctrl+K
- **Mes abréviations** : ses propres raccourcis (`ssi` → « si et seulement si »)

**Tous les outils de la primaire au lycée**
- **Opérations posées** : addition, soustraction, multiplication, division, avec des colonnes colorées
- **Systèmes, matrices, suites, ensembles, probabilités**
- **Graphiques de fonctions**, **arbres de probabilités**, **tableaux de signes et de variations**
- **Images** de l'énoncé dans le cahier (coller une capture, glisser une photo)

**Aides pour les dys**
- **Lecture à voix haute** en français (F2)
- **Mode concentration** (F8), **parenthèses colorées**, **chiffres et lettres en couleur**
- **Réglages tout prêts** (dyspraxie, dyslexie, dyscalculie), polices adaptées (Lexend, Atkinson Hyperlegible, Andika), taille, interligne, thème crème ou sombre

**Rendre son travail**
- **Imprimer ou enregistrer en PDF** une copie propre (Ctrl+P)
- **Exporter pour Word ou LibreOffice**, ou copier en texte lisible
- **Sauvegarder tout le cahier** en un seul fichier, pour ne jamais rien perdre

**Pour les professeurs**
- **Fiches d'exercices** : des lignes d'énoncé protégées que l'élève complète, sans pouvoir écraser la fiche
- **Mode examen** : les aides qui donnent des réponses sont coupées, l'heure de début est imprimée sur la copie

**Confort**
- **Visite guidée** au premier lancement, **menu Fichier** unique, **messages lisibles** (durée selon la longueur, bouton 🔊), **astuces au bon moment**
- **Panneau 📚 Pages** rangées par matière (F4), **menu de la ligne** (clic droit ou toucher l'icône), **réglages en onglets** avec aperçu
- **Pages rangées par matière**, **Mode simple**, **Annuler / Rétablir** pour tout le cahier, **déplacer les blocs**, **clavier de maths à l'écran** pour les tablettes
- Conçu pour être utilisable **au clavier seul** et avec un **lecteur d'écran**

Toute l'aide est dans le logiciel : touche **F1**. Les nouveautés sont dans [CHANGELOG.md](CHANGELOG.md).

## Vie privée

- **Aucun compte, aucune inscription.**
- Les cahiers sont enregistrés **sur votre ordinateur**, dans des fichiers `.mathdys` (Ctrl+S pour enregistrer, Ctrl+O pour ouvrir).
- Rien n'est envoyé sur un serveur : le site ne fait que s'afficher, tout se passe dans votre navigateur. La lecture à voix haute utilise la voix de votre ordinateur.

## Sans Internet

Ouvrez le site une fois avec une connexion : il reste ensuite disponible hors ligne.
Dans Chrome ou Edge, vous pouvez aussi **l'installer comme une application** (icône ⊕ dans la barre d'adresse).

## Une idée ? Un bug ?

Dans MathDys : bouton **🐞 Signaler un bug** en bas de la page. Ou écrivez à **git.public@protonmail.com** ou ouvrez une *Issue* sur ce dépôt.
Pour un bug, indiquez ce que vous faisiez, ce qui s'est passé et votre navigateur.

## Vérifier que tout marche

Ajoutez `#test` à la fin de l'adresse (https://mathdys.github.io/#test) : MathDys lance un auto-test et affiche ce qui fonctionne.

## Contribuer

Toute aide est bienvenue : voir [CONTRIBUTING.md](CONTRIBUTING.md). Les tests automatiques se lancent à chaque envoi (onglet *Actions*).

## Licence

MathDys est un **logiciel libre** distribué sous licence **GNU GPL v3** (voir le fichier [LICENSE](LICENSE)).
Vous pouvez l'utiliser, l'étudier, le modifier et le partager librement. Si vous distribuez une version modifiée, elle doit rester libre, sous la même licence, avec son code source.

## Technique

Une simple page web : `index.html`, `style.css` et `app.js`, plus `sw.js` et `manifest.webmanifest` pour le mode hors ligne. Pas d'installation, pas de serveur.
L'éditeur de formules est [MathLive](https://cortexjs.io/mathlive/) (licence MIT).
