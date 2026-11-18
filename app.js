/*
  MathDys — cahier de maths pour les élèves multi-dys (licence GNU GPL v3)
  https://mathdys.github.io

  SOMMAIRE (cherche le titre avec Ctrl+F) :
   - Catalogue des symboles
   - État + sauvegarde
   - Types de blocs
   - Annuler / Rétablir pour tout le cahier
   - Rendu
   - Vérifier ses étapes (F9) : signale la ligne où une erreur s'est glissée, sans donner la réponse
   - Lecture à voix haute (synthèse vocale du navigateur, rien n'est envoyé)
   - Parenthèses colorées par paire
   - Réglages tout prêts
   - Clavier
   - Barre d'outils
   - Aide
   - Fenêtres, réglages, pages
   - Export : texte lisible, LaTeX, Word / LibreOffice
   - Fichiers sur l'ordinateur (aucun compte, aucun serveur)
   - Mode examen : les aides qui donnent des réponses sont coupées
   - Signaler un bug
   - Hors ligne : installation comme une application
   - Auto-test (ouvrir le site avec #test à la fin de l'adresse)
   - Démarrage

  Voir CONTRIBUTING.md pour l'organisation du projet.
*/
(function(){
'use strict';
const MFE = window.MathfieldElement || (window.MathLive && window.MathLive.MathfieldElement);
if(!MFE){ document.getElementById('loaderr').style.display='block'; }
else{
  // Pas de polices ni de sons distants (bloqués ici) : MathLive utilise les polices du système.
  try{ MFE.fontsDirectory = null; }catch(e){}
  try{ MFE.soundsDirectory = null; }catch(e){}
  try{ MFE.keypressSound = null; MFE.plonkSound = null; }catch(e){}
  try{ MFE.decimalSeparator = ','; }catch(e){}
}

/* ============ Catalogue des symboles ============
   [symbole affiché, nom (pour la recherche), modèle LaTeX, raccourci tapé, niveau min (0 primaire, 1 collège, 2 lycée), mots-clés]
   #? = case à remplir, #@ = ce qui est juste avant le curseur */
const LV={primaire:0,college:1,lycee:2};
const SYS2='\\begin{cases}#?\\\\#?\\end{cases}';
const SYS3='\\begin{cases}#?\\\\#?\\\\#?\\end{cases}';
const MAT2='\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}';
const MAT3='\\begin{pmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{pmatrix}';
const CATALOG=[
 {cat:'Base', items:[
  ['a/b','Fraction','\\frac{#@}{#?}','/',0,'diviser quotient'],
  ['×','Fois','\\times','*',0,'multiplier produit'],
  ['÷','Divisé par','\\div','div',0,'division'],
  ['( )','Parenthèses','\\left(#?\\right)','(',0,''],
  ['[ ]','Crochets','\\left[#?\\right]','[',1,''],
  ['%','Pourcent','\\%','%',1,'pourcentage'],
  ['±','Plus ou moins','\\pm','+-',1,''],
 ]},
 {cat:'Puissances', items:[
  ['x²','Puissance','#@^{#?}','^',1,'carré exposant'],
  ['x²','Au carré','^2',null,1,'carré'],
  ['√','Racine carrée','\\sqrt{#?}','rac',1,''],
  ['ⁿ√','Racine n-ième','\\sqrt[#?]{#?}',null,2,'cubique'],
  ['10ⁿ','Puissance de 10','\\times10^{#?}',null,1,'scientifique notation'],
 ]},
 {cat:'Comparer', items:[
  ['≤','Inférieur ou égal','\\le','<=',1,'plus petit'],
  ['≥','Supérieur ou égal','\\ge','>=',1,'plus grand'],
  ['≠','Différent','\\ne','!=',1,''],
  ['≈','Environ égal','\\approx','~=',1,'arrondi approximativement'],
  ['<','Inférieur','<',null,0,'plus petit'],
  ['>','Supérieur','>',null,0,'plus grand'],
 ]},
 {cat:'Ensembles', items:[
  ['ℕ','Entiers naturels','\\mathbb{N}','NN',2,''],
  ['ℤ','Entiers relatifs','\\mathbb{Z}','ZZ',2,''],
  ['ℚ','Rationnels','\\mathbb{Q}','QQ',2,''],
  ['ℝ','Réels','\\mathbb{R}','RR',2,''],
  ['ℂ','Complexes','\\mathbb{C}','CC',2,''],
  ['∈','Appartient à','\\in','dans',2,'élément'],
  ['∉','N\u2019appartient pas','\\notin','pasdans',2,''],
  ['⊂','Inclus dans','\\subset','inclus',2,'sous-ensemble'],
  ['∅','Ensemble vide','\\varnothing','vide',2,''],
  ['[a;b]','Intervalle fermé','\\left[#?;#?\\right]',null,2,'intervalle'],
  [']a;b[','Intervalle ouvert','\\left]#?;#?\\right[',null,2,'intervalle'],
  ['[a;b[','Intervalle semi-ouvert','\\left[#?;#?\\right[',null,2,'intervalle'],
  [']−∞;a]','Intervalle depuis −∞','\\left]-\\infty;#?\\right]',null,2,'intervalle infini'],
  ['[a;+∞[','Intervalle jusqu\u2019à +∞','\\left[#?;+\\infty\\right[',null,2,'intervalle infini'],
  ['⇒','Implique','\\Rightarrow','=>',2,'donc logique'],
  ['⇔','Équivaut à','\\Leftrightarrow','<=>',2,'équivalent logique'],
  ['∀','Pour tout','\\forall','pourtout',2,'quel que soit'],
  ['∃','Il existe','\\exists','existe',2,''],
 ]},
 {cat:'Systèmes & matrices', items:[
  ['{ 2','Système de 2 équations',SYS2,'sys',1,'accolade équations'],
  ['{ 3','Système de 3 équations',SYS3,null,1,'accolade équations'],
  ['( )₂','Matrice 2×2',MAT2,'mat',2,'tableau'],
  ['( )₃','Matrice 3×3',MAT3,null,2,'tableau'],
  ['(x y)','Coordonnées en colonne','\\begin{pmatrix}#?\\\\#?\\end{pmatrix}','col',2,'vecteur colonne'],
  ['det','Déterminant','\\det\\left(#?\\right)',null,2,''],
 ]},
 {cat:'Suites', items:[
  ['uₙ','u indice n','u_{n}',null,2,'suite terme'],
  ['uₙ₊₁','u indice n+1','u_{n+1}',null,2,'suite récurrence'],
  ['u₀','Premier terme u₀','u_{0}',null,2,'suite'],
  ['xₙ','Indice','#@_{#?}','_',2,'suite'],
  ['(uₙ)','La suite (uₙ)','\\left(u_{n}\\right)',null,2,''],
  ['Σ','Somme','\\sum_{#?}^{#?}','som',2,'sigma'],
  ['lim n','Limite quand n→+∞','\\lim_{n\\to+\\infty}',null,2,'limite suite'],
  ['n!','Factorielle','!',null,2,''],
 ]},
 {cat:'Analyse', items:[
  ['📈','Graphique de fonction','@graph',null,1,'courbe tracer représentation'],
  ['↗','Tableau de variations','@tab',null,2,'variation croissante décroissante tableau'],
  ['±','Tableau de signes','@tabsign',null,2,'signe tableau règle des signes produit'],
  ['∞','Infini','\\infty','inf',1,'infinity'],
  ['+∞','Plus l\u2019infini','+\\infty',null,1,'infini'],
  ['−∞','Moins l\u2019infini','-\\infty',null,1,'infini'],
  ['lim','Limite','\\lim_{#?\\to#?}','lim',2,''],
  ['lim +∞','Limite en +∞','\\lim_{x\\to+\\infty}',null,2,'limite infini'],
  ['f\u2032','Dérivée f\u2032(x)','f\'\\left(x\\right)',null,2,'prime'],
  ['|x|','Valeur absolue','\\left|#?\\right|','abs',2,''],
  ['eˣ','Exponentielle','e^{#?}','exp',2,''],
  ['ln','Logarithme népérien','\\ln\\left(#?\\right)',null,2,'log'],
  ['∫','Intégrale','\\int_{#?}^{#?}#?\\,dx','integ',2,''],
  ['→','Tend vers','\\to','->',2,'flèche'],
  ['↦','Fonction x ↦','\\mapsto','|->',2,'associe'],
  ['sin','Sinus','\\sin\\left(#?\\right)',null,2,'trigonométrie'],
  ['cos','Cosinus','\\cos\\left(#?\\right)',null,2,'trigonométrie'],
 ]},
 {cat:'Probas', items:[
  ['🌳','Arbre de probabilités','@tree',null,1,'arbre pondéré branches'],
  ['+−','Opération posée','@op',null,0,'addition soustraction multiplication division poser'],
  ['🖼','Image de l\u2019énoncé','@img',null,0,'photo capture énoncé'],
  ['🐞','Signaler un bug ou proposer une idée','@bug',null,0,'problème erreur contact aide'],
  ['🎓','Mode examen','@exam',null,0,'contrôle brevet bac évaluation devoir'],
  ['P(A)','Probabilité de A','P\\left(#?\\right)',null,1,''],
  ['Ā','Contraire (barre)','\\overline{#?}','barre',1,'complémentaire événement'],
  ['∩','Intersection (et)','\\cap','inter',1,'et'],
  ['∪','Union (ou)','\\cup','union',1,'ou réunion'],
  ['P_A(B)','Probabilité conditionnelle','P_{#?}\\left(#?\\right)',null,2,'sachant'],
  ['(n k)','Combinaison','\\binom{#?}{#?}','comb',2,'coefficient binomial parmi'],
  ['E(X)','Espérance','E\\left(X\\right)',null,2,'moyenne'],
  ['V(X)','Variance','V\\left(X\\right)',null,2,''],
  ['σ','Écart-type sigma','\\sigma',null,2,''],
  ['x̄','Moyenne x barre','\\overline{x}',null,1,'statistiques'],
 ]},
 {cat:'Géométrie', items:[
  ['°','Degré','^{\\circ}','deg',1,'angle'],
  ['∠','Angle (chapeau)','\\widehat{#?}','angle',1,''],
  ['π','Pi','\\pi','pi',1,'cercle'],
  ['⊥','Perpendiculaire','\\perp','perp',1,''],
  ['∥','Parallèle','\\parallel','para',1,''],
  ['[AB]','Segment','\\left[#?\\right]',null,1,''],
  ['→AB','Vecteur','\\overrightarrow{#?}','vec',2,''],
  ['‖u‖','Norme','\\left\\|#?\\right\\|',null,2,'longueur vecteur'],
 ]},
 {cat:'Formules', items:[
  ['(a+b)²','Identité remarquable (a+b)²','\\left(a+b\\right)^2=a^2+2ab+b^2',null,1,'développer carré somme'],
  ['(a−b)²','Identité remarquable (a−b)²','\\left(a-b\\right)^2=a^2-2ab+b^2',null,1,'développer carré différence'],
  ['(a+b)(a−b)','Identité remarquable (a+b)(a−b)','\\left(a+b\\right)\\left(a-b\\right)=a^2-b^2',null,1,'différence de deux carrés factoriser'],
  ['Pythagore','Théorème de Pythagore','BC^2=AB^2+AC^2',null,1,'triangle rectangle hypoténuse'],
  ['Thalès','Théorème de Thalès','\\frac{AM}{AB}=\\frac{AN}{AC}=\\frac{MN}{BC}',null,1,'proportionnalité triangle'],
  ['πr²','Aire d\u2019un disque','\\mathcal{A}=\\pi r^2',null,1,'cercle rayon surface'],
  ['2πr','Périmètre d\u2019un cercle','P=2\\pi r',null,1,'circonférence rayon'],
  ['b×h/2','Aire d\u2019un triangle','\\mathcal{A}=\\frac{b\\times h}{2}',null,1,'base hauteur surface'],
  ['V cyl.','Volume d\u2019un cylindre','V=\\pi r^2h',null,1,'volume'],
  ['V cône','Volume d\u2019un cône ou d\u2019une pyramide','V=\\frac{\\mathcal{B}\\times h}{3}',null,1,'volume pyramide'],
  ['v=d/t','Vitesse moyenne','v=\\frac{d}{t}',null,1,'distance temps'],
  ['sin, cos, tan','Trigonométrie dans le triangle rectangle','\\cos\\widehat{A}=\\frac{\\text{adjacent}}{\\text{hypoténuse}}',null,1,'cosinus sinus tangente soh cah toa'],
  ['Δ','Discriminant','\\Delta=b^2-4ac',null,2,'second degré trinôme'],
  ['x₁, x₂','Solutions du second degré','x=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}',null,2,'racines trinôme'],
  ['(xⁿ)\u2032','Dérivée de xⁿ','\\left(x^n\\right)\'=nx^{n-1}',null,2,'dérivée puissance'],
  ['(1/x)\u2032','Dérivée de 1/x','\\left(\\frac{1}{x}\\right)\'=-\\frac{1}{x^2}',null,2,'dérivée inverse'],
  ['(√x)\u2032','Dérivée de √x','\\left(\\sqrt{x}\\right)\'=\\frac{1}{2\\sqrt{x}}',null,2,'dérivée racine'],
  ['(eˣ)\u2032','Dérivée de l\u2019exponentielle','\\left(e^x\\right)\'=e^x',null,2,'dérivée exp'],
  ['(uv)\u2032','Dérivée d\u2019un produit','\\left(uv\\right)\'=u\'v+uv\'',null,2,'dérivée produit'],
  ['(u/v)\u2032','Dérivée d\u2019un quotient','\\left(\\frac{u}{v}\\right)\'=\\frac{u\'v-uv\'}{v^2}',null,2,'dérivée quotient'],
  ['tangente','Équation de la tangente','y=f\'\\left(a\\right)\\left(x-a\\right)+f\\left(a\\right)',null,2,'tangente dérivée'],
  ['uₙ arith.','Suite arithmétique','u_n=u_0+nr',null,2,'raison suite'],
  ['uₙ géom.','Suite géométrique','u_n=u_0\\times q^n',null,2,'raison suite'],
  ['1+…+n','Somme des entiers','1+2+\\cdots+n=\\frac{n\\left(n+1\\right)}{2}',null,2,'somme suite'],
  ['cos²+sin²','cos² + sin² = 1','\\cos^2x+\\sin^2x=1',null,2,'trigonométrie'],
  ['P(A∪B)','Probabilité de A ou B','P\\left(A\\cup B\\right)=P\\left(A\\right)+P\\left(B\\right)-P\\left(A\\cap B\\right)',null,2,'union probabilité'],
  ['P(X=k)','Loi binomiale','P\\left(X=k\\right)=\\binom{n}{k}p^k\\left(1-p\\right)^{n-k}',null,2,'binomiale bernoulli'],
 ]},
 {cat:'Grec', items:[
  ['α','alpha','\\alpha','alpha',1,''],['β','bêta','\\beta','beta',1,''],['γ','gamma','\\gamma','gamma',2,''],
  ['δ','delta','\\delta','delta',2,''],['Δ','Delta (discriminant)','\\Delta','Delta',2,'discriminant'],
  ['θ','thêta','\\theta','theta',1,''],['λ','lambda','\\lambda','lambda',2,''],['μ','mu','\\mu','mu',2,''],
  ['ω','oméga','\\omega','omega',2,''],['Ω','Oméga (univers)','\\Omega','Omega',2,'univers'],
 ]},
];
const ALLSYM=[]; CATALOG.forEach(c=>c.items.forEach(a=>ALLSYM.push({cat:c.cat,sym:a[0],name:a[1],tpl:a[2],key:a[3],lvl:a[4],kw:a[5]||''})));
const NATIVE=new Set(['/','^','_','(','[','%','*']);
const SHORTCUTS={'fois':'\\times','*':'\\times'};
ALLSYM.forEach(s=>{ if(s.key && !NATIVE.has(s.key)) SHORTCUTS[s.key]=s.tpl.replace(/#@/g,'#?'); });
function userAbbr(){ // « abréviation = texte », une par ligne (Réglages)
  const m={}; if(state&&state.settings&&state.settings.exam&&state.settings.exam.on) return m; (state&&state.settings&&state.settings.abbr||'').split('\n').forEach(l=>{ const i=l.indexOf('='); if(i<1) return;
    const k=l.slice(0,i).trim(), v=l.slice(i+1).trim(); if(/^[a-zA-Z]{2,12}$/.test(k) && v) m[k]=v; }); return m; }
function shortcutsFor(defaults){
  // retire les raccourcis par défaut qui empêcheraient les nôtres (ex. « in » avant « inf »)
  const out=Object.assign({},defaults||{});
  const ua=userAbbr(); Object.entries(ua).forEach(([k,v])=>{ SHORTCUTS[k]= /[\\^_{}]/.test(v) ? v : '\\text{'+v.replace(/[{}\\]/g,'')+'}'; });
  const mine=Object.keys(SHORTCUTS);
  Object.keys(out).forEach(d=>{ if(mine.some(m=>m!==d && m.startsWith(d))) delete out[d]; });
  return Object.assign(out,SHORTCUTS);
}
const symsFor=level=>ALLSYM.filter(s=>s.lvl<=LV[level] && !(isExam() && s.cat==='Formules'));

/* ============ État + sauvegarde ============ */
const KEY='mathdys.v1';
const uid=()=>Math.random().toString(36).slice(2,10);
const today=()=>new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
function newPage(){ return {id:uid(), title:'Cours du '+today(), rows:[
  {id:uid(),type:'text',value:''},
  {id:uid(),type:'math',value:''}
]}; }
function defaults(){
  const p=newPage();
  p.title='Essai';
  p.rows=[
    {id:uid(),type:'text',value:'# Équation'},
    {id:uid(),type:'math',value:'3x+2=8'},
    {id:uid(),type:'math',value:'3x=8-2'},
    {id:uid(),type:'math',value:'3x=6'},
    {id:uid(),type:'math',value:'x=\\frac{6}{3}=2'},
    {id:uid(),type:'text',value:'Astuce : place-toi sur une ligne et fais Ctrl+D pour la recopier, puis corrige seulement ce qui change.'},
    {id:uid(),type:'math',value:''}
  ];
  return {pages:[p], current:p.id, settings:{level:'college', fs:20, lh:1.6, font:"'Lexend', Arial, sans-serif", theme:'clair', align:true, labels:true, check:true, focus:false, parens:false, rate:1, name:'', simple:false, vkb:'auto', teacher:false, digits:false, abbr:''}, seenHelp:false};
}
let canStore=true;
function load(){
  try{ const s=localStorage.getItem(KEY); if(s){ const d=JSON.parse(s); if(d && d.pages && d.pages.length) return d; } }
  catch(e){ canStore=false; }
  return null;
}
let state = load() || defaults();
state.settings = Object.assign(defaults().settings, state.settings||{});
let saveTimer=null;
function scheduleSave(dirty){ if(dirty!==false){ const p=page(); if(p) p.dirty=true; noteChange(); } clearTimeout(saveTimer); saveTimer=setTimeout(save,400); refreshFileStatus(); }
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); canStore=true; }
  catch(e){ if(canStore) toast('Mémoire du navigateur pleine : enregistre ton cahier dans un fichier (Ctrl+S)'); canStore=false; }
  refreshFileStatus();
}
function refreshFileStatus(){
  const p=page(); if(!p) return;
  const st=document.getElementById('status'); const sb=document.getElementById('saveBtn');
  if(p.dirty){ st.textContent='● Pas encore enregistré dans un fichier'+(p.fileName?' (« '+p.fileName+' »)':''); st.style.color='var(--d)'; if(sb) sb.classList.add('primary'); }
  else if(p.fileName){ st.textContent='✓ Enregistré : '+p.fileName; st.style.color='var(--c)'; if(sb) sb.classList.remove('primary'); }
  else { st.textContent=''; if(sb) sb.classList.remove('primary'); }
}
function setStatus(t){ document.getElementById('status').textContent=t; }
const page=()=>state.pages.find(p=>p.id===state.current)||state.pages[0];
const rowById=id=>page().rows.find(r=>r.id===id);
const idx=id=>page().rows.findIndex(r=>r.id===id);
const prevId=id=>{const i=idx(id);return i>0?page().rows[i-1].id:null};
const nextId=id=>{const i=idx(id);const R=page().rows;return i>=0&&i<R.length-1?R[i+1].id:null};

/* ============ Types de blocs ============ */
const BLOCKS={
  math:{icon:'ƒx',label:'Ligne de calcul',f:'e'}, text:{icon:'Aa',label:'Ligne de texte',f:'e'},
  op:{icon:'+−',label:'Opération posée',f:''}, graph:{icon:'📈',label:'Graphique',f:''},
  tree:{icon:'P',label:'Arbre',f:''}, img:{icon:'🖼',label:'Image',f:'e'}, tab:{icon:'↗',label:'Tableau',f:''}
};
/* ============ Annuler / Rétablir pour tout le cahier ============ */
const HIST={undo:[],redo:[],pid:null,structural:false,suppress:false,burst:false,stable:null,idle:null};
const snap=()=>JSON.stringify(page().rows);
function histPush(s){ if(!s) return; const u=HIST.undo; if(u.length && u[u.length-1]===s) return; u.push(s); if(u.length>150) u.shift(); HIST.redo=[]; }
function noteChange(){ // appelé à chaque modification de contenu : un « pas » d'annulation par moment de frappe
  if(HIST.suppress) return;
  if(!HIST.burst){ HIST.burst=true; histPush(HIST.stable); }
  HIST.structural=false; clearTimeout(HIST.idle);
  HIST.idle=setTimeout(()=>{ HIST.burst=false; HIST.stable=snap(); },1200);
}
function beforeStructural(){ // à appeler juste AVANT d'ajouter, supprimer, déplacer… un bloc
  clearTimeout(HIST.idle); HIST.burst=false; histPush(snap()); HIST.structural=true; HIST.suppress=true;
  setTimeout(()=>{ HIST.suppress=false; HIST.stable=snap(); },0);
}
function histRestore(s,focusId){
  page().rows=JSON.parse(s); HIST.suppress=true; renderPage(); HIST.stable=s; HIST.burst=false;
  const p=page(); p.dirty=true; save(); refreshFileStatus();
  setTimeout(()=>{ HIST.suppress=false; },0);
  const R=page().rows; const f=R.find(r=>r.id===focusId)||R[R.length-1]; if(f) focusRow(f.id,'end');
}
function undo(){
  if(HIST.burst){ clearTimeout(HIST.idle); HIST.burst=false; }
  const st=HIST.undo.pop(); if(!st){ toast('Rien à annuler'); return; }
  HIST.redo.push(snap()); histRestore(st,currentId); HIST.structural=true; toast('Annulé (Ctrl+Y pour rétablir)');
}
function redo(){
  const st=HIST.redo.pop(); if(!st){ toast('Rien à rétablir'); return; }
  HIST.undo.push(snap()); histRestore(st,currentId); HIST.structural=true; toast('Rétabli');
}
const isEditable=t=>t && (t.tagName==='MATH-FIELD' || t.tagName==='INPUT' || t.tagName==='TEXTAREA' || t.isContentEditable);

/* ============ Rendu ============ */
const paper=document.getElementById('paper');
const els=new Map();
let currentId=null;

function makeRowEl(row){
  const el=document.createElement('div');
  el.className='row row-'+row.type; el.dataset.id=row.id;
  const g=document.createElement('button');
  g.className='gutter'; g.tabIndex=-1;
  const B=BLOCKS[row.type]||BLOCKS.math;
  g.textContent=B.icon;
  g.title = (row.type==='math'||row.type==='text') ? B.label+' — clic pour changer (Ctrl+M)' : B.label;
  g.addEventListener('mousedown',e=>e.preventDefault());
  g.addEventListener('click',()=>{ if(row.type==='math'||row.type==='text') toggleType(row.id); });
  const body=document.createElement('div'); body.className='body';
  const del=document.createElement('button'); del.className='rdel'; del.tabIndex=-1; del.textContent='🗑';
  del.title='Supprimer ce bloc (Ctrl+Maj+Retour arrière)';
  del.addEventListener('mousedown',e=>e.preventDefault());
  del.addEventListener('click',()=>deleteRow(row.id));
  if(row.locked && !state.settings.teacher){ // ligne d'énoncé : l'élève peut la lire, pas la modifier
    requestAnimationFrame(()=>{ const mf=body.querySelector('math-field'); if(mf){ mf.readOnly=true; mf.setAttribute('read-only',''); }
      const tx=body.querySelector('.txt'); if(tx) tx.contentEditable='false';
      if(row.type!=='math'&&row.type!=='text'&&row.type!=='img') body.inert=true; });
    del.style.visibility='hidden';
  }
  const mv=document.createElement('div'); mv.className='rmove';
  if(state.settings.teacher){ const lk=document.createElement('button'); lk.textContent=row.locked?'🔒':'🔓'; lk.tabIndex=-1;
    lk.title=row.locked?'Ligne d\u2019énoncé (protégée pour l\u2019élève) — clic pour la libérer':'Clic pour en faire une ligne d\u2019énoncé protégée';
    lk.addEventListener('mousedown',e=>e.preventDefault()); lk.addEventListener('click',()=>toggleLock(row.id)); mv.append(lk); }
  [['▲',-1,'Monter ce bloc (Alt+↑)'],['▼',1,'Descendre ce bloc (Alt+↓)']].forEach(([t,d,tt])=>{ const b=document.createElement('button'); b.textContent=t; b.title=tt; b.tabIndex=-1;
    b.addEventListener('mousedown',e=>e.preventDefault()); b.addEventListener('click',()=>moveRow(row.id,d)); mv.append(b); });
  el.append(g,body,mv,del);
  if(row.type==='math'||row.type==='text'){
    el.addEventListener('pointerup',e=>{
      if(e.button!==0 || e.target.closest('button')) return;
      setTimeout(()=>{ const mf=el.querySelector('math-field'), tx=el.querySelector('.txt');
        if(mf){ if(document.activeElement!==mf || (mf.hasFocus&&!mf.hasFocus())) mfFocus(mf,'end'); }
        else if(tx && document.activeElement!==tx && tx.isContentEditable) focusRow(row.id,'end'); },0);
    });
  }
  if(row.locked){ el.classList.add('locked'); const bd=document.createElement('span'); bd.className='lockbadge'; bd.textContent='Énoncé'; body.append(bd); }
  if(row.type==='math') buildMath(row,body);
  else if(row.type==='text') buildText(row,body);
  else if(row.type==='graph') buildGraph(row,body);
  else if(row.type==='tree') buildTree(row,body);
  else if(row.type==='img') buildImg(row,body);
  else if(row.type==='tab') buildTab(row,body);
  else buildOp(row,body);
  return el;
}

function buildMath(row,body){
  if(!MFE){ const t=document.createElement('div'); t.className='txt'; t.textContent=row.value; body.append(t); return; }
  const mf=document.createElement('math-field');
  mf.setAttribute('math-virtual-keyboard-policy',vkbOn()?'auto':'manual');
  body.append(mf);
  const msg=document.createElement('div'); msg.className='calcmsg'; body.append(msg);
  mf.addEventListener('input',()=>{ row.value=mf.value; msg.textContent=''; msg.className='calcmsg'; scheduleSave(); scheduleAlign(); });
  mf.addEventListener('move-out',e=>{
    const d=e.detail && e.detail.direction;
    if(d==='upward'){ const p=prevId(row.id); if(p){ e.preventDefault(); focusRow(p,'end'); } }
    else if(d==='downward'){ const n=nextId(row.id); if(n){ e.preventDefault(); focusRow(n,'end'); } }
  });
  mf._setup=()=>setupMF(mf, row.value||'', '\\text{calcul…}');
}
// configuration d'un champ de formule une fois dans la page
// placer le curseur dans une formule : mf.focus() ne suffit pas toujours, on passe alors par la zone de saisie interne de MathLive
function mfFocus(mf,where){
  if(!mf) return;
  try{ mf.focus(); }catch(e){}
  const ok=()=>document.activeElement===mf && (!mf.hasFocus || mf.hasFocus());
  if(!ok()){ const sink=mf.shadowRoot && mf.shadowRoot.querySelector('[part="keyboard-sink"], .ML__keyboard-sink'); if(sink) try{ sink.focus(); }catch(e){} }
  if(where) requestAnimationFrame(()=>{ try{ mf.executeCommand(where==='start'?'moveToMathfieldStart':'moveToMathfieldEnd'); }catch(e){} });
}
function vkbOn(){ const v=state.settings.vkb||'auto'; if(v==='on') return true; if(v==='off') return false;
  try{ return matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches; }catch(e){ return false; } }
function setupMF(mf,value,ph){
  try{ mf.mathVirtualKeyboardPolicy=vkbOn()?'auto':'manual'; }catch(e){}
  try{ mf.inlineShortcuts=shortcutsFor(mf.inlineShortcuts); }catch(e){}
  try{ mf.smartFence=true; mf.smartSuperscript=true; }catch(e){}
  try{ mf.menuItems=[]; }catch(e){}
  try{ if(ph) mf.placeholder=ph; }catch(e){}
  try{ mf.value=value; }catch(e){}
  mf.addEventListener('focus',()=>{ lastMF=mf; requestAnimationFrame(()=>colorParens(mf)); });
  mf.addEventListener('blur',()=>requestAnimationFrame(()=>colorParens(mf)));
  mf.addEventListener('input',()=>requestAnimationFrame(()=>colorParens(mf)));
  setTimeout(()=>colorParens(mf),80);
}
let lastMF=null;

function buildText(row,body){
  const t=document.createElement('div');
  t.className='txt'; t.contentEditable='true'; t.spellcheck=true; t.setAttribute('role','textbox'); t.setAttribute('aria-multiline','true'); t.setAttribute('aria-label','Texte');
  t.dataset.ph='Texte… (commence par # pour un titre)';
  t.textContent=row.value||'';
  const upd=()=>t.classList.toggle('title',/^#\s/.test(t.textContent));
  upd();
  t.addEventListener('input',()=>{ row.value=t.innerText.replace(/\n$/,''); upd(); scheduleSave(); });
  // abréviations personnelles : remplacées quand on tape une espace ou une ponctuation
  t.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey || !/^[ .,;:!?)]$/.test(e.key)) return;
    const ua=userAbbr(); const sel=getSelection(); if(!sel.rangeCount || !sel.isCollapsed) return;
    const node=sel.anchorNode, off=sel.anchorOffset; if(!node || node.nodeType!==3 || !t.contains(node)) return;
    const before=node.nodeValue.slice(0,off); const m=before.match(/(^|[\s(«"'])([a-zA-Z]{2,12})$/); if(!m || !ua[m[2]]) return;
    const start=off-m[2].length; node.nodeValue=node.nodeValue.slice(0,start)+ua[m[2]]+node.nodeValue.slice(off);
    const r=document.createRange(); r.setStart(node,start+ua[m[2]].length); r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
  });
  t.addEventListener('paste',e=>{ e.preventDefault(); const s=(e.clipboardData||window.clipboardData).getData('text'); document.execCommand('insertText',false,s); });
  body.append(t);
}

/* ---------- Opération posée ---------- */
function buildOp(row,body){
  if(!row.value || typeof row.value!=='object') row.value={expr:'',res:{},ret:{}};
  const box=document.createElement('div'); box.className='op';
  const inp=document.createElement('input'); inp.className='op-expr';
  inp.placeholder='Opération à poser : 345 + 78 · 52,4 − 7,85 · 123 × 45 · 156 : 12'; inp.value=row.value.expr||'';
  const wrap=document.createElement('div'); wrap.className='op-wrap';
  const grid=document.createElement('div'); grid.className='op-grid';
  const side=document.createElement('div'); side.className='op-side';
  const msg=document.createElement('div'); msg.className='op-msg';
  wrap.append(grid,side); box.append(inp,wrap,msg); body.append(box);
  inp.addEventListener('input',()=>{ row.value.expr=inp.value; row.value.res={}; row.value.ret={}; row.value.cells={}; drawOp(row,grid,side,msg); scheduleSave(); });
  drawOp(row,grid,side,msg);
}
function parseOp(s){
  s=(s||'').replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/\./g,',');
  const m=s.match(/^(\d+(?:,\d+)?)([+\-x×*÷:\/])(\d+(?:,\d+)?)$/);
  if(!m) return null;
  const o=m[2]; return {a:m[1],op:o==='+'?'+':o==='-'?'-':'x×*'.includes(o)?'×':'÷',b:m[3]};
}
function drawOp(row,grid,side,msg){
  grid.innerHTML=''; side.innerHTML=''; msg.textContent='';
  const p=parseOp(row.value.expr);
  if(!p){ if(row.value.expr) msg.textContent='Écris deux nombres séparés par +, −, × (ou *) ou : , par exemple 345 + 78 ou 156 : 12.'; return; }
  if(p.op==='×'){ drawMul(row,grid,side,msg,p); return; }
  if(p.op==='÷'){ drawDiv(row,grid,side,msg,p); return; }
  const [ai,ad='']=p.a.split(','), [bi,bd='']=p.b.split(',');
  const D=Math.max(ad.length,bd.length);
  const I=Math.max(ai.length,bi.length)+(p.op==='+'?1:0);
  // colonnes : [signe] + I entiers + [virgule] + D décimales
  const cols=[]; cols.push({k:'sign'});
  for(let i=I-1;i>=0;i--) cols.push({k:'int',place:i});
  if(D>0){ cols.push({k:'comma'}); for(let j=1;j<=D;j++) cols.push({k:'dec',place:-j}); }
  grid.style.gridTemplateColumns=cols.map(c=>c.k==='comma'?'.6em':'1.5em').join(' ');
  const cls=c=>{ if(c.k==='int'){ const r=c.place%3; return r===0?'colU':r===1?'colD':'colC'; } if(c.k==='dec') return 'colDec'; return ''; };
  const digitAt=(ip,dp,place)=> place>=0 ? (ip[ip.length-1-place]||'') : (dp[-place-1]||'');
  const mk=(c,extra)=>{ const d=document.createElement('div'); d.className='cell '+(c?cls(c):'')+' '+(extra||''); grid.append(d); return d; };
  const LAB={0:'u',1:'d',2:'c',3:'m',4:'dm',5:'cm'}; const DLAB={'-1':'1/10','-2':'1/100','-3':'1/1000'};
  if(state.settings.labels) cols.forEach(c=>{ const d=mk(c,'lab'); if(c.k==='int') d.textContent=LAB[c.place]||''; if(c.k==='dec') d.textContent=DLAB[c.place]||''; });
  // retenues
  cols.forEach(c=>{ const d=mk(c,'ret'); if(c.k==='int'||c.k==='dec'){ const i=cellInput(row,'ret',c.place); d.append(i);} });
  // nombres
  [[ai,ad,''],[bi,bd,p.op==='-'?'−':'+']].forEach(([ip,dp,sg])=>{
    cols.forEach(c=>{ const d=mk(c, c.k==='sign'?'sign':c.k==='comma'?'comma':'');
      if(c.k==='sign') d.textContent=sg;
      else if(c.k==='comma') d.textContent=(dp.length?',':'');
      else d.textContent=digitAt(ip,dp,c.place);
    });
  });
  // résultat
  cols.forEach(c=>{ const d=mk(c,'res'+(c.k==='sign'?' signcell':'')+(c.k==='comma'?' comma':''));
    if(c.k==='comma') d.textContent=',';
    else if(c.k!=='sign'){ d.append(cellInput(row,'res',c.place)); }
  });
  if(state.settings.check){
    const b=document.createElement('button'); b.className='btn'; b.textContent='Vérifier';
    b.addEventListener('click',()=>checkOp(row,grid,p,D,msg));
    side.append(b);
  }
  const clr=document.createElement('button'); clr.className='btn'; clr.textContent='Effacer le résultat';
  clr.addEventListener('click',()=>{ row.value.res={}; row.value.ret={}; drawOp(row,grid,side,msg); scheduleSave(); });
  side.append(clr);
  msg.textContent='Commence par les unités (à droite). Après chaque chiffre, le curseur passe à la colonne suivante. ↑ pour écrire une retenue.';
}
/* --- grille générique (multiplication, division) : chaque case a une ligne r et une colonne c --- */
const PLACE_NAMES={'0':'unités','1':'dizaines','2':'centaines','3':'milliers','4':'dizaines de mille','5':'centaines de mille','6':'millions','-1':'dixièmes','-2':'centièmes','-3':'millièmes'};
function cellAria(key){ const m=key.match(/^(\w)(\d*):?(-?\d+)?$/); if(!m) return 'case';
  const kind={c:'retenue',p:'produit partiel '+((+m[2]||0)+1),r:'résultat',w:'ligne de calcul '+m[2],q:'quotient',s:'signe'}[m[1]]||'case';
  if(m[1]==='w') return kind+', colonne '+m[3]; if(m[1]==='q') return 'quotient, chiffre '+(+m[3]+1); if(m[1]==='s') return 'signe, ligne '+m[2];
  return kind+', '+(PLACE_NAMES[m[3]]||'colonne'); }
const placeCls=q=>{ const r=q%3; return r===0?'colU':r===1?'colD':'colC'; };
function gCell(row,key,r,c,dir,cls,opts){
  const d=document.createElement('div'); d.className='cell '+(cls||'');
  const i=document.createElement('input'); i.inputMode='numeric'; i.maxLength=1; i.autocomplete='off';
  i.dataset.key=key; i.dataset.r=r; i.dataset.c=c; i.dataset.dir=dir; i.setAttribute('aria-label',cellAria(key));
  if(opts&&opts.comma) i.dataset.comma=1; if(opts&&opts.sign) i.dataset.sign=1;
  const C=row.value.cells=row.value.cells||{};
  i.value=C[key]||''; if(C[key+'#']) d.classList.add('cm');
  i.addEventListener('keydown',e=>gKey(e,row,i)); i.addEventListener('focus',()=>i.select());
  d.append(i); return d;
}
function gKey(e,row,i){
  const grid=i.closest('.op-grid'); const C=row.value.cells; const key=i.dataset.key;
  const r=+i.dataset.r, c=+i.dataset.c, dir=+i.dataset.dir;
  const at=(rr,cc)=>grid.querySelector('input[data-r="'+rr+'"][data-c="'+cc+'"]');
  const find=(dr,dc)=>{ for(let k=1;k<60;k++){ const t=at(r+dr*k,c+dc*k); if(t) return t; } return null; };
  const clr=()=>i.parentElement.classList.remove('ok','ko');
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(/^[0-9]$/.test(e.key) && !i.dataset.sign){ e.preventDefault(); i.value=e.key; C[key]=e.key; clr(); scheduleSave(); const t=find(0,dir); if(t) t.focus(); return; }
  if(i.dataset.sign && /^[-−+]$/.test(e.key)){ e.preventDefault(); i.value=e.key==='+'?'+':'−'; C[key]=i.value; scheduleSave(); const t=find(0,1); if(t) t.focus(); return; }
  if((e.key===','||e.key==='.') && i.dataset.comma){ e.preventDefault(); const on=!C[key+'#']; if(on) C[key+'#']=1; else delete C[key+'#']; i.parentElement.classList.toggle('cm',on); clr(); scheduleSave(); return; }
  if(e.key==='Backspace'){ e.preventDefault(); if(i.value){ i.value=''; delete C[key]; clr(); } else { const t=find(0,-dir); if(t){ t.focus(); t.value=''; delete C[t.dataset.key]; } } scheduleSave(); return; }
  if(e.key==='Delete'){ e.preventDefault(); i.value=''; delete C[key]; scheduleSave(); return; }
  const mv={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[e.key];
  if(mv){ e.preventDefault(); e.stopPropagation(); const t=find(mv[0],mv[1]); if(t) t.focus(); else if(mv[0]){ const id=mv[0]<0?prevId(row.id):nextId(row.id); if(id) focusRow(id,'end'); } return; }
  if(e.key.length===1) e.preventDefault();
}
function opButtons(row,grid,side,msg,check){
  if(state.settings.check && !isExam()){ const b=document.createElement('button'); b.className='btn'; b.textContent='Vérifier'; b.addEventListener('click',check); side.append(b); }
  const clr=document.createElement('button'); clr.className='btn'; clr.textContent='Tout effacer';
  clr.addEventListener('click',()=>{ row.value.res={}; row.value.ret={}; row.value.cells={}; drawOp(row,grid,side,msg); scheduleSave(); });
  side.append(clr);
}
function markCells(list){ // list de [input, attendu] ; renvoie {bad, empty}
  let bad=0, empty=0;
  list.forEach(([inp,want])=>{ const cell=inp.parentElement; cell.classList.remove('ok','ko'); const got=inp.value;
    if(!got){ if(want && want!=='0') empty++; else if(want==='0') empty++; return; }
    if(got===want || (!want && got==='0')) cell.classList.add('ok'); else { cell.classList.add('ko'); bad++; } });
  return {bad,empty};
}
function verdict(msg,bad,empty,extra){
  msg.textContent = bad ? (bad===1?'Un chiffre est à revoir (souligné en rouge).':bad+' chiffres sont à revoir (soulignés en rouge).')
    : empty ? 'Pour l\u2019instant c\u2019est juste. Il reste des cases à remplir.' : 'Bravo, c\u2019est juste !';
  if(extra) msg.textContent+=' '+extra;
}
/* --- multiplication posée --- */
function drawMul(row,grid,side,msg,p){
  const ad=(p.a.split(',')[1]||'').length, bd=(p.b.split(',')[1]||'').length;
  const A=p.a.replace(',','').replace(/^0+(?=\d)/,''), Bs=p.b.replace(',','').replace(/^0+(?=\d)/,'');
  const nb=Bs.length, W=A.length+Bs.length;
  const places=[]; for(let q=W-1;q>=0;q--) places.push(q);
  grid.style.gridTemplateColumns='1.5em '+places.map(()=>'1.5em').join(' ');
  let R=0; const row_=(fn)=>{ fn(R); R++; };
  const fixed=(t,cls)=>{ const d=document.createElement('div'); d.className='cell '+(cls||''); d.textContent=t; grid.append(d); return d; };
  const dec=ad+bd;
  if(state.settings.labels && !dec) row_(()=>{ fixed('', 'lab'); places.forEach(q=>fixed(['u','d','c','m','dm','cm','M'][q]||'',placeCls(q)+' lab')); });
  // retenues
  row_(r=>{ fixed('','ret'); places.forEach((q,c)=>grid.append(gCell(row,'c:'+q,r,c+1,-1,placeCls(q)+' ret'))); });
  // les deux nombres (alignés à droite, la virgule reste à sa place)
  [[A,ad,''],[Bs,bd,'×']].forEach(([n,d,sg])=>row_(()=>{ fixed(sg,'sign');
    places.forEach(q=>{ const ch=n[n.length-1-q]||''; const cell=fixed(ch,placeCls(q)); if(d && q===d && ch) cell.classList.add('cm'); }); }));
  // produits partiels
  if(nb>1) for(let k=0;k<nb;k++) row_(r=>{ fixed(k===nb-1?'+':'', 'sign'+(k===0?' res signcell':''));
    places.forEach((q,c)=>{ if(q<k){ fixed('0',placeCls(q)+' shift'+(k===0?' res':'')); } else grid.append(gCell(row,'p'+k+':'+q,r,c+1,-1,placeCls(q)+(k===0?' res':''))); }); });
  // résultat
  row_(r=>{ fixed('','sign res signcell'); places.forEach((q,c)=>grid.append(gCell(row,'r:'+q,r,c+1,-1,placeCls(q)+' res',{comma:!!dec}))); });
  const check=()=>{
    const BA=BigInt(A), list=[];
    const digitsAt=(str,q)=>str[str.length-1-q]||'';
    if(nb>1) for(let k=0;k<nb;k++){ const w=(BA*BigInt(Bs[nb-1-k])).toString();
      places.forEach(q=>{ if(q<k) return; const inp=grid.querySelector('input[data-key="p'+k+':'+q+'"]'); if(inp) list.push([inp,digitsAt(w,q-k)]); }); }
    let w=(BA*BigInt(Bs)).toString(); if(dec) w=w.padStart(dec+1,'0');
    places.forEach(q=>{ const inp=grid.querySelector('input[data-key="r:'+q+'"]'); if(inp) list.push([inp,digitsAt(w,q)]); });
    const {bad,empty}=markCells(list);
    let extra='';
    if(dec){ const C=row.value.cells; const commas=places.filter(q=>C['r:'+q+'#']);
      extra = commas.length===1 && commas[0]===dec ? 'La virgule est bien placée.' : 'Virgule : il y a '+dec+' chiffre'+(dec>1?'s':'')+' après la virgule en tout, compte-les en partant de la droite du résultat.'; }
    verdict(msg,bad,empty,extra);
  };
  opButtons(row,grid,side,msg,check);
  msg.textContent = (nb>1?'Une ligne par chiffre du nombre du bas, en commençant par les unités. Les 0 gris sont les décalages. ':'')
    +'Commence par la droite : le curseur avance tout seul vers la gauche. ↑ pour une retenue.'
    +(dec?' Calcule comme s\u2019il n\u2019y avait pas de virgule, puis tape « , » dans la case du résultat après laquelle elle va.':'');
}
/* --- division posée (potence) --- */
function drawDiv(row,grid,side,msg,p){
  if(p.a.includes(',')||p.b.includes(',')){ msg.textContent='La division posée marche pour l\u2019instant avec des nombres entiers (ex : 156 : 12).'; return; }
  const Dv=p.a.replace(/^0+(?=\d)/,''), dv=p.b.replace(/^0+(?=\d)/,'');
  if(/^0+$/.test(dv)){ msg.textContent='On ne peut pas diviser par 0.'; return; }
  const n=Dv.length, m=Math.max(n,dv.length+1);
  grid.style.gridTemplateColumns='1.2em '+Array(n).fill('1.5em').join(' ')+' .5em '+Array(m).fill('1.5em').join(' ');
  const fixed=(t,cls)=>{ const d=document.createElement('div'); d.className='cell '+(cls||''); d.textContent=t; grid.append(d); return d; };
  const C=row.value.cells=row.value.cells||{};
  // ligne 0 : dividende | diviseur
  fixed('','sign'); [...Dv].forEach(ch=>fixed(ch,'divd')); fixed('','vbar');
  for(let j=0;j<m;j++) fixed(dv[j]||'','dvs');
  const WORK=2*n;
  for(let r=1;r<=WORK;r++){
    grid.append(gCell(row,'s'+r,r,0,1,'sign',{sign:true}));
    for(let c=1;c<=n;c++) grid.append(gCell(row,'w'+r+':'+c,r,c,1,'work'));
    fixed('','vbar');
    if(r===1) for(let j=0;j<m;j++) grid.append(gCell(row,'q:'+j,r,n+2+j,1,'quo'));
    else for(let j=0;j<m;j++) fixed('','');
  }
  const rl=document.createElement('label'); rl.className='op-rest'; rl.textContent='Reste : ';
  const ri=document.createElement('input'); ri.inputMode='numeric'; ri.value=C.reste||''; ri.className='op-expr'; ri.style.width='5em';
  ri.addEventListener('input',()=>{ C.reste=ri.value.replace(/\D/g,''); scheduleSave(); }); rl.append(ri); side.append(rl);
  const check=()=>{
    const q=(BigInt(Dv)/BigInt(dv)).toString(), rest=(BigInt(Dv)%BigInt(dv)).toString();
    const qs=[...grid.querySelectorAll('input[data-key^="q:"]')];
    const typed=qs.map(i=>i.value).join('').replace(/^0+(?=\d)/,'');
    qs.forEach(i=>i.parentElement.classList.remove('ok','ko'));
    const qOk= typed===q, rOk=(C.reste||'')===rest;
    qs.forEach(i=>{ if(i.value) i.parentElement.classList.add(qOk?'ok':'ko'); });
    msg.textContent = !typed ? 'Écris le quotient sous le diviseur.' :
      (qOk?'Le quotient est juste. ':'Le quotient est à revoir. ')+(!C.reste?'Écris aussi le reste.':rOk?'Le reste est juste.':'Le reste est à revoir (il doit être plus petit que '+dv+').');
  };
  opButtons(row,grid,side,msg,check);
  msg.textContent='Sous le dividende, écris les soustractions de gauche à droite (tape « − » dans la petite case de gauche). Le quotient va sous le diviseur, à droite. Puis le reste.';
}
function cellInput(row,kind,place){
  const i=document.createElement('input');
  i.inputMode='numeric'; i.maxLength=1; i.autocomplete='off';
  i.dataset.kind=kind; i.dataset.place=place; i.setAttribute('aria-label',(kind==='ret'?'retenue':'résultat')+', '+(PLACE_NAMES[place]||'colonne'));
  i.value=(row.value[kind]&&row.value[kind][place])||'';
  i.addEventListener('keydown',e=>opKey(e,row,i));
  i.addEventListener('focus',()=>i.select());
  return i;
}
// première case à remplir : unités du résultat (+ −), premier produit partiel (×), début de la potence (÷)
function opStart(rowEl){ const g=rowEl.querySelector('.op-grid'); if(!g) return false;
  const ps=opPlaces(g); let t= ps.length ? opCell(g,'res',ps[ps.length-1]) : null;
  t = t || g.querySelector('input[data-key="p0:0"]') || g.querySelector('input[data-key="r:0"]') || g.querySelector('input[data-key="w1:1"]');
  if(t){ t.focus(); return true; } return false; }
function opCell(grid,kind,place){ return grid.querySelector('input[data-kind="'+kind+'"][data-place="'+place+'"]'); }
function opPlaces(grid){ return [...grid.querySelectorAll('input[data-kind="res"]')].map(i=>+i.dataset.place); } // gauche → droite
function opKey(e,row,i){
  const grid=i.closest('.op-grid'); const kind=i.dataset.kind; const place=+i.dataset.place;
  const places=opPlaces(grid); const k=places.indexOf(place);
  const go=(kd,pl)=>{ const t=opCell(grid,kd,pl); if(t){ t.focus(); } };
  const store=v=>{ row.value[kind]=row.value[kind]||{}; if(v) row.value[kind][place]=v; else delete row.value[kind][place]; i.parentElement.classList.remove('ok','ko'); scheduleSave(); };
  if(/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey){
    e.preventDefault(); i.value=e.key; store(e.key);
    if(kind==='res'){ if(k>0) go('res',places[k-1]); }
    else go('res',place);
    return;
  }
  if(e.key==='Backspace'){ e.preventDefault(); if(i.value){ i.value=''; store(''); } else if(kind==='res' && k<places.length-1){ const t=opCell(grid,'res',places[k+1]); t.focus(); t.value=''; row.value.res&&delete row.value.res[places[k+1]]; scheduleSave(); } return; }
  if(e.key==='Delete'){ e.preventDefault(); i.value=''; store(''); return; }
  if(e.key==='ArrowLeft'){ e.preventDefault(); if(k>0) go(kind,places[k-1]); return; }
  if(e.key==='ArrowRight'){ e.preventDefault(); if(k<places.length-1) go(kind,places[k+1]); return; }
  if(e.key==='ArrowUp'){ e.preventDefault(); e.stopPropagation(); if(kind==='res') go('ret',place); else { const p=prevId(row.id); if(p) focusRow(p,'end'); } return; }
  if(e.key==='ArrowDown'){ e.preventDefault(); e.stopPropagation(); if(kind==='ret') go('res',place); else { const n=nextId(row.id); if(n) focusRow(n,'end'); } return; }
  if(e.key.length===1 && !e.ctrlKey && !e.metaKey){ e.preventDefault(); }
}
function checkOp(row,grid,p,D,msg){
  const toInt=s=>{ const [i,d='']=s.split(','); return BigInt(i+(d+'0'.repeat(D)).slice(0,D)); };
  let r = p.op==='+' ? toInt(p.a)+toInt(p.b) : toInt(p.a)-toInt(p.b);
  if(r<0n){ msg.textContent='Le résultat serait négatif : pose plutôt le plus grand nombre en premier.'; return; }
  let s=r.toString(); if(D>0) s=s.padStart(D+1,'0');
  const ip=D>0?s.slice(0,s.length-D):s, dp=D>0?s.slice(s.length-D):'';
  let bad=0, empty=0;
  grid.querySelectorAll('input[data-kind="res"]').forEach(inp=>{
    const pl=+inp.dataset.place;
    const want= pl>=0 ? (ip[ip.length-1-pl]||'') : (dp[-pl-1]||'');
    const got=inp.value; const cell=inp.parentElement; cell.classList.remove('ok','ko');
    if(!got){ if(want && !(want==='0' && pl>=ip.length)) empty++; return; }
    if(got===want || (want==='' && got==='0')) cell.classList.add('ok'); else { cell.classList.add('ko'); bad++; }
  });
  msg.textContent = bad ? (bad===1?'Un chiffre est à revoir (souligné en rouge).':bad+' chiffres sont à revoir (soulignés en rouge).')
                  : empty ? 'Pour l\u2019instant c\u2019est juste. Il reste des colonnes à remplir.' : 'Bravo, c\u2019est juste !';
}

/* ---------- Graphique de fonctions ---------- */
const GNAMES=['f','g','h','k','p','q'];
const GCOL=['#2f6fde','#d9433b','#1f9d55','#c97a00','#8a4fd1','#0e9aa7'];
function buildGraph(row,body){
  if(!row.value||!row.value.fns) row.value={fns:[''],view:null};
  if(examCut('graph')){ const d=document.createElement('div'); d.className='op-msg'; d.textContent='Graphique masqué : les graphiques sont coupés en mode examen.'; body.append(d); return; }
  const V=row.value;
  if(!V.view) V.view={xmin:-10,xmax:10,ymin:-7,ymax:7};
  const box=document.createElement('div'); box.className='graph';
  const list=document.createElement('div');
  const ctrl=document.createElement('div'); ctrl.className='gctrl';
  const cv=document.createElement('canvas'); cv.className='gcanvas';
  const err=document.createElement('div'); err.className='gerr';
  box.append(list,ctrl,cv,err); body.append(box);
  const fields=[];
  function addField(i,focus){
    const line=document.createElement('div'); line.className='gfn';
    const dot=document.createElement('span'); dot.className='gdot'; dot.style.background=GCOL[i%GCOL.length];
    const nm=document.createElement('span'); nm.className='gname'; nm.textContent=GNAMES[i%GNAMES.length]+'(x) =';
    const mf=document.createElement('math-field');
    const del=document.createElement('button'); del.className='gdel'; del.textContent='✕'; del.title='Retirer cette fonction'; del.tabIndex=-1;
    line.append(dot,nm,mf,del);
    const before=list.children[i]; if(before) list.insertBefore(line,before); else list.append(line);
    mf._gi=i; fields.splice(i,0,mf);
    mf._setup=()=>setupMF(mf, V.fns[i]||'', '\\text{ex : }x^2-3');
    mf.addEventListener('input',()=>{ const k=fields.indexOf(mf); V.fns[k]=mf.value; scheduleSave(); draw(); });
    mf.addEventListener('move-out',e=>{ const k=fields.indexOf(mf); const d=e.detail&&e.detail.direction;
      if(d==='upward'){ e.preventDefault(); if(k>0) focusMF(fields[k-1]); else { const p=prevId(row.id); if(p) focusRow(p,'end'); } }
      if(d==='downward'){ e.preventDefault(); if(k<fields.length-1) focusMF(fields[k+1]); else { const n=nextId(row.id); if(n) focusRow(n,'end'); } } });
    del.addEventListener('click',()=>removeField(fields.indexOf(mf)));
    if(document.body.contains(list)){ mf._setup(); if(focus) focusMF(mf); }
    return mf;
  }
  function relabel(){ [...list.children].forEach((ln,i)=>{ ln.querySelector('.gdot').style.background=GCOL[i%GCOL.length]; ln.querySelector('.gname').textContent=GNAMES[i%GNAMES.length]+'(x) ='; }); }
  function removeField(k){ if(fields.length<=1){ fields[0].value=''; V.fns[0]=''; draw(); scheduleSave(); return; }
    list.children[k].remove(); fields.splice(k,1); V.fns.splice(k,1); relabel(); draw(); scheduleSave(); focusMF(fields[Math.max(0,k-1)]); }
  function focusMF(mf){ mfFocus(mf,'end'); }
  V.fns.forEach((_,i)=>addField(i,false));
  // API utilisée par le clavier (Entrée / Retour arrière)
  box._addAfter=mf=>{ const k=fields.indexOf(mf)+1; if(fields.length>=GNAMES.length){ toast('6 fonctions maximum'); return; } V.fns.splice(k,0,''); addField(k,true); relabel(); scheduleSave(); };
  box._removeIfEmpty=mf=>{ if(mf.value || fields.length<=1) return false; removeField(fields.indexOf(mf)); return true; };
  // boutons
  const B=(t,title,fn)=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=t; b.title=title; b.addEventListener('click',fn); ctrl.append(b); };
  B('＋ fonction','Ajouter une courbe (Entrée dans une formule)',()=>box._addAfter(fields[fields.length-1]));
  B('Zoom +','Zoomer',()=>zoom(0.7)); B('Zoom −','Dézoomer',()=>zoom(1/0.7));
  B('Repère normal','Revenir à la vue de départ',()=>{ V.view={xmin:-10,xmax:10,ymin:-7,ymax:7}; fitAspect(); draw(); scheduleSave(); });
  function zoom(f,cx,cy){ const v=V.view; cx=cx??(v.xmin+v.xmax)/2; cy=cy??(v.ymin+v.ymax)/2;
    v.xmin=cx-(cx-v.xmin)*f; v.xmax=cx+(v.xmax-cx)*f; v.ymin=cy-(cy-v.ymin)*f; v.ymax=cy+(v.ymax-cy)*f; draw(); scheduleSave(); }
  function fitAspect(){ const r=cv.getBoundingClientRect(); if(!r.width) return; const v=V.view; const cy=(v.ymin+v.ymax)/2; const h=(v.xmax-v.xmin)*r.height/r.width; v.ymin=cy-h/2; v.ymax=cy+h/2; }
  // déplacer à la souris / au doigt, zoomer à la molette
  let drag=null;
  cv.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY,v:Object.assign({},V.view)}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(!drag) return; const r=cv.getBoundingClientRect(); const v=drag.v;
    const dx=(e.clientX-drag.x)*(v.xmax-v.xmin)/r.width, dy=(e.clientY-drag.y)*(v.ymax-v.ymin)/r.height;
    V.view={xmin:v.xmin-dx,xmax:v.xmax-dx,ymin:v.ymin+dy,ymax:v.ymax+dy}; draw(); });
  cv.addEventListener('pointerup',()=>{ if(drag){ drag=null; scheduleSave(); } });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const r=cv.getBoundingClientRect(); const v=V.view;
    const cx=v.xmin+(e.clientX-r.left)/r.width*(v.xmax-v.xmin), cy=v.ymax-(e.clientY-r.top)/r.height*(v.ymax-v.ymin);
    zoom(e.deltaY>0?1.15:1/1.15,cx,cy); },{passive:false});
  function niceStep(range,px){ const raw=range/Math.max(2,px/70); const p=Math.pow(10,Math.floor(Math.log10(raw))); const m=raw/p; return (m<1.5?1:m<3.5?2:m<7.5?5:10)*p; }
  const frNum=x=>{ const r=Math.round(x*1e6)/1e6; return String(r).replace('.',',').replace('-','−'); };
  function draw(){
    const r=cv.getBoundingClientRect(); if(!r.width) return;
    const dpr=window.devicePixelRatio||1; cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
    const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0);
    const W=r.width,H=r.height, v=V.view; const cs=getComputedStyle(document.body);
    const ink=cs.getPropertyValue('--ink').trim()||'#222', line=cs.getPropertyValue('--line').trim()||'#ddd', muted=cs.getPropertyValue('--muted').trim()||'#888';
    const X=x=>(x-v.xmin)/(v.xmax-v.xmin)*W, Y=y=>(v.ymax-y)/(v.ymax-v.ymin)*H;
    c.clearRect(0,0,W,H);
    const sx=niceStep(v.xmax-v.xmin,W), sy=niceStep(v.ymax-v.ymin,H);
    c.lineWidth=1; c.strokeStyle=line; c.beginPath();
    for(let x=Math.ceil(v.xmin/sx)*sx;x<=v.xmax;x+=sx){ c.moveTo(Math.round(X(x))+.5,0); c.lineTo(Math.round(X(x))+.5,H); }
    for(let y=Math.ceil(v.ymin/sy)*sy;y<=v.ymax;y+=sy){ c.moveTo(0,Math.round(Y(y))+.5); c.lineTo(W,Math.round(Y(y))+.5); }
    c.stroke();
    // axes
    const ax=Math.min(Math.max(Y(0),0),H), ay=Math.min(Math.max(X(0),0),W);
    c.strokeStyle=ink; c.lineWidth=1.5; c.beginPath(); c.moveTo(0,ax); c.lineTo(W,ax); c.moveTo(ay,0); c.lineTo(ay,H); c.stroke();
    c.fillStyle=muted; c.font='12px '+(cs.getPropertyValue('--font')||'sans-serif');
    c.textAlign='center'; c.textBaseline='top';
    for(let x=Math.ceil(v.xmin/sx)*sx;x<=v.xmax;x+=sx){ if(Math.abs(x)<sx/2||X(x)<14||X(x)>W-14) continue; c.fillText(frNum(x),X(x),Math.min(ax+4,H-16)); }
    c.textAlign='right'; c.textBaseline='middle';
    for(let y=Math.ceil(v.ymin/sy)*sy;y<=v.ymax;y+=sy){ if(Math.abs(y)<sy/2||Y(y)<10||Y(y)>H-10) continue; c.fillText(frNum(y),Math.max(ay-5,30),Y(y)); }
    c.textAlign='right'; c.textBaseline='top'; c.fillText('0',ay-4,ax+4);
    // courbes
    const bad=[];
    fields.forEach((mf,k)=>{
      let src=(V.fns[k]||'').trim(); if(!src) return;
      const parts=splitTopEq(src); src=parts[parts.length-1];
      const f=compileExpr(src,['x']); if(!f){ bad.push(GNAMES[k%GNAMES.length]); return; }
      c.strokeStyle=GCOL[k%GCOL.length]; c.lineWidth=2.5; c.beginPath();
      let pen=false, py=null; const N=Math.ceil(W*1.5);
      for(let i=0;i<=N;i++){ const px=i/N*W; const x=v.xmin+px/W*(v.xmax-v.xmin); let y; try{ y=f({x}); }catch(e){ y=NaN; }
        if(!isFinite(y)){ pen=false; continue; }
        const yy=Y(y);
        if(pen && py!==null && Math.abs(yy-py)>H*1.5){ pen=false; }
        if(yy<-H*2||yy>H*3){ if(pen){ c.lineTo(px,Math.max(-H,Math.min(2*H,yy))); } pen=false; py=yy; continue; }
        if(!pen){ c.moveTo(px,yy); pen=true; } else c.lineTo(px,yy);
        py=yy; }
      c.stroke();
    });
    err.textContent = bad.length ? 'Je ne comprends pas encore '+bad.map(n=>n+'(x)').join(', ')+' : utilise x comme variable (ex : 2x+1, x^2, √x, sin(x), e^x).' : '';
  }
  body.parentElement._afterMount=()=>{ requestAnimationFrame(()=>{ fitAspect(); draw(); }); };
  if(window.ResizeObserver) new ResizeObserver(()=>draw()).observe(cv);
  box._draw=draw;
}

