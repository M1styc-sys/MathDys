# MathDys — cahier de maths pour les élèves multi-dys

MathDys est un cahier de mathématiques en ligne pour prendre des notes **vite, au clavier, sans souris**.
Il est pensé pour les élèves dyspraxiques, dyslexiques et dyscalculiques, de la primaire au lycée.

👉 **Utiliser MathDys : https://m1styc-sys.github.io/MathDys/**

## Ce qu'il sait faire

- **Écrire les maths comme on tape un SMS** : `3/4` donne une fraction, `x^2` une puissance, `rac` une racine, `inf` l'infini…
- **Ctrl+D recopie la ligne** : on corrige seulement ce qui change, idéal pour résoudre une équation étape par étape
- **Alignement automatique des `=`** d'une ligne à l'autre
- **Calculatrice intégrée** (Ctrl+Entrée)
- **Opérations posées** avec des colonnes colorées (unités, dizaines, centaines)
- **Systèmes, matrices, suites, probabilités, ensembles…** et **Ctrl+K** pour trouver n'importe quel symbole par son nom
- **Graphiques de fonctions** (Ctrl+G) et **arbres de probabilités** (Ctrl+B)
- **Trois niveaux** (primaire, collège, lycée) dans la même interface
- **Réglages d'affichage** : polices adaptées (Lexend, Atkinson Hyperlegible, Andika), taille, interligne, thème crème ou sombre

Toute l'aide est dans le logiciel : touche **F1**.

## Vie privée

- **Aucun compte, aucune inscription.**
- Les cahiers sont enregistrés **sur votre ordinateur**, dans des fichiers `.mathdys` (Ctrl+S pour enregistrer, Ctrl+O pour ouvrir).
- Rien n'est envoyé sur un serveur : le site ne fait que s'afficher, tout se passe dans votre navigateur.

## Utiliser sans Internet

Téléchargez le projet (bouton vert **Code** puis **Download ZIP**), décompressez-le et ouvrez `index.html`.
*(Pour l'instant, une connexion est encore nécessaire pour charger l'éditeur de formules.)*

## Une idée ? Un bug ?

Écrivez à **git.public@protonmail.com** ou ouvrez une *Issue* sur ce dépôt.
Pour un bug, indiquez ce que vous faisiez, ce qui s'est passé et votre navigateur.

## Technique

Une simple page web : `index.html`, `style.css` et `app.js`, sans installation ni serveur.
L'éditeur de formules est [MathLive](https://cortexjs.io/mathlive/) (licence MIT).
