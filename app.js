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
function shortcutsFor(defaults){
  // retire les raccourcis par défaut qui empêcheraient les nôtres (ex. « in » avant « inf »)
  const out=Object.assign({},defaults||{});
  const mine=Object.keys(SHORTCUTS);
  Object.keys(out).forEach(d=>{ if(mine.some(m=>m!==d && m.startsWith(d))) delete out[d]; });
  return Object.assign(out,SHORTCUTS);
}
const symsFor=level=>ALLSYM.filter(s=>s.lvl<=LV[level]);

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
  return {pages:[p], current:p.id, settings:{level:'college', fs:20, lh:1.6, font:"'Lexend', Arial, sans-serif", theme:'clair', align:true, labels:true, check:true}, seenHelp:false};
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
function scheduleSave(dirty){ if(dirty!==false){ const p=page(); if(p) p.dirty=true; } clearTimeout(saveTimer); saveTimer=setTimeout(save,400); refreshFileStatus(); }
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }
  catch(e){ canStore=false; }
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

/* ============ Rendu ============ */
const paper=document.getElementById('paper');
const els=new Map();
let currentId=null;

function makeRowEl(row){
  const el=document.createElement('div');
  el.className='row row-'+row.type; el.dataset.id=row.id;
  const g=document.createElement('button');
  g.className='gutter'; g.tabIndex=-1;
  g.textContent = row.type==='math'?'ƒx':row.type==='text'?'Aa':row.type==='graph'?'📈':row.type==='tree'?'P':'+−';
  g.title = row.type==='op' ? 'Opération posée' : row.type==='graph' ? 'Graphique' : row.type==='tree' ? 'Arbre de probabilités' : 'Ligne de '+(row.type==='math'?'calcul':'texte')+' — clic pour changer (Ctrl+M)';
  g.addEventListener('mousedown',e=>e.preventDefault());
  g.addEventListener('click',()=>{ if(row.type==='math'||row.type==='text') toggleType(row.id); });
  const body=document.createElement('div'); body.className='body';
  const del=document.createElement('button'); del.className='rdel'; del.tabIndex=-1; del.textContent='🗑';
  del.title='Supprimer ce bloc (Ctrl+Maj+Retour arrière)';
  del.addEventListener('mousedown',e=>e.preventDefault());
  del.addEventListener('click',()=>deleteRow(row.id));
  el.append(g,body,del);
  if(row.type==='math') buildMath(row,body);
  else if(row.type==='text') buildText(row,body);
  else if(row.type==='graph') buildGraph(row,body);
  else if(row.type==='tree') buildTree(row,body);
  else buildOp(row,body);
  return el;
}

function buildMath(row,body){
  if(!MFE){ const t=document.createElement('div'); t.className='txt'; t.textContent=row.value; body.append(t); return; }
  const mf=document.createElement('math-field');
  mf.setAttribute('math-virtual-keyboard-policy','manual');
  body.append(mf);
  const msg=document.createElement('div'); msg.className='calcmsg'; body.append(msg);
  mf.addEventListener('input',()=>{ row.value=mf.value; msg.textContent=''; scheduleSave(); scheduleAlign(); });
  mf.addEventListener('move-out',e=>{
    const d=e.detail && e.detail.direction;
    if(d==='upward'){ const p=prevId(row.id); if(p){ e.preventDefault(); focusRow(p,'end'); } }
    else if(d==='downward'){ const n=nextId(row.id); if(n){ e.preventDefault(); focusRow(n,'end'); } }
  });
  mf._setup=()=>setupMF(mf, row.value||'', '\\text{calcul…}');
}
// configuration d'un champ de formule une fois dans la page
function setupMF(mf,value,ph){
  try{ mf.mathVirtualKeyboardPolicy='manual'; }catch(e){}
  try{ mf.inlineShortcuts=shortcutsFor(mf.inlineShortcuts); }catch(e){}
  try{ mf.smartFence=true; mf.smartSuperscript=true; }catch(e){}
  try{ mf.menuItems=[]; }catch(e){}
  try{ if(ph) mf.placeholder=ph; }catch(e){}
  try{ mf.value=value; }catch(e){}
  mf.addEventListener('focus',()=>{ lastMF=mf; });
}
let lastMF=null;