/* ---------- Arbre de probabilités ---------- */
const OVL='̅';
const barOf=s=>s.includes(OVL)?s.replace(new RegExp(OVL,'g'),''):[...s].map(c=>/[A-Za-z0-9]/.test(c)?c+OVL:c).join('');
function prettyEv(s){ s=(s||'').trim(); let m;
  if((m=s.match(/^(.+?)\s*barre$/i))) return barOf(m[1].trim());
  if((m=s.match(/^non\s*(.+)$/i))) return barOf(m[1].trim());
  return s; }
function parseP(s){ s=(s||'').trim().replace(/\s+/g,'').replace(/,/g,'.'); if(!s) return null; let m;
  if((m=s.match(/^(\d*\.?\d+)\/(\d*\.?\d+)$/))) return +m[1]/+m[2];
  if((m=s.match(/^(\d*\.?\d+)%$/))) return +m[1]/100;
  if(/^\d*\.?\d+$/.test(s)) return +s;
  return NaN; }
const fmtP=v=>String(Math.round(v*1e6)/1e6).replace('.',',');
function buildTree(row,body){
  if(!row.value||!row.value.levels) row.value={levels:[['A',''],['B','']],p:{},prod:true};
  const V=row.value; V.p=V.p||{};
  const box=document.createElement('div'); box.className='tree';
  const head=document.createElement('div'); head.className='tctrl';
  const wrap=document.createElement('div'); wrap.className='tstage-wrap';
  const stage=document.createElement('div'); stage.className='tstage'; wrap.append(stage);
  const msg=document.createElement('div'); msg.className='op-msg';
  box.append(head,wrap,msg); body.append(box);
  const evName=(L,i)=>{ const n=prettyEv(V.levels[L][i]); if(n) return n;
    if(V.levels[L].length===2 && i===1){ const a=prettyEv(V.levels[L][0]); if(a) return barOf(a); } return '?'; };
  let probInputs=[], labels=[], prods=[];
  function changed(){ scheduleSave(); update(); }
  function rebuild(){ buildHead(); layout(); update(); scheduleSave(); }
  function buildHead(){
    head.innerHTML='';
    V.levels.forEach((lev,L)=>{
      const d=document.createElement('div'); d.className='tlev';
      const t=document.createElement('span'); t.className='tl'; t.textContent='Étape '+(L+1)+' :'; d.append(t);
      lev.forEach((nm,i)=>{ const inp=document.createElement('input'); inp.type='text'; inp.value=nm;
        inp.placeholder= (lev.length===2&&i===1) ? 'contraire' : 'nom';
        inp.title='Nom de l’issue. Écris « A barre » ou « non A » pour Ā. Laisse vide la 2e case : le contraire se met tout seul.';
        inp.addEventListener('input',()=>{ lev[i]=inp.value; changed(); }); d.append(inp); });
      const mk=(txt,title,fn)=>{ const b=document.createElement('button'); b.className='mini'; b.textContent=txt; b.title=title; b.tabIndex=-1; b.addEventListener('click',fn); d.append(b); };
      if(lev.length<4) mk('+ issue','Ajouter une branche à cette étape',()=>{ lev.push(''); rebuild(); });
      if(lev.length>2) mk('− issue','Retirer la dernière branche',()=>{ lev.pop(); rebuild(); });
      head.append(d);
    });
    const d=document.createElement('div'); d.className='tlev';
    const mk=(txt,fn)=>{ const b=document.createElement('button'); b.className='mini'; b.textContent=txt; b.tabIndex=-1; b.addEventListener('click',fn); d.append(b); };
    if(V.levels.length<3) mk('+ étape',()=>{ const used=V.levels.map(l=>prettyEv(l[0])); const nx=['A','B','C','D','E'].find(x=>!used.includes(x))||'C'; V.levels.push([nx,'']); rebuild(); });
    if(V.levels.length>1) mk('− étape',()=>{ V.levels.pop(); rebuild(); });
    const lb=document.createElement('label'); lb.style.cssText='display:flex;align-items:center;gap:.3em;margin-left:.5em';
    const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=V.prod!==false; cb.tabIndex=-1;
    cb.addEventListener('change',()=>{ V.prod=cb.checked; layout(); update(); scheduleSave(); });
    lb.append(cb,document.createTextNode('Calculer les probabilités au bout des branches')); d.append(lb);
    head.append(d);
  }
  function layout(){
    stage.innerHTML=''; probInputs=[]; labels=[]; prods=[];
    const fs=state.settings.fs; const counts=V.levels.map(l=>l.length); const nL=counts.length;
    const leaves=counts.reduce((a,b)=>a*b,1);
    const rowH=Math.round(fs*2.7), colW=Math.round(fs*9), nodeW=Math.round(fs*2.2);
    const showProd=V.prod!==false && !isExam();
    const W=24+nL*colW+nodeW+(showProd?fs*16:20), H=leaves*rowH+8;
    stage.style.width=W+'px'; stage.style.height=H+'px';
    const NS='http://www.w3.org/2000/svg'; const svg=document.createElementNS(NS,'svg'); svg.setAttribute('width',W); svg.setAttribute('height',H); stage.append(svg);
    const ink=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#222';
    const dot=document.createElementNS(NS,'circle'); dot.setAttribute('cx',12); dot.setAttribute('cy',H/2); dot.setAttribute('r',3.5); dot.setAttribute('fill',ink); svg.append(dot);
    const spanOf=L=>counts.slice(L+1).reduce((a,b)=>a*b,1);
    function place(L,parentPath,px,py,start){
      const span=spanOf(L);
      for(let i=0;i<counts[L];i++){
        const path=parentPath===''?String(i):parentPath+'-'+i;
        const s=start+i*span, y=(s+span/2)*rowH+4, x=24+(L+1)*colW;
        const ln=document.createElementNS(NS,'line'); ln.setAttribute('x1',px); ln.setAttribute('y1',py); ln.setAttribute('x2',x-6); ln.setAttribute('y2',y);
        ln.setAttribute('stroke',ink); ln.setAttribute('stroke-width',1.6); svg.append(ln);
        const lab=document.createElement('span'); lab.className='tn'; lab.style.left=x+'px'; lab.style.top=y+'px'; stage.append(lab); labels.push({el:lab,L,i});
        const inp=document.createElement('input'); inp.type='text'; inp.className='tp'; inp.inputMode='decimal'; inp.autocomplete='off';
        inp.style.left=((px+x-6)/2)+'px'; inp.style.top=((py+y)/2)+'px';
        inp.value=V.p[path]||''; inp.dataset.path=path; inp.title='Probabilité : 0,3 ou 3/10 ou 30 %';
        inp.setAttribute('aria-label','Probabilité de la branche '+path.split('-').map((x,LL)=>evName(LL,+x)).join(' puis '));
        inp.addEventListener('input',()=>{ if(inp.value) V.p[path]=inp.value; else delete V.p[path]; changed(); });
        stage.append(inp); probInputs.push(inp);
        if(L<nL-1) place(L+1,path,x+nodeW,y,s);
        else if(showProd){ const pr=document.createElement('span'); pr.className='tprod'; pr.style.left=(x+nodeW+8)+'px'; pr.style.top=y+'px'; pr.dataset.path=path; stage.append(pr); prods.push(pr); }
      }
    }
    place(0,'',12,H/2,0);
    // ordre de Tab : étape par étape, de haut en bas
    probInputs.sort((a,b)=>a.dataset.path.split('-').length-b.dataset.path.split('-').length);
    probInputs.forEach(i=>stage.append(i));
  }
  function eff(path){ // probabilité saisie ou complétée automatiquement
    const inp=probInputs.find(i=>i.dataset.path===path); if(!inp) return null;
    const v=parseP(inp.value); if(v!==null) return isNaN(v)?null:v;
    if(inp.dataset.auto) return +inp.dataset.auto; return null;
  }
  function update(){
    labels.forEach(l=>l.el.textContent=evName(l.L,l.i));
    const groups={}; probInputs.forEach(i=>{ const p=i.dataset.path; const par=p.includes('-')?p.slice(0,p.lastIndexOf('-')):'root'; (groups[par]=groups[par]||[]).push(i); });
    const problems=[];
    Object.entries(groups).forEach(([par,ins])=>{
      ins.forEach(i=>{ i.placeholder=''; delete i.dataset.auto; i.classList.remove('bad'); });
      const vals=ins.map(i=>parseP(i.value));
      if(vals.some(v=>v!==null&&(isNaN(v)||v<0||v>1))){ ins.forEach((i,k)=>{ const v=vals[k]; if(v!==null&&(isNaN(v)||v<0||v>1)) i.classList.add('bad'); }); problems.push('Une probabilité doit être un nombre entre 0 et 1 (ex : 0,3 ou 3/10 ou 30 %).'); return; }
      const empty=ins.filter((i,k)=>vals[k]===null); const sum=vals.reduce((a,v)=>a+(v||0),0);
      if(empty.length===1 && sum<=1+1e-9 && !isExam()){ const r=Math.round((1-sum)*1e9)/1e9; empty[0].placeholder=fmtP(r); empty[0].dataset.auto=r; }
      if(!empty.length && Math.abs(sum-1)>1e-9){ ins.forEach(i=>i.classList.add('bad'));
        const where= par==='root' ? 'au départ' : 'après '+par.split('-').map((x,L)=>evName(L,+x)).join(' puis ');
        problems.push('Les branches '+where+' font '+fmtP(sum)+' au total au lieu de 1.'); }
    });
    prods.forEach(pr=>{
      const parts=pr.dataset.path.split('-'); const paths=parts.map((_,k)=>parts.slice(0,k+1).join('-'));
      const ps=paths.map(eff); const names=parts.map((x,L)=>evName(L,+x));
      const event='P('+names.join(' ∩ ')+')';
      if(ps.some(v=>v===null)){ pr.textContent=event+' = …'; return; }
      const v=ps.reduce((a,b)=>a*b,1);
      pr.textContent=event+' = '+ps.map(fmtP).join(' × ')+' = '+fmtP(v);
    });
    msg.style.color=problems.length?'var(--ko)':'';
    msg.textContent= problems.length ? problems[0] : 'Tab ou Entrée : branche suivante. La dernière branche d’un groupe se complète toute seule (en bleu) : tape-la si tu veux la garder.';
  }
  buildHead(); layout(); update();
  box._relayout=()=>{ layout(); update(); };
}

