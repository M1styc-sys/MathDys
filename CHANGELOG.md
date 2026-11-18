# Nouveautés de MathDys

## Version 1.3.1 — plus aucune dépendance à un autre site
- **Éditeur de formules rangé dans le dépôt** (`lib/mathlive/`, installé par l'action GitHub « Installer l'éditeur de formules ») : MathDys marche même si le réseau de l'établissement bloque jsDelivr, et hors ligne dès la première visite. Les formules utilisent maintenant les vraies polices de maths de MathLive.
- Si la copie manque, MathDys reprend automatiquement la même version sur jsDelivr : rien ne casse.

## Version 1.3.0 — nouvelle identité « Signature »
- **Nouveau logo** : « M » sur « D », séparés par un trait de fraction abricot. Nouvelle icône d'application et d'onglet.
- **Une identité qu'on reconnaît** : le trait de fraction souligne l'onglet actif et les titres, la ligne en cours est **surlignée comme au stabilo**, et le fond est un **papier pointé** discret. Icônes fines à la place des émojis dans les barres d'outils.
- **Thème automatique** : MathDys suit le réglage clair ou sombre de l'ordinateur. Un bouton lune / soleil en haut change en un clic. Le thème sombre est bleu nuit avec un texte blanc cassé, plus reposant. L'impression et le PDF sortent toujours en clair.
- **Téléphones et tablettes** : plusieurs réglages pour petits écrans ne s'appliquaient pas ; c'est corrigé (marges, tailles, flèches ▲▼ cachées). Le bouton 🗑 reste visible au doigt. Le titre de la page est de nouveau visible et modifiable.
- **Messages** : ils ne sont plus écrasés sur une colonne étroite sur téléphone.
- **Mode examen** : la barre d'outils ne passe plus sous le bandeau rouge quand il tient sur plusieurs lignes.
- **Grand écran** : le panneau 📚 Pages se range sous la barre du haut au lieu de la recouvrir.
- **Thème sombre** : bouton « Annuler » des messages, cases d'erreur et cases des opérations posées enfin lisibles.
- Textes trop petits agrandis ; réglage « réduire les animations » de l'ordinateur respecté ; feuille de style réorganisée et commentée.

## Version 1.2.0 — plus simple à prendre en main
- **Écran plus léger** : un seul menu **📁 Fichier** (ouvrir, enregistrer sous, sauvegarder tout le cahier, imprimer ou PDF, Word, LibreOffice, copier). **💾 Enregistrer** reste à portée de main. Les boutons qui n'avaient qu'un symbole ont maintenant un nom (↶ Annuler, ↷ Rétablir, 🎯 Concentration).
- **Visite guidée** au premier lancement, à faire en vrai sur la page : une fraction, Entrée, Ctrl+D, F9, Ctrl+K. Elle remplace le grand tableau d'aide. À revoir depuis l'aide (F1) ou les réglages.
- **Messages lisibles** : ils restent affichés selon leur longueur, ne disparaissent pas tant que la souris est dessus, et ont un bouton ✕ et un bouton 🔊 pour les écouter.
- **Astuces au bon moment**, une seule fois chacune (par exemple « tape 3/4 » après plusieurs clics sur le bouton fraction, ou « Ctrl+D » quand on réécrit la ligne du dessus). Désactivables dans Réglages → Aides.
- **📚 Pages** (ou F4) : un panneau avec toutes les pages rangées par matière, une recherche, et 📁 Ranger / 🗑 Supprimer pour chaque page.
- **Réglages en 4 onglets** (Affichage, Aides, Clavier, Professeur et examen) avec un **aperçu en direct**.
- **Ctrl+K trouve aussi les réponses de l'aide** : tape « supprimer », « enregistrer », « matière »…
- **Menu de la ligne** : clic droit sur une ligne, touche Menu du clavier, ou toucher l'icône à gauche sur tablette → monter, descendre, dupliquer, changer en texte ou en calcul, lire, supprimer.
- **Tablettes et téléphones** : les barres d'outils tiennent enfin sur une ligne et une flèche **›** montre qu'il y a d'autres outils.
- **Mêmes mots partout** (cahier, page, ligne, bloc, sauvegarde, fiche, énoncé), avec un petit lexique dans l'aide.

## Version 1.1.1 — version stable (corrections)
- **Mode examen** : le bandeau rouge restait affiché en permanence, même hors examen ou après en être sorti, avec un bouton « Quitter » sans effet. Corrigé.
- **Mode examen** : impossible désormais d'en sortir en ouvrant un fichier depuis l'ordinateur ; le bouton « Vérifier » des additions et soustractions est bien coupé ; si le code du professeur est perdu, il n'est plus demandé 4 h après le début ; le cadre rouge ne disparaît plus quand on change un réglage.
- **Mises à jour** : le navigateur pouvait mélanger l'ancienne page et le nouveau code, et MathDys démarrait à moitié. Maintenant les deux sont toujours de la même version, et MathDys se répare tout seul si besoin (bouton « Réparer et recharger » en dernier recours ; les cahiers ne sont jamais touchés).
- **Données** : ouvrir un fichier pouvait supprimer des pages vides du cahier ; rouvrir un fichier déjà ouvert pouvait écraser des modifications non enregistrées. Corrigé : rien n'est plus jamais effacé sans le demander.
- **Données** : un cahier abîmé (fichier modifié à la main, ancienne version) est réparé au lieu de faire planter MathDys.
- Changer de page n'affiche plus à tort « pas encore enregistré ».
- Ctrl+Entrée deux fois de suite n'écrit plus « = 7 = 7 ».
- Une ligne d'énoncé ne peut plus être déplacée en déplaçant sa voisine ; elle est protégée dès son affichage.
- Un zoom extrême sur un graphique ne peut plus figer la page.
- Arbres : les probabilités des branches retirées sont effacées ; en mode examen, plus d'indication sur la somme des branches.
- Plus d'erreur au chargement liée au dossier `lib/` (l'éditeur de formules est chargé directement, en version figée).
- Messages du mode examen corrigés (« Désactivé en mode examen : la calculatrice »).