function buildText(row,body){
  const t=document.createElement('div');
  t.className='txt'; t.contentEditable='true'; t.spellcheck=true;
  t.dataset.ph='Texte… (commence par # pour un titre)';
  t.textContent=row.value||'';
  const upd=()=>t.classList.toggle('title',/^#\s/.test(t.textContent));
  upd();
  t.addEventListener('input',()=>{ row.value=t.innerText.replace(/\n$/,''); upd(); scheduleSave(); });
  t.addEventListener('paste',e=>{ e.preventDefault(); const s=(e.clipboardData||window.clipboardData).getData('text'); document.execCommand('insertText',false,s); });
  body.append(t);
}

/* ---------- Opération posée ---------- */
function buildOp(row,body){
  if(!row.value || typeof row.value!=='object') row.value={expr:'',res:{},ret:{}};
  const box=document.createElement('div'); box.className='op';
  const inp=document.createElement('input'); inp.className='op-expr';
  inp.placeholder='Opération à poser, ex : 345 + 78   ou   52,4 − 7,85'; inp.value=row.value.expr||'';
  const wrap=document.createElement('div'); wrap.className='op-wrap';
  const grid=document.createElement('div'); grid.className='op-grid';
  const side=document.createElement('div'); side.className='op-side';
  const msg=document.createElement('div'); msg.className='op-msg';
  wrap.append(grid,side); box.append(inp,wrap,msg); body.append(box);
  inp.addEventListener('input',()=>{ row.value.expr=inp.value; row.value.res={}; row.value.ret={}; drawOp(row,grid,side,msg); scheduleSave(); });
  drawOp(row,grid,side,msg);
}
function parseOp(s){
  s=(s||'').replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/\./g,',');
  const m=s.match(/^(\d+(?:,\d+)?)([+\-x×*])(\d+(?:,\d+)?)$/);
  if(!m) return null;
  return {a:m[1],op:m[2]==='+'?'+':m[2]==='-'?'-':'×',b:m[3]};
}
function drawOp(row,grid,side,msg){
  grid.innerHTML=''; side.innerHTML=''; msg.textContent='';
  const p=parseOp(row.value.expr);
  if(!p){ if(row.value.expr) msg.textContent='Écris deux nombres séparés par + ou −, par exemple 345 + 78.'; return; }
  if(p.op==='×'){ msg.textContent='La multiplication posée arrive dans la prochaine version. Pour l\u2019instant : + et −.'; return; }
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
function cellInput(row,kind,place){
  const i=document.createElement('input');
  i.inputMode='numeric'; i.maxLength=1; i.autocomplete='off';
  i.dataset.kind=kind; i.dataset.place=place;
  i.value=(row.value[kind]&&row.value[kind][place])||'';
  i.addEventListener('keydown',e=>opKey(e,row,i));
  i.addEventListener('focus',()=>i.select());
  return i;
}
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
  function focusMF(mf){ mf.focus(); requestAnimationFrame(()=>{ try{ mf.executeCommand('moveToMathfieldEnd'); }catch(e){} }); }
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
    for(let x=Math.ceil(v.xmin/sx)*sx;x<=v.xmax;x+=sx){ if(Math.abs(x)<sx/2) continue; c.fillText(frNum(x),X(x),Math.min(ax+4,H-16)); }
    c.textAlign='right'; c.textBaseline='middle';
    for(let y=Math.ceil(v.ymin/sy)*sy;y<=v.ymax;y+=sy){ if(Math.abs(y)<sy/2) continue; c.fillText(frNum(y),Math.max(ay-5,30),Y(y)); }
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
    const rowH=Math.round(fs*2.1), colW=Math.round(fs*8.5), nodeW=Math.round(fs*2.2);
    const W=24+nL*colW+nodeW+(V.prod!==false?fs*16:20), H=leaves*rowH+8;
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
        inp.addEventListener('input',()=>{ if(inp.value) V.p[path]=inp.value; else delete V.p[path]; changed(); });
        stage.append(inp); probInputs.push(inp);
        if(L<nL-1) place(L+1,path,x+nodeW,y,s);
        else if(V.prod!==false){ const pr=document.createElement('span'); pr.className='tprod'; pr.style.left=(x+nodeW+8)+'px'; pr.style.top=y+'px'; pr.dataset.path=path; stage.append(pr); prods.push(pr); }
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
      if(empty.length===1 && sum<=1+1e-9){ const r=Math.round((1-sum)*1e9)/1e9; empty[0].placeholder=fmtP(r); empty[0].dataset.auto=r; }
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

/* ---------- Insertion dans la page ---------- */
function mount(row, afterEl){
  const el=makeRowEl(row);
  if(afterEl && afterEl.nextSibling) paper.insertBefore(el, afterEl.nextSibling);
  else if(afterEl) paper.append(el);
  else paper.append(el);
  els.set(row.id, el);
  el.querySelectorAll('math-field').forEach(mf=>{ if(mf._setup) mf._setup(); });
  if(el._afterMount) el._afterMount();
  return el;
}
function renderPage(){
  paper.innerHTML=''; els.clear();
  page().rows.forEach(r=>mount(r,null));
  renderPageList();
  setTimeout(alignAll,60); setTimeout(alignAll,400); setTimeout(alignAll,1200);
}
function renderPageList(){
  const sel=document.getElementById('pageSel'); sel.innerHTML='';
  state.pages.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=p.title||'Sans titre'; if(p.id===state.current) o.selected=true; sel.append(o); });
  const o=document.createElement('option'); o.value='__del'; o.textContent='🗑 Supprimer cette page…'; sel.append(o);
  document.getElementById('pageTitle').value=page().title||'';
  refreshFileStatus();
}