/* ---------- Tableau de signes / de variations ---------- */
const prettyX=t=>(t||'').trim().replace(/^\+?\s*inf(ini)?$/i,'+∞').replace(/^[-−]\s*inf(ini)?$/i,'−∞').replace(/^∞$/,'+∞').replace(/^-/,'−');
function newTab(kind){ return {xs:['-inf','','+inf'], lines: kind==='sign'
  ? [{kind:'sign',label:'',cells:{}},{kind:'sign',label:'',cells:{}},{kind:'prod',label:'',cells:{}}]
  : [{kind:'sign',label:"f'(x)",cells:{}},{kind:'var',label:'f(x)',cells:{}}]}; }
const TSIGN={'+':'+','-':'−','0':'0','|':'||'}, TARROW={'+':'↗','-':'↘','=':'→'};
function buildTab(row,body){
  if(!row.value||!row.value.xs) row.value=newTab('var');
  const V=row.value;
  const box=document.createElement('div'); box.className='tabblk';
  const bar=document.createElement('div'); bar.className='gctrl tbar';
  const wrap=document.createElement('div'); wrap.className='tstage-wrap';
  const grid=document.createElement('div'); grid.className='tab-grid'; wrap.append(grid);
  const msg=document.createElement('div'); msg.className='op-msg';
  box.append(bar,wrap,msg); body.append(box);
  const B=(t,title,fn)=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=t; b.title=title; b.tabIndex=-1; b.addEventListener('click',fn); bar.append(b); };
  B('+ valeur de x','Ajouter une valeur de x (avant la dernière)',()=>{ const k=V.xs.length-1; V.xs.splice(k,0,''); remap((t,j)=> j>=k ? t+(j+1) : t+j); draw(); scheduleSave(); focusX(k); });
  B('− valeur de x','Retirer l’avant-dernière valeur de x',()=>{ if(V.xs.length<=2) return; const k=V.xs.length-2; V.xs.splice(k,1);
    remap((t,j)=> t==='b' ? (j===k?null:j>k?'b'+(j-1):'b'+j) : (j===k?null:j>k?'i'+(j-1):'i'+j)); draw(); scheduleSave(); });
  B('+ ligne de signes','',()=>{ V.lines.push({kind:'sign',label:'',cells:{}}); draw(); scheduleSave(); });
  B('+ ligne produit','Signe calculé tout seul avec la règle des signes, à partir des lignes de signes au-dessus',()=>{ V.lines.push({kind:'prod',label:'',cells:{}}); draw(); scheduleSave(); });
  B('+ ligne de variations','',()=>{ V.lines.push({kind:'var',label:'f(x)',cells:{}}); draw(); scheduleSave(); });
  function remap(fn){ V.lines.forEach(L=>{ const nc={}; Object.entries(L.cells).forEach(([k,v])=>{ const nk=fn(k[0],+k.slice(1)); if(nk) nc[nk]=v; }); L.cells=nc; }); }
  function prodLine(li){
    const n=V.xs.length, out={}; const above=V.lines.slice(0,li).filter(L=>L.kind==='sign');
    for(let j=0;j<n;j++){ const vs=above.map(L=>L.cells['b'+j]||''); out['b'+j]= vs.includes('|')?'|': vs.includes('0')?'0':''; }
    for(let j=0;j<n-1;j++){ const vs=above.map(L=>L.cells['i'+j]||''); out['i'+j]= !above.length||vs.some(v=>v!=='+'&&v!=='-') ? '' : (vs.filter(v=>v==='-').length%2?'-':'+'); }
    return out;
  }
  let keys=[], prods=[], vals=[];
  function move(r,c,dr,dc){
    for(let k=1;k<40;k++){ const t=grid.querySelector('[data-r="'+(r+dr*k)+'"][data-c="'+(c+dc*k)+'"]'); if(t){ t.focus(); if(t.select) t.select(); return true; } }
    return false;
  }
  function focusX(j){ const t=grid.querySelector('[data-r="0"][data-c="'+(2*j+1)+'"]'); if(t) t.focus(); }
  grid.addEventListener('keydown',e=>{
    const t=e.target; if(!t.dataset||t.dataset.r===undefined) return;
    const r=+t.dataset.r, c=+t.dataset.c;
    if(e.key==='ArrowUp'||e.key==='ArrowDown'){ e.preventDefault(); e.stopPropagation();
      if(!move(r,c,e.key==='ArrowUp'?-1:1,0)){ const id=e.key==='ArrowUp'?prevId(row.id):nextId(row.id); if(id) focusRow(id,'end'); } return; }
    if((e.key==='ArrowLeft'||e.key==='ArrowRight') && (t.classList.contains('tk') || (e.key==='ArrowLeft'?t.selectionStart===0:t.selectionEnd===t.value.length))){ e.preventDefault(); move(r,c,0,e.key==='ArrowLeft'?-1:1); }
  });
  function keyCell(L,key,r,c){
    const inp=document.createElement('input'); inp.className='tk'; inp.autocomplete='off'; inp.dataset.r=r; inp.dataset.c=c;
    inp.setAttribute('aria-label',(L.label||(L.kind==='var'?'variations':'signe'))+(key[0]==='i'?', intervalle '+(+key.slice(1)+1):', valeur de x numéro '+(+key.slice(1)+1)));
    const isInt=key[0]==='i';
    inp.title = isInt ? (L.kind==='var'?'Tape + (croissante ↗), − (décroissante ↘) ou = (constante)':'Tape + ou −') : 'Tape 0, ou | pour une valeur interdite';
    inp.addEventListener('keydown',e=>{
      if(e.ctrlKey||e.metaKey||e.altKey) return;
      let v=null;
      if(isInt){ if(e.key==='+') v='+'; else if(e.key==='-'||e.key==='−') v='-'; else if(L.kind==='var'&&e.key==='=') v='='; }
      else { if(e.key==='0') v='0'; else if(e.key==='|'||e.key==='i'||e.key==='I') v='|'; }
      if(v!==null){ e.preventDefault(); if(!isInt && L.cells[key]===v) delete L.cells[key]; else L.cells[key]=v; scheduleSave(); paint(); move(r,c,0,1); return; }
      if(e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); delete L.cells[key]; scheduleSave(); paint(); if(e.key==='Backspace') move(r,c,0,-1); return; }
      if(e.key.length===1) e.preventDefault();
    });
    return inp;
  }
  function draw(){
    grid.innerHTML=''; keys=[]; prods=[]; vals=[];
    const n=V.xs.length;
    grid.style.gridTemplateColumns='minmax(5em,auto) '+Array(2*n-1).fill(0).map((_,k)=>k%2?'minmax(3.4em,1fr)':'minmax(3.2em,auto)').join(' ');
    const cell=cls=>{ const d=document.createElement('div'); d.className='tc '+(cls||''); grid.append(d); return d; };
    const lx=cell('tlab xrow'); lx.textContent='x';
    for(let j=0;j<n;j++){ const d=cell('tb xrow');
      const inp=document.createElement('input'); inp.className='tx'; inp.value=prettyX(V.xs[j]); inp.setAttribute('aria-label','Valeur de x numéro '+(j+1)); inp.placeholder=j===0?'−∞':j===n-1?'+∞':'…'; inp.dataset.r=0; inp.dataset.c=2*j+1;
      inp.addEventListener('input',()=>{ V.xs[j]=inp.value; scheduleSave(); });
      inp.addEventListener('blur',()=>{ const pv=prettyX(inp.value); if(pv!==inp.value){ inp.value=pv; V.xs[j]=pv; scheduleSave(); } });
      d.append(inp); if(j<n-1) cell('ti xrow'); }
    V.lines.forEach((L,li)=>{
      const r=li+1;
      const lab=cell('tlab '+L.kind);
      const lin=document.createElement('input'); lin.className='tl-in'; lin.value=L.label; lin.dataset.r=r; lin.dataset.c=0;
      lin.placeholder= L.kind==='var'?'f(x)':L.kind==='prod'?'produit':'facteur';
      lin.addEventListener('input',()=>{ L.label=lin.value; scheduleSave(); });
      const del=document.createElement('button'); del.className='gdel'; del.textContent='✕'; del.tabIndex=-1; del.title='Retirer cette ligne';
      del.addEventListener('click',()=>{ if(V.lines.length<=1) return; V.lines.splice(li,1); draw(); scheduleSave(); });
      lab.append(lin,del);
      for(let j=0;j<n;j++){
        const bk='b'+j, d=cell('tb '+L.kind+(j===0||j===n-1?' edge':''));
        if(L.kind==='sign'){ const k=keyCell(L,bk,r,2*j+1); d.append(k); keys.push({L,key:bk,inp:k,cell:d}); }
        else if(L.kind==='prod') prods.push({li,key:bk,cell:d});
        else { const vi=document.createElement('input'); vi.className='tv'; vi.value=prettyX(L.cells[bk]||''); vi.dataset.r=r; vi.dataset.c=2*j+1; vi.placeholder='·';
          vi.title='Valeur de f en ce point (laisse vide si rien à écrire). Tape || pour une valeur interdite.';
          vi.addEventListener('input',()=>{ if(vi.value) L.cells[bk]=vi.value; else delete L.cells[bk]; scheduleSave(); placeVar(L); });
          vi.addEventListener('blur',()=>{ const pv=prettyX(vi.value); if(pv!==vi.value){ vi.value=pv; if(pv) L.cells[bk]=pv; scheduleSave(); } });
          d.append(vi); vals.push({L,j,el:vi,cell:d}); }
        if(j<n-1){ const ik='i'+j, e2=cell('ti '+L.kind);
          if(L.kind==='prod') prods.push({li,key:ik,cell:e2});
          else { const k=keyCell(L,ik,r,2*j+2); e2.append(k); keys.push({L,key:ik,inp:k,cell:e2}); } }
      }
    });
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('tarrows'); grid.append(svg);
    paint();
  }
  function paint(){
    keys.forEach(({L,key,inp,cell})=>{ const v=L.cells[key]||'';
      inp.value = (L.kind==='var'&&key[0]==='i') ? (TARROW[v]||'') : (TSIGN[v]||'');
      if(L.kind==='var'&&key[0]==='i') inp.classList.add('tarrowkey');
      cell.classList.toggle('bar2',v==='|'); });
    const cache={}; prods.forEach(({li,key,cell})=>{ const pv=isExam()?{}:(cache[li]||(cache[li]=prodLine(li))); const v=pv[key]||''; cell.textContent=TSIGN[v]||''; cell.classList.toggle('bar2',v==='|'); });
    V.lines.forEach(L=>{ if(L.kind==='var') placeVar(L,true); });
    requestAnimationFrame(arrows);
  }
  function placeVar(L,noArrow){
    vals.filter(v=>v.L===L).forEach(({j,cell:d,el})=>{
      const before=L.cells['i'+(j-1)], after=L.cells['i'+j];
      const top=(before==='+'||after==='-') && !(before==='-'||after==='+');
      const bottom=(before==='-'||after==='+') && !(before==='+'||after==='-');
      d.classList.toggle('vtop',top); d.classList.toggle('vbot',bottom);
      d.classList.toggle('bar2',/^\|\|?$/.test((L.cells['b'+j]||'').trim()));
    });
    if(!noArrow) requestAnimationFrame(arrows);
  }
  function arrows(){
    const svg=grid.querySelector('svg.tarrows'); if(!svg) return;
    const g=grid.getBoundingClientRect(); if(!g.width) return;
    svg.setAttribute('width',g.width); svg.setAttribute('height',g.height); svg.innerHTML='';
    const NS='http://www.w3.org/2000/svg'; const ink=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#222';
    const mid='ah'+row.id;
    const defs=document.createElementNS(NS,'defs'); defs.innerHTML='<marker id="'+mid+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="'+ink+'"/></marker>'; svg.append(defs);
    V.lines.forEach(L=>{ if(L.kind!=='var') return;
      const vs=vals.filter(v=>v.L===L);
      for(let j=0;j<V.xs.length-1;j++){
        const dir=L.cells['i'+j]; if(!dir) continue;
        const a=vs.find(v=>v.j===j), b=vs.find(v=>v.j===j+1); if(!a||!b) continue;
        const ca=a.cell.getBoundingClientRect(), cb=b.cell.getBoundingClientRect();
        const ea=a.el.getBoundingClientRect(), eb=b.el.getBoundingClientRect();
        const pad=6;
        const yA = dir==='+' ? ca.bottom-pad-4 : dir==='-' ? ca.top+pad+4 : (ca.top+ca.bottom)/2;
        const yB = dir==='+' ? cb.top+pad+4 : dir==='-' ? cb.bottom-pad-4 : (cb.top+cb.bottom)/2;
        const x1 = (a.el.value?ea.right:(ca.left+ca.right)/2)-g.left+4, x2=(b.el.value?eb.left:(cb.left+cb.right)/2)-g.left-4;
        const ln=document.createElementNS(NS,'line');
        ln.setAttribute('x1',x1); ln.setAttribute('y1',yA-g.top); ln.setAttribute('x2',x2); ln.setAttribute('y2',yB-g.top);
        ln.setAttribute('stroke',ink); ln.setAttribute('stroke-width',1.8); ln.setAttribute('marker-end','url(#'+mid+')'); svg.append(ln);
      }
    });
  }
  draw();
  msg.textContent='Ligne x : tape −inf, 2, +inf… · Signes : + ou − dans les cases, 0 ou | (valeur interdite) sur les traits · Variations : + pour ↗, − pour ↘ · Tab ou flèches pour avancer.';
  box._relayout=()=>requestAnimationFrame(arrows);
  if(window.ResizeObserver) new ResizeObserver(()=>box._relayout()).observe(grid);
}

