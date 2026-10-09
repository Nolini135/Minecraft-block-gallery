const BASE = 'https://cdn.jsdelivr.net/gh/PrismarineJS';
const CANDIDATES = ['26.1.2', '26.1', '1.21.11']; // du plus récent au plus ancien

const container = document.querySelector('.scroll-container');

let target = container.scrollLeft;   // position visée
let current = container.scrollLeft;  // position affichée
let rafId = null;

const maxScroll = () => container.scrollWidth - container.clientWidth;

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("the DOM is ready!");
  
});

// Get data
async function fetchBlocks() {
  const paths = await (await fetch(`${BASE}/minecraft-data/data/dataPaths.json`)).json();

  for (const version of CANDIDATES) {
    const entry = paths.pc[version];
    if (!entry?.blocks) continue;

    const res = await fetch(`${BASE}/minecraft-data/data/${entry.blocks}/blocks.json`);
    if (!res.ok) continue;

    console.log('Version chargée :', version);
    return { version, blocks: await res.json() };

  }
  throw new Error('Aucune version disponible');
}

// 2. Crée un .scroll-item par bloc (la partie que tu demandes)
function renderBlocks(version, blocks) {
  const fragment = document.createDocumentFragment();

  for (const block of blocks) {
    const item = document.createElement('div');
    item.className = 'scroll-item';
    item.dataset.name = block.displayName;
    item.dataset.description = `Dureté : ${block.hardness ?? 'infinie'}`;

    const img = document.createElement('img');
    img.src = `${BASE}/minecraft-assets/data/${version}/blocks/${block.name}.png`;
    img.alt = block.displayName;
    img.loading = 'lazy';
    img.onerror = () => item.remove();   // pas de texture : on retire le bloc
    item.appendChild(img);
    
    const p = document.createElement("p");
    p.textContent = block.displayName
    item.appendChild(p);

    fragment.appendChild(item);
  }

  container.appendChild(fragment);
}

// 3. Lance le tout
async function init() {
  try {
    const { version, blocks } = await fetchBlocks();
    renderBlocks(version, blocks);
  } catch (err) {
    console.error('Impossible de charger les blocs :', err);
  }
}

init();


container.addEventListener('wheel', (event) => {
  event.preventDefault();

  // deltaMode: 0 = pixels, 1 = lignes (certains navigateurs/souris)
  const delta = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY;

  target += delta;
  target = Math.max(0, Math.min(target, maxScroll())); // reste dans les limites

  if (!rafId) rafId = requestAnimationFrame(animate);
}, { passive: false });

function animate() {
  current += (target - current) * 0.1;   // 0.1 = douceur (plus petit = plus lent)
  container.scrollLeft = current;

  if (Math.abs(target - current) > 0.5) {
    rafId = requestAnimationFrame(animate);
  } else {
    current = target;
    container.scrollLeft = current;
    rafId = null;
  }
}