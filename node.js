const container = document.querySelector('.scroll-container');

let target = container.scrollLeft;   // position visée
let current = container.scrollLeft;  // position affichée
let rafId = null;

const maxScroll = () => container.scrollWidth - container.clientWidth;

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