/* ---------- Image (énoncé, photo, capture) ---------- */
function buildImg(row,body){
  if(!row.value||typeof row.value!=='object') row.value={src:'',w:100};
  const V=row.value;
  const box=document.createElement('div'); box.className='imgblk';
  if(!V.src){
    const pick=document.createElement('button'); pick.className='btn'; pick.textContent='Choisir une image…';
    const hint=document.createElement('span'); hint.className='op-msg'; hint.textContent=' ou colle une capture (Ctrl+V), ou glisse une photo sur la page';
    pick.addEventListener('click',()=>pickImageFor(row.id));
    box.append(pick,hint); body.append(box); return;
  }
  const im=document.createElement('img'); im.src=V.src; im.alt='Image de l\u2019énoncé'; im.style.width=(V.w||100)+'%';
  const ctl=document.createElement('div'); ctl.className='gctrl';
  [['Petite',40],['Moyenne',65],['Grande',100]].forEach(([t,w])=>{ const b=document.createElement('button'); b.className='btn'+((V.w||100)===w?' primary':''); b.textContent=t; b.tabIndex=-1;
    b.addEventListener('click',()=>{ V.w=w; im.style.width=w+'%'; ctl.querySelectorAll('.btn').forEach(x=>x.classList.toggle('primary',x===b)); scheduleSave(); }); ctl.append(b); });
  box.append(im,ctl); box.tabIndex=0; body.append(box);
}
let imgTarget=null;
function pickImageFor(id){ imgTarget=id; document.getElementById('imgIn').click(); }
function readImage(file){
  return new Promise((res,rej)=>{
    const fr=new FileReader(); fr.onerror=rej;
    fr.onload=()=>{ const im=new Image(); im.onerror=rej; im.onload=()=>{
        const MAX=1600; const k=Math.min(1,MAX/Math.max(im.width,im.height));
        const c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k);
        const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height);
        const png=c.toDataURL('image/png'); const jpg=c.toDataURL('image/jpeg',0.85);
        res(png.length<jpg.length*1.3?png:jpg); };
      im.src=fr.result; };
    fr.readAsDataURL(file);
  });
}
async function addImage(file,afterId){
  if(isExam()) return examRefused('L\u2019ajout d\u2019image');
  if(!file || !/^image\//.test(file.type)){ toast('Ce fichier n\u2019est pas une image'); return; }
  try{
    const src=await readImage(file);
    const r=afterId&&rowById(afterId);
    if(r && r.type==='img' && !r.value.src){ r.value.src=src; const old=els.get(r.id); const el=makeRowEl(r); old.replaceWith(el); els.set(r.id,el); setCurrent(r.id); scheduleSave(); }
    else addRowAfter(afterId||currentId,'img',{src,w:100});
    if(src.length>1.5e6) toast('Grande image : ton fichier .mathdys sera plus lourd');
  }catch(e){ toast('Impossible de lire cette image'); }
}

/* ---------- Insertion dans la page ---------- */
function ariaFix(root){ (root||document).querySelectorAll('button[title]:not([aria-label]),input[title]:not([aria-label])').forEach(b=>b.setAttribute('aria-label',b.title)); }
function mount(row, afterEl){
  const el=makeRowEl(row);
  if(afterEl && afterEl.nextSibling) paper.insertBefore(el, afterEl.nextSibling);
  else if(afterEl) paper.append(el);
  else paper.append(el);
  els.set(row.id, el);
  el.setAttribute('role','listitem'); el.setAttribute('aria-label',(BLOCKS[row.type]||BLOCKS.math).label+(row.locked?' (énoncé)':''));
  ariaFix(el);
  el.querySelectorAll('math-field').forEach(mf=>{ if(mf._setup) mf._setup(); });
  if(el._afterMount) el._afterMount();
  return el;
}
function renderPage(){
  if(HIST.pid!==state.current){ HIST.undo=[]; HIST.redo=[]; HIST.pid=state.current; HIST.burst=false; }
  paper.innerHTML=''; els.clear();
  page().rows.forEach(r=>mount(r,null));
  renderPageList();
  setTimeout(alignAll,60); setTimeout(alignAll,400); setTimeout(alignAll,1200);
  HIST.stable=snap();
}
const subjects=()=>[...new Set(state.pages.map(p=>p.subject).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
function renderPageList(){
  const sel=document.getElementById('pageSel'); sel.innerHTML='';
  const groups=subjects(); const opt=p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=p.title||'Sans titre'; if(p.id===state.current) o.selected=true; return o; };
  groups.forEach(g=>{ const og=document.createElement('optgroup'); og.label='📁 '+g; state.pages.filter(p=>p.subject===g).forEach(p=>og.append(opt(p))); sel.append(og); });
  const rest=state.pages.filter(p=>!p.subject);
  if(groups.length && rest.length){ const og=document.createElement('optgroup'); og.label='Sans matière'; rest.forEach(p=>og.append(opt(p))); sel.append(og); } else rest.forEach(p=>sel.append(opt(p)));
  const og=document.createElement('optgroup'); og.label='────────';
  const o2=document.createElement('option'); o2.value='__subj'; o2.textContent='📁 Ranger cette page dans une matière…'; og.append(o2);
  const o=document.createElement('option'); o.value='__del'; o.textContent='🗑 Supprimer cette page…'; og.append(o); sel.append(og);
  document.getElementById('pageTitle').value=page().title||'';
  refreshFileStatus();
}

/* ---------- Actions sur les lignes ---------- */
function focusRow(id,where){
  if(!id) return; const el=els.get(id); if(!el) return;
  const mf=el.querySelector('math-field');
  if(mf){ mfFocus(mf,where==='start'?'start':'end'); }
  else if(el.querySelector('.txt')){ const t=el.querySelector('.txt'); t.focus(); const r=document.createRange(); r.selectNodeContents(t); r.collapse(where==='start'); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
  else { const body=el.querySelector('.body')||el; let i=null;
    for(const sel of ['.op-expr','.tab-grid input.tx','.tlev input','.tstage .tp','.imgblk','.body button']){ i=body.querySelector(sel); if(i) break; }
    if(i) i.focus(); }
  setCurrent(id);
  el.scrollIntoView({block:'nearest'});
}
function setCurrent(id){
  if(currentId && els.get(currentId)) els.get(currentId).classList.remove('current');
  currentId=id; const el=els.get(id); if(el) el.classList.add('current');
}
function addRowAfter(id,type,value){
  if((type==='graph'&&examCut('graph'))||(type==='img'&&isExam())){ examRefused(type==='img'?'L\u2019ajout d\u2019image':'Le graphique'); return null; }
  beforeStructural();
  const R=page().rows; const i=id?idx(id):R.length-1;
  const row={id:uid(),type,value: value!==undefined?value:(type==='op'?{expr:'',res:{},ret:{}}:type==='graph'?{fns:[''],view:null}:type==='tree'?{levels:[['A',''],['B','']],p:{},prod:true}:type==='tab'?newTab('var'):type==='img'?{src:'',w:100}:'')};
  R.splice(i+1,0,row);
  mount(row, id?els.get(id):paper.lastElementChild);
  focusRow(row.id, type==='op'?'start':'end');
  scheduleSave(); scheduleAlign();
  return row;
}
function duplicate(id){
  const r=rowById(id); if(!r) return;
  addRowAfter(id, r.type, JSON.parse(JSON.stringify(r.value))); // la copie n'est jamais verrouillée : l'élève peut travailler dessus
  toast('Ligne recopiée — corrige ce qui change');
}
function removeRow(id,noHist){
  const R=page().rows; const i=idx(id); if(i<0||R.length<=1) return;
  if(!noHist) beforeStructural();
  R.splice(i,1); const el=els.get(id); if(el) el.remove(); els.delete(id);
  scheduleSave(); scheduleAlign();
}
// suppression avec possibilité d'annuler
function deleteRow(id){
  const R=page().rows; const i=idx(id); if(i<0) return;
  if(R[i].locked && !state.settings.teacher){ toast('Cette ligne fait partie de l\u2019énoncé : elle ne peut pas être supprimée'); return; }
  beforeStructural();
  const type=R[i].type; const pid=page().id;
  const focusTo=prevId(id)||nextId(id);
  if(R.length<=1){ R.push({id:uid(),type:'math',value:''}); mount(R[R.length-1],els.get(id)); }
  removeRow(id,true);
  focusRow(focusTo||page().rows[0].id,'end');
  const B=BLOCKS[type]||BLOCKS.math;
  toast(B.label+' supprimé'+B.f,'Annuler',()=>{ if(page().id===pid) undo(); });
}
function toggleLock(id){
  const r=rowById(id); if(!r) return; beforeStructural(); r.locked=!r.locked; if(!r.locked) delete r.locked;
  const old=els.get(id); const el=makeRowEl(r); old.replaceWith(el); els.set(id,el);
  el.querySelectorAll('math-field').forEach(m=>m._setup&&m._setup()); if(el._afterMount) el._afterMount();
  setCurrent(id); scheduleSave(); toast(r.locked?'Ligne d\u2019énoncé : l\u2019élève ne pourra pas la modifier':'Ligne libérée');
}
function moveRow(id,dir){
  { const r=rowById(id); if(r&&r.locked&&!state.settings.teacher){ toast('Les lignes d\u2019énoncé ne se déplacent pas'); return; } }
  const R=page().rows; const i=idx(id), j=i+dir; if(i<0||j<0||j>=R.length) return;
  beforeStructural();
  [R[i],R[j]]=[R[j],R[i]];
  const el=els.get(id), other=els.get(R[i].id);
  if(dir<0) paper.insertBefore(el,other); else paper.insertBefore(other,el);
  el.scrollIntoView({block:'nearest'}); scheduleSave(); scheduleAlign();
  const mf=el.querySelector('math-field'); if(mf) requestAnimationFrame(()=>mfFocus(mf));
}
function toggleType(id){
  const r=rowById(id); if(!r||(r.type!=='math'&&r.type!=='text')) return;
  if(r.locked && !state.settings.teacher) return;
  beforeStructural();
  r.type = r.type==='math'?'text':'math';
  if(typeof r.value!=='string') r.value='';
  const old=els.get(id); const el=makeRowEl(r); old.replaceWith(el); els.set(id,el);
  const mf=el.querySelector('math-field'); if(mf&&mf._setup) mf._setup();
  focusRow(id,'end'); scheduleSave(); scheduleAlign();
}
function isEmpty(r){ return r.type==='op' ? !(r.value&&r.value.expr) : (r.type==='math'||r.type==='text') ? !r.value : false; }

/* ---------- Calculatrice intégrée (Ctrl+Entrée) ---------- */
function splitTopEq(s){ const out=[]; let d=0,cur=''; for(const ch of s){ if(ch==='{')d++; if(ch==='}')d--; if(ch==='='&&d===0){out.push(cur);cur='';} else cur+=ch; } out.push(cur); return out; }
/* MathLive écrit parfois \frac34 ou \sqrt2 sans accolades : on les remet, pour que tout le reste comprenne */
const ARGS={frac:2,dfrac:2,tfrac:2,binom:2,sqrt:1,overline:1,overrightarrow:1,widehat:1,mathbb:1,text:1,operatorname:1};
function braceify(src){
  let s=src||'', out='', i=0;
  const readArg=()=>{ while(s[i]===' ') i++;
    if(s[i]==='{'){ let d=0, j=i; do{ if(s[j]==='{') d++; else if(s[j]==='}') d--; j++; }while(d>0&&j<s.length); const a=s.slice(i,j); i=j; return '{'+braceify(a.slice(1,-1))+'}'; }
    if(s[i]==='\\'){ let j=i+1; while(j<s.length&&/[a-zA-Z]/.test(s[j])) j++; if(j===i+1) j++; const a=s.slice(i,j); i=j; return '{'+a+'}'; }
    if(i<s.length){ const a=s[i]; i++; return '{'+a+'}'; } return '{}'; };
  while(i<s.length){
    const c=s[i];
    if(c==='\\'){ let j=i+1; while(j<s.length&&/[a-zA-Z]/.test(s[j])) j++; const name=s.slice(i+1,j);
      if(ARGS[name]){ out+='\\'+name; i=j;
        if(name==='sqrt'){ while(s[i]===' ') i++; if(s[i]==='['){ const k=s.indexOf(']',i); out+=s.slice(i,k+1); i=k+1; } }
        for(let n=0;n<ARGS[name];n++) out+=readArg(); continue; }
      if(j===i+1){ out+=s.slice(i,i+2); i+=2; continue; }
      out+=s.slice(i,j); i=j; continue; }
    if(c==='^'||c==='_'){ i++; out+=c+readArg(); continue; }
    out+=c; i++;
  }
  return out;
}
/* LaTeX → expression simple, puis petit analyseur (sans eval). Sert à la calculatrice et aux graphiques. */
function normLatex(s){
  let t=braceify(s).replace(/\\m?left|\\m?right/g,'').replace(/\{,\}/g,'.').replace(/(\d),(\d)/g,'$1.$2');
  t=t.replace(/\\times|\\cdot/g,'*').replace(/\\div/g,'/').replace(/\\pi/g,' pi ').replace(/\\%|%/g,'/100');
  t=t.replace(/\\exponentialE/g,'e').replace(/\\operatorname\{([a-z]+)\}/g,' $1 ');
  t=t.replace(/\\(sin|cos|tan|ln|log|exp)\b/g,' $1 ');
  t=t.replace(/\\[,;:! ]|~/g,' ').replace(/\\placeholder\{\}/g,'');
  for(let n=0;n<60;n++){
    const b=t;
    t=t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,'(($1)/($2))');
    t=t.replace(/\\sqrt\[([^{}\[\]]*)\]\{([^{}]*)\}/g,'(($2)^(1/($1)))');
    t=t.replace(/\\sqrt\{([^{}]*)\}/g,' sqrt($1)');
    t=t.replace(/\^\{([^{}]*)\}/g,'^($1)');
    t=t.replace(/(^|[^a-zA-Z\]\}\^_])\{([^{}]*)\}/g,'$1($2)');
    if(t===b) break;
  }
  t=t.replace(/\|([^|]*)\|/g,' abs($1)');
  return /\\/.test(t) ? null : t;
}
const FN={sin:Math.sin,cos:Math.cos,tan:Math.tan,ln:Math.log,log:Math.log10,exp:Math.exp,sqrt:Math.sqrt,abs:Math.abs};
function fact(n){ if(n<0||!Number.isInteger(n)||n>170) return NaN; let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
function compileExpr(src,vars){
  // retourne une fonction (env)=>nombre, ou null si l'expression n'est pas comprise
  const s=normLatex(src); if(s===null) return null;
  const toks=[]; let i=0;
  const names=Object.keys(FN).concat(['pi']).sort((a,b)=>b.length-a.length);
  while(i<s.length){
    const c=s[i];
    if(/\s/.test(c)){ i++; continue; }
    if(/[0-9.]/.test(c)){ let j=i; while(j<s.length&&/[0-9.]/.test(s[j])) j++; const v=parseFloat(s.slice(i,j)); if(isNaN(v)) return null; toks.push({t:'n',v}); i=j; continue; }
    if(/[a-zA-Z]/.test(c)){
      const nm=names.find(n=>s.startsWith(n,i));
      if(nm){ toks.push(nm==='pi'?{t:'n',v:Math.PI}:{t:'f',v:nm}); i+=nm.length; continue; }
      if(c==='e'){ toks.push({t:'n',v:Math.E}); i++; continue; }
      if(vars.includes(c)){ toks.push({t:'v',v:c}); i++; continue; }
      return null;
    }
    if('+-*/^()!'.includes(c)){ toks.push({t:c}); i++; continue; }
    return null;
  }
  if(!toks.length) return null;
  let p=0; const peek=()=>toks[p]; const eat=t=>{ if(toks[p]&&toks[p].t===t){p++;return true;} return false; };
  const startsPrimary=tk=>tk&&(tk.t==='n'||tk.t==='v'||tk.t==='f'||tk.t==='(');
  function expr(){ let a=term(); while(peek()&&(peek().t==='+'||peek().t==='-')){ const o=toks[p++].t; const b=term(); const A=a; a= o==='+'?e=>A(e)+b(e):e=>A(e)-b(e); } return a; }
  function term(){ let a=unary(); for(;;){ const tk=peek(); if(!tk) break;
      if(tk.t==='*'||tk.t==='/'){ p++; const b=unary(); const A=a; a= tk.t==='*'?e=>A(e)*b(e):e=>A(e)/b(e); }
      else if(startsPrimary(tk)){ const b=power(); const A=a; a=e=>A(e)*b(e); }
      else break; } return a; }
  function unary(){ if(eat('-')){ const a=unary(); return e=>-a(e); } if(eat('+')) return unary(); return power(); }
  function power(){ const a=postfix(); if(eat('^')){ const b=unary(); return e=>Math.pow(a(e),b(e)); } return a; }
  function postfix(){ let a=primary(); while(eat('!')){ const A=a; a=e=>fact(A(e)); } return a; }
  function primary(){ const tk=toks[p++]; if(!tk) throw 0;
    if(tk.t==='n'){ const v=tk.v; return ()=>v; }
    if(tk.t==='v'){ const v=tk.v; return e=>e[v]; }
    if(tk.t==='('){ const a=expr(); if(!eat(')')) throw 0; return a; }
    if(tk.t==='f'){ const f=FN[tk.v]; const a=(peek()&&peek().t==='(')?primary():power(); return e=>f(a(e)); }
    throw 0; }
  try{ const f=expr(); if(p!==toks.length) return null; return f; }catch(e){ return null; }
}
function evalLatex(s){ const f=compileExpr(s,[]); if(!f) return null; const v=f({}); return (typeof v==='number'&&isFinite(v))?v:null; }
const fr=x=>String(x).replace('.','{,}');
function formatResult(v,src){
  const r=Math.round(v*1e10)/1e10;
  if(Number.isInteger(r)) return {rel:'=',tex:String(r)};
  const hasFrac=/\\frac|\//.test(src);
  if(hasFrac){ for(let q=2;q<=1000;q++){ const pq=v*q; if(Math.abs(pq-Math.round(pq))<1e-9){ const pn=Math.round(pq); const f=(pn<0?'-':'')+'\\frac{'+Math.abs(pn)+'}{'+q+'}';
        const dec=String(r).split('.')[1]||''; return dec.length<=6 ? {rel:'=',tex:f+'='+fr(r)} : {rel:'=',tex:f+'\\approx '+fr(r.toFixed(4))}; } } }
  const dec=String(r).split('.')[1]||'';
  return dec.length<=6 ? {rel:'=',tex:fr(r)} : {rel:'\\approx',tex:fr(+r.toFixed(4))};
}
function compute(id){
  if(examCut('calc')) return examRefused('La calculatrice');
  const el=els.get(id); const mf=el&&el.querySelector('math-field'); if(!mf) return;
  const msg=el.querySelector('.calcmsg');
  let latex=mf.value.replace(/\s*=\s*(\\placeholder\{\})?\s*\??\s*$/,'');
  const parts=splitTopEq(latex); const target=parts[parts.length-1];
  const v=evalLatex(target);
  if(v===null){ msg.textContent='Je ne sais calculer que des nombres (pas de lettres) : par ex. 3\u00d74+\u00bd.'; return; }
  const f=formatResult(v,target);
  mf.value = latex + f.rel + f.tex;
  focusRow(id,'end'); msg.textContent='';
  const r=rowById(id); r.value=mf.value; scheduleSave(); scheduleAlign();
}

/* ---------- Alignement des = ---------- */
let alignTimer=null;
function scheduleAlign(){ clearTimeout(alignTimer); alignTimer=setTimeout(alignAll,30); }
function eqOffset(mf){
  const sr=mf.shadowRoot; if(!sr) return null;
  const root=sr.querySelector('.ML__content')||sr;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n;
  const base=mf.getBoundingClientRect().left;
  while((n=w.nextNode())){
    if(n.nodeValue.trim()==='='){ const r=n.parentElement.getBoundingClientRect(); if(r.width>0) return r.left+r.width/2-base; }
  }
  return null;
}
function alignAll(){
  const rows=page().rows; let group=[];
  const flush=()=>{
    if(group.length>=2){
      const offs=group.map(g=>({mf:g, o:eqOffset(g)}));
      const valid=offs.filter(x=>x.o!==null);
      const max=Math.max(...valid.map(x=>x.o));
      offs.forEach(x=>{ x.mf.style.marginLeft = (x.o===null?0:Math.max(0,max-x.o))+'px'; });
    } else group.forEach(g=>g.style.marginLeft='0px');
    group=[];
  };
  rows.forEach(r=>{
    const el=els.get(r.id); const mf=el&&el.querySelector('math-field');
    if(state.settings.align && mf && r.type==='math' && splitTopEq(r.value||'').length>1) group.push(mf);
    else { flush(); if(mf) mf.style.marginLeft='0px'; }
  });
  flush();
}
window.addEventListener('resize',scheduleAlign);

/* ============ Vérifier ses étapes (F9) : signale la ligne où une erreur s'est glissée, sans donner la réponse ============ */
const RELS=[['\\leq','le'],['\\geq','ge'],['\\le','le'],['\\ge','ge'],['\\ne','ne'],['\\lt','lt'],['\\gt','gt'],['=','eq'],['<','lt'],['>','gt']];
function splitRel(src){ // découpe au premier niveau : 3x+2=8, x<5, a=b=c…
  const s=braceify(src||''); const parts=[], rels=[]; let d=0, cur='', i=0;
  while(i<s.length){ const c=s[i];
    if(c==='{') d++; if(c==='}') d--;
    if(d===0){ const r=RELS.find(([t])=>s.startsWith(t,i) && !(t[0]==='\\' && /[a-zA-Z]/.test(s[i+t.length]||'')));
      if(r && !(r[0]==='<'&&s[i+1]==='=') ){ parts.push(cur); rels.push(r[1]); cur=''; i+=r[0].length; continue; } }
    cur+=c; i++; }
  parts.push(cur); return {parts,rels};
}
function varsOf(src){ const n=normLatex(src); if(n===null) return null;
  const t=n.replace(/sqrt|sin|cos|tan|ln|log|exp|abs|pi/g,' '); const v=new Set((t.match(/[a-zA-Z]/g)||[]).filter(c=>c!=='e')); return [...v]; }
function sampleEnvs(vars,n){ const out=[]; let seed=7;
  const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  for(let k=0;k<n;k++){ const e={}; vars.forEach(v=>{ e[v]=Math.round((rnd()*9-4.5)*1000)/1000+0.137; }); out.push(e); } return out; }
const nearEq=(a,b)=>Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(a),Math.abs(b));
function sameExpr(a,b,vars){ // deux expressions égales pour toutes les valeurs ?
  const fa=compileExpr(a,vars), fb=compileExpr(b,vars); if(!fa||!fb) return null;
  let n=0; for(const e of sampleEnvs(vars,10)){ const x=fa(e), y=fb(e); if(!isFinite(x)||!isFinite(y)) continue; n++; if(!nearEq(x,y)) return false; }
  return n>=3 ? true : null;
}
function stepInfo(latex){
  const {parts,rels}=splitRel(latex); if(parts.length<2) return {kind:'expr',parts};
  const vars=varsOf(latex); if(vars===null) return {kind:'unknown'};
  if(parts[0].trim()==='' && rels[0]==='eq') return {kind:'cont',parts:parts.slice(1),rels:rels.slice(1),vars}; // ligne qui commence par « = »
  return {kind:'rel',parts,rels,vars};
}
function relFunc(info){ // forme « f(x) = 0 » ou « f(x) > 0 » de la ligne
  const i0=0, i1=info.parts.length-1, r=info.rels[0];
  if(!info.rels.every(x=>x===info.rels[0] || x==='eq')) return null;
  const main=info.rels.find(x=>x!=='eq')||'eq';
  const L=info.parts[i0], R=info.parts[i1];
  const sign = (main==='lt'||main==='le') ? -1 : 1;
  const fL=compileExpr(L,info.vars), fR=compileExpr(R,info.vars); if(!fL||!fR) return null;
  return {f:e=>sign*(fL(e)-fR(e)), type: main==='eq'?'eq':main==='ne'?'ne':(main==='lt'||main==='gt')?'strict':'large'};
}
function equivalent(a,b,vars){ // b découle-t-elle de a (opérations sur les deux membres) ?
  if(a.type!==b.type) return false;
  let r0=null, n=0;
  for(const e of sampleEnvs(vars,12)){ const x=a.f(e), y=b.f(e); if(!isFinite(x)||!isFinite(y)) continue;
    if(Math.abs(x)<1e-9 && Math.abs(y)<1e-9) continue;
    if(Math.abs(x)<1e-9 || Math.abs(y)<1e-9) return false;
    const r=y/x; if(r0===null) r0=r; else if(!nearEq(r,r0)) return false; n++; }
  if(n<3 || r0===null) return null;
  if(a.type!=='eq' && a.type!=='ne' && r0<0) return false; // inégalité : le sens doit suivre
  return true;
}
function checkSteps(){
  if(isExam()) return examRefused('La vérification des étapes');
  const R=page().rows; let ok=0, bad=0, unk=0, prev=null;
  const mark=(r,cls,txt)=>{ const el=els.get(r.id); const m=el&&el.querySelector('.calcmsg'); if(m){ m.className='calcmsg '+cls; m.textContent=txt; } };
  R.forEach(r=>{
    if(r.type!=='math' || !(r.value||'').trim()){ if(r.type!=='math') prev=null; return; }
    const info=stepInfo(r.value);
    if(info.kind==='expr'||info.kind==='unknown'){ prev=null; return; }
    // 1. les égalités à l'intérieur de la ligne (a = b = c : b et c doivent être égaux)
    let lineOk=true;
    const start = info.kind==='cont' ? 0 : 1;
    for(let i=start;i<info.parts.length-1;i++){ if(info.rels[i]!=='eq') continue; const s=sameExpr(info.parts[i],info.parts[i+1],info.vars); if(s===false){ lineOk=false; break; } }
    if(info.kind==='cont'){ // « = … » continue le calcul de la ligne du dessus
      let s = prev&&prev.last!=null ? sameExpr(prev.last,info.parts[0],[...new Set(prev.vars.concat(info.vars))]) : null;
      if(s===false||!lineOk){ bad++; mark(r,'ko','✗ À revoir : ce calcul ne donne pas le même résultat que la ligne du dessus.'); }
      else if(s===true){ ok++; mark(r,'ok','✓ Étape juste'); } else unk++;
      prev={last:info.parts[info.parts.length-1],vars:info.vars,rel:prev&&prev.rel}; return;
    }
    if(!lineOk){ bad++; mark(r,'ko','✗ À revoir : une égalité de cette ligne est fausse.'); prev=null; return; }
    const first=sameExpr(info.parts[0],info.parts[1],info.vars);
    if(info.vars.length===0){ // que des nombres : l'égalité est-elle vraie ?
      const rf=relFunc(info); let t=null;
      if(rf){ const v=rf.f({}); t = rf.type==='eq'? Math.abs(v)<1e-9 : rf.type==='ne'? Math.abs(v)>1e-9 : rf.type==='strict'? v>1e-12 : v>-1e-12; }
      if(t===false){ bad++; mark(r,'ko','✗ À revoir : ce calcul est faux.'); } else if(t===true){ ok++; mark(r,'ok','✓ Calcul juste'); } else unk++;
      prev={last:info.parts[info.parts.length-1],vars:[]}; return;
    }
    if(first===true && info.rels.every(x=>x==='eq')){ // développement / factorisation : a = b vrai pour tout x
      ok++; mark(r,'ok','✓ Égalité juste'); prev={last:info.parts[info.parts.length-1],vars:info.vars}; return; }
    const rf=relFunc(info);
    if(prev && prev.rel && rf){
      const allVars=[...new Set(prev.vars.concat(info.vars))];
      const eqv=equivalent(prev.rel,rf,allVars);
      if(eqv===false){ bad++; mark(r,'ko','✗ À revoir : cette ligne ne découle pas de celle du dessus.'); }
      else if(eqv===true){ ok++; mark(r,'ok','✓ Étape juste'); } else unk++;
    }
    prev={rel:rf,vars:info.vars,last:info.parts[info.parts.length-1]};
  });
  if(!ok && !bad) toast('Rien à vérifier ici : écris une équation sur plusieurs lignes (ex. 3x+2=8, puis 3x=6)');
  else toast(bad ? (bad===1?'1 ligne à revoir':bad+' lignes à revoir')+(ok?' · '+ok+' juste'+(ok>1?'s':''):'') : 'Tout est juste ('+ok+' étape'+(ok>1?'s':'')+')');
}

