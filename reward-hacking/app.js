'use strict';
const D=window.ATLAS, $=id=>document.getElementById(id);
const format=n=>n.toLocaleString('en-US');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=u=>/^https?:\/\//i.test(u||'')?esc(u):'';
const link=(u,label)=>safe(u)?`<a href="${safe(u)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';
const works=new Map(D.works.map(w=>[w.id,w])),core=D.works.filter(w=>w.area), outgoing=new Map(),incoming=new Map();
function push(m,k,v){if(!m.has(k))m.set(k,[]);m.get(k).push(v)}
for(const [s,t,a] of D.edges){push(outgoing,s,[t,a]);push(incoming,t,s)}
const countCites=id=>(incoming.get(id)||[]).length;
const AREAS={
 Mitigation:['Mitigation','#528c82','Changes the reward, policy, verifier, or training procedure.'],
 Behavior:['Behavioral studies','#d68a56','Elicits, explains, or tests the transfer of a shortcut.'],
 Benchmarking:['Benchmarking','#688bb6','Builds or audits tasks, datasets, and evaluation protocols.'],
 Detection:['Detection','#ba7798','Tests whether a monitor or diagnostic identifies hacking.'],
 Theory:['Theory','#9386b7','Formalizes incentives, assumptions, or bounds.'],
 Synthesis:['Reviews & synthesis','#99a35c','Organizes findings across studies or domains.']
};
const areaKeys=Object.keys(AREAS).sort((a,b)=>core.filter(w=>w.area===b).length-core.filter(w=>w.area===a).length);
const areaCount=a=>core.filter(w=>w.area===a).length;
const repIds=new Set(D.replications.filter(r=>r.type!=='Adaptation').map(r=>r.id));
const eligible=core.filter(w=>w.entries>0);
const workBtn=(id,cl='paper-btn')=>`<button class="${cl}" data-work="${esc(id)}">${esc(works.get(id)?.title||id)}</button>`;
const libLink=(query={})=>'#library?'+new URLSearchParams(query);
const citeLink=(id,label)=>`<a href="#paper/${encodeURIComponent(id)}">${esc(label)}</a>`;
const yearOptions=[...new Set(D.works.map(w=>Number(w.year)).filter(y=>Number.isInteger(y)&&y>0))].sort((a,b)=>b-a);
$('area-filter').innerHTML='<option value="">All areas</option>'+areaKeys.map(a=>`<option value="${a}">${AREAS[a][0]}</option>`).join('');
$('year-filter').innerHTML='<option value="">All years</option>'+yearOptions.map(y=>`<option>${y}</option>`).join('');
let page=1,matches=[],lastRoute='#atlas',workReturn='#atlas';
function fields(){return {q:$('query').value.trim(),stratum:$('stratum').value,collection:$('collection').value,area:$('area-filter').value,year:$('year-filter').value,sort:$('sort').value}}
function loadFilters(params){
 for(const [field,id,val] of [['q','query',''],['collection','collection','core'],['area','area-filter',''],['year','year-filter',''],['sort','sort','recent'],['stratum','stratum','']]){
  $(id).value=params.get(field)||val;if($(id).selectedIndex===-1)$(id).value=val
 }if(params.get('stratum'))$('advanced').open=true;page=1;library()
}
function updateFilters(){page=1;const f=fields();if(f.area&&f.collection==='reference'){$('collection').value='core';f.collection='core'}history.replaceState(null,'',libLink(f));lastRoute=location.hash;library()}
for(const id of ['area-filter','year-filter','sort','collection','stratum'])$(id).onchange=()=>{if(id==='collection'&&$('collection').value==='reference')$('area-filter').value='';updateFilters()};
$('query').oninput=updateFilters;$('clear').onclick=()=>{history.replaceState(null,'','#library');lastRoute='#library';loadFilters(new URLSearchParams())};
function library(){
 const f=fields(),tokens=f.q.toLowerCase().split(/\s+/).filter(Boolean);
 matches=D.works.filter(w=>{
  if(f.collection==='core'&&!w.area||f.collection==='reference'&&w.area||f.collection==='replication'&&!repIds.has(w.id)||f.area&&w.area!==f.area||f.year&&String(w.year)!==f.year)return false;
  if(f.stratum&&f.stratum!==w.stratum)return false;
  const search=[w.title,w.authors,w.id,w.doi,w.url].join(' ').toLowerCase();
  return tokens.every(t=>search.includes(t))
 }).sort((a,b)=>(f.sort==='title'?0:f.sort==='influence'?countCites(b.id)-countCites(a.id):(b.year||0)-(a.year||0))||a.title.localeCompare(b.title));
 showPage()
}
const pageSize=25;
function showPage(){
 $('results').textContent=format(matches.length)+' matching works';
 $('library-rows').innerHTML=matches.slice((page-1)*pageSize,page*pageSize).map(w=>`<div class="list-row"><div>${workBtn(w.id)}<p class="muted">${w.year||'Year unavailable'} · ${esc(shortAuthors(w.authors)||'Author metadata unavailable')} · ${countCites(w.id)} citing core works</p></div><span class="tag ${w.area?'':'ref'}">${w.area?AREAS[w.area][0]:'Cited work'}</span></div>`).join('')||'<p class="empty">No works match these filters.</p>';
 $('prev').disabled=page<=1;$('next').disabled=page*pageSize>=matches.length;$('page-index').textContent=matches.length?`Page ${page} of ${Math.ceil(matches.length/pageSize)}`:'0 results';
}
function shortAuthors(a){return a?.length>120?a.slice(0,115).replace(/[, ]+\S*$/,'')+'…':a}
$('prev').onclick=()=>{page--;showPage();$('results').scrollIntoView({block:'center'})};$('next').onclick=()=>{page++;showPage();$('results').scrollIntoView({block:'center'})};
function save(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('export-data').onclick=()=>save('reward-hacking-atlas.json',JSON.stringify(D),'application/json');
$('export-library').onclick=()=>{const rows=[['Title','Authors','Year','Primary area','Collection','ID','Source URL','Citing core works'],...matches.map(w=>[w.title,w.authors,w.year,w.area,w.area?'Core':'Reference',w.id,w.url,countCites(w.id)])];save('reward-hacking-library.csv',rows.map(r=>r.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\r\n'),'text/csv')};
function repHTML(r){
 return `<div class="rep-record"><p class="eyebrow">${esc(r.type.toUpperCase())}</p>${workBtn(r.id)}<p class="muted">Original work · ${citeLink(r.target,works.get(r.target)?.title||r.target)}</p><p>${esc(r.note)}</p>${link(r.source,'Evidence in source')}</div>`;
}
$('review-content').innerHTML=window.REVIEW_HTML+'<section id="replication-section"><h2>Replication evidence</h2><p>These relationships have an identifiable original study and a source describing what the later authors repeated or changed. An adaptation changes the task, model, or evaluation protocol. Coverage is selective.</p>'+D.replications.map(repHTML).join('')+'</section>';
const unc=core.filter(w=>!w.entries),raw=D.works.filter(w=>w.rawOnly).length;
const countMethod=m=>core.filter(w=>w.bibMethod===m).length;
$('method-content').innerHTML=`<h2>Search and selection</h2><p>The cutoff is 18 November 2026. We include papers published from January 2020 through the cutoff. We exclude cited records whose publication year is unknown or outside this window. Four arXiv queries initially returned ${format(D.candidates)} distinct records. We screened titles and relevant abstract passages, added studies from primary-source searches and bibliographies, and checked selected Crossref and OpenReview records. A record enters the core collection when it contributes a definition, measurement, explanation, intervention, or synthesis relevant to proxy exploitation. Application studies qualify when the abstract identifies a specific behavior or intervention.</p><p>The search includes preprints, proceedings papers, journal articles, and selected technical reports. English search terms, relevance-ranked publisher results, renamed papers, unpublished work, and indexing delays limit recall. A cluster count describes this collection. It cannot establish the total size of the field.</p><details><summary>Search queries and screening decisions</summary>${D.searches.map(s=>`<p><b>arXiv · ${s.retrieved} results</b><br><code>${esc(s.query)}</code></p>`).join('')}${(D.publisherSearch.queries||[]).map(s=>`<p><b>${esc(s.source)}</b> · ${esc(s.query)} · ${esc(s.returned??s.status??'targeted search')} ${link(s.url,'Search')}</p>`).join('')}<p><a href="screening.csv" download>Download the arXiv screening register</a> · <a href="publisher-search.json" download>Publisher search log</a></p></details>
 <h2>How we classified the work</h2><p>Each core work has one primary contribution. A benchmark paper may also demonstrate the behavior or propose a mitigation. The primary label makes the area totals additive. The review and replication records describe overlaps. “Behavioral studies” includes original demonstrations and transfer experiments. The verified reproduction and replication count requires an explicit link to an earlier study.</p><table class="review-table"><thead><tr><th>Primary area</th><th>Inclusion rule</th></tr></thead><tbody>${areaKeys.map(a=>`<tr><td>${AREAS[a][0]}</td><td>${AREAS[a][2]}</td></tr>`).join('')}</tbody></table>
 <h2>How we collected citations</h2><p>We followed each core work’s outgoing references one step. A citation can lead to another core study, a methods paper, a book, software, or a report. We used versioned arXiv bibliographies available by the cutoff, PDF reference sections, publisher bibliographies, and index records. For the UK AI Security Institute report we recorded inline links to research publications. Each work record names its bibliography source.</p><p>${format(eligible.length)} of ${format(core.length)} core works have at least one recovered reference. The dataset contains ${format(D.edges.length)} distinct directed links. An indexed list may omit items, and a recovered list does not certify complete extraction. We match arXiv IDs, DOIs, and normalized titles. ${format(raw)} records retain citation text where a title could not be isolated. Spelling and version differences can leave duplicate records.</p><details><summary>Works without in-period references (${unc.length})</summary>${unc.map(w=>'<p>'+workBtn(w.id)+'</p>').join('')||'<p>All core records have a recovered bibliography.</p>'}</details>
 <h2>Reading the map</h2><p>Each bubble represents one screened paper. Color indicates its primary contribution. The bars count papers in each category. Select a bubble for the paper or select a bar for its category. Each record lists recovered citations within the publication window.</p><p>Years refer to first arXiv submission or the cited publication’s recorded year. The 2026 count is partial. Bibliographic years and titles for cited-only records follow the citing source or identifier metadata. Anonymous submissions and technical reports carry different levels of review. Area counts do not weight study quality. “Cited by” counts only citing works in this collection. Download the dataset to inspect every work, directed link, and replication record.</p>`;
function openWork(id){if(!works.has(id))return;if(!$('paper').open)workReturn=location.hash||'#atlas';location.hash='#paper/'+encodeURIComponent(id)}
function details(id){
 const w=works.get(id);if(!w)return;
 const outs=outgoing.get(id)||[],ins=incoming.get(id)||[];
 const related=D.replications.filter(r=>r.id===id||r.target===id);
 const bib=w.bibSource||'';
 const coverage=w.area?(w.entries?`${w.bibMethod} · ${w.entries} in-period references`:'No in-period references available'):'Cited work · bibliography outside the one-step search';
 const rows=(arr,out)=>arr.map(item=>{
   const [dest,anchor]=out?item:[item,(outgoing.get(item)||[]).find(e=>e[0]===id)?.[1]||''];const o=works.get(dest);
   const source=out?bib:o.bibSource;
   return `<div class="cited-row">${workBtn(dest)}<p class="muted">${o.year||'Year unavailable'} · ${esc(shortAuthors(o.authors)||'Author metadata unavailable')} ${source?link(source+(anchor?'#'+anchor:''),'Citation source'):''}</p></div>`
 }).join('');
 $('detail').innerHTML=`<div class="dialog-content"><span class="tag ${w.area?'':'ref'}">${w.area?AREAS[w.area][0]:'Cited work'}</span><h2 id="paper-title">${esc(w.title)}</h2><p class="muted">${w.year||'Year unavailable'} · ${esc(w.authors||'Author metadata unavailable')}</p><div class="source">${w.url?link(w.url,'Open source work'):link('https://scholar.google.com/scholar?q='+encodeURIComponent(w.title),'Find this cited work')}${link(bib,'Bibliography source')}</div>${w.note?'<p>'+esc(w.note)+'</p>':''}${w.excerpt?'<blockquote><small>From the authors’ abstract</small>'+esc(w.excerpt)+'</blockquote>':''}<p class="muted">${esc(coverage)}${w.stratum?' · '+esc(w.stratum):''}</p>${related.length?'<details class="record-section" open><summary>Reproduction and adaptation evidence ('+related.length+')</summary>'+related.map(repHTML).join('')+'</details>':''}${w.area?`<details class="record-section" ${outs.length?'open':''}><summary>References (${outs.length})</summary>${rows(outs,true)||'<p>No references recovered.</p>'}</details>`:''}<details class="record-section" ${!w.area?'open':''}><summary>Cited by core works (${ins.length})</summary>${rows(ins,false)||'<p>No citing work in this collection.</p>'}</details></div>`;
 $('paper').setAttribute('aria-labelledby','paper-title');if(!$('paper').open)$('paper').showModal();$('paper').scrollTop=0;$('close').focus()
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-work]');if(b)openWork(b.dataset.work)});
function dismiss(){if($('paper').open)$('paper').close();location.hash=workReturn.startsWith('#paper/')?'#atlas':workReturn}
$('close').onclick=dismiss;$('paper').oncancel=e=>{e.preventDefault();dismiss()};$('paper').onclick=e=>{if(e.target===$('paper')){const b=$('paper').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dismiss()}};
function route(){
 const hash=location.hash.slice(1)||'atlas';if(hash.startsWith('paper/')){const id=decodeURIComponent(hash.slice(6));if(works.has(id)){details(id);return}location.hash='#library';return}
 if($('paper').open)$('paper').close();lastRoute='#'+hash;workReturn=lastRoute;
 const [name,query='']=hash.split('?'),reviewSections=['foundations','empirical','mitigation','replications'];
 const active=reviewSections.includes(name)?'review':['atlas','library','review','methods'].includes(name)?name:'atlas';
 for(const id of ['atlas','library','review','methods'])$(id).hidden=id!==active;
 for(const a of document.querySelectorAll('nav a')){if(a.hash==='#'+active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}
 if(active==='library')loadFilters(new URLSearchParams(query));
 document.body.classList.toggle('map-mode',active==='atlas');
 if(reviewSections.includes(name))requestAnimationFrame(()=>$(name==='replications'?'replication-section':'chapter-'+name)?.scrollIntoView());else window.scrollTo(0,0)
}
window.addEventListener('hashchange',route);route();