## Version 1.1.0
- **Mode examen** (Réglages → 🎓, ou Ctrl+K → « examen ») : coupe les aides qui donnent des réponses (vérification des étapes, aide-mémoire, abréviations, « Vérifier » des opérations, calculs automatiques des arbres et des tableaux), au choix la calculatrice et les graphiques, et l'accès aux autres pages et fichiers. Bandeau visible, heure de début imprimée sur la copie, code facultatif du professeur pour en sortir.
- **Sauvegarder tout le cahier** en un seul fichier (Exporter… → 💾), et le restaurer avec 📂 Ouvrir, sans rien effacer. Petit rappel quand le cahier grandit.
- **Téléphones et tablettes** : barres d'outils compactes qui défilent sur le côté ; le cahier garde la place.

## Version 1.0.0 — première version officielle
- **Vérifier ses étapes** (F9) : signale la ligne où une erreur s'est glissée dans une équation, une inéquation ou un calcul, sans donner la réponse.
- **Aide-mémoire** : 27 formules du programme du collège et du lycée, à retrouver avec Ctrl+K.
- **Mes abréviations** : ses propres raccourcis, dans le texte comme dans les calculs.
- **Chiffres et lettres en couleur** dans les formules (activé par le réglage « dyscalculie »).
- **Pages rangées par matière** ; Ctrl+K retrouve aussi les pages.
- **🐞 Signaler un bug** : un message prêt à envoyer, avec les informations utiles (sans le cahier ni le nom).
- **Éditeur de formules dans le dépôt** (dossier `lib/`, facultatif) : plus aucun service extérieur pour l'éditeur.
- **Tests automatiques** à chaque envoi sur GitHub, guide pour contribuer (CONTRIBUTING.md), sommaire en tête du code.

## Version 0.4.2
- Nouvelle adresse : **https://mathdys.github.io**
- Cliquer n'importe où sur une ligne (même à droite de la formule ou sur une ligne vide) y place le curseur.
- Le curseur passe de façon fiable d'une ligne à l'autre (flèches, Échap, déplacement de blocs).

## Version 0.4.1 (corrections après tests en ligne)
- La calculatrice, la lecture à voix haute et l'export comprennent les fractions et racines tapées au clavier (\frac34, \sqrt2).
- Échap pour fermer une fenêtre ne fait plus passer la ligne de calcul en « mode LaTeX ».
- Le curseur va bien dans un nouveau bloc (opération posée, tableau, arbre, image).
- Entrée dans une multiplication ou une division posée amène dans la grille.
- La recherche Ctrl+K prend le curseur tout de suite.
- Barre du haut plus compacte sur les petits écrans, tableau sans barre de défilement, chiffres non barrés dans les opérations, arbre plus aéré.

## Version 0.4.0
- **Annuler / Rétablir pour tout le cahier** (Ctrl+Z, Ctrl+Y, boutons ↶ ↷) : un bloc supprimé, déplacé ou transformé se récupère.
- **Mode simple** : seulement les boutons essentiels ; tout le reste est dans Ctrl+K. Activé par les réglages tout prêts.
- **Déplacer un bloc** vers le haut ou le bas (Alt+↑ / Alt+↓, ou ▲▼).
- **Clavier de maths à l'écran** pour les tablettes.
- **Fiches d'exercices pour les professeurs** : lignes d'énoncé protégées (🔒) ; l'élève enregistre sa copie sans écraser la fiche.
- **Export Word et LibreOffice** (menu Exporter…), et copie en texte lisible (x², √, ∞…).
- **Accessibilité** : contrastes conformes aux normes (WCAG AA), libellés pour les lecteurs d'écran, focus visible au clavier.
- **Fiabilité** : version de l'éditeur de formules figée, page d'auto-test (ajoute #test à la fin de l'adresse).

## Version 0.3.0
- **Imprimer ou enregistrer en PDF** (Ctrl+P) : une copie propre avec ton nom, la date et le titre, sans les boutons.
- **Images dans le cahier** : colle une capture de l'énoncé (Ctrl+V), glisse une photo sur la page ou choisis un fichier.
- **Multiplication posée** : une ligne par chiffre, décalages déjà posés, virgule dans le résultat.
- **Division posée** (potence) : soustractions, quotient et reste, avec vérification.
- **Tableaux de signes et de variations**, avec une ligne « produit » qui applique la règle des signes toute seule.
- **Lecture à voix haute** en français (F2 pour la ligne, Maj+F2 pour la page), sans rien envoyer sur Internet.
- **Mode concentration** (F8) : seule la ligne en cours reste bien visible.
- **Parenthèses colorées** par paire (réglage).
- **Réglages tout prêts** : dyspraxie, dyslexie, dyscalculie.
- **Marche sans Internet** une fois le site ouvert une première fois, et **s'installe comme une application** (Chrome, Edge).

## Version 0.2.0
- Enregistrement des cahiers dans des fichiers `.mathdys` sur l'ordinateur (Ctrl+S, Ctrl+O), glisser-déposer.
- Arbres de probabilités, graphiques de fonctions, systèmes, matrices, suites, probabilités.
- Recherche de symbole par son nom (Ctrl+K).
- Suppression de n'importe quel bloc, avec « Annuler ».

## Version 0.1.0
- Premier prototype : saisie rapide au clavier, Ctrl+D pour recopier une ligne, alignement des `=`, calculatrice, opérations posées (+ et −), trois niveaux, réglages d'affichage.
