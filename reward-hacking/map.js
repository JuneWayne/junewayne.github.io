'use strict';
{
  const svg = $('bubble-map'), canvas = $('citation-lines'), tip = $('bubble-tip');
  const ctx = canvas.getContext('2d');
  const tabs = [...document.querySelectorAll('.size-tabs button')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const groups = areaKeys.map(area => ({
    area, papers: core.filter(p => p.area === area)
  }));
  const byId = new Map();
  let metric = 'citations', moving = !reduced.matches;
  let nodes = [], edges = [], width = 0, height = 0, cell = 0, scale = 1;
  let frame = 0, last = 0, elapsed = 0, held = null, hovered = null, focused = null;

  $('scope-count').textContent = format(core.length) + ' papers · 2020–2026';
  $('area-list').innerHTML = groups.map(({area, papers}) => {
    const [name, color] = AREAS[area];
    return `<a class="bar-row" data-area="${area}" href="${libLink({area})}" style="--series:${color}">
      <span class="bar-label">${esc(name)}<b>${papers.length}</b></span>
      <span class="bar-track"><i style="width:${100 * papers.length / groups[0].papers.length}%"></i></span></a>`;
  }).join('');

  function element(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  }

  function quantity(paper) {
    const unit = metric === 'citations' ? 'citations received' : 'references';
    return paper[metric] == null ? unit + ' unavailable' : format(paper[metric]) + ' ' + unit;
  }

  for (const group of groups) {
    const [name, color] = AREAS[group.area];
    group.el = element('g', {'data-group':group.area, role:'group', 'aria-label':name, style:'--series:'+color});
    group.label = element('text', {class:'cluster-name', 'text-anchor':'middle'});
    group.label.textContent = name;
    group.nodes = group.papers.map((paper, i) => {
      const el = element('circle', {'data-id':paper.id, class:'paper-bubble', fill:color, role:'button', tabindex:i===0?0:-1});
      group.el.append(el);
      const n = {paper, group, el, phase:(nodes.length+1)*2.399963, vx:0, vy:0};
      nodes.push(n);
      byId.set(paper.id,n);
      return n;
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
      const packed = g.nodes.map(n => {
        const value = n.paper[metric];
        n.raw = value == null ? 1.55 : 1.55 + .92*Math.log1p(value);
        n.el.classList.toggle('unknown',value == null);
        n.el.setAttribute('aria-label', n.paper.title + ', ' + n.paper.year + ', ' + quantity(n.paper));
        return {n, r:n.raw+1.1};
      }).sort((a,b) => b.r-a.r);
      d3.packSiblings(packed);
      const enclosure = d3.packEnclose(packed);
      g.raw = enclosure.r;
      for (const p of packed) { p.n.lx = p.x-enclosure.x; p.n.ly = p.y-enclosure.y; }
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
    scale=Math.max(.02,Math.min((width-2*side)/(right-left),(height-size*2-18)/(bottom-top)));
    const ox=(width-(right-left)*scale)/2-left*scale, oy=(height-(bottom-top)*scale-size*1.5)/2-top*scale;
    for (const g of groups) {
      g.x=ox+g.cx*scale; g.y=oy+g.cy*scale; g.r=g.raw*scale;
      g.label.setAttribute('font-size',size);
      const half=g.label.getComputedTextLength()/2+3;
      g.label.setAttribute('x',Math.max(half,Math.min(width-half,g.x)));
      g.label.setAttribute('y',g.y+g.r+size);
      for (const n of g.nodes) {
        n.x=g.x+n.lx*scale; n.y=g.y+n.ly*scale; n.r=n.raw*scale;
        n.vx=0; n.vy=0; n.el.setAttribute('r',n.r);
      }
    }
    cell=Math.max(8,Math.max(...nodes.map(n=>n.r))*2+2);
    paint();
    wake();
  }

  function positionTip(n) {
    tip.style.left=Math.max(2, Math.min(width-tip.offsetWidth-2,n.x-tip.offsetWidth/2))+'px';
    tip.style.top=(n.y-n.r>tip.offsetHeight+8 ? n.y-n.r-tip.offsetHeight-5 : n.y+n.r+5)+'px';
  }
  function active() { return held?.node || hovered || focused; }
  function describe() {
    const n=active();
    tip.hidden=!n;
    if (n) {tip.textContent=n.paper.title+' · '+quantity(n.paper);positionTip(n);}
    drawEdges();
  }
  function drawEdges() {
    if (canvas.hidden) return;
    ctx.clearRect(0,0,width,height);
    const selected=active();
    ctx.beginPath();
    for (const [a,b] of edges) {ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
    ctx.strokeStyle=selected?'rgba(55,72,70,.024)':'rgba(55,72,70,.105)';
    ctx.lineWidth=.65;ctx.stroke();
    if (!selected) return;
    // On incident links the arrow points to the referenced paper.
    ctx.beginPath();
    for (const [a,b] of edges) {
      if (a!==selected && b!==selected) continue;
      const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
      if (len <= a.r+b.r+1) continue;
      const ux=dx/len, uy=dy/len, x=b.x-ux*(b.r+1), y=b.y-uy*(b.r+1);
      ctx.moveTo(a.x,a.y);ctx.lineTo(x,y);
      ctx.lineTo(x-ux*5-uy*2.2,y-uy*5+ux*2.2);ctx.moveTo(x,y);ctx.lineTo(x-ux*5+uy*2.2,y-uy*5-ux*2.2);
    }
    ctx.lineWidth=1.25;ctx.strokeStyle='rgba(28,67,58,.74)';ctx.stroke();
  }
  function paint() {
    for (const n of nodes) {n.el.setAttribute('cx',n.x.toFixed(2));n.el.setAttribute('cy',n.y.toFixed(2));}
    drawEdges();
  }
  function step(dt) {
    elapsed+=dt;
    const pinned=active(), grid=new Map(), speed=Math.max(3,Math.min(11,scale*4.7));
    for (const n of nodes) {
      const g=n.group, dx=n.x-g.x, dy=n.y-g.y, dist=Math.hypot(dx,dy)||1;
      // A soft outer boundary keeps category membership legible as individual papers drift.
      const pull=Math.max(0,dist+n.r-g.r)*2.4;
      if (n!==pinned) {
        const angle=n.phase+.65*elapsed+Math.sin(n.phase*.7+elapsed*.24);
        const blend=Math.min(1,dt*2.2);
        n.vx+=(Math.cos(angle)*speed-dx/dist*pull-.031*dy-n.vx)*blend;
        n.vy+=(Math.sin(angle)*speed-dy/dist*pull+.031*dx-n.vy)*blend;
        n.x+=n.vx*dt; n.y+=n.vy*dt;
      }
      const gx=Math.floor(n.x/cell), gy=Math.floor(n.y/cell);
      for (let i=gx-1;i<=gx+1;i++) for (let j=gy-1;j<=gy+1;j++) {
        const nearby=grid.get(i+','+j);
        if (!nearby) continue;
        for (const b of nearby) {
          const xx=n.x-b.x, yy=n.y-b.y, min=n.r+b.r+.35;
          const square=xx*xx+yy*yy;
          if (square>=min*min) continue;
          const len=Math.sqrt(square)||.01, overlap=(min-len)/len;
          const share=n===pinned?0:b===pinned?1:.5;
          n.x+=xx*overlap*share; n.y+=yy*overlap*share;
          b.x-=xx*overlap*(1-share); b.y-=yy*overlap*(1-share);
        }
      }
      n.x=Math.max(n.r,Math.min(width-n.r,n.x)); n.y=Math.max(n.r,Math.min(height-n.r,n.y));
      const key=gx+','+gy;
      if (!grid.has(key)) grid.set(key,[]);
      grid.get(key).push(n);
    }
    paint();
  }
  function visible() {return !$('atlas').hidden && !$('paper').open && !document.hidden;}
  function tick(time) {
    frame=0;
    if (!moving || !visible()) {last=0;return;}
    if (!last || time-last>=32) {step(last?Math.min((time-last)/1000,.065):.033);last=time;}
    frame=requestAnimationFrame(tick);
  }
  function wake() {if (!frame && moving && visible()) {last=0;frame=requestAnimationFrame(tick);}}
  function setMotion(value) {
    moving=value;
    const name=(moving?'Pause':'Resume')+' motion';
    $('motion').setAttribute('aria-label',name);$('motion').title=name;
    $('motion').innerHTML=moving?'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10m6-10v10"/></svg>':'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5z"/></svg>';
    wake();
  }
  $('motion').onclick=()=>setMotion(!moving);
  reduced.addEventListener('change',e=>setMotion(!e.matches));
  setMotion(moving);
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
    if (!n || e.button!==0) return;
    held={node:n, id:e.pointerId, startX:e.clientX, startY:e.clientY, dragged:false};
    n.el.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove',e=>{
    if (!held || held.id!==e.pointerId) return;
    if (Math.hypot(e.clientX-held.startX,e.clientY-held.startY)>4) held.dragged=true;
    if (!held.dragged) return;
    const rect=svg.getBoundingClientRect(), n=held.node;
    n.x=Math.max(n.r,Math.min(width-n.r,e.clientX-rect.left));
    n.y=Math.max(n.r,Math.min(height-n.r,e.clientY-rect.top));
    paint();describe();
  });
  svg.addEventListener('pointerup',e=>{
    if (!held || e.pointerId!==held.id) return;
    const {node,dragged}=held;
    held=null; hovered=null; node.el.releasePointerCapture(e.pointerId);
    if (dragged) {node.el.blur();describe();}
    else {tip.hidden=true;openWork(node.paper.id);}
  });
  svg.addEventListener('pointercancel',()=>{held=null;hovered=null;describe();});
  svg.addEventListener('click',e=>{
    if (e.target.classList.contains('cluster-name')) location.hash=libLink({area:e.target.parentNode.dataset.group});
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
  for (const row of document.querySelectorAll('.bar-row')) {
    const highlight=on=>groups.forEach(g=>g.el.classList.toggle('faded',on && g.area!==row.dataset.area));
    row.onpointerenter=row.onfocus=()=>highlight(true);
    row.onpointerleave=row.onblur=()=>highlight(false);
  }
  new ResizeObserver(layout).observe(svg);
  window.addEventListener('hashchange',wake);
  document.addEventListener('visibilitychange',wake);
  $('paper').addEventListener('close',wake);
  layout();
}