/* ============ Lecture à voix haute (synthèse vocale du navigateur, rien n'est envoyé) ============ */
function latexToSpeech(src){
  let t=' '+braceify(src||'')+' ';
  t=t.replace(/\\[,;:!]/g,' ').replace(/\\(begin|end)\{(\w+)\}/g,'\\$1$2 ').replace(/\\(mathbb|operatorname)\{([^{}]*)\}/g,' $2 ');
  // lettres collées (xy) : on les sépare pour qu'elles soient lues une par une, sans toucher aux commandes (\frac…) ni au texte
  t=t.split(/(\\text\{[^{}]*\})/).map(seg=>/^\\text\{/.test(seg)?' '+seg.slice(6,-1)+' ':seg.replace(/(^|[^\\a-zA-Z])([a-zA-Z]{2,})/g,(m,p,w)=>p+w.split('').join(' '))).join('');
  t=t.replace(/\\m?left|\\m?right/g,'').replace(/\{,\}/g,' virgule ').replace(/(\d),(\d)/g,'$1 virgule $2');
  t=t.replace(/\\text\{([^{}]*)\}/g,' $1 ');
  t=t.replace(/\\begincases/g,' système : ').replace(/\\endcases/g,' . ');
  t=t.replace(/\\beginpmatrix/g,' matrice : ').replace(/\\endpmatrix/g,' . ');
  t=t.replace(/\\\\/g,' ; ').replace(/&/g,' , ');
  t=t.replace(/\\lim_\{([^{}]*)\\to([^{}]*)\}/g,' limite quand $1 tend vers $2 de ');
  for(let n=0;n<40;n++){ const b=t;
    t=t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,(m,a,c)=>{ const cx=x=>/[+\-=]|\s\S+\s\S/.test(x.trim()); return (cx(a)||cx(c)) ? ' fraction : '+a+' , sur , '+c+' , fin de fraction, ' : ' '+a+' sur '+c+' '; });
    t=t.replace(/\\binom\{([^{}]*)\}\{([^{}]*)\}/g,' $2 parmi $1 ');
    t=t.replace(/\\sqrt\[([^{}\]]*)\]\{([^{}]*)\}/g,(m,n,a)=>' racine '+({'3':'cubique','4':'quatrième'}[n.trim()]||'d’indice '+n)+' de '+a+' ');
    t=t.replace(/\\sqrt\{([^{}]*)\}/g,' racine de $1 ');
    t=t.replace(/\\overrightarrow\{([^{}]*)\}/g,' vecteur $1 ');
    t=t.replace(/\\overline\{([^{}]*)\}/g,' $1 barre ');
    t=t.replace(/\\widehat\{([^{}]*)\}/g,' angle $1 ');
    t=t.replace(/\\mathbb\{([^{}]*)\}/g,' $1 ');
    t=t.replace(/\^\{\\circ\}/g,' degrés ');
    t=t.replace(/\^\{2\}|\^2(?!\d)/g,' au carré ').replace(/\^\{3\}|\^3(?!\d)/g,' au cube ');
    t=t.replace(/\^\{([^{}]*)\}/g,' puissance $1 ').replace(/\^(\w)/g,' puissance $1 ');
    t=t.replace(/_\{([^{}]*)\}/g,' indice $1 ').replace(/_(\w)/g,' indice $1 ');
    if(t===b){ t=t.replace(/(^|[^a-zA-Z\]\}\^_])\{([^{}]*)\}/g,'$1 $2 '); if(t===b) break; } }
  const W=[['\\times',' fois '],['\\cdot',' fois '],['\\div',' divisé par '],['\\le',' inférieur ou égal à '],['\\ge',' supérieur ou égal à '],
    ['\\ne',' différent de '],['\\approx',' environ égal à '],['\\pm',' plus ou moins '],['\\pi',' pi '],['\\infty',' l’infini '],
    ['\\notin',' n’appartient pas à '],['\\in',' appartient à '],['\\subset',' inclus dans '],['\\cap',' inter '],['\\cup',' union '],['\\varnothing',' l’ensemble vide '],
    ['\\Rightarrow',' implique '],['\\Leftrightarrow',' équivaut à '],['\\forall',' pour tout '],['\\exists',' il existe '],['\\mapsto',' associe '],['\\to',' tend vers '],
    ['\\sum',' somme '],['\\int',' intégrale '],['\\sin',' sinus '],['\\cos',' cosinus '],['\\tan',' tangente '],['\\ln',' logarithme '],['\\exp',' exponentielle '],
    ['\\perp',' perpendiculaire à '],['\\parallel',' parallèle à '],['\\%',' pourcent '],['\\det',' déterminant '],['\\Delta',' delta '],['\\alpha',' alpha '],['\\beta',' bêta '],
    ['\\theta',' thêta '],['\\lambda',' lambda '],['\\sigma',' sigma '],['\\Omega',' oméga '],['\\omega',' oméga '],['\\mu',' mu '],['\\placeholder',' ']];
  W.forEach(([a,b])=>{ t=t.split(a).join(b); });
  t=t.replace(/<=>/g,' équivaut à ');
  t=t.replace(/=/g,' égale ').replace(/</g,' inférieur à ').replace(/>/g,' supérieur à ').replace(/\+/g,' plus ').replace(/-/g,' moins ');
  t=t.replace(/\*/g,' fois ').replace(/\//g,' sur ').replace(/!/g,' factorielle ').replace(/'/g,' prime ');
  t=t.replace(/\(/g,' parenthèse ').replace(/\)/g,' , ').replace(/[\[\]]/g,' crochet ').replace(/\|/g,' barre ').replace(/;(?=[^;]*crochet)/g,' ; ');
  t=t.replace(/\\[a-zA-Z]+/g,' ').replace(/[{}\\]/g,' ');
  t=t.replace(/(\d)([a-zA-Z])/g,'$1 $2');
  return t.replace(/\s+/g,' ').replace(/\s+([,.;])/g,'$1').trim();
}
function rowSpeech(r){
  if(r.type==='math') return latexToSpeech(r.value);
  if(r.type==='text') return (r.value||'').replace(/^#\s*/,'');
  if(r.type==='op') return 'Opération posée : '+latexToSpeech((r.value.expr||'').replace(/[x×*]/g,'\\times ').replace(/:/g,'\\div '));
  if(r.type==='graph') return 'Graphique : '+r.value.fns.filter(Boolean).map((f,i)=>GNAMES[i]+' de x égale '+latexToSpeech(f)).join(' ; ');
  if(r.type==='tree') return 'Arbre de probabilités';
  if(r.type==='tab') return 'Tableau';
  if(r.type==='img') return 'Image';
  return '';
}
let speaking=false;
function speak(text){
  if(!('speechSynthesis' in window)){ toast('La lecture à voix haute n’est pas disponible dans ce navigateur'); return; }
  const ss=window.speechSynthesis;
  if(speaking||ss.speaking){ ss.cancel(); speaking=false; return; }
  if(!text){ toast('Rien à lire sur cette ligne'); return; }
  const u=new SpeechSynthesisUtterance(text); u.lang='fr-FR'; u.rate=state.settings.rate||1;
  const v=ss.getVoices().find(v=>/^fr(-|_)FR/i.test(v.lang))||ss.getVoices().find(v=>/^fr/i.test(v.lang)); if(v) u.voice=v;
  u.onend=u.onerror=()=>{ speaking=false; };
  speaking=true; ss.speak(u);
}
function speakCurrent(){ const r=currentId&&rowById(currentId); if(r) speak(rowSpeech(r)); }
function speakPage(){ speak(page().rows.map(rowSpeech).filter(Boolean).join('. ')); }
if('speechSynthesis' in window) try{ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged=()=>{}; }catch(e){}

/* ============ Parenthèses colorées par paire ============ */
const PCOL=['var(--accent)','var(--d)','var(--c)','var(--dec)'];
function colorParens(mf){
  if(!mf||!mf.shadowRoot) return;
  const root=mf.shadowRoot.querySelector('.ML__content')||mf.shadowRoot;
  const on=state.settings.parens, dg=state.settings.digits; let depth=0;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){ const ch=n.nodeValue.trim(); const el=n.parentElement; if(!el) continue;
    if(/^[0-9.,]+$/.test(ch)){ el.style.color=dg?'var(--u)':''; continue; }
    if(/^[a-zA-Z]$/.test(ch)){ el.style.color=dg?'var(--dec)':''; continue; }
    if(ch==='('||ch==='['){ if(on) el.style.color=PCOL[depth%PCOL.length], el.style.fontWeight='700'; else el.style.color=el.style.fontWeight=''; depth++; }
    else if(ch===')'||ch===']'){ depth=Math.max(0,depth-1); if(on) el.style.color=PCOL[depth%PCOL.length], el.style.fontWeight='700'; else el.style.color=el.style.fontWeight=''; } }
}
function colorAllParens(){ document.querySelectorAll('math-field').forEach(colorParens); }

