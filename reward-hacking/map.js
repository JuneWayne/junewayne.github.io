'use strict';
{
  const svg = $('bubble-map'), canvas = $('citation-lines'), tip = $('bubble-tip');
  const ctx = canvas.getContext('2d');
  const tabs = [...document.querySelectorAll('.size-tabs button')];
  const groups = areaKeys.map(area => ({
    area, papers: core.filter(p => p.area === area)
  }));
  const byId = new Map();
  const nodes = [], edges = [];
  let metric = 'citations', width = 0, height = 0;
  let held = null, hovered = null, focused = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0, lastTick=0, phaseTime=0, cellSize=1;
  const years = [...new Set(core.map(p => p.year))].sort((a,b) => b-a);
  const newest = years[0], oldest = years[years.length-1];
  const yearColors = new Map(years.map(year => {
    const age = (newest-year)/Math.max(1,newest-oldest);
    // Endpoints sampled from the article’s classifier accuracy chart.
    const blue=[108,156,198], pink=[191,102,139];
    const rgb=pink.map((channel,i)=>Math.round(channel+(blue[i]-channel)*age));
    return [year, 'rgb('+rgb.join(',')+')'];
  }));
  $('year-range').textContent = oldest+'–'+newest;
  $('newest-year').textContent = newest;
  $('oldest-year').textContent = oldest;
  $('year-key').setAttribute('aria-label', `Publication year, pink for ${newest} through blue for ${oldest}`);
  $('year-key').querySelector('i').style.background = 'linear-gradient(to right,' + years.map(y => yearColors.get(y)+' '+100*(newest-y)/Math.max(1,newest-oldest)+'%').join(',') + ')';

  let selectedArea='', visibleNodes=nodes, visibleEdges=edges;
  const mapLink=area=>'#atlas?'+new URLSearchParams({area});
  const selector=$('cluster-select');
  selector.add(new Option('All clusters',''));
  for(const area of areaKeys) selector.add(new Option(AREAS[area][0],area));
  selector.onchange=()=>{location.hash=selector.value?mapLink(selector.value):'#atlas';};
  function drawChart() {
    const g=groups.find(item=>item.area===selectedArea);
    selector.value=selectedArea;
    const items=g?g.topics.map(t=>({label:t.name,count:t.nodes.length,topic:t.name,color:t.color,
      area:g.area,href:libLink({area:g.area,subcluster:t.name})})):
      groups.map(item=>({label:AREAS[item.area][0],count:item.nodes.length,area:item.area,href:mapLink(item.area)}));
    $('chart-back').hidden=!g;
    $('chart-review').hidden=!g;
    if(g) $('chart-review').href='#'+g.area.toLowerCase();
    $('chart-title').textContent=g?'Papers by subgroup':'Papers by category';
    document.querySelector('.map-title h1').textContent=g?AREAS[g.area][0]:'Paper clusters';
    $('atlas').classList.toggle('subgroup-view',Boolean(g));
    $('atlas').style.setProperty('--mobile-rows',g?Math.ceil(g.topics.length/2):0);
    $('area-list').innerHTML=items.map(item=>`<a class="bar-row" data-area="${item.area}" data-topic="${esc(item.topic||'')}" href="${esc(item.href)}" style="--series:${item.color||AREAS[item.area][1]}">
      <span class="bar-label">${esc(item.label)}<b>${item.count}</b></span>
      <span class="bar-track"><i style="width:${100*item.count/items[0].count}%"></i></span></a>`).join('');
    for (const row of $('area-list').querySelectorAll('a')) {
      const highlight=on=>{
        if(g) for(const n of g.nodes) n.el.classList.toggle('faded',on && n.paper.subcluster!==row.dataset.topic);
        else for(const item of groups) item.el.classList.toggle('faded',on && item.area!==row.dataset.area);
      };
      row.onpointerenter=row.onfocus=()=>highlight(true);
      row.onpointerleave=row.onblur=()=>highlight(false);
    }
  }

  function element(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  }

  const rawRadius=value=>1.55+.92*Math.log1p(value??0);
  function quantity(paper) {
    const label = metric === 'citations' ? 'Cited by' : 'References';
    return label + ' ' + (paper[metric] == null ? 'unavailable' : format(paper[metric]));
  }

  for (const group of groups) {
    const [name, color] = AREAS[group.area];
    group.el = element('g', {'data-group':group.area, role:'group', 'aria-label':name, style:'--series:'+color});
    group.label = element('text', {class:'cluster-name', 'text-anchor':'middle'});
    group.label.textContent = name;
    group.nodes = group.papers.map((paper, i) => {
      const el = element('circle', {'data-id':paper.id, class:'paper-bubble', role:'button', tabindex:i===0?0:-1});
      el.dataset.publication=paper.publication.status;
      group.el.append(el);
      const n = {paper, group, el, phase:nodes.length*2.399963};
      nodes.push(n);
      byId.set(paper.id,n);
      return n;
    });
    const buckets=new Map();
    for(const n of group.nodes) {
      const name=n.paper.subcluster;
      if(!buckets.has(name)) buckets.set(name,[]);
      buckets.get(name).push(n);
    }
    group.topics=[...buckets].sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0])).map(([name,list],i)=>{
      const shades=[0,-42,40,-23,24,-56,52,-12,12,-33];
      const shade=shades[i%shades.length];
      const tone=`color-mix(in srgb,${color},${shade<0?'#112925':'#fafaf7'} ${Math.abs(shade)}%)`;
      const ring=element('circle',{class:'topic-ring','aria-hidden':true,style:'--series:'+tone});
      const label=element('foreignObject',{class:'topic-caption'});
      const link=document.createElement('a');
      link.textContent=name;link.href=libLink({area:group.area,subcluster:name});
      label.append(link);
      for(const n of list) n.topicColor=tone;
      group.el.prepend(ring);group.el.append(label);
      return {name,nodes:list,ring,label,color:tone};
    });
    group.el.append(group.label);
    svg.append(group.el);
  }
  for (const [source,target] of D.edges) {
    if (source !== target && byId.has(source) && byId.has(target)) edges.push([byId.get(source),byId.get(target)]);
  }

  function layout() {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height;
    const dpi = Math.min(window.devicePixelRatio || 1,2);
    canvas.width = Math.round(width*dpi); canvas.height = Math.round(height*dpi);
    ctx.setTransform(dpi,0,0,dpi,0,0);
    const size = width < 520 ? 12 : 15;
    const wide = width / height > 1.12;
    const anchors = wide ? [[.29,.45],[.72,.40],[.55,.75],[.87,.76],[.27,.83],[.51,.09]]
                         : [[.34,.31],[.65,.68],[.72,.27],[.22,.67],[.26,.89],[.75,.08]];
    for (const [i,g] of groups.entries()) {
      for (const t of g.topics) {
        const packed=t.nodes.map(n=>{
          const value=n.paper[metric];
          n.raw=rawRadius(value);
          n.el.setAttribute('aria-label',n.paper.title+', '+n.paper.year+', '+quantity(n.paper)+', '+t.name+', '+publicationText(n.paper));
          return {n,r:n.raw+.8};
        }).sort((a,b)=>b.r-a.r);
        d3.packSiblings(packed);
        const enclosure=d3.packEnclose(packed);
        t.raw=enclosure.r;
        for(const p of packed){p.n.lx=p.x-enclosure.x;p.n.ly=p.y-enclosure.y;}
      }
      const islands=g.topics.map(t=>({t,r:t.raw+2.8})).sort((a,b)=>b.r-a.r);
      d3.packSiblings(islands);
      const parent=d3.packEnclose(islands);
      g.raw=parent.r;
      for(const island of islands){
        island.t.lx=island.x-parent.x;island.t.ly=island.y-parent.y;
      }
      [g.ax,g.ay] = anchors[i];
    }
    // Fit the six enclosures and their labels together before placing individual papers.
    const max = Math.max(...groups.map(g => g.raw));
    const logicalW = max*(wide ? 4.7 : 3.55);
    const logicalH = logicalW * Math.min(2,Math.max(.5,height/width));
    for (const g of groups) {g.cx=g.ax*logicalW; g.cy=g.ay*logicalH;}
    for (let pass=0;pass<65;pass++) {
      groups.forEach((a,i) => groups.slice(i+1).forEach(b => {
        const dx=b.cx-a.cx, dy=b.cy-a.cy, distance=Math.hypot(dx,dy)||1;
        const shift=(a.raw+b.raw+max*.23-distance)*.51;
        if (shift<=0) return;
        a.cx-=dx/distance*shift; a.cy-=dy/distance*shift;
        b.cx+=dx/distance*shift; b.cy+=dy/distance*shift;
      }));
    }
    const left=Math.min(...groups.map(g=>g.cx-g.raw)), right=Math.max(...groups.map(g=>g.cx+g.raw));
    const top=Math.min(...groups.map(g=>g.cy-g.raw)), bottom=Math.max(...groups.map(g=>g.cy+g.raw));
    const side=width<520?12:24;
    const overviewScale=Math.max(.02,Math.min((width-2*side)/(right-left),(height-size*2-18)/(bottom-top)));
    const ox=(width-(right-left)*overviewScale)/2-left*overviewScale;
    const oy=(height-(bottom-top)*overviewScale-size*1.5)/2-top*overviewScale;
    for (const g of groups) {
      const zoom=g.area===selectedArea;
      g.el.style.display=selectedArea && !zoom?'none':'';
      if(selectedArea && !zoom) continue;
      // Give each subgroup a separate cell, with space below the bubbles for its full name.
      const columns=width<540?2:Math.min(4,Math.max(2,Math.round(Math.sqrt(g.topics.length*width/height))));
      const rows=Math.ceil(g.topics.length/columns);
      const cellW=width/columns, cellH=height/rows, captionH=width<540?56:48;
      const scale=zoom?Math.max(.02,Math.min(cellW-24,cellH-captionH-14)/(2*Math.max(...g.topics.map(t=>t.raw+1)))):overviewScale;
      g.x=zoom?width/2:ox+g.cx*scale; g.y=zoom?height/2:oy+g.cy*scale;
      g.r=g.raw*scale;
      g.label.style.display=zoom?'none':'';
      g.label.setAttribute('font-size',size);
      const half=g.label.getComputedTextLength()/2+3;
      g.label.setAttribute('x',Math.max(half,Math.min(width-half,g.x)));
      g.label.setAttribute('y',g.y+g.r+size);
      for (const [i,t] of g.topics.entries()) {
        const row=Math.floor(i/columns),col=i%columns;
        const rowSize=Math.min(columns,g.topics.length-row*columns);
        t.x=zoom?(col+.5+(columns-rowSize)/2)*cellW:g.x+t.lx*scale;
        t.y=zoom?row*cellH+(cellH-captionH)/2:g.y+t.ly*scale;
        t.r=t.raw*scale;
        t.ring.setAttribute('cx',t.x);t.ring.setAttribute('cy',t.y);t.ring.setAttribute('r',t.r+scale);
        if(zoom){
          t.label.setAttribute('x',t.x-cellW/2+5);t.label.setAttribute('y',t.y+t.r+scale+4);
          t.label.setAttribute('width',cellW-10);t.label.setAttribute('height',captionH);
        }
        for(const n of t.nodes){
          n.r=n.raw*scale;
          n.homeX=t.x+n.lx*scale; n.homeY=t.y+n.ly*scale;
          n.x=n.drop?Math.max(n.r,Math.min(width-n.r,n.drop.x*width)):n.homeX;
          n.y=n.drop?Math.max(n.r,Math.min(height-n.r,n.drop.y*height)):n.homeY;
          n.restX=n.x;n.restY=n.y;n.vx=0;n.vy=0;
          n.el.setAttribute('r',n.r);
          position(n);
        }
      }
    }
    const maxCount=Math.max(0,...visibleNodes.map(n=>n.paper[metric]??0));
    const examples=[0,1,10,100].filter(v=>v<maxCount);
    examples.push(maxCount);
    const sample=visibleNodes[0], unit=sample.r/sample.raw;
    const label=metric==='citations'?'Citations':'References';
    $('size-key').innerHTML='<b>'+label+'</b><div>'+examples.map(v=>{
      const diameter=2*unit*rawRadius(v);
      return '<span><i aria-hidden="true" style="width:'+diameter+'px;height:'+diameter+'px"></i>'+format(v)+'</span>';
    }).join('')+'</div>';
    cellSize=2*Math.max(...visibleNodes.map(n=>n.r))+1;
    describe();
    schedule();
  }

  function positionTip(n) {
    tip.style.left=Math.max(2, Math.min(width-tip.offsetWidth-2,n.x-tip.offsetWidth/2))+'px';
    tip.style.top=(n.y-n.r>tip.offsetHeight+8 ? n.y-n.r-tip.offsetHeight-5 : n.y+n.r+5)+'px';
  }
  function active() { return held?.node || hovered || focused; }
  function describe() {
    const n=active();
    tip.hidden=!n;
    if (n) {tip.textContent=n.paper.year+' · '+n.paper.title+' · '+n.paper.subcluster+' · '+quantity(n.paper)+' · '+publicationText(n.paper)+($('color-mode').value==='votes'?' · Hugging Face upvotes: '+(n.paper.hfUpvotes??'No data'):'');positionTip(n);}
    drawEdges();
  }
  function drawEdges() {
    if (canvas.hidden) return;
    ctx.clearRect(0,0,width,height);
    const selected=active();
    ctx.beginPath();
    for (const [a,b] of visibleEdges) {ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
    ctx.strokeStyle=selected?'rgba(55,72,70,.024)':'rgba(55,72,70,.105)';
    ctx.lineWidth=.65;ctx.stroke();
    if (!selected) return;
    // On incident links the arrow points to the referenced paper.
    ctx.beginPath();
    for (const [a,b] of visibleEdges) {
      if (a!==selected && b!==selected) continue;
      const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
      if (len <= a.r+b.r+1) continue;
      const ux=dx/len, uy=dy/len, x=b.x-ux*(b.r+1), y=b.y-uy*(b.r+1);
      ctx.moveTo(a.x,a.y);ctx.lineTo(x,y);
      ctx.lineTo(x-ux*5-uy*2.2,y-uy*5+ux*2.2);ctx.moveTo(x,y);ctx.lineTo(x-ux*5+uy*2.2,y-uy*5-ux*2.2);
    }
    ctx.lineWidth=1.25;ctx.strokeStyle='rgba(28,67,58,.74)';ctx.stroke();
  }
  function position(n) {
    n.el.setAttribute('cx',n.x.toFixed(2));
    n.el.setAttribute('cy',n.y.toFixed(2));
  }
  function separate(pinned) {
    const grid=new Map();
    const columns=Math.ceil(width/cellSize)+2;
    for (const a of visibleNodes) {
      const cellX=Math.floor(a.x/cellSize), cellY=Math.floor(a.y/cellSize);
      for (let row=cellY-1;row<=cellY+1;row++) {
        for (let col=cellX-1;col<=cellX+1;col++) {
          const nearby=grid.get(row*columns+col);
          if (!nearby) continue;
          for (const b of nearby) {
            const dx=a.x-b.x, dy=a.y-b.y, min=a.r+b.r+.25;
            const distance=Math.hypot(dx,dy);
            if (distance>=min) continue;
            const ux=distance?dx/distance:Math.cos(a.phase), uy=distance?dy/distance:Math.sin(a.phase);
            // Give a dropped bubble more weight so its neighbors yield around the drop point.
            const massA=a.r*(a.drop?12:1), massB=b.r*(b.drop?12:1);
            const share=a===pinned?0:b===pinned?1:massB/(massA+massB);
            const push=min-distance;
            a.x+=ux*push*share; a.y+=uy*push*share;
            b.x-=ux*push*(1-share); b.y-=uy*push*(1-share);
            const impact=Math.max(0,-((a.vx-b.vx)*ux+(a.vy-b.vy)*uy));
            a.vx+=ux*impact*share; a.vy+=uy*impact*share;
            b.vx-=ux*impact*(1-share); b.vy-=uy*impact*(1-share);
          }
        }
      }
      const key=cellY*columns+cellX;
      if (!grid.has(key)) grid.set(key,[]);
      grid.get(key).push(a);
    }
  }
  function paintPositions() {
    for (const n of visibleNodes) {
      n.x=Math.max(n.r,Math.min(width-n.r,n.x));
      n.y=Math.max(n.r,Math.min(height-n.r,n.y));
      position(n);
    }
    if (active() && !tip.hidden) positionTip(active());
    drawEdges();
  }
  function easeDropTowardCluster(n,dt) {
    const dx=n.homeX-n.restX, dy=n.homeY-n.restY;
    const distance=Math.hypot(dx,dy);
    if (distance<.25) {
      n.restX=n.homeX; n.restY=n.homeY;
      if (Math.hypot(n.x-n.homeX,n.y-n.homeY)<2.5) n.drop=null;
      return;
    }
    // Pull to the paper's packed spot inside its subgroup, then brake over the last few pixels.
    const span=Math.hypot(width,height);
    const inwardSpeed=span*.42*(1+1.8*Math.exp(-distance/(span*.12)));
    const travel=Math.min(inwardSpeed*dt,distance*(-Math.expm1(-10*dt)));
    n.restX+=dx/distance*travel; n.restY+=dy/distance*travel;
    n.drop.x=n.restX/width; n.drop.y=n.restY/height;
  }
  function tick(time) {
    frame=0;
    if (!canAnimate()) {lastTick=0;return;}
    if (!lastTick || time-lastTick>=32) {
      const dt=lastTick?Math.min(.05,(time-lastTick)/1000):1/30;
      lastTick=time;phaseTime+=dt;
      // A released bubble can return even while the pointer is still over it.
      const pinned=held?.node || (focused?.drop ? null : focused) || (hovered?.drop ? null : hovered);
      const damping=Math.exp(-7*dt);
      for (const n of visibleNodes) {
        if (n===pinned) continue;
        if (n.drop) easeDropTowardCluster(n,dt);
        // Damped springs follow a tiny, slow orbit around the packed or dropped position.
        const amplitude=Math.min(1.9,n.r*.38);
        const tx=n.restX+amplitude*Math.cos(phaseTime*.65+n.phase);
        const ty=n.restY+amplitude*Math.sin(phaseTime*.53+n.phase*1.31);
        const spring=n.drop?94:20;
        const drag=n.drop?Math.exp(-13*dt):damping;
        n.vx=(n.vx+spring*(tx-n.x)*dt)*drag;
        n.vy=(n.vy+spring*(ty-n.y)*dt)*drag;
        n.x+=n.vx*dt; n.y+=n.vy*dt;
      }
      separate(pinned);
      paintPositions();
    }
    schedule();
  }
  function canAnimate() {
    return width>0 && !reducedMotion.matches && !$('atlas').hidden && !$('paper').open && !document.hidden;
  }
  function schedule() {
    if (!frame && canAnimate()) frame=requestAnimationFrame(tick);
  }
  const voteBands=[
    {min:0,label:'0',color:'#cbbce3'}, {min:1,label:'1–4',color:'#a88bc8'},
    {min:5,label:'5–19',color:'#7751a3'}, {min:20,label:'20+',color:'#45216b'}
  ];
  const missingVotes={label:'No data',color:'#979e9d'};
  const voteBand=value=>value==null?missingVotes:voteBands.findLast(b=>value>=b.min);
  $('vote-key').innerHTML=[...voteBands,missingVotes].map(b=>`<span><i style="background:${b.color}"></i>${b.label}</span>`).join('');
  function updateColors() {
    const mode=$('color-mode').value, byYear=mode==='year';
    $('vote-key').hidden=mode!=='votes';
    $('scope-count').textContent=format(visibleNodes.length)+' papers';
    $('year-range').hidden=byYear;
    $('year-key').hidden=!byYear;
    for (const n of nodes) {
      if (byYear) n.el.style.setProperty('--bubble-color',yearColors.get(n.paper.year));
      else if(mode==='votes') n.el.style.setProperty('--bubble-color',voteBand(n.paper.hfUpvotes).color);
      else if(n.group.area===selectedArea) n.el.style.setProperty('--bubble-color',n.topicColor);
      else n.el.style.removeProperty('--bubble-color');
    }
  }
  $('color-mode').onchange=()=>{updateColors();describe();};
  updateColors();
  $('show-links').onchange=e=>{canvas.hidden=!e.target.checked;drawEdges();};
  tabs.forEach((tab,i)=>{
    tab.onclick=()=>{
      metric=tab.dataset.metric;
      tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
      $('cluster-panel').setAttribute('aria-labelledby',tab.id);
      layout();describe();
    };
    tab.onkeydown=e=>{
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const next=tabs[e.key==='Home'?0:e.key==='End'?1:1-i];
      next.focus();next.click();
    };
  });

  const nodeAt=e=>byId.get(e.target.dataset.id);
  svg.addEventListener('pointerover',e=>{hovered=nodeAt(e);describe();});
  svg.addEventListener('pointerout',()=>{hovered=null;describe();});
  svg.addEventListener('focusin',e=>{focused=nodeAt(e);describe();});
  svg.addEventListener('focusout',()=>{focused=null;describe();});
  svg.addEventListener('pointerdown',e=>{
    const n=nodeAt(e);
    if (!n || held || e.button!==0) return;
    const rect=svg.getBoundingClientRect();
    held={node:n, id:e.pointerId, startX:e.clientX, startY:e.clientY, offsetX:n.x-e.clientX+rect.left, offsetY:n.y-e.clientY+rect.top, dragged:false};
    n.el.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove',e=>{
    if (!held || held.id!==e.pointerId) return;
    if (!held.dragged) {
      if (Math.hypot(e.clientX-held.startX,e.clientY-held.startY)<=4) return;
      held.dragged=true;
    }
    const rect=svg.getBoundingClientRect(), n=held.node;
    const dx=Math.max(n.r,Math.min(width-n.r,e.clientX-rect.left+held.offsetX))-n.x;
    const dy=Math.max(n.r,Math.min(height-n.r,e.clientY-rect.top+held.offsetY))-n.y;
    const steps=Math.min(16,Math.max(1,Math.ceil(Math.hypot(dx,dy)/Math.max(4,n.r))));
    n.vx=Math.max(-20,Math.min(20,dx*6)); n.vy=Math.max(-20,Math.min(20,dy*6));
    for (let step=0;step<steps;step++) {
      n.x+=dx/steps; n.y+=dy/steps;
      separate(n);
    }
    n.restX=n.x; n.restY=n.y; n.drop={x:n.x/width,y:n.y/height};
    paintPositions();
  });
  svg.addEventListener('pointerup',e=>{
    if (!held || e.pointerId!==held.id) return;
    const {node,dragged}=held;
    held=null; hovered=null; node.el.releasePointerCapture(e.pointerId);
    if (dragged) {
      node.vx=0; node.vy=0;
      node.el.blur();
      svg.append(node.group.el);
      node.group.el.insertBefore(node.el,node.group.label);
      if (reducedMotion.matches) {node.drop=null;layout();}
      describe();
    }
    else {tip.hidden=true;openWork(node.paper.id);}
  });
  svg.addEventListener('pointercancel',()=>{
    const node=held?.node;
    held=null;hovered=null;
    if (node?.drop && reducedMotion.matches) {node.drop=null;layout();}
    describe();
  });
  svg.addEventListener('click',e=>{
    if (e.target.classList.contains('cluster-name')) location.hash=mapLink(e.target.parentNode.dataset.group);
    else if (e.detail===0 && nodeAt(e)) openWork(nodeAt(e).paper.id);
  });
  svg.addEventListener('keydown',e=>{
    const n=nodeAt(e);
    if (!n) return;
    if (e.key==='Enter'||e.key===' ') {e.preventDefault();openWork(n.paper.id);return;}
    const direction={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1}[e.key];
    if (!direction) return;
    e.preventDefault();
    const list=n.group.nodes, next=list[(list.indexOf(n)+direction+list.length)%list.length];
    n.el.setAttribute('tabindex','-1');next.el.setAttribute('tabindex','0');next.el.focus();
  });
  function mapRoute() {
    if(location.hash && !/^#atlas(?:\?|$)/.test(location.hash)) return;
    const area=new URLSearchParams(location.hash.split('?')[1]).get('area');
    const next=areaKeys.includes(area)?area:'';
    if(next===selectedArea && $('area-list').childElementCount) return;
    selectedArea=next;
    held=hovered=focused=null;
    for(const n of nodes){n.drop=null;n.el.classList.remove('faded');}
    for(const g of groups) g.el.classList.remove('faded');
    visibleNodes=next?groups.find(g=>g.area===next).nodes:nodes;
    visibleEdges=next?edges.filter(([a,b])=>a.group.area===next && b.group.area===next):edges;
    drawChart();updateColors();layout();
  }
  drawChart();
  window.addEventListener('hashchange',mapRoute);
  mapRoute();
  reducedMotion.addEventListener('change',()=>{
    if (reducedMotion.matches) {
      for (const n of nodes) if (n!==held?.node) n.drop=null;
      layout();
    } else schedule();
  });
  document.addEventListener('visibilitychange',schedule);
  window.addEventListener('hashchange',schedule);
  $('paper').addEventListener('close',schedule);
  new ResizeObserver(layout).observe(svg);
  layout();
}