/* ---------- Actions sur les lignes ---------- */
function focusRow(id,where){
  if(!id) return; const el=els.get(id); if(!el) return;
  const mf=el.querySelector('math-field');
  if(mf){ mf.focus(); requestAnimationFrame(()=>{ try{ mf.executeCommand(where==='start'?'moveToMathfieldStart':'moveToMathfieldEnd'); }catch(e){} }); }
  else if(el.querySelector('.txt')){ const t=el.querySelector('.txt'); t.focus(); const r=document.createRange(); r.selectNodeContents(t); r.collapse(where==='start'); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
  else { const i=el.querySelector('.op-expr'); if(i) i.focus(); }
  setCurrent(id);
  el.scrollIntoView({block:'nearest'});
}
function setCurrent(id){
  if(currentId && els.get(currentId)) els.get(currentId).classList.remove('current');
  currentId=id; const el=els.get(id); if(el) el.classList.add('current');
}
function addRowAfter(id,type,value){
  const R=page().rows; const i=id?idx(id):R.length-1;
  const row={id:uid(),type,value: value!==undefined?value:(type==='op'?{expr:'',res:{},ret:{}}:type==='graph'?{fns:[''],view:null}:type==='tree'?{levels:[['A',''],['B','']],p:{},prod:true}:'')};
  R.splice(i+1,0,row);
  mount(row, id?els.get(id):paper.lastElementChild);
  focusRow(row.id, type==='op'?'start':'end');
  scheduleSave(); scheduleAlign();
  return row;
}
function duplicate(id){
  const r=rowById(id); if(!r) return;
  addRowAfter(id, r.type, JSON.parse(JSON.stringify(r.value)));
  toast('Ligne recopiée — corrige ce qui change');
}
function removeRow(id){
  const R=page().rows; const i=idx(id); if(i<0||R.length<=1) return;
  R.splice(i,1); const el=els.get(id); if(el) el.remove(); els.delete(id);
  scheduleSave(); scheduleAlign();
}
// suppression avec possibilité d'annuler
function deleteRow(id){
  const R=page().rows; const i=idx(id); if(i<0) return;
  const saved=JSON.parse(JSON.stringify(R[i])); const pid=page().id;
  const focusTo=prevId(id)||nextId(id);
  if(R.length<=1){ R.push({id:uid(),type:'math',value:''}); mount(R[R.length-1],els.get(id)); }
  removeRow(id);
  focusRow(focusTo||page().rows[0].id,'end');
  const names={math:'Ligne de calcul',text:'Ligne de texte',op:'Opération posée',graph:'Graphique',tree:'Arbre'};
  toast(names[saved.type]+' supprimé'+(['op','graph','tree'].includes(saved.type)?'':'e'),'Annuler',()=>{
    if(page().id!==pid) return;
    const rows=page().rows; const at=Math.min(i,rows.length);
    rows.splice(at,0,saved);
    const prevEl = at>0 ? els.get(rows[at-1].id) : null;
    if(prevEl) mount(saved,prevEl); else { const el=mount(saved,null); paper.insertBefore(el,paper.firstChild); }
    focusRow(saved.id,'end'); scheduleSave(); scheduleAlign();
  });
}
function toggleType(id){
  const r=rowById(id); if(!r||r.type==='op') return;
  r.type = r.type==='math'?'text':'math';
  if(typeof r.value!=='string') r.value='';
  const old=els.get(id); const el=makeRowEl(r); old.replaceWith(el); els.set(id,el);
  const mf=el.querySelector('math-field'); if(mf&&mf._setup) mf._setup();
  focusRow(id,'end'); scheduleSave(); scheduleAlign();
}
function isEmpty(r){ return r.type==='op' ? !(r.value&&r.value.expr) : (r.type==='graph'||r.type==='tree') ? false : !r.value; }

/* ---------- Calculatrice intégrée (Ctrl+Entrée) ---------- */
function splitTopEq(s){ const out=[]; let d=0,cur=''; for(const ch of s){ if(ch==='{')d++; if(ch==='}')d--; if(ch==='='&&d===0){out.push(cur);cur='';} else cur+=ch; } out.push(cur); return out; }
/* LaTeX → expression simple, puis petit analyseur (sans eval). Sert à la calculatrice et aux graphiques. */
function normLatex(s){
  let t=s.replace(/\\m?left|\\m?right/g,'').replace(/\{,\}/g,'.').replace(/(\d),(\d)/g,'$1.$2');
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

/* ============ Clavier ============ */
window.addEventListener('keydown',e=>{
  if(e.key==='F1'){ e.preventDefault(); openDlg('helpDlg'); return; }
  if(e.key==='Escape'){ const o=document.querySelectorAll('.overlay.open'); if(o.length){ o.forEach(x=>x.classList.remove('open')); if(currentId) focusRow(currentId,'end'); } return; }
  if(document.querySelector('.overlay.open')) return;
  const ctrl=e.ctrlKey||e.metaKey; const k=e.key.toLowerCase();
  const stop=()=>{ e.preventDefault(); e.stopPropagation(); };
  if(ctrl && !e.shiftKey && !e.altKey && k==='k'){ stop(); openSearch(); return; }
  if(ctrl && !e.altKey && k==='s'){ stop(); saveFile(e.shiftKey); return; }
  if(ctrl && !e.shiftKey && !e.altKey && k==='o'){ stop(); openFile(); return; }
  const t=e.target; const rowEl=t&&t.closest?t.closest('.row'):null;
  if(!rowEl) return;
  const id=rowEl.dataset.id; const row=rowById(id); if(!row) return;
  if(ctrl && e.shiftKey && e.key==='Backspace'){ stop(); deleteRow(id); return; }
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
    if(row.type==='op' && t.classList.contains('op-expr')){ stop(); const g=rowEl.querySelector('.op-grid'); const ps=opPlaces(g); if(ps.length){ opCell(g,'res',ps[ps.length-1]).focus(); } return; }
    stop();
    let type = row.type==='op' ? 'math' : row.type;
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
    if(e.key==='ArrowDown'){ const g=rowEl.querySelector('.op-grid'); const ps=opPlaces(g); if(ps.length){ stop(); opCell(g,'res',ps[ps.length-1]).focus(); return; } }
    if(tgt){ stop(); focusRow(tgt,'end'); } return;
  }
},true);
document.addEventListener('focusin',e=>{ const r=e.target.closest&&e.target.closest('.row'); if(r) setCurrent(r.dataset.id); });

/* ============ Barre d'outils ============ */
function renderTools(){
  const box=document.getElementById('tools'); box.innerHTML='';
  const act=(label,keys,fn,title)=>{ const b=document.createElement('button'); b.className='tool'; b.title=title||label;
    b.innerHTML='<span>'+label+'</span>'+(keys?' <kbd>'+keys+'</kbd>':''); b.addEventListener('mousedown',e=>e.preventDefault()); b.addEventListener('click',fn); box.append(b); };
  act('＋ Calcul','Entrée',()=>addRowAfter(currentId,'math'),'Nouvelle ligne de calcul');
  act('＋ Texte','Maj+Entrée',()=>addRowAfter(currentId,'text'),'Nouvelle ligne de texte');
  if(state.settings.level!=='lycee') act('＋ Opération posée','Ctrl+Maj+Entrée',()=>addRowAfter(currentId,'op'));
  act('Dupliquer','Ctrl+D',()=>{ if(currentId) duplicate(currentId); });
  act('Calculer','Ctrl+Entrée',()=>{ const r=currentId&&rowById(currentId); if(r&&r.type==='math') compute(currentId); else toast('Place-toi sur une ligne de calcul'); });
  if(state.settings.level!=='primaire') act('＋ Graphique','Ctrl+G',()=>addRowAfter(currentId,'graph'),'Tracer des fonctions');
  if(state.settings.level!=='primaire') act('＋ Arbre de probas','Ctrl+B',()=>addRowAfter(currentId,'tree'),'Arbre de probabilités');
  act('🔍 Symbole','Ctrl+K',openSearch,'Chercher un symbole par son nom');
  renderCats();
}
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
  if(tpl[0]==='@'){ addRowAfter(currentId,tpl.slice(1)); return; }
  const mf=targetMF(); if(!mf) return;
  mf.focus();
  try{ mf.insert(tpl,{focus:true, selectionMode:'placeholder', format:'latex'}); }catch(e){ try{ mf.executeCommand(['insert',tpl]); }catch(_){} }
  mf.dispatchEvent(new Event('input',{bubbles:true}));
}