/* ============ Réglages tout prêts ============ */
const PRESETS={
  defaut:{simple:false,digits:false,fs:20,lh:1.6,font:"'Lexend', Arial, sans-serif",theme:'clair',align:true,labels:true,check:true,focus:false,parens:false,rate:1},
  dyspraxie:{simple:true,fs:24,lh:1.8,font:"'Lexend', Arial, sans-serif",theme:'clair',align:true,labels:true,check:true,focus:false,parens:true,rate:1},
  dyslexie:{simple:true,fs:22,lh:2.0,font:"'Andika', Arial, sans-serif",theme:'creme',align:true,labels:true,check:true,focus:true,parens:true,rate:0.9},
  dyscalculie:{simple:true,digits:true,fs:22,lh:1.8,font:"'Atkinson Hyperlegible', Arial, sans-serif",theme:'creme',align:true,labels:true,check:true,focus:false,parens:true,rate:0.85},
};
function applyPreset(name){
  Object.assign(state.settings,PRESETS[name]); applySettings(); syncSettingsUI(); colorAllParens(); renderTools(); scheduleSave(false);
  toast('Réglages « '+({defaut:'par défaut',dyspraxie:'dyspraxie',dyslexie:'dyslexie',dyscalculie:'dyscalculie'}[name])+' » appliqués — tu peux encore les ajuster');
}

/* ============ Clavier ============ */
window.addEventListener('keydown',e=>{
  if(e.key==='F1'){ e.preventDefault(); openDlg('helpDlg'); return; }
  if(e.key==='F2'){ e.preventDefault(); if(e.shiftKey) speakPage(); else speakCurrent(); return; }
  if(e.key==='F8'){ e.preventDefault(); toggleFocus(); return; }
  if(e.key==='F9'){ e.preventDefault(); checkSteps(); return; }
  if(e.key==='Escape'){ const o=document.querySelectorAll('.overlay.open'); if(o.length){ e.preventDefault(); e.stopPropagation(); o.forEach(x=>x.classList.remove('open')); if(currentId) focusRow(currentId,'end'); } return; }
  if(document.querySelector('.overlay.open')) return;
  const ctrl=e.ctrlKey||e.metaKey; const k=e.key.toLowerCase();
  const stop=()=>{ e.preventDefault(); e.stopPropagation(); };
  if(ctrl && !e.shiftKey && !e.altKey && k==='k'){ stop(); openSearch(); return; }
  if(ctrl && !e.altKey && ((k==='z'&&!e.shiftKey)||k==='y'||(k==='z'&&e.shiftKey))){
    const isRedo = k==='y' || e.shiftKey;
    // dans une formule ou un texte, on laisse d'abord l'annulation du champ lui-même ; sinon on annule dans le cahier
    if(isEditable(e.target) && !HIST.structural) return;
    stop(); if(isRedo) redo(); else undo(); return;
  }
  if(ctrl && !e.altKey && k==='s'){ stop(); saveFile(e.shiftKey); return; }
  if(ctrl && !e.shiftKey && !e.altKey && k==='o'){ stop(); openFile(); return; }
  if(ctrl && !e.shiftKey && !e.altKey && k==='p'){ stop(); doPrint(); return; }
  const t=e.target; let rowEl=t&&t.closest?t.closest('.row'):null;
  if(!rowEl){ // curseur hors du cahier (bouton, lien…) : les raccourcis d'ajout s'appliquent à la ligne en cours
    const global=ctrl&&(['g','b','d'].includes(k)||(e.key==='Enter'&&e.shiftKey));
    if(global && currentId && els.get(currentId)) rowEl=els.get(currentId); else return; }
  const id=rowEl.dataset.id; const row=rowById(id); if(!row) return;
  if(ctrl && e.shiftKey && e.key==='Backspace'){ stop(); deleteRow(id); return; }
  if(e.altKey && !ctrl && (e.key==='ArrowUp'||e.key==='ArrowDown')){ stop(); moveRow(id,e.key==='ArrowUp'?-1:1); return; }
  if(ctrl && !e.shiftKey && k==='d'){ stop(); duplicate(id); return; }
  if(ctrl && !e.shiftKey && !e.altKey && k==='g'){ stop(); addRowAfter(id,'graph'); return; }
  if(ctrl && k==='m'){ stop(); toggleType(id); return; }
  // systèmes et matrices : Alt+Entrée = une ligne de plus, Alt+C = une colonne de plus
  if(e.altKey && !ctrl && (e.key==='Enter' || e.code==='KeyC') && t.tagName==='MATH-FIELD'){
    stop();
    if(!/\\begin\{/.test(t.value)){ toast('Place-toi d’abord dans un système ou une matrice'); return; }
    try{ t.executeCommand(e.key==='Enter'?'addRowAfter':'addColumnAfter'); }catch(_){}
    return;
  }
  if(row.type==='tree' && t.tagName==='INPUT' && t.type==='text'){
    if(e.key==='Enter' && !ctrl){ stop(); const ins=[...rowEl.querySelectorAll('input[type=text]')]; const k=ins.indexOf(t);
      if(e.shiftKey){ if(k>0) ins[k-1].focus(); } else if(k<ins.length-1) ins[k+1].focus(); else addRowAfter(id,'math'); return; }
    return;
  }
  if(ctrl && !e.shiftKey && !e.altKey && k==='b'){ stop(); addRowAfter(id,'tree'); return; }
  if(row.type==='tab' && t.tagName==='INPUT'){
    if(e.key==='Enter' && !ctrl){ stop(); const ins=[...rowEl.querySelectorAll('.tab-grid input')]; const k=ins.indexOf(t);
      if(e.shiftKey){ if(k>0) ins[k-1].focus(); } else if(k<ins.length-1) ins[k+1].focus(); else addRowAfter(id,'math'); return; }
    return;
  }
  if(row.type==='img' && t.classList.contains('imgblk') && (e.key==='Backspace'||e.key==='Delete')){ stop(); deleteRow(id); return; }
  if(row.type==='graph' && t.tagName==='MATH-FIELD'){
    const box=rowEl.querySelector('.graph');
    if(e.key==='Enter' && !ctrl && !e.shiftKey){ stop(); box._addAfter(t); return; }
    if(e.key==='Enter' && e.shiftKey){ stop(); addRowAfter(id,'math'); return; }
    if(e.key==='Enter' && ctrl){ stop(); return; }
    if(e.key==='Backspace' && box._removeIfEmpty(t)){ stop(); return; }
    return;
  }
  if(ctrl && e.shiftKey && e.key==='Enter'){ stop(); addRowAfter(id,'op'); return; }
  if(ctrl && e.key==='Enter'){ stop(); if(row.type==='math') compute(id); return; }
  if(e.key==='Enter' && !e.altKey){
    if(row.type==='op' && t.classList.contains('op-expr')){ stop(); opStart(rowEl); return; }
    stop();
    let type = (row.type==='math'||row.type==='text') ? row.type : 'math';
    if(e.shiftKey) type = type==='math'?'text':'math';
    addRowAfter(id,type); return;
  }
  if(e.key==='Backspace' && row.type!=='op' && isEmpty(row) && page().rows.length>1){
    stop(); const p=prevId(id)||nextId(id); removeRow(id); focusRow(p,'end'); return;
  }
  if(row.type==='text' && (e.key==='ArrowUp'||e.key==='ArrowDown') && !e.shiftKey){
    const tgt = e.key==='ArrowUp'?prevId(id):nextId(id); if(tgt){ stop(); focusRow(tgt,'end'); } return;
  }
  if(row.type==='op' && t.classList.contains('op-expr') && (e.key==='ArrowUp'||e.key==='ArrowDown')){
    const tgt = e.key==='ArrowUp'?prevId(id):(()=>{ const g=rowEl.querySelector('.op-grid'); const ps=opPlaces(g); return ps.length?null:nextId(id); })();
    if(e.key==='ArrowDown'){ if(opStart(rowEl)){ stop(); return; } }
    if(tgt){ stop(); focusRow(tgt,'end'); } return;
  }
},true);
document.addEventListener('focusin',e=>{ const r=e.target.closest&&e.target.closest('.row'); if(r) setCurrent(r.dataset.id); });

/* ============ Barre d'outils ============ */
function toggleFocus(){ state.settings.focus=!state.settings.focus; applySettings(); syncSettingsUI(); scheduleSave(false); toast(state.settings.focus?'Mode concentration activé (F8 pour l\u2019enlever)':'Mode concentration désactivé'); }
function renderTools(){
  const box=document.getElementById('tools'); box.innerHTML='';
  const simple=!!state.settings.simple, L=state.settings.level;
  const act=(label,keys,fn,title,id)=>{ const b=document.createElement('button'); b.className='tool'; b.title=title||label; if(id) b.id=id;
    b.innerHTML='<span>'+label+'</span>'+(keys&&!simple?' <kbd>'+keys+'</kbd>':''); b.addEventListener('mousedown',e=>e.preventDefault()); b.addEventListener('click',fn); box.append(b); return b; };
  act('↶','Ctrl+Z',undo,'Annuler (Ctrl+Z)','undoBtn'); act('↷','Ctrl+Y',redo,'Rétablir (Ctrl+Y)','redoBtn');
  const sep=()=>{ const d=document.createElement('div'); d.className='sep'; box.append(d); }; sep();
  act('＋ Calcul','Entrée',()=>addRowAfter(currentId,'math'),'Nouvelle ligne de calcul (Entrée)');
  act('＋ Texte','Maj+Entrée',()=>addRowAfter(currentId,'text'),'Nouvelle ligne de texte (Maj+Entrée)');
  if(!simple){
    if(L!=='lycee') act('＋ Opération posée','Ctrl+Maj+Entrée',()=>addRowAfter(currentId,'op'));
    if(L!=='primaire' && !examCut('graph')) act('＋ Graphique','Ctrl+G',()=>addRowAfter(currentId,'graph'),'Tracer des fonctions');
    if(L==='lycee') act('＋ Tableau de variations','',()=>addRowAfter(currentId,'tab'),'Tableau de signes et de variations');
    if(L!=='primaire') act('＋ Arbre de probas','Ctrl+B',()=>addRowAfter(currentId,'tree'),'Arbre de probabilités');
    if(!isExam()) act('＋ Image','Ctrl+V',()=>{ const r=addRowAfter(currentId,'img'); if(r) pickImageFor(r.id); },'Ajouter l\u2019énoncé : photo ou capture d\u2019écran');
    sep();
  }
  act('Dupliquer','Ctrl+D',()=>{ if(currentId) duplicate(currentId); },'Recopier la ligne en dessous (Ctrl+D)');
  if(!simple && !examCut('calc')) act('Calculer','Ctrl+Entrée',()=>{ const r=currentId&&rowById(currentId); if(r&&r.type==='math') compute(currentId); else toast('Place-toi sur une ligne de calcul'); });
  if(!isExam()) act('✓ Vérifier','F9',checkSteps,'Vérifier mes étapes de calcul : signale la ligne où une erreur s\u2019est glissée (F9)');
  act('🔊 Lire','F2',speakCurrent,'Lire la ligne à voix haute (F2 ; Maj+F2 : toute la page). Appuie encore pour arrêter.');
  const fb=act('🎯','F8',toggleFocus,'Mode concentration : estomper les autres lignes (F8)','focusBtn'); if(state.settings.focus) fb.classList.add('primary');
  act('🔍 Symbole','Ctrl+K',openSearch,'Chercher un symbole ou un outil par son nom (Ctrl+K)');
  const sw=act(simple?'☰ Tous les outils':'Mode simple','',toggleSimple, simple?'Afficher tous les boutons':'N\u2019afficher que l\u2019essentiel (tout reste accessible au clavier et avec Ctrl+K)');
  sw.classList.add('simple-toggle');
  ariaFix(box);
  document.getElementById('cats').style.display=simple?'none':'';
  document.getElementById('items').style.display=simple?'none':'';
  renderCats();
}
function toggleSimple(){ state.settings.simple=!state.settings.simple; renderTools(); syncSettingsUI(); scheduleSave(false);
  toast(state.settings.simple?'Mode simple : tous les outils restent dans Ctrl+K':'Tous les outils sont affichés'); }
let curCat=null;
function renderCats(){
  const cats=document.getElementById('cats'); cats.innerHTML='';
  const avail=CATALOG.filter(c=>c.items.some(a=>a[4]<=LV[state.settings.level]));
  if(!avail.find(c=>c.cat===curCat)) curCat=avail[0]&&avail[0].cat;
  avail.forEach(c=>{ const b=document.createElement('button'); b.className='cat'+(c.cat===curCat?' on':''); b.textContent=c.cat;
    b.addEventListener('mousedown',e=>e.preventDefault());
    b.addEventListener('click',()=>{ curCat=c.cat; renderCats(); }); cats.append(b); });
  const box=document.getElementById('items'); box.innerHTML='';
  symsFor(state.settings.level).filter(s=>s.cat===curCat).forEach(s=>box.append(symButton(s)));
}
function symButton(s){
  const b=document.createElement('button'); b.className='tool';
  b.title=s.name+(s.key?' — tape '+s.key:'');
  b.innerHTML='<span class="sym"></span>'+(s.key?' <kbd></kbd>':'');
  b.querySelector('.sym').textContent=s.sym; if(s.key) b.querySelector('kbd').textContent=s.key;
  b.addEventListener('mousedown',e=>e.preventDefault());
  b.addEventListener('click',()=>insertTpl(s.tpl));
  return b;
}
function targetMF(){
  // le champ de formule où l'élève écrivait en dernier (ligne de calcul ou fonction d'un graphique)
  if(lastMF && document.body.contains(lastMF)){ const r=lastMF.closest('.row'); if(r && r.dataset.id===currentId) return lastMF; }
  let r=currentId&&rowById(currentId);
  if(r && (r.type==='math'||r.type==='graph')) return els.get(r.id).querySelector('math-field');
  r=addRowAfter(currentId,'math'); return els.get(r.id).querySelector('math-field');
}
function insertTpl(tpl){
  if(tpl==='@tabsign'){ addRowAfter(currentId,'tab',newTab('sign')); return; }
  if(tpl==='@bug'){ openBug(); return; }
  if(tpl==='@exam'){ openExamDlg(); return; }
  if(tpl==='@img'){ const r=addRowAfter(currentId,'img'); if(r) pickImageFor(r.id); return; }
  if(tpl[0]==='@'){ addRowAfter(currentId,tpl.slice(1)); return; }
  const mf=targetMF(); if(!mf) return;
  mfFocus(mf);
  try{ mf.insert(tpl,{focus:true, selectionMode:'placeholder', format:'latex'}); }catch(e){ try{ mf.executeCommand(['insert',tpl]); }catch(_){} }
  mf.dispatchEvent(new Event('input',{bubbles:true}));
}

/* ---------- Recherche de symbole par son nom (Ctrl+K) ---------- */
const deacc=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
let srchSel=0, srchRes=[], srchMF=null;
function openSearch(){
  srchMF = (lastMF && document.body.contains(lastMF)) ? lastMF : null;
  const inp=document.getElementById('srchIn'); inp.value=''; doSearch();
  openDlg('srchDlg'); inp.focus();
}
function doSearch(){
  const q=deacc(document.getElementById('srchIn').value.trim());
  const L=LV[state.settings.level];
  srchRes=ALLSYM.filter(s=>!(isExam() && (s.cat==='Formules'||s.tpl==='@img'||(s.tpl==='@graph'&&examCut('graph'))))).map(s=>{ const hay=deacc(s.name+' '+s.kw+' '+s.cat+' '+(s.key||''));
      let sc= !q?1 : deacc(s.name).startsWith(q)?3 : hay.split(/\s+/).some(w=>w.startsWith(q))?2 : hay.includes(q)?1:0;
      if(sc && s.lvl<=L) sc+=0.5; return {s,sc}; })
    .filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc).slice(0,40).map(x=>x.s);
  if(q && !isExam()) state.pages.forEach(p=>{ if(p.id!==state.current && deacc((p.title||'')+' '+(p.subject||'')).includes(q)) srchRes.unshift({page:p.id,sym:'📄',name:p.title||'Sans titre',cat:p.subject||'Page',kw:''}); });
  srchSel=0; paintSearch();
}
function paintSearch(){
  const list=document.getElementById('srchList'); list.innerHTML='';
  if(!srchRes.length){ list.innerHTML='<div class="sitem">Rien trouvé. Essaie un autre mot.</div>'; return; }
  srchRes.forEach((s,i)=>{ const d=document.createElement('div'); d.className='sitem'+(i===srchSel?' sel':'');
    d.innerHTML='<span class="sym"></span><span class="nm"></span><span class="ct"></span>'+(s.key?'<kbd></kbd>':'');
    d.querySelector('.sym').textContent=s.sym; d.querySelector('.nm').textContent=s.name; d.querySelector('.ct').textContent=s.cat;
    if(s.key) d.querySelector('kbd').textContent=s.key;
    d.addEventListener('mousedown',e=>e.preventDefault());
    d.addEventListener('click',()=>pickSearch(i)); list.append(d); });
  const sel=list.children[srchSel]; if(sel) sel.scrollIntoView({block:'nearest'});
}
function pickSearch(i){
  const s=srchRes[i]; document.getElementById('srchDlg').classList.remove('open'); if(!s) return;
  if(s.page){ state.current=s.page; renderPage(); scheduleSave(false); const R=page().rows; if(R.length) focusRow(R[R.length-1].id,'end'); return; }
  if(srchMF && document.body.contains(srchMF)){ lastMF=srchMF; const r=srchMF.closest('.row'); if(r) setCurrent(r.dataset.id); }
  insertTpl(s.tpl);
  if(s.key && !NATIVE.has(s.key)) toast('Astuce : la prochaine fois, tape « '+s.key+' »');
}
document.getElementById('srchIn').addEventListener('input',doSearch);
document.getElementById('srchIn').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){ e.preventDefault(); srchSel=Math.min(srchSel+1,srchRes.length-1); paintSearch(); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); srchSel=Math.max(srchSel-1,0); paintSearch(); }
  else if(e.key==='Enter'){ e.preventDefault(); pickSearch(srchSel); }
});

