'use strict';
const D=window.ATLAS, $=id=>document.getElementById(id);
const format=n=>n.toLocaleString('en-US');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=u=>/^https?:\/\//i.test(u||'')?esc(u):'';
const link=(u,label)=>safe(u)?`<a href="${safe(u)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';
const works=new Map(D.works.map(w=>[w.id,w])),core=D.works.filter(w=>w.area);
const incoming=new Map();
for(const [,id] of D.edges) incoming.set(id,(incoming.get(id)||0)+1);
const countCites=id=>incoming.get(id)||0;
const AREAS={
 Mitigation:['Mitigation','#6c9cc6','Changes the reward, policy, verifier, or training procedure.'],
 Behavior:['Behavioral studies','#bf668b','Elicits, explains, or tests the transfer of a shortcut.'],
 Benchmarking:['Benchmarking','#309689','Builds or audits tasks, datasets, and evaluation protocols.'],
 Detection:['Detection','#d49239','Tests whether a monitor or diagnostic identifies hacking.'],
 Theory:['Theory','#8b70b2','Formalizes incentives, assumptions, or bounds.'],
 Synthesis:['Reviews & synthesis','#839649','Organizes findings across studies or domains.']
};
const areaKeys=Object.keys(AREAS).sort((a,b)=>core.filter(w=>w.area===b).length-core.filter(w=>w.area===a).length);
const areaCount=a=>core.filter(w=>w.area===a).length;
const eligible=core.filter(w=>w.entries>0);
const workBtn=(id,cl='paper-btn')=>`<button class="${cl}" data-work="${esc(id)}">${esc(works.get(id)?.title||id)}</button>`;
const libLink=(query={})=>'#library?'+new URLSearchParams(query);
$('area-filter').innerHTML='<option value="">All categories</option>'+areaKeys.map(a=>`<option value="${a}">${AREAS[a][0]}</option>`).join('');
let subcluster='',setting='';
let page=1,matches=[],lastRoute='#atlas',workReturn='#atlas';
function loadFilters(params){
 $('query').value=params.get('q')||'';
 $('area-filter').value=areaKeys.includes(params.get('area'))?params.get('area'):'';
 const area=$('area-filter').value;
 subcluster=params.get('subcluster')||'';
 if(subcluster==='Proxy score diverges from task quality') subcluster='Proxy reward or evaluator rating diverges from task quality';
 setting=params.get('setting')||'';
 if(!core.some(w=>w.area===area && w.subcluster===subcluster)) subcluster='';
 if(!subcluster || !core.some(w=>w.area===area && w.subcluster===subcluster && w.setting===setting)) setting='';
 page=1;library()
}
function updateFilters(){
 const params=new URLSearchParams();
 if($('query').value.trim())params.set('q',$('query').value.trim());
 if($('area-filter').value)params.set('area',$('area-filter').value);
 if(subcluster)params.set('subcluster',subcluster);
 if(setting)params.set('setting',setting);
 history.replaceState(null,'',params.size?'#library?'+params:'#library');
 lastRoute=location.hash;page=1;library()
}
$('area-filter').onchange=()=>{subcluster=setting='';updateFilters()};
$('query').oninput=updateFilters;
$('clear').onclick=()=>{subcluster=setting='';$('query').value='';$('area-filter').value='';updateFilters()};
function library(){
 const tokens=$('query').value.toLowerCase().split(/\s+/).filter(Boolean);
 const area=$('area-filter').value;
 // Show the screened papers by default. Text search also reaches their references.
 const pool=tokens.length && !area ? D.works : core;
 matches=pool.filter(w=>{
  if(area&&w.area!==area || subcluster&&w.subcluster!==subcluster || setting&&w.setting!==setting)return false;
  const text=[w.title,w.authors,w.id,w.doi,w.url,w.year].join(' ').toLowerCase();
  return tokens.every(t=>text.includes(t))
 }).sort((a,b)=>Number(Boolean(b.area))-Number(Boolean(a.area)) || (b.year||0)-(a.year||0) || a.title.localeCompare(b.title));
 $('clear').hidden=!tokens.length && !area;
 showPage()
}
const pageSize=25;
function showPage(){
 $('results').textContent=[format(matches.length)+' matching works',subcluster,setting].filter(Boolean).join(' · ');
 $('library-rows').innerHTML=matches.slice((page-1)*pageSize,page*pageSize).map(w=>`<div class="list-row"><div>${workBtn(w.id)}<p class="muted">${w.year||'Year unavailable'} · ${esc(shortAuthors(w.authors)||'Author metadata unavailable')}</p></div><span class="tag ${w.area?'':'ref'}">${w.area?esc(w.subcluster||AREAS[w.area][0]):'Cited work'}</span></div>`).join('')||'<p class="empty">No works match these filters.</p>';
 $('prev').disabled=page<=1;$('next').disabled=page*pageSize>=matches.length;$('page-index').textContent=matches.length?`Page ${page} of ${Math.ceil(matches.length/pageSize)}`:'0 results';
}
function shortAuthors(a){return a?.length>120?a.slice(0,115).replace(/[, ]+\S*$/,'')+'…':a}
$('prev').onclick=()=>{page--;showPage();$('results').scrollIntoView({block:'center'})};$('next').onclick=()=>{page++;showPage();$('results').scrollIntoView({block:'center'})};
function save(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('export-data').onclick=()=>save('reward-hacking-atlas.json',JSON.stringify(D),'application/json');
$('export-library').onclick=()=>{const rows=[['Title','Authors','Year','Primary area','Subgroup','Task setting','Collection','ID','Source URL','Citations received (OpenAlex)','Bibliography entries','Citing core works','Publication status','Venue','Publication evidence'],...matches.map(w=>[w.title,w.authors,w.year,w.area,w.subcluster,w.setting,w.area?'Core':'Reference',w.id,w.url,w.citations,w.references,countCites(w.id),w.publication?.status,w.publication?.venue,w.publication?.source])];save('reward-hacking-library.csv',rows.map(r=>r.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\r\n'),'text/csv')};
$('review-content').innerHTML=window.REVIEW_HTML;
for(const section of $('review-content').querySelectorAll('section[data-area]')){
 section.style.setProperty('--series',AREAS[section.dataset.area][1]);
}
const unc=core.filter(w=>!w.entries),raw=D.works.filter(w=>w.rawOnly).length;
const countMethod=m=>core.filter(w=>w.bibMethod===m).length;
$('method-content').innerHTML=`<h2>Search and selection</h2><p>The cutoff is 18 November 2026. We include papers published from January 2020 through the cutoff. We exclude cited records whose publication year is unknown or outside this window. Four arXiv queries initially returned ${format(D.candidates)} distinct records. We screened titles and relevant abstract passages, added studies from primary-source searches and bibliographies, and checked selected Crossref and OpenReview records. A record enters the core collection when it contributes a definition, measurement, explanation, intervention, or synthesis relevant to proxy exploitation. Application studies qualify when the abstract identifies a specific behavior or intervention.</p><p>The search includes preprints, proceedings papers, journal articles, and selected technical reports. English search terms, relevance-ranked publisher results, renamed papers, unpublished work, and indexing delays limit recall. A cluster count describes this collection. It cannot establish the total size of the field.</p><details><summary>Search queries and screening decisions</summary>${D.searches.map(s=>`<p><b>arXiv · ${s.retrieved} results</b><br><code>${esc(s.query)}</code></p>`).join('')}${(D.publisherSearch.queries||[]).map(s=>`<p><b>${esc(s.source)}</b> · ${esc(s.query)} · ${esc(s.returned??s.status??'targeted search')} ${link(s.url,'Search')}</p>`).join('')}<p><a href="screening.csv" download>Download the arXiv screening register</a> · <a href="publisher-search.json" download>Publisher search log</a></p></details>
 <h2>How we classified the work</h2><p>Each mapped paper has one primary category and one subgroup. These editorial labels describe the main task, behavior, technique, or question in the title and available abstract. A paper can discuss other topics. Each behavioral study also has one primary task setting. The main search and the later search for application studies describe how papers entered the collection. A benchmark paper may also demonstrate the behavior or propose a mitigation. The primary label makes the area totals additive. The review describes overlaps. “Behavioral studies” includes original demonstrations and transfer experiments.</p><table class="review-table"><thead><tr><th>Primary area</th><th>Inclusion rule</th></tr></thead><tbody>${areaKeys.map(a=>`<tr><td>${AREAS[a][0]}</td><td>${AREAS[a][2]}</td></tr>`).join('')}</tbody></table>
 <h2>How we collected citations</h2><p>We followed each core work’s outgoing references one step. A citation can lead to another core study, a methods paper, a book, software, or a report. We used versioned arXiv bibliographies available by the cutoff, PDF reference sections, publisher bibliographies, and index records. For the UK AI Security Institute report we recorded inline links to research publications. The downloadable dataset names each bibliography source.</p><p>${format(eligible.length)} of ${format(core.length)} core works have at least one recovered reference. The dataset contains ${format(D.edges.length)} distinct directed links. An indexed list may omit items, and a recovered list does not certify complete extraction. We match arXiv IDs, DOIs, and normalized titles. ${format(raw)} records retain citation text where a title could not be isolated. Spelling and version differences can leave duplicate records.</p><details><summary>Works without in-period references (${unc.length})</summary>${unc.map(w=>'<p>'+workBtn(w.id)+'</p>').join('')||'<p>All core records have a recovered bibliography.</p>'}</details>
 <h2>Reading the map</h2><p>Each bubble represents one screened paper. The default colors show each paper’s primary contribution. Turn on Color by year to see publication years from pink (newest) to blue (oldest). Release a dragged bubble and it returns to its place in its subgroup. Cited by shows the number of citations to the matched OpenAlex record as of ${esc(D.citationDate)}. References counts recovered bibliography entries of all years. For cited-only works, available OpenAlex counts use indexed references. Indexed bibliographies can be incomplete. Filled bubbles have a main conference publication record, including Findings papers. Hollow bubbles have no such record in this collection. Open a paper to see its venue, preprint, workshop, journal, or submission details. We record conference acceptance separately until the proceedings list the paper. We checked conference listings, DBLP, publisher and index records, and arXiv publication notes on 19 November 2026. A missing venue can reflect a title change or indexing delay. Missing citation or reference counts use the minimum size. Radius uses a logarithmic scale. Citation links connect screened papers when one cites the other. The bars count papers in each category. Select a category to see its subgroups. Select a subgroup bar to see its papers. The dataset lists recovered citations within the publication window.</p><p>Years refer to first arXiv submission or the cited publication’s recorded year. The 2026 count is partial. Bibliographic years and titles for cited-only records follow the citing source or identifier metadata. Anonymous submissions and technical reports carry different levels of review. Area counts do not weight study quality. Download the dataset to inspect the paper records and citation links.</p>`;
function openWork(id){if(!works.has(id))return;if(!$('paper').open)workReturn=location.hash||'#atlas';location.hash='#paper/'+encodeURIComponent(id)}
window.REFERENCE_ABSTRACTS={};
const abstractLoads=new Map();
function referenceAbstracts(part) {
 if (!abstractLoads.has(part)){
   const load=new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     script.src='abstracts/'+part+'.js?v='+D.abstractVersions[part];
     script.onload=()=>resolve(window.REFERENCE_ABSTRACTS[part]);
     script.onerror=()=>{abstractLoads.delete(part);script.remove();reject(new Error('Abstracts unavailable'));};
     document.head.append(script);
   });
   abstractLoads.set(part,load);
 }
 return abstractLoads.get(part);
}
const indexedDetails=new Map();
function loadIndexedDetails(w) {
 const source=w.arxivUrl||w.url||'';
 const arxiv=source.match(/^https?:\/\/arxiv\.org\/abs\/(\d{4}\.\d+)/i);
 const doi=arxiv?'10.48550/arxiv.'+arxiv[1]:source.match(/^https?:\/\/(?:dx\.)?doi\.org\/(10\..+)$/i)?.[1];
 if (!doi || !navigator.onLine) return;
 if (!indexedDetails.has(doi)) {
   const fields='abstract_inverted_index,cited_by_count,referenced_works_count';
   const request=fetch('https://api.openalex.org/works/https://doi.org/'+encodeURI(doi)+'?select='+fields,
     {signal:AbortSignal.timeout(8000)}).then(response=>response.ok?response.json():null).catch(()=>null);
   indexedDetails.set(doi,request);
 }
 return indexedDetails.get(doi);
}
function renderAbstract(el,value) {
 el.textContent=value;
 if (!/[\\$]/.test(value)) return;
 window.renderMathInElement?.(el,{
   delimiters:[
     {left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},
     {left:'\\(',right:'\\)',display:false},
     ...['equation','equation*','align','align*','gather','gather*'].map(env=>({
       left:'\\begin{'+env+'}',right:'\\end{'+env+'}',display:true})),
     {left:'$',right:'$',display:false}
   ],trust:false,strict:'ignore',errorCallback:()=>{}
 });
 // arXiv also supplies text markup outside equations. Keep all source text inert.
 const tags={textbf:'strong',emph:'em',textit:'em',texttt:'code',textsc:'small',underline:'u',url:'span',text:'span'};
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
 const plain=[];
 while(walker.nextNode()) if(!walker.currentNode.parentElement.closest('.katex')) plain.push(walker.currentNode);
 const pattern=/\\(textbf|emph|textit|texttt|textsc|underline|url|text)\{([^{}]*)\}|\\href\{[^{}]*\}\{([^{}]*)\}|\\([%&#_$])/g;
 for(const node of plain){
   const source=node.data,fragment=document.createDocumentFragment();
   let start=0;
   for(const match of source.matchAll(pattern)){
     fragment.append(source.slice(start,match.index));
     if(match[1]){
       const tag=document.createElement(tags[match[1]]);
       tag.textContent=match[2].replace(/\\([%&#_$])/g,'$1'); fragment.append(tag);
     } else fragment.append(match[3]??match[4]);
     start=match.index+match[0].length;
   }
   if(start){fragment.append(source.slice(start));node.replaceWith(fragment);}
 }
}
const publicationLabels={conference:'Conference publication',preprint:'Preprint',journal:'Journal publication',workshop:'Workshop',manuscript:'Camera-ready manuscript',submission:'Submission',report:'Technical report'};
function publicationText(w){
 const record=w.publication;
 return record?[publicationLabels[record.status],record.venue].filter(Boolean).join(' · '):'';
}
function details(id){
 const w=works.get(id);if(!w)return;
 const showCount=value=>value==null?'Unavailable':format(value);
 const url=w.arxivUrl||w.url||'';
 const isArxiv=/^https?:\/\/(?:www\.)?arxiv\.org\/abs\//i.test(url);
 const action=safe(url)?`<a class="button" href="${safe(url)}" target="_blank" rel="noopener noreferrer">${isArxiv?'Open on arXiv':'Open original source'} ↗</a>`:'';
 const abstract=w.abstract||window.REFERENCE_ABSTRACTS[w.abstractPart]?.[id];
 $('detail').innerHTML=`<div class="dialog-content">
   <h2 id="paper-title">${esc(w.title)}</h2>
   <p class="muted">${[w.year,w.authors].filter(Boolean).map(esc).join(' · ')}</p>
   ${w.publication?'<p class="muted">'+(w.publication.venue && safe(w.publication.source) && w.publication.source!==url?link(w.publication.source,publicationText(w)):esc(publicationText(w)))+'</p>':''}
   <dl class="paper-counts"><div><dt>Cited by</dt><dd id="paper-citations">${showCount(w.citations)}</dd></div><div><dt>References</dt><dd id="paper-references">${showCount(w.references)}</dd></div></dl>
   <h3>Abstract</h3><div id="paper-abstract"></div>
   ${action}</div>`;
 const text=$('paper-abstract');
 renderAbstract(text,abstract||(w.abstractPart?'Loading…':url?'See the original source.':'Abstract unavailable.'));
 if(w.abstractPart && !abstract){
   referenceAbstracts(w.abstractPart).then(data=>renderAbstract(text,data[id]||'Abstract unavailable.'))
     .catch(()=>{text.textContent='Abstract unavailable.';});
 }
 if(!w.area && (w.citations==null || w.references==null || (!abstract && !w.abstractPart))){
   const citations=$('paper-citations'), references=$('paper-references');
   loadIndexedDetails(w)?.then(hit=>{
     if (!hit) return;
     if (w.citations==null) citations.textContent=showCount(hit.cited_by_count);
     if (w.references==null) references.textContent=showCount(hit.referenced_works_count);
     if (!abstract && !w.abstractPart && hit.abstract_inverted_index){
       const words=[];
       for(const [word,positions] of Object.entries(hit.abstract_inverted_index)){
         for(const pos of positions) words[pos]=word;
       }
       if(words.length) renderAbstract(text,words.join(' '));
     }
   });
 }
 $('paper').setAttribute('aria-labelledby','paper-title');if(!$('paper').open)$('paper').showModal();$('paper').scrollTop=0;$('close').focus()
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-work]');if(b)openWork(b.dataset.work)});
function dismiss(){if($('paper').open)$('paper').close();location.hash=workReturn.startsWith('#paper/')?'#atlas':workReturn}
$('close').onclick=dismiss;$('paper').oncancel=e=>{e.preventDefault();dismiss()};$('paper').onclick=e=>{if(e.target===$('paper')){const b=$('paper').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dismiss()}};
function route(){
 const hash=location.hash.slice(1)||'atlas';if(hash.startsWith('paper/')){const id=decodeURIComponent(hash.slice(6));if(works.has(id)){details(id);return}location.hash='#library';return}
 if($('paper').open)$('paper').close();lastRoute='#'+hash;workReturn=lastRoute;
 const [name,query='']=hash.split('?'),reviewSections={opportunities:'review-opportunities',foundations:'chapter-theory',empirical:'chapter-behavior',mitigation:'chapter-mitigation',behavior:'chapter-behavior',benchmarking:'chapter-benchmarking',detection:'chapter-detection',theory:'chapter-theory',synthesis:'chapter-synthesis',replications:'review-findings'};
 const active=Object.hasOwn(reviewSections,name)?'review':['atlas','library','review','methods'].includes(name)?name:'atlas';
 for(const id of ['atlas','library','review','methods'])$(id).hidden=id!==active;
 for(const a of document.querySelectorAll('nav a')){if(a.hash==='#'+active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}
 if(active==='library')loadFilters(new URLSearchParams(query));
 document.body.classList.toggle('map-mode',active==='atlas');
 if(Object.hasOwn(reviewSections,name)){
   const section=$(reviewSections[name]);
   requestAnimationFrame(()=>section.scrollIntoView());
 } else window.scrollTo(0,0)
}
window.addEventListener('hashchange',route);route();