/* ---------- Recherche de symbole par son nom (Ctrl+K) ---------- */
const deacc=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
let srchSel=0, srchRes=[], srchMF=null;
function openSearch(){
  srchMF = (lastMF && document.body.contains(lastMF)) ? lastMF : null;
  const inp=document.getElementById('srchIn'); inp.value=''; doSearch();
  openDlg('srchDlg'); setTimeout(()=>inp.focus(),30);
}
function doSearch(){
  const q=deacc(document.getElementById('srchIn').value.trim());
  const L=LV[state.settings.level];
  srchRes=ALLSYM.map(s=>{ const hay=deacc(s.name+' '+s.kw+' '+s.cat+' '+(s.key||''));
      let sc= !q?1 : deacc(s.name).startsWith(q)?3 : hay.split(/\s+/).some(w=>w.startsWith(q))?2 : hay.includes(q)?1:0;
      if(sc && s.lvl<=L) sc+=0.5; return {s,sc}; })
    .filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc).slice(0,40).map(x=>x.s);
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
    ['Chiffre du résultat','le curseur passe tout seul à la colonne de gauche'],
    ['<kbd>↑</kbd> / <kbd>↓</kbd>','aller écrire une retenue / revenir au résultat'],
  ]);
  h+='<p style="font-size:.75em;color:var(--muted);margin-top:1em">Les boutons de la barre du haut font la même chose et rappellent le raccourci : utilise-les au début, puis passe au clavier. Ton travail est gardé dans ce navigateur en attendant, mais <b>pense à l\u2019enregistrer dans un fichier</b> (Ctrl+S) : c\u2019est lui qui compte.</p>';
  h+='<h3>Enregistrer et ouvrir</h3>'+rows([
    ['<kbd>Ctrl</kbd>+<kbd>S</kbd>','enregistrer le cahier dans un fichier <b>.mathdys</b> sur ton ordinateur. Les fois suivantes, le même fichier est mis à jour (Chrome, Edge) ou un nouveau est téléchargé (Firefox, Safari)'],
    ['<kbd>Ctrl</kbd>+<kbd>Maj</kbd>+<kbd>S</kbd>','enregistrer sous un autre nom'],
    ['<kbd>Ctrl</kbd>+<kbd>O</kbd>','ouvrir un cahier .mathdys — ou glisse le fichier sur la page'],
    ['Pastille rouge en haut','il y a des changements pas encore enregistrés dans le fichier'],
  ]);
  h+='<p style="font-size:.75em;margin-top:1em">Une idée, un bug ? Écris à <a href="mailto:git.public@protonmail.com?subject=MathDys">git.public@protonmail.com</a></p>';
  document.getElementById('helpBody').innerHTML=h;
}