/* ============ Aide ============ */
function renderHelp(){
  const L=state.settings.level;
  const rows=(arr)=>'<table>'+arr.map(([a,b])=>'<tr><td>'+a+'</td><td>'+b+'</td></tr>').join('')+'</table>';
  let h='<h3>Se déplacer et organiser</h3>'+rows([
    ['<kbd>Entrée</kbd>','nouvelle ligne du même type'],
    ['<kbd>Maj</kbd>+<kbd>Entrée</kbd>','nouvelle ligne de l\u2019autre type (texte ⇄ calcul)'],
    ['<kbd>Ctrl</kbd>+<kbd>D</kbd>','<b>recopier la ligne</b> en dessous — idéal pour résoudre une équation étape par étape'],
    ['<kbd>Ctrl</kbd>+<kbd>M</kbd>','changer la ligne en texte ou en calcul'],
    ['<kbd>↑</kbd> <kbd>↓</kbd>','ligne précédente / suivante'],
    ['<kbd>⌫</kbd> sur une ligne vide','supprimer la ligne'],
    ['<kbd>Ctrl</kbd>+<kbd>Maj</kbd>+<kbd>⌫</kbd> ou 🗑 à droite','supprimer n’importe quel bloc (graphique, opération posée…). « Annuler » le remet pendant quelques secondes'],
    ['<kbd>Ctrl</kbd>+<kbd>Entrée</kbd>','calculer la ligne (nombres seulement) et écrire le résultat'],
    ['# au début d\u2019un texte','en faire un titre'],
  ]);
  h+='<h3>Écrire les maths au clavier</h3>'+rows([
    ['<kbd>/</kbd>','fraction : tape 3 puis / puis 4 → ¾. <kbd>→</kbd> ou <kbd>Tab</kbd> pour sortir'],
    ['<kbd>*</kbd> &nbsp; <kbd>div</kbd>','× &nbsp; ÷'],
    ['<kbd>(</kbd>','parenthèses (la fermante se met toute seule)'],
    [', (virgule)','nombre décimal : 2,5'],
  ].concat(L!=='primaire'?[
    ['<kbd>^</kbd>','puissance : x^2 → x². <kbd>→</kbd> pour redescendre'],
    ['<kbd>rac</kbd>','racine carrée √'],
    ['<kbd>&lt;=</kbd> <kbd>&gt;=</kbd> <kbd>!=</kbd> <kbd>~=</kbd>','≤ ≥ ≠ ≈'],
    ['<kbd>pi</kbd> &nbsp; <kbd>deg</kbd>','π &nbsp; degré °'],
  ]:[]).concat(L==='lycee'?[
    ['<kbd>_</kbd>','indice : u_n → uₙ'],
    ['<kbd>vec</kbd>','vecteur → AB'],
    ['<kbd>abs</kbd>','valeur absolue |x|'],
    ['<kbd>lim</kbd> <kbd>inf</kbd>','limite, ∞'],
    ['<kbd>som</kbd> <kbd>integ</kbd>','somme Σ, intégrale ∫'],
    ['<kbd>RR</kbd> <kbd>NN</kbd> <kbd>ZZ</kbd> <kbd>QQ</kbd>','ℝ ℕ ℤ ℚ'],
    ['<kbd>dans</kbd> <kbd>=&gt;</kbd> <kbd>&lt;=&gt;</kbd>','∈ ⇒ ⇔'],
    ['f\u2032(x)','tape simplement f\'(x)'],
    ['<kbd>sys</kbd>','syst\u00e8me d\u2019\u00e9quations (accolade)'],
    ['<kbd>mat</kbd> &nbsp; <kbd>col</kbd>','matrice 2\u00d72, coordonn\u00e9es en colonne'],
    ['<kbd>barre</kbd> <kbd>inter</kbd> <kbd>union</kbd> <kbd>comb</kbd>','\u0100, \u2229, \u222a, combinaison (n k)'],
    ['<kbd>exp</kbd> &nbsp; <kbd>vide</kbd>','e<sup>x</sup>, \u2205'],
  ]:[]).concat(L==='college'?[
    ['<kbd>sys</kbd>','syst\u00e8me d\u2019\u00e9quations (accolade)'],
    ['<kbd>inf</kbd>','infini \u221e'],
    ['<kbd>barre</kbd> <kbd>inter</kbd> <kbd>union</kbd>','\u0100, \u2229, \u222a (probabilit\u00e9s)'],
  ]:[]));
  h+='<h3>Trouver n\u2019importe quel symbole</h3>'+rows([
    ['<kbd>Ctrl</kbd>+<kbd>K</kbd>','tape son nom en fran\u00e7ais (infini, union, matrice, sachant, intervalle\u2026) puis <kbd>Entr\u00e9e</kbd>. Le raccourci \u00e0 taper s\u2019affiche \u00e0 c\u00f4t\u00e9 pour la prochaine fois'],
    ['Les onglets sous la barre','tous les symboles rang\u00e9s par th\u00e8me : Base, Puissances, Ensembles, Syst\u00e8mes & matrices, Suites, Analyse, Probas\u2026'],
  ]);
  if(L!=='primaire') h+='<h3>Syst\u00e8mes, matrices et graphiques</h3>'+rows([
    ['<kbd>Alt</kbd>+<kbd>Entr\u00e9e</kbd>','dans un syst\u00e8me ou une matrice : ajouter une ligne'],
    ['<kbd>Alt</kbd>+<kbd>C</kbd>','dans une matrice : ajouter une colonne'],
    ['<kbd>Tab</kbd>','passer \u00e0 la case suivante'],
    ['<kbd>Ctrl</kbd>+<kbd>G</kbd>','nouveau graphique : \u00e9cris f(x) = 2x+1, x^2, sin(x), e^x, ln(x)\u2026'],
    ['<kbd>Entr\u00e9e</kbd> dans un graphique','ajouter une courbe g, h\u2026'],
    ['<kbd>Ctrl</kbd>+<kbd>B</kbd>','arbre de probabilités : nomme les issues (A, puis « A barre » ou laisse vide pour Ā), puis tape les probabilités. <kbd>Entrée</kbd> ou <kbd>Tab</kbd> = branche suivante'],
    ['Complément automatique','la dernière branche d\u2019un groupe se calcule toute seule (1 − …), et les P(A ∩ B) s\u2019affichent au bout'],
    ['Souris / doigt','glisser pour d\u00e9placer le rep\u00e8re, molette pour zoomer'],
  ]);
  if(L!=='lycee') h+='<h3>Opération posée</h3>'+rows([
    ['<kbd>Ctrl</kbd>+<kbd>Maj</kbd>+<kbd>Entrée</kbd>','nouvelle opération posée'],
    ['Tape l\u2019opération puis <kbd>Entrée</kbd>','les colonnes s\u2019alignent toutes seules (unités en bleu, dizaines en rouge, centaines en vert)'],
    ['345 + 78 · 52,4 − 7,85','addition et soustraction, avec ou sans virgule'],
    ['123 × 45','multiplication : une ligne par chiffre, les décalages (0 gris) sont déjà posés. Avec des virgules, tape « , » dans la case du résultat'],
    ['156 : 12','division (potence) : les soustractions à gauche, le quotient sous le diviseur, puis le reste'],
    ['Chiffre du résultat','le curseur passe tout seul à la colonne de gauche'],
    ['<kbd>↑</kbd> / <kbd>↓</kbd>','aller écrire une retenue / revenir au résultat'],
  ]);
  h+='<p style="font-size:.75em;color:var(--muted);margin-top:1em">Les boutons de la barre du haut font la même chose et rappellent le raccourci : utilise-les au début, puis passe au clavier. Ton travail est gardé dans ce navigateur en attendant, mais <b>pense à l\u2019enregistrer dans un fichier</b> (Ctrl+S) : c\u2019est lui qui compte.</p>';
  h+='<h3>Aides</h3>'+rows([
    ['<kbd>F9</kbd>','<b>vérifier mes étapes</b> : MathDys signale la ligne où une erreur s\u2019est glissée (équations, inéquations, calculs, lignes qui commencent par « = »), sans donner la réponse'],
    ['Ctrl+K → « Pythagore », « discriminant »…','l\u2019aide-mémoire : les formules du programme, à insérer en un clic. Ctrl+K retrouve aussi tes pages'],
    ['Réglages → Mes abréviations','tes propres raccourcis, par exemple <code>ssi = si et seulement si</code>'],
    ['Page → 📁 Ranger dans une matière','classer tes pages par matière ou par chapitre'],
    ['<kbd>F2</kbd>','lire la ligne à voix haute, en français (<kbd>Maj</kbd>+<kbd>F2</kbd> : toute la page). <kbd>F2</kbd> encore pour arrêter'],
    ['<kbd>F8</kbd>','mode concentration : seule la ligne en cours reste bien visible'],
    ['Réglages → Réglages tout prêts','dyspraxie, dyslexie, dyscalculie : un point de départ à ajuster'],
    ['<kbd>Ctrl</kbd>+<kbd>P</kbd>','imprimer ou enregistrer en PDF une copie propre (nom, date, titre)'],
    ['<kbd>Ctrl</kbd>+<kbd>V</kbd> d\u2019une capture','mettre l\u2019énoncé en image dans le cahier (ou glisse une photo sur la page)'],
  ]);
  h+='<h3>Mode examen</h3>'+rows([
    ['Réglages → 🎓 Mode examen (ou Ctrl+K → « examen »)','pour un contrôle : coupe les aides qui donnent des réponses et l\u2019accès aux autres pages. Un bandeau reste affiché et l\u2019heure de début est imprimée sur la copie. Le professeur peut choisir un code pour en sortir'],
  ]);
  h+='<h3>Pour les professeurs : fiches d\u2019exercices</h3>'+rows([
    ['Réglages → Mode professeur','survole une ligne et clique sur 🔓 pour en faire une ligne d\u2019<b>énoncé</b> protégée (🔒), puis enregistre la fiche (Ctrl+S) et donne le fichier aux élèves'],
    ['Côté élève','il ouvre la fiche (Ctrl+O) : l\u2019énoncé ne peut être ni modifié ni supprimé, il écrit ses réponses dessous. Ctrl+S crée <b>sa</b> copie « … - mes réponses », sans écraser la fiche'],
    ['Exporter… → Word','pour rendre un devoir sur l\u2019ENT si le PDF n\u2019est pas accepté'],
  ]);
  h+='<h3>Enregistrer et ouvrir</h3>'+rows([
    ['<kbd>Ctrl</kbd>+<kbd>S</kbd>','enregistrer le cahier dans un fichier <b>.mathdys</b> sur ton ordinateur. Les fois suivantes, le même fichier est mis à jour (Chrome, Edge) ou un nouveau est téléchargé (Firefox, Safari)'],
    ['<kbd>Ctrl</kbd>+<kbd>Maj</kbd>+<kbd>S</kbd>','enregistrer sous un autre nom'],
    ['Exporter… → 💾 Sauvegarder tout le cahier','toutes tes pages dans un seul fichier, à garder sur une clé USB ou dans OneDrive. Pour les retrouver : 📂 Ouvrir ce fichier (rien n\u2019est effacé)'],
    ['<kbd>Ctrl</kbd>+<kbd>O</kbd>','ouvrir un cahier .mathdys — ou glisse le fichier sur la page'],
    ['Pastille rouge en haut','il y a des changements pas encore enregistrés dans le fichier'],
    ['Sur plusieurs appareils','enregistre tes cahiers dans ton dossier OneDrive, Google Drive ou celui de l\u2019ENT : tu les retrouves partout, sans compte MathDys'],
    ['<kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd>','annuler / rétablir (dans une formule, puis dans tout le cahier). Les boutons ↶ ↷ annulent toujours dans le cahier'],
    ['<kbd>Alt</kbd>+<kbd>↑</kbd> / <kbd>Alt</kbd>+<kbd>↓</kbd>','monter / descendre le bloc (ou ▲▼ à droite)'],
  ]);
  h+='<p style="font-size:.75em;margin-top:1em;color:var(--muted)">MathDys version '+APP_VERSION+'. Pour l\u2019avoir même sans Internet : ouvre le site une fois connecté, puis installe-le (icône ⊕ dans la barre d\u2019adresse de Chrome ou Edge).</p>';
  h+='<p style="font-size:.75em;margin-top:1em">Un bug ? Une idée ? Bouton <b>🐞 Signaler un bug</b> en bas du cahier, ou Ctrl+K → « bug ».</p>';
  h+='<p style="font-size:.75em;margin-top:1em">Une idée, un bug ? Écris à <a href="mailto:git.public@protonmail.com?subject=MathDys">git.public@protonmail.com</a></p>';
  document.getElementById('helpBody').innerHTML=h;
}

/* ============ Fenêtres, réglages, pages ============ */
function openDlg(id){ if(id==='helpDlg') renderHelp(); const o=document.getElementById(id); o.classList.add('open');
  // le curseur va dans la fenêtre : ce qu'on tape ne part plus dans le cahier derrière
  if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  const f=o.querySelector('input:not([type=hidden]),select,button.primary,button'); if(f) f.focus(); }
document.querySelectorAll('.overlay').forEach(o=>{
  o.addEventListener('click',e=>{ if(e.target===o||e.target.hasAttribute('data-close')){ o.classList.remove('open'); if(o.id==='helpDlg'&&!state.seenHelp){state.seenHelp=true;scheduleSave(false);} if(currentId) focusRow(currentId,'end'); } });
});
let askCb=null;
function ask(text,cb,opt){ document.getElementById('askText').textContent=text; askCb=cb;
  const inp=document.getElementById('askIn'); inp.style.display=opt&&opt.input?'':'none'; inp.value=opt&&opt.value||''; inp.placeholder=opt&&opt.placeholder||'';
  const dl=document.getElementById('askList'); dl.innerHTML=''; (opt&&opt.list||[]).forEach(v=>{ const o=document.createElement('option'); o.value=v; dl.append(o); });
  document.getElementById('askOk').textContent=opt&&opt.ok||'Oui';
  openDlg('askDlg'); if(opt&&opt.input){ inp.focus(); inp.select(); } }
document.getElementById('askIn').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('askOk').click(); } });
document.getElementById('askOk').addEventListener('click',()=>{ document.getElementById('askDlg').classList.remove('open'); const v=document.getElementById('askIn').value; if(askCb) askCb(v); askCb=null; });

function applySettings(){
  const s=state.settings, r=document.documentElement.style;
  r.setProperty('--fs',s.fs+'px'); r.setProperty('--lh',s.lh); r.setProperty('--font',s.font);
  document.body.className='theme-'+s.theme+(s.focus?' focusmode':'')+(vkbOn()?' vkb':'');
  const fb=document.getElementById('focusBtn'); if(fb) fb.classList.toggle('primary',!!s.focus);
  document.getElementById('levelSel').value=s.level;
  scheduleAlign();
  requestAnimationFrame(()=>{ document.querySelectorAll('.graph').forEach(g=>g._draw&&g._draw()); document.querySelectorAll('.tree').forEach(t=>t._relayout&&t._relayout()); });
}
const BOUND=[];
function syncSettingsUI(){ BOUND.forEach(([el,key])=>{ if(el.type==='checkbox') el.checked=!!state.settings[key]; else el.value=state.settings[key]??''; }); }
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>applyPreset(b.dataset.preset)));
const bind=(id,key,conv,ev)=>{ const el=document.getElementById(id); BOUND.push([el,key]);
  if(el.type==='checkbox') el.checked=!!state.settings[key]; else el.value=state.settings[key];
  el.addEventListener(ev||'input',()=>{ state.settings[key]= el.type==='checkbox'?el.checked:conv(el.value); applySettings(); if(key==='labels'||key==='check') renderPage(); if(key==='parens') colorAllParens(); if(key==='simple') renderTools(); if(key==='vkb'||key==='teacher'||key==='abbr') renderPage(); if(key==='digits') colorAllParens(); if(key==='teacher') toast(state.settings.teacher?'Mode professeur : survole une ligne et clique sur 🔓 pour la protéger':'Mode professeur désactivé'); scheduleSave(false); }); };
