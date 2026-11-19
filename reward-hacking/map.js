'use strict';
{
  const svg = $('bubble-map');
  const tooltip = $('bubble-tip');
  const ns = 'http://www.w3.org/2000/svg';
  const groups = areaKeys.map(area => ({
    area,
    papers: core.filter(paper => paper.area === area).sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))
  }));

  $('scope-count').textContent = `${core.length} papers · January 2020 – November 2026`;
  const largest = groups[0].papers.length;
  $('area-list').innerHTML = groups.map(({area, papers}) => {
    const [name, color] = AREAS[area];
    return `<a class="bar-row" data-area="${area}" href="${libLink({area})}" style="--series:${color}">
      <span class="bar-label">${esc(name)}<b>${papers.length}</b></span>
      <span class="bar-track"><i style="width:${100 * papers.length / largest}%"></i></span>
    </a>`;
  }).join('');

  function element(name, attributes) {
    const node = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }

  // Pack identical paper markers onto a triangular lattice, starting at the center.
  function packing(count) {
    const extent = Math.ceil(Math.sqrt(count)) + 2;
    const slots = [];
    for (let row = -extent; row <= extent; row++) {
      for (let col = -extent; col <= extent; col++) {
        const x = col + (Math.abs(row) % 2) / 2;
        const y = row * Math.sqrt(3) / 2;
        slots.push({x, y, distance: Math.hypot(x, y)});
      }
    }
    return slots.sort((a, b) => a.distance - b.distance).slice(0, count);
  }
  for (const group of groups) group.slots = packing(group.papers.length);

  function draw() {
    const {width, height} = svg.getBoundingClientRect();
    if (!width || !height) return;
    const focused = svg.contains(document.activeElement) ? document.activeElement.dataset.id : null;
    tooltip.hidden = true;
    const wide = width / height > 1;
    // Category centers in the same units as the paper lattice. Fit the full set to the viewport.
    const centers = wide
      ? [[10,14],[29,10],[24,24],[36,22],[13,29],[19,1.5]]
      : [[10,12],[22,29],[26,14],[10,31],[15,41],[23,4]];
    const radii = groups.map(g => g.slots.at(-1).distance + .95);
    const left = Math.min(...centers.map(([x], i) => x-radii[i]));
    const top = Math.min(...centers.map(([,y], i) => y-radii[i]));
    const right = Math.max(...centers.map(([x], i) => x+radii[i]));
    const bottom = Math.max(...centers.map(([,y], i) => y+radii[i]));
    const mobile = width < 500;
    const margin = mobile ? 13 : 28;
    const labelSize = mobile ? 12 : 16;
    const pitch = Math.min((width-2*margin)/(right-left), (height-2*margin-2*labelSize)/(bottom-top));
    const ox = (width-pitch*(right-left))/2 - pitch*left;
    const oy = (height-pitch*(bottom-top)-labelSize*1.6)/2 - pitch*top;
    const fragment = document.createDocumentFragment();
    for (const [i, group] of groups.entries()) {
      const [name, color] = AREAS[group.area];
      const x = ox + centers[i][0]*pitch, y = oy + centers[i][1]*pitch;
      const radius = radii[i]*pitch;
      const cluster = element('g', {'data-group':group.area, 'aria-label':name, role:'group', style:`--series:${color}`});
      cluster.append(element('circle', {cx:x,cy:y,r:radius,class:'cluster-halo'}));
      group.papers.forEach((paper, j) => {
        const slot = group.slots[j];
        const dot = element('circle', {cx:x+slot.x*pitch, cy:y+slot.y*pitch, r:pitch*.405,
          'data-id':paper.id, class:'paper-bubble', fill:color, role:'button',
          tabindex:j===0?0:-1, 'aria-label':`${paper.title}, ${paper.year}`});
        cluster.append(dot);
      });
      const label = element('text', {x:Math.max(52,Math.min(width-55,x)), y:y+radius+labelSize*1.18,
        'text-anchor':'middle',class:'cluster-name','font-size':labelSize});
      label.textContent = name;
      cluster.append(label);
      fragment.append(cluster);
    }
    svg.replaceChildren(fragment);
    if (focused) svg.querySelector('[data-id="'+CSS.escape(focused)+'"]')?.focus({preventScroll:true});
  }

  function showTip(dot) {
    const paper = works.get(dot.dataset.id);
    if (!paper) return;
    tooltip.textContent = `${paper.year} · ${paper.title}`;
    tooltip.hidden = false;
    const parent = svg.getBoundingClientRect(), box = dot.getBoundingClientRect();
    const width = tooltip.offsetWidth, height = tooltip.offsetHeight;
    tooltip.style.left = Math.max(2,Math.min(parent.width-width-2,box.left-parent.left+box.width/2-width/2))+'px';
    tooltip.style.top = (box.top-parent.top>height+10 ? box.top-parent.top-height-6 : box.bottom-parent.top+5)+'px';
  }
  svg.addEventListener('pointerover', e => {if(e.target.hasAttribute('data-id')) showTip(e.target)});
  svg.addEventListener('pointerout', () => {tooltip.hidden=true});
  svg.addEventListener('focusin', e => {if(e.target.hasAttribute('data-id')) showTip(e.target)});
  svg.addEventListener('focusout', () => {tooltip.hidden=true});
  svg.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (id) {tooltip.hidden=true;openWork(id)}
    else if (e.target.classList.contains('cluster-name')) location.hash=libLink({area:e.target.parentNode.dataset.group});
  });
  svg.addEventListener('keydown', e => {
    const dot=e.target;
    if(!dot.dataset.id) return;
    if(e.key==='Enter'||e.key===' ') {e.preventDefault();openWork(dot.dataset.id);return}
    const direction={ArrowLeft:-1,ArrowDown:1,ArrowRight:1,ArrowUp:-1}[e.key];
    if(!direction) return;
    e.preventDefault();
    const dots=[...dot.parentNode.querySelectorAll('[data-id]')];
    const next=dots[(dots.indexOf(dot)+direction+dots.length)%dots.length];
    dot.setAttribute('tabindex','-1');next.setAttribute('tabindex','0');next.focus();
  });
  for (const row of document.querySelectorAll('.bar-row')) {
    const emphasize = selected => {
      for(const group of svg.children) group.classList.toggle('faded',selected && group.dataset.group!==row.dataset.area);
    };
    row.onpointerenter=row.onfocus=()=>emphasize(true);
    row.onpointerleave=row.onblur=()=>emphasize(false);
  }
  new ResizeObserver(draw).observe(svg);
  draw();
}