/* ============ Fenêtres, réglages, pages ============ */
function openDlg(id){ if(id==='helpDlg') renderHelp(); document.getElementById(id).classList.add('open'); }
document.querySelectorAll('.overlay').forEach(o=>{
  o.addEventListener('click',e=>{ if(e.target===o||e.target.hasAttribute('data-close')){ o.classList.remove('open'); if(o.id==='helpDlg'&&!state.seenHelp){state.seenHelp=true;scheduleSave(false);} if(currentId) focusRow(currentId,'end'); } });
});
let askCb=null;
function ask(text,cb){ document.getElementById('askText').textContent=text; askCb=cb; openDlg('askDlg'); }
document.getElementById('askOk').addEventListener('click',()=>{ document.getElementById('askDlg').classList.remove('open'); if(askCb) askCb(); askCb=null; });

function applySettings(){
  const s=state.settings, r=document.documentElement.style;
  r.setProperty('--fs',s.fs+'px'); r.setProperty('--lh',s.lh); r.setProperty('--font',s.font);
  document.body.className='theme-'+s.theme;
  document.getElementById('levelSel').value=s.level;
  scheduleAlign();
  requestAnimationFrame(()=>{ document.querySelectorAll('.graph').forEach(g=>g._draw&&g._draw()); document.querySelectorAll('.tree').forEach(t=>t._relayout&&t._relayout()); });
}
const bind=(id,key,conv,ev)=>{ const el=document.getElementById(id);
  if(el.type==='checkbox') el.checked=!!state.settings[key]; else el.value=state.settings[key];
  el.addEventListener(ev||'input',()=>{ state.settings[key]= el.type==='checkbox'?el.checked:conv(el.value); applySettings(); if(key==='labels'||key==='check') renderPage(); scheduleSave(false); }); };