bind('sFs','fs',Number); bind('sLh','lh',Number); bind('sFont','font',String,'change'); bind('sTheme','theme',String,'change');
bind('sName','name',String); bind('sFocus','focus',Boolean,'change'); bind('sParens','parens',Boolean,'change'); bind('sRate','rate',Number); bind('sSimple','simple',Boolean,'change'); bind('sAbbr','abbr',String,'change'); bind('sDigits','digits',Boolean,'change'); bind('sTeacher','teacher',Boolean,'change'); bind('sVkb','vkb',String,'change'); bind('sAlign','align',Boolean,'change'); bind('sLabels','labels',Boolean,'change'); bind('sCheck','check',Boolean,'change');
document.getElementById('levelSel').addEventListener('change',e=>{ state.settings.level=e.target.value; renderTools(); scheduleSave(false); toast('Niveau : '+e.target.selectedOptions[0].textContent); });
document.getElementById('settingsBtn').addEventListener('click',()=>openDlg('setDlg'));
document.getElementById('helpBtn').addEventListener('click',()=>openDlg('helpDlg'));
document.getElementById('newPage').addEventListener('click',()=>{ const p=newPage(); if(page()&&page().subject) p.subject=page().subject; state.pages.push(p); state.current=p.id; renderPage(); scheduleSave(); focusRow(p.rows[0].id,'end'); });
document.getElementById('pageSel').addEventListener('change',e=>{
  const v=e.target.value;
  if(v==='__subj'){ e.target.value=state.current;
    ask('Dans quelle matière ranger « '+(page().title||'Sans titre')+' » ?',val=>{ page().subject=(val||'').trim().slice(0,40)||undefined; renderPageList(); scheduleSave(); },
      {input:true,value:page().subject||'',placeholder:'Maths, Physique, Chapitre 3…',list:subjects(),ok:'Ranger'});
    return; }
  if(v==='__del'){ e.target.value=state.current;
    ask('Supprimer la page « '+(page().title||'Sans titre')+' » ?',()=>{ state.pages=state.pages.filter(p=>p.id!==state.current); if(!state.pages.length) state.pages.push(newPage()); state.current=state.pages[0].id; renderPage(); scheduleSave(); });
    return; }
  state.current=v; renderPage(); scheduleSave();
});
document.getElementById('pageTitle').addEventListener('input',e=>{ page().title=e.target.value; const o=document.querySelector('#pageSel option[value="'+state.current+'"]'); if(o) o.textContent=e.target.value||'Sans titre'; scheduleSave(); });
document.getElementById('pageTitle').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); const r=page().rows[0]; if(r) focusRow(r.id,'end'); } });
function preparePrint(){
  const ph=document.getElementById('printhead');
  const d=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  ph.innerHTML='<div class="ph-top"><span></span><span></span></div><h1></h1>';
  ph.querySelector('.ph-top span').textContent=state.settings.name||'';
  ph.querySelectorAll('.ph-top span')[1].textContent=d;
  ph.querySelector('h1').textContent=page().title||'';
  const ex=page().exam; if(ex){ const n=document.createElement('div'); n.className='ph-exam';
    n.textContent='Rédigé avec MathDys '+APP_VERSION+' en mode examen : commencé à '+hhmm(ex.start)+(ex.end?', terminé à '+hhmm(ex.end):'')+' — aides coupées'+(ex.calc?', calculatrice coupée':'')+(ex.graph?', graphiques coupés':'')+'.'; ph.append(n); }
  page().rows.forEach(r=>{ const el=els.get(r.id); if(el) el.classList.toggle('p-empty',isEmpty(r) || (r.type==='img'&&!r.value.src)); });
}
window.addEventListener('beforeprint',preparePrint);
function doPrint(){ preparePrint(); try{ window.print(); }catch(e){ toast('Impression impossible ici'); } }
document.getElementById('printBtn').addEventListener('click',doPrint);
/* ============ Export : texte lisible, LaTeX, Word / LibreOffice ============ */
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','n':'ⁿ','x':'ˣ','i':'ⁱ'};
const SUB={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','n':'ₙ','k':'ₖ','p':'ₚ','i':'ᵢ'};
const conv=(s,map,pre)=>[...s].every(c=>map[c])?[...s].map(c=>map[c]).join(''):pre+'('+s+')';
function latexToUnicode(src){
  let t=braceify(src||'');
  t=t.replace(/\\m?left|\\m?right/g,'').replace(/\{,\}/g,',').replace(/\\text\{([^{}]*)\}/g,'$1').replace(/\\[,;:! ]/g,' ');
  t=t.replace(/\\begin\{cases\}/g,'⦃ ').replace(/\\end\{cases\}/g,' ⦄').replace(/\\begin\{pmatrix\}/g,'[ ').replace(/\\end\{pmatrix\}/g,' ]').replace(/\\\\/g,' ; ').replace(/&/g,'  ');
  t=t.replace(/\\lim_\{([^{}]*)\\to([^{}]*)\}/g,'lim($1→$2) ');
  const simple=x=>/^[\w.,]+$|^\\?[a-zA-Z]+$/.test(x.trim());
  for(let n=0;n<40;n++){ const b=t;
    t=t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,(m,a,c)=>(simple(a)?a:'('+a+')')+'/'+(simple(c)?c:'('+c+')'));
    t=t.replace(/\\binom\{([^{}]*)\}\{([^{}]*)\}/g,'($1 parmi $2)'.replace('$1 parmi $2','$2 parmi $1'));
    t=t.replace(/\\sqrt\[([^{}\]]*)\]\{([^{}]*)\}/g,(m,n,a)=>({'3':'∛','4':'∜'}[n.trim()]||n+'√')+(simple(a)?a:'('+a+')'));
    t=t.replace(/\\sqrt\{([^{}]*)\}/g,(m,a)=>'√'+(simple(a)?a:'('+a+')'));
    t=t.replace(/\\overrightarrow\{([^{}]*)\}/g,(m,a)=>'vect('+a+')');
    t=t.replace(/\\overline\{([^{}]*)\}/g,(m,a)=>[...a].map(c=>c+'̅').join(''));
    t=t.replace(/\\widehat\{([^{}]*)\}/g,'∠$1');
    t=t.replace(/\\mathbb\{([A-Z])\}/g,(m,a)=>({N:'ℕ',Z:'ℤ',Q:'ℚ',R:'ℝ',C:'ℂ'}[a]||a));
    t=t.replace(/\^\{\\circ\}/g,'°');
    t=t.replace(/\^\{([^{}]*)\}/g,(m,a)=>conv(a,SUP,'^')).replace(/\^([0-9a-z])/g,(m,a)=>conv(a,SUP,'^'));
    t=t.replace(/_\{([^{}]*)\}/g,(m,a)=>conv(a,SUB,'_')).replace(/_([0-9a-z])/g,(m,a)=>conv(a,SUB,'_'));
    t=t.replace(/(^|[^a-zA-Z\]\}\^_\\])\{([^{}]*)\}/g,'$1$2');
    if(t===b) break; }
  const M={'\\times':'×','\\cdot':'·','\\div':'÷','\\le':'≤','\\ge':'≥','\\ne':'≠','\\approx':'≈','\\pm':'±','\\pi':'π','\\infty':'∞',
    '\\notin':'∉','\\in':'∈','\\subset':'⊂','\\cap':'∩','\\cup':'∪','\\varnothing':'∅','\\Rightarrow':'⇒','\\Leftrightarrow':'⇔','\\forall':'∀','\\exists':'∃',
    '\\mapsto':'↦','\\to':'→','\\sum':'Σ','\\int':'∫','\\perp':'⊥','\\parallel':'∥','\\%':'%','\\Delta':'Δ','\\Omega':'Ω','\\alpha':'α','\\beta':'β',
    '\\gamma':'γ','\\delta':'δ','\\theta':'θ','\\lambda':'λ','\\mu':'μ','\\sigma':'σ','\\omega':'ω','\\sin':'sin','\\cos':'cos','\\tan':'tan','\\ln':'ln','\\exp':'exp','\\det':'det','\\placeholder':''};
  Object.keys(M).sort((a,b)=>b.length-a.length).forEach(k=>{ t=t.split(k).join(M[k]); });
  return t.replace(/\\[a-zA-Z]+/g,'').replace(/[{}]/g,'').replace(/⦃/g,'{').replace(/⦄/g,'}').replace(/\s+/g,' ').trim();
}
function blockText(r,latex){
  if(r.type==='math') return latex ? '$'+r.value+'$' : latexToUnicode(r.value);
  if(r.type==='text') return (r.value||'').replace(/^#\s*/,'');
  if(r.type==='op') return 'Opération posée : '+(r.value.expr||'');
  if(r.type==='graph') return 'Graphique : '+r.value.fns.filter(Boolean).map((f,i)=>GNAMES[i]+'(x) = '+(latex?'$'+f+'$':latexToUnicode(f))).join(' ; ');
  if(r.type==='tree'){ const el=els.get(r.id); const pr=el?[...el.querySelectorAll('.tprod')].map(x=>x.textContent):[]; return 'Arbre de probabilités'+(pr.length?' : '+pr.join(' ; '):''); }
  if(r.type==='tab') return '[tableau de signes / de variations : voir le PDF]';
  if(r.type==='img') return '[image]';
  return '';
}
async function copyPage(latex){
  const txt=(page().title?page().title+'\n\n':'')+page().rows.map(r=>blockText(r,latex)).filter(Boolean).join('\n');
  try{ await navigator.clipboard.writeText(txt); toast(latex?'Page copiée (calculs en LaTeX)':'Page copiée en texte lisible'); }
  catch(e){ toast('Copie refusée par le navigateur'); }
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function gridToTable(grid,colsCount){
  const kids=[...grid.children].filter(d=>!(d instanceof SVGElement));
  let html='<table>'; kids.forEach((d,k)=>{ if(k%colsCount===0) html+=(k?'</tr>':'')+'<tr>';
    const inp=d.querySelector('input'); let v=inp?inp.value:d.textContent; if(d.classList.contains('cm')) v+=',';
    if(d.classList.contains('bar2')&&!v) v='||';
    html+='<td>'+esc(v)+'</td>'; });
  return html+'</tr></table>';
}
function rowToHtml(r,mathml){
  const el=els.get(r.id);
  if(r.type==='text'){ const v=r.value||''; return /^#\s/.test(v)?'<h2>'+esc(v.replace(/^#\s*/,''))+'</h2>':'<p>'+esc(v).replace(/\n/g,'<br>')+'</p>'; }
  if(r.type==='math'){ if(!r.value) return '';
    if(mathml){ try{ const ML=window.MathLive; let m=ML&&ML.convertLatexToMathMl?ML.convertLatexToMathMl(r.value):null;
        if(m){ if(!/^<math/.test(m)) m='<math xmlns="http://www.w3.org/1998/Math/MathML">'+m+'</math>'; return '<p>'+m+'</p>'; } }catch(e){} }
    return '<p>'+esc(latexToUnicode(r.value))+'</p>'; }
  if(r.type==='img') return r.value.src?'<p><img src="'+r.value.src+'" style="max-width:100%"></p>':'';
  if(r.type==='graph'){ const cv=el&&el.querySelector('canvas'); let h='<p>'+esc(blockText(r,false))+'</p>';
    try{ if(cv) h+='<p><img src="'+cv.toDataURL('image/png')+'" width="600"></p>'; }catch(e){} return h; }
  if(r.type==='op'){ const g=el&&el.querySelector('.op-grid'); const n=g?(g.style.gridTemplateColumns||'').trim().split(/\s+/).length:0;
    return '<p><b>'+esc(r.value.expr||'')+'</b></p>'+(g&&n?gridToTable(g,n):''); }
  if(r.type==='tab'){ const g=el&&el.querySelector('.tab-grid'); return g?gridToTable(g,2*r.value.xs.length):''; }
  if(r.type==='tree') return '<p>'+esc(blockText(r,false))+'</p>';
  return '';
}
function exportDoc(mathml){
  const p=page();
  const body=page().rows.map(r=>rowToHtml(r,mathml)).join('\n');
  const head=(state.settings.name?'<p style="color:#555">'+esc(state.settings.name)+' — '+new Date().toLocaleDateString('fr-FR')+'</p>':'');
  const html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>'+esc(p.title||'MathDys')+'</title>'
    +'<style>body{font-family:Arial,sans-serif;font-size:13pt;line-height:1.5} h1{font-size:18pt} h2{font-size:15pt;color:#2f6fde} table{border-collapse:collapse;margin:6pt 0} td{border:1px solid #999;padding:2pt 6pt;text-align:center;min-width:14pt}</style></head><body>'
    +head+'<h1>'+esc(p.title||'')+'</h1>'+body+'</body></html>';
  const blob=new Blob(['﻿'+html],{type:'application/msword'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=(p.title||'cahier').replace(/[\\/:*?"<>|]+/g,'-').trim()+(mathml?' (Word)':' (texte)')+'.doc';
  document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),3000);
  toast(mathml?'Fichier Word créé : les formules deviennent des équations Word':'Fichier créé : les formules sont écrites en texte simple');
}
document.getElementById('exportSel').addEventListener('change',e=>{
  const v=e.target.value; e.target.value='';
  if(v==='txt') copyPage(false); else if(v==='latex') copyPage(true);
  else if(v==='all') saveAll();
  else if(v==='word') exportDoc(true); else if(v==='odt') exportDoc(false); else if(v==='pdf') doPrint();
});

/* ============ Fichiers sur l'ordinateur (aucun compte, aucun serveur) ============ */
const FILE_EXT='.mathdys';
const handles=new Map(); // page → fichier ouvert (Chrome/Edge), pour réenregistrer au même endroit
const FTYPES=[{description:'Cahier MathDys',accept:{'application/json':[FILE_EXT]}}];
const safeName=t=>((t||'cahier').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,80)||'cahier')+FILE_EXT;
function pageToFile(p){ return JSON.stringify({app:'MathDys',format:1,saved:new Date().toISOString(),title:p.title,rows:p.rows}); }
async function saveFile(as){
  const p=page(); const data=pageToFile(p); const name=safeName(p.title);
  try{
    if(window.showSaveFilePicker){
      let h=handles.get(p.id);
      if(!h||as){ h=await window.showSaveFilePicker({suggestedName:p.suggest||(p.fileName&&!as?p.fileName:name), types:FTYPES}); handles.set(p.id,h); }
      const w=await h.createWritable(); await w.write(data); await w.close();
      p.fileName=h.name;
    } else {
      const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob);
      const fname=p.suggest||p.fileName||name;
      const a=document.createElement('a'); a.href=url; a.download=fname; document.body.append(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000); p.fileName=fname;
    }
    delete p.suggest; p.dirty=false; save(); toast('Enregistré dans « '+p.fileName+' »');
  }catch(e){
    if(e && e.name==='AbortError') return;
    toast('Enregistrement impossible ici. Utilise « Exporter… → Copier » en attendant.');
  }
}
/* --- sauvegarde complète : toutes les pages dans un seul fichier --- */
async function saveAll(){
  const data=JSON.stringify({app:'MathDys',format:1,kind:'backup',version:APP_VERSION,saved:new Date().toISOString(),
    pages:state.pages.map(p=>({title:p.title,subject:p.subject,rows:p.rows,exam:p.exam}))});
  const name='MathDys - sauvegarde complète - '+new Date().toISOString().slice(0,10)+FILE_EXT;
  try{
    if(window.showSaveFilePicker){ const h=await window.showSaveFilePicker({suggestedName:name,types:FTYPES}); const w=await h.createWritable(); await w.write(data); await w.close(); }
    else { const url=URL.createObjectURL(new Blob([data],{type:'application/json'})); const a=document.createElement('a'); a.href=url; a.download=name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),3000); }
    state.lastBackup=new Date().toISOString(); save();
    toast('Sauvegarde complète : '+state.pages.length+' page'+(state.pages.length>1?'s':'')+' dans un seul fichier. Garde-le précieusement (clé USB, OneDrive…)');
  }catch(e){ if(e&&e.name==='AbortError') return; toast('Sauvegarde impossible ici'); }
}
function restoreAll(d,name){
  const list=d.pages.filter(p=>p&&Array.isArray(p.rows));
  const same=(a,b)=>a.title===b.title && JSON.stringify(a.rows.map(r=>[r.type,r.value]))===JSON.stringify(b.rows.map(r=>[r.type,r.value]));
  const fresh=list.filter(p=>!state.pages.some(q=>same(q,p)));
  if(!fresh.length){ toast('Toutes les pages de cette sauvegarde sont déjà dans ton cahier'); return; }
  ask('Ajouter '+fresh.length+' page'+(fresh.length>1?'s':'')+' de la sauvegarde « '+name+' » ? Tes pages actuelles sont gardées : rien n\u2019est effacé.',()=>{
    let first=null;
    fresh.forEach(p=>{ const np={id:uid(),title:p.title||'Sans titre',subject:p.subject,rows:p.rows.filter(r=>r&&KNOWN.includes(r.type)).map(r=>Object.assign({},r,{id:uid()})),exam:p.exam};
      if(!np.rows.length) np.rows.push({id:uid(),type:'math',value:''}); state.pages.push(np); if(!first) first=np; });
    state.pages=state.pages.filter(q=>q.dirty || q.fileName || q.rows.some(r=>!isEmpty(r)) || fresh.length===0);
    state.current=first.id; renderPage(); save(); toast(fresh.length+' page'+(fresh.length>1?'s':'')+' restaurée'+(fresh.length>1?'s':''));
  },{ok:'Restaurer'});
}
async function openFile(){
  if(isExam() && !pendingExam) return examRefused('L\u2019ouverture d\u2019un fichier');
  if(window.showOpenFilePicker){
    try{ const [h]=await window.showOpenFilePicker({types:FTYPES.concat([{description:'JSON',accept:{'application/json':['.json']}}])});
      const f=await h.getFile(); loadFileText(await f.text(), h.name, h); }
    catch(e){ if(!e || e.name!=='AbortError') document.getElementById('fileIn').click(); else pendingExam=null; }
  } else document.getElementById('fileIn').click();
}
const KNOWN=Object.keys(BLOCKS);
function loadFileText(txt,name,handle){
  let d=null; try{ d=JSON.parse(txt); }catch(e){}
  if(d && d.app==='MathDys' && d.kind==='backup' && Array.isArray(d.pages)){ if(isExam()) return examRefused('La restauration'); restoreAll(d,name); return; }
  if(!d || d.app!=='MathDys' || !Array.isArray(d.rows)){ toast('« '+name+' » n\u2019est pas un cahier MathDys'); return; }
  const rows=d.rows.filter(r=>r&&KNOWN.includes(r.type)).map(r=>Object.assign({},r,{id:uid()}));
  if(!rows.length) rows.push({id:uid(),type:'math',value:''});
  const title=d.title||name.replace(/\.[^.]+$/,'');
  let p=state.pages.find(q=>q.fileName===name);
  if(p){ p.title=title; p.rows=rows; }
  else { p={id:uid(),title,rows}; state.pages.push(p); }
  p.fileName=name; p.dirty=false; state.current=p.id; delete p.suggest;
  if(handle) handles.set(p.id,handle); else handles.delete(p.id);
  const fiche=rows.some(r=>r.locked) && !state.settings.teacher;
  if(fiche){ // fiche du professeur : on n'écrase jamais l'original, l'élève enregistre SA copie
    handles.delete(p.id); p.fileName=null; p.dirty=true; p.suggest=name.replace(/\.mathdys$/i,'')+' - mes réponses'+FILE_EXT; }
  // retire la page vide de départ si elle n'a jamais servi
  state.pages=state.pages.filter(q=>q===p || q.dirty || q.fileName || q.rows.some(r=>!isEmpty(r)));
  if(pendingExam && Date.now()-pendingExam.asked<10*60*1000){ finishExam(pendingExam,p); return; }
  pendingExam=null;
  renderPage(); save();
  if(fiche) toast('Fiche d\u2019exercice : l\u2019énoncé est protégé. Écris tes réponses, puis Ctrl+S pour enregistrer TA copie.','OK',()=>{});
  else toast('« '+name+' » ouvert');
}
document.getElementById('openBtn').addEventListener('click',openFile);
document.getElementById('saveBtn').addEventListener('click',()=>saveFile(false));
document.getElementById('fileIn').addEventListener('change',async e=>{ const f=e.target.files[0]; if(f) loadFileText(await f.text(), f.name, null); e.target.value=''; });
let dragN=0; const dropEl=document.getElementById('drop');
const hasFiles=e=>e.dataTransfer && [...e.dataTransfer.types].includes('Files');
window.addEventListener('dragenter',e=>{ if(hasFiles(e)){ dragN++; dropEl.classList.add('on'); } });
window.addEventListener('dragleave',e=>{ if(hasFiles(e) && --dragN<=0){ dragN=0; dropEl.classList.remove('on'); } });
window.addEventListener('dragover',e=>{ if(hasFiles(e)) e.preventDefault(); });
window.addEventListener('drop',async e=>{ if(!hasFiles(e)) return; e.preventDefault(); dragN=0; dropEl.classList.remove('on');
  const fs=[...e.dataTransfer.files]; if(!fs.length) return;
  if(isExam()) return examRefused('Le glisser-déposer de fichiers');
  for(const f of fs){ if(/^image\//.test(f.type)) await addImage(f,currentId); else loadFileText(await f.text(), f.name, null); } });
document.getElementById('imgIn').addEventListener('change',async e=>{ const f=e.target.files[0]; e.target.value=''; if(f) await addImage(f,imgTarget||currentId); imgTarget=null; });
// coller une capture d'écran n'importe où
window.addEventListener('paste',async e=>{
  const items=[...(e.clipboardData&&e.clipboardData.items||[])]; const it=items.find(i=>i.kind==='file'&&/^image\//.test(i.type));
  if(!it) return; e.preventDefault(); e.stopPropagation(); await addImage(it.getAsFile(),currentId);
},true);
window.addEventListener('beforeunload',e=>{ if(state.pages.some(p=>p.dirty && p.rows.some(r=>!isEmpty(r)))){ e.preventDefault(); e.returnValue=''; } });

let toastT=null;
function toast(t,actLabel,actFn){
  const el=document.getElementById('toast'); el.textContent=t; el.classList.remove('act');
  if(actLabel){ const b=document.createElement('button'); b.textContent=actLabel;
    b.addEventListener('click',()=>{ el.classList.remove('show','act'); actFn(); }); el.append(b); el.classList.add('act'); }
  el.classList.add('show'); clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove('show','act'), actLabel?6000:1800);
}

/* ============ Mode examen : les aides qui donnent des réponses sont coupées ============ */
// Ce n'est pas un verrou de sécurité (un élève très averti peut vider les données du navigateur) :
// c'est un cadre clair et visible pour le professeur, avec l'heure de début imprimée sur la copie.
const EX=()=>state.settings.exam||null;
const isExam=()=>!!(state.settings.exam&&state.settings.exam.on);
const examCut=what=>{ const x=EX(); if(!x||!x.on) return false; if(what==='calc') return !!x.calc; if(what==='graph') return !!x.graph; return true; };
const hashCode=s=>{ let h=5381; for(const c of String(s)) h=((h<<5)+h+c.charCodeAt(0))|0; return String(h>>>0); };
const hhmm=d=>new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
function examRefused(what){ toast((what||'Cet outil')+' est désactivé en mode examen'); return true; }
let pendingExam=null;
function openExamDlg(){
  if(isExam()){ quitExam(); return; }
  document.getElementById('exCode').value=''; openDlg('examDlg');
}
function startExam(withFile){
  const o={on:true, calc:document.getElementById('exCalc').checked, graph:document.getElementById('exGraph').checked,
    code:document.getElementById('exCode').value.trim()?hashCode(document.getElementById('exCode').value.trim()):'', start:new Date().toISOString()};
  document.getElementById('examDlg').classList.remove('open');
  if(withFile){ o.asked=Date.now(); pendingExam=o; openFile(); return; }
  const p=newPage(); p.title='Examen du '+new Date().toLocaleDateString('fr-FR'); p.subject='Examens';
  p.rows=[{id:uid(),type:'math',value:''}]; state.pages.push(p); state.current=p.id; finishExam(o,p);
}
function finishExam(o,p){
  o.page=p.id; p.exam={start:o.start,calc:o.calc,graph:o.graph}; state.settings.exam=o; pendingExam=null;
  applyExam(); renderPage(); save(); const R=page().rows; focusRow(R[R.length-1].id,'end');
  toast('Mode examen : les aides sont coupées. Bon courage !','OK',()=>{});
}
function quitExam(){
  const x=EX(); if(!x) return;
  const done=()=>{ const p=state.pages.find(q=>q.id===x.page); if(p&&p.exam) p.exam.end=new Date().toISOString();
    state.settings.exam=null; applyExam(); renderPage(); save(); toast('Mode examen terminé'); };
  if(x.code) ask('Code du professeur pour quitter le mode examen :',v=>{ if(hashCode((v||'').trim())===x.code) done(); else toast('Code incorrect'); },{input:true,placeholder:'code',ok:'Quitter'});
  else ask('Quitter le mode examen ? Les aides seront de nouveau disponibles.',done,{ok:'Quitter'});
}
function applyExam(){
  const on=isExam(), x=EX();
  document.body.classList.toggle('exam',on);
  const b=document.getElementById('examBar');
  if(on){ b.hidden=false; b.querySelector('.ex-txt').textContent='MODE EXAMEN — commencé à '+hhmm(x.start)+' · aides coupées'+(x.calc?' · calculatrice coupée':'')+(x.graph?' · graphiques coupés':''); }
  else b.hidden=true;
  ['pageSel','newPage','openBtn'].forEach(id=>{ const el=document.getElementById(id); if(el) el.disabled=on; });
  if(on && state.current!==x.page && state.pages.some(p=>p.id===x.page)) state.current=x.page;
  renderTools();
}

/* ============ Signaler un bug ============ */
function bugInfo(){
  const st=Object.assign({},state.settings); delete st.name; delete st.abbr;
  return ['MathDys '+APP_VERSION, 'Adresse : '+location.origin+location.pathname, 'Navigateur : '+navigator.userAgent,
    'Écran : '+innerWidth+'×'+innerHeight+' (zoom '+(window.devicePixelRatio||1)+')', 'Éditeur de formules : '+(MFE?'chargé':'NON chargé'),
    'Hors ligne : '+(navigator.serviceWorker&&navigator.serviceWorker.controller?'actif':'non'), 'Réglages : '+JSON.stringify(st)].join('\n');
}
function openBug(){
  document.getElementById('bugInfo').textContent=bugInfo(); openDlg('bugDlg'); document.getElementById('bugTxt').focus(); updBugMail();
}
function bugMessage(){ return (document.getElementById('bugTxt').value.trim()||'(décris ici le problème)')+'\n\n-----\n'+bugInfo(); }
function updBugMail(){ document.getElementById('bugMail').href='mailto:git.public@protonmail.com?subject='+encodeURIComponent('MathDys '+APP_VERSION+' — bug ou idée')+'&body='+encodeURIComponent(bugMessage().slice(0,1800)); }
document.getElementById('bugBtn').addEventListener('click',openBug);
document.getElementById('exStart').addEventListener('click',()=>startExam(false));
document.getElementById('examOpen').addEventListener('click',()=>{ document.getElementById('setDlg').classList.remove('open'); openExamDlg(); });
document.getElementById('exFile').addEventListener('click',()=>startExam(true));
document.getElementById('examQuit').addEventListener('click',quitExam);
document.getElementById('bugTxt').addEventListener('input',updBugMail);
document.getElementById('bugCopy').addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(bugMessage()); toast('Message copié : colle-le dans un mail à git.public@protonmail.com'); }catch(e){ toast('Copie refusée par le navigateur'); } });

/* ============ Hors ligne : installation comme une application ============ */
const APP_VERSION='1.1.0';
try{
  if('serviceWorker' in navigator && location.protocol==='https:' && window.self===window.top)
    navigator.serviceWorker.register('sw.js').catch(()=>{});
}catch(e){}
// ouvrir un fichier .mathdys directement depuis l'ordinateur (application installée, Chrome/Edge)
try{ if('launchQueue' in window) window.launchQueue.setConsumer(async p=>{ for(const h of (p.files||[])){ const f=await h.getFile(); loadFileText(await f.text(), f.name, h); } }); }catch(e){}

/* ============ Auto-test (ouvrir le site avec #test à la fin de l'adresse) ============ */
function runSelfTest(){
  const res=[]; const ok=(name,cond,detail)=>res.push({name,ok:!!cond,detail:detail||''});
  const eq=(name,got,want)=>ok(name,got===want,'obtenu : '+JSON.stringify(got)+' / attendu : '+JSON.stringify(want));
  const near=(name,got,want)=>ok(name,got!==null&&Math.abs(got-want)<1e-9,'obtenu : '+got+' / attendu : '+want);
  // calculatrice
  near('calcul 3×4+½',evalLatex('3\\times4+\\frac{1}{2}'),12.5);
  near('calcul −2²',evalLatex('-2^{2}'),-4);
  near('calcul 5!',evalLatex('5!'),120);
  near('calcul 2,5×4',evalLatex('2{,}5\\times4'),10);
  near('fraction tapée au clavier (\\frac34)',evalLatex('\\frac34+\\frac14'),1);
  near('racine tapée au clavier (\\sqrt2)',evalLatex('\\sqrt2\\times\\sqrt2'),2);
  eq('calcul refuse les lettres',evalLatex('x+1'),null);
  eq('fraction exacte ⅓+⅙',formatResult(0.5,'\\frac{1}{3}+\\frac{1}{6}').tex,'\\frac{1}{2}=0{,}5');
  // courbes
  const f=compileExpr('3x^{2}-2x+1',['x']); near('fonction 3x²−2x+1 en 2',f&&f({x:2}),9);
  const g=compileExpr('\\sin\\left(x\\right)',['x']); near('fonction sin(π/2)',g&&g({x:Math.PI/2}),1);
  const h=compileExpr('e^{x}',['x']); near('fonction eˣ en 0',h&&h({x:0}),1);
  // vérifier ses étapes
  { const a=relFunc(stepInfo('3x+2=8')), b=relFunc(stepInfo('3x=6')), c=relFunc(stepInfo('3x=10'));
    eq('vérifier ses étapes : étape juste',a&&b&&equivalent(a,b,['x']),true);
    eq('vérifier ses étapes : erreur repérée',a&&c&&equivalent(a,c,['x']),false);
    const i1=relFunc(stepInfo('-2x<6')), i2=relFunc(stepInfo('x<-3'));
    eq('vérifier ses étapes : sens d\u2019inégalité oublié',i1&&i2&&equivalent(i1,i2,['x']),false); }
  eq('export texte lisible',latexToUnicode('x^{2}+\\sqrt2'),'x²+√2');
  // mode examen
  { const before=state.settings.exam; state.settings.exam={on:true,calc:true,graph:false};
    eq('mode examen : aide-mémoire masqué',symsFor('lycee').some(x=>x.cat==='Formules'),false);
    eq('mode examen : abréviations coupées',Object.keys(userAbbr()).length,0);
    eq('mode examen : calculatrice coupée',examCut('calc'),true);
    state.settings.exam=before; }
  // alignement
  eq('découpage au signe =',splitTopEq('3x+2=8').length,2);
  // opérations posées
  eq('lecture de « 156 : 12 »',(parseOp('156 : 12')||{}).op,'÷');
  eq('lecture de « 123 x 45 »',(parseOp('123 x 45')||{}).op,'×');
  eq('lecture de « 52,4 − 7,85 »',(parseOp('52,4 − 7,85')||{}).op,'-');
  // probabilités et tableaux
  near('probabilité « 30 % »',parseP('30 %'),0.3); near('probabilité « 3/10 »',parseP('3/10'),0.3);
  eq('contraire de A',prettyEv('A barre'),'A̅');
  eq('valeur x « -inf »',prettyX('-inf'),'−∞');
  // lecture à voix haute
  eq('lecture x²−3x+2',latexToSpeech('x^{2}-3x+2'),'x au carré moins 3 x plus 2');
  eq('lecture d’un système',latexToSpeech('\\begin{cases}x+y=3\\\\x-y=1\\end{cases}'),'système : x plus y égale 3; x moins y égale 1.');
  // chaque type de bloc se construit sans erreur
  const samples={math:'3x+2=8',text:'# Titre',op:{expr:'123 × 45',res:{},ret:{},cells:{}},graph:{fns:['x^2'],view:null},
    tree:{levels:[['A',''],['B','']],p:{'0':'0,3'},prod:true},tab:newTab('var'),img:{src:'',w:100}};
  const box=document.createElement('div'); box.style.cssText='position:absolute;left:-9999px;top:0;width:900px'; document.body.append(box);
  Object.entries(samples).forEach(([type,value])=>{
    try{ const el=makeRowEl({id:'t'+type,type,value:JSON.parse(JSON.stringify(value))}); box.append(el); el.querySelectorAll('math-field').forEach(m=>m._setup&&m._setup()); if(el._afterMount) el._afterMount(); ok('bloc « '+BLOCKS[type].label+' »',true); }
    catch(e){ ok('bloc « '+BLOCKS[type].label+' »',false,String(e&&e.message||e)); }
  });
  ['+ 345 + 78','× 123 × 45','÷ 156 : 12'].forEach(x=>{ const [, ...rest]=x.split(' '); const expr=rest.join(' ');
    try{ const el=makeRowEl({id:'o'+expr,type:'op',value:{expr,res:{},ret:{},cells:{}}}); box.append(el); ok('opération posée '+expr, el.querySelectorAll('.op-grid input').length>0); }
    catch(e){ ok('opération posée '+expr,false,String(e&&e.message||e)); } });
  setTimeout(()=>box.remove(),500);
  ok('éditeur de formules MathLive chargé',!!MFE,'MathLive ne s’est pas chargé');
  ok('enregistrement dans le navigateur',canStore);
  return res;
}
function showSelfTest(){
  const res=runSelfTest(); const bad=res.filter(r=>!r.ok);
  const d=document.getElementById('helpBody');
  d.innerHTML='<h3>Auto-test : '+(res.length-bad.length)+' / '+res.length+' réussis</h3><table>'+res.map(r=>'<tr><td>'+(r.ok?'✅':'❌')+' '+r.name+'</td><td>'+(r.ok?'':r.detail)+'</td></tr>').join('')+'</table>';
  document.getElementById('helpDlg').classList.add('open');
  return res;
}
window.MathDysTest=runSelfTest;

/* ============ Démarrage ============ */
applySettings(); renderTools(); if(isExam()) applyExam(); renderPage();
refreshFileStatus();
const backupReminder=()=>{ if(isExam()) return; const n=state.pages.filter(p=>p.rows.some(r=>!isEmpty(r))).length; const last=state.lastBackup?new Date(state.lastBackup):null;
  if(n>=5 && (!last || Date.now()-last>30*864e5)) setTimeout(()=>toast('Pense à faire une sauvegarde complète de ton cahier ('+n+' pages)','Sauvegarder',saveAll),4000); };
const start=()=>{ const R=page().rows; focusRow(R[R.length-1].id,'end'); backupReminder(); if(location.hash==='#test') setTimeout(showSelfTest,600); else if(!state.seenHelp) openDlg('helpDlg'); };
if(window.customElements && customElements.whenDefined && MFE){ customElements.whenDefined('math-field').then(()=>setTimeout(start,150)); } else start();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>setTimeout(alignAll,50));
})();
