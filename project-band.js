(() => {
  const viewport = document.querySelector('.project-references-viewport');
  const track = document.querySelector('.project-references-track');
  if (!viewport || !track) return;
  const cards = [...track.querySelectorAll('.reference-card')];
  const prev = document.querySelector('.project-reference-prev');
  const next = document.querySelector('.project-reference-next');
  let index = 0;
  const move = direction => {
    if (!cards.length) return;
    index = (index + direction + cards.length) % cards.length;
    const card = cards[index];
    const max = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const left = Math.min(card.offsetLeft, max);
    track.style.transform = `translateX(-${left}px)`;
  };
  prev?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  let touchStart = 0;
  viewport.addEventListener('touchstart', e => { touchStart = e.changedTouches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
  }, { passive: true });
  window.addEventListener('resize', () => move(0));
})();