bind('sFs','fs',Number); bind('sLh','lh',Number); bind('sFont','font',String,'change'); bind('sTheme','theme',String,'change');
bind('sAlign','align',Boolean,'change'); bind('sLabels','labels',Boolean,'change'); bind('sCheck','check',Boolean,'change');
document.getElementById('levelSel').addEventListener('change',e=>{ state.settings.level=e.target.value; renderTools(); scheduleSave(false); toast('Niveau : '+e.target.selectedOptions[0].textContent); });
document.getElementById('settingsBtn').addEventListener('click',()=>openDlg('setDlg'));
document.getElementById('helpBtn').addEventListener('click',()=>openDlg('helpDlg'));
document.getElementById('newPage').addEventListener('click',()=>{ const p=newPage(); state.pages.push(p); state.current=p.id; renderPage(); scheduleSave(); focusRow(p.rows[0].id,'end'); });
document.getElementById('pageSel').addEventListener('change',e=>{
  const v=e.target.value;
  if(v==='__del'){ e.target.value=state.current;
    ask('Supprimer la page « '+(page().title||'Sans titre')+' » ?',()=>{ state.pages=state.pages.filter(p=>p.id!==state.current); if(!state.pages.length) state.pages.push(newPage()); state.current=state.pages[0].id; renderPage(); scheduleSave(); });
    return; }
  state.current=v; renderPage(); scheduleSave();
});
document.getElementById('pageTitle').addEventListener('input',e=>{ page().title=e.target.value; const o=document.querySelector('#pageSel option[value="'+state.current+'"]'); if(o) o.textContent=e.target.value||'Sans titre'; scheduleSave(); });
document.getElementById('pageTitle').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); const r=page().rows[0]; if(r) focusRow(r.id,'end'); } });
document.getElementById('copyBtn').addEventListener('click',async()=>{
  const lines=page().rows.map(r=> r.type==='math' ? '$'+r.value+'$' : r.type==='op' ? '[opération posée] '+(r.value.expr||'') : r.type==='tree' ? '[arbre] '+r.value.levels.map(l=>l.map(prettyEv).join('/')).join(' puis ') : r.type==='graph' ? '[graphique] '+r.value.fns.map((f,i)=>GNAMES[i%GNAMES.length]+'(x)=$'+f+'$').join(' ; ') : r.value);
  const txt=(page().title?page().title+'\n\n':'')+lines.join('\n');
  try{ await navigator.clipboard.writeText(txt); toast('Page copiée (les calculs en LaTeX)'); }
  catch(e){ toast('Copie refusée par le navigateur'); }
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
      if(!h||as){ h=await window.showSaveFilePicker({suggestedName:p.fileName&&!as?p.fileName:name, types:FTYPES}); handles.set(p.id,h); }
      const w=await h.createWritable(); await w.write(data); await w.close();
      p.fileName=h.name;
    } else {
      const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=name; document.body.append(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000); p.fileName=name;
    }
    p.dirty=false; save(); toast('Enregistré dans « '+p.fileName+' »');
  }catch(e){
    if(e && e.name==='AbortError') return;
    toast('Enregistrement impossible ici. Utilise « Copier » en attendant.');
  }
}
async function openFile(){
  if(window.showOpenFilePicker){
    try{ const [h]=await window.showOpenFilePicker({types:FTYPES.concat([{description:'JSON',accept:{'application/json':['.json']}}])});
      const f=await h.getFile(); loadFileText(await f.text(), h.name, h); }
    catch(e){ if(!e || e.name!=='AbortError') document.getElementById('fileIn').click(); }
  } else document.getElementById('fileIn').click();
}
const KNOWN=['math','text','op','graph','tree'];
function loadFileText(txt,name,handle){
  let d=null; try{ d=JSON.parse(txt); }catch(e){}
  if(!d || d.app!=='MathDys' || !Array.isArray(d.rows)){ toast('« '+name+' » n\u2019est pas un cahier MathDys'); return; }
  const rows=d.rows.filter(r=>r&&KNOWN.includes(r.type)).map(r=>Object.assign({},r,{id:uid()}));
  if(!rows.length) rows.push({id:uid(),type:'math',value:''});
  const title=d.title||name.replace(/\.[^.]+$/,'');
  let p=state.pages.find(q=>q.fileName===name);
  if(p){ p.title=title; p.rows=rows; }
  else { p={id:uid(),title,rows}; state.pages.push(p); }
  p.fileName=name; p.dirty=false; state.current=p.id;
  if(handle) handles.set(p.id,handle); else handles.delete(p.id);
  // retire la page vide de départ si elle n'a jamais servi
  state.pages=state.pages.filter(q=>q===p || q.dirty || q.fileName || q.rows.some(r=>!isEmpty(r)));
  renderPage(); save(); toast('« '+name+' » ouvert');
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
  const f=e.dataTransfer.files[0]; if(f) loadFileText(await f.text(), f.name, null); });
window.addEventListener('beforeunload',e=>{ if(state.pages.some(p=>p.dirty && p.rows.some(r=>!isEmpty(r)))){ e.preventDefault(); e.returnValue=''; } });

let toastT=null;
function toast(t,actLabel,actFn){
  const el=document.getElementById('toast'); el.textContent=t; el.classList.remove('act');
  if(actLabel){ const b=document.createElement('button'); b.textContent=actLabel;
    b.addEventListener('click',()=>{ el.classList.remove('show','act'); actFn(); }); el.append(b); el.classList.add('act'); }
  el.classList.add('show'); clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove('show','act'), actLabel?6000:1800);
}

/* ============ Démarrage ============ */
applySettings(); renderTools(); renderPage();
refreshFileStatus();
const start=()=>{ const R=page().rows; focusRow(R[R.length-1].id,'end'); if(!state.seenHelp) openDlg('helpDlg'); };
if(window.customElements && customElements.whenDefined && MFE){ customElements.whenDefined('math-field').then(()=>setTimeout(start,150)); } else start();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>setTimeout(alignAll,50));
})();
