document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('tagSearch');
  const list = document.querySelector('.tag-list');
  const empty = document.getElementById('tagSearchEmpty');
  if (!input || !list) return;

  const items = Array.from(list.querySelectorAll('li'));

  function filter() {
    const q = (input.value || '').trim().toLowerCase();
    let visible = 0;
    items.forEach(li => {
      const text = li.querySelector('a')?.textContent?.toLowerCase() || '';
      const match = q === '' || text.includes(q);
      li.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (empty) empty.style.display = visible === 0 ? '' : 'none';
  }

  input.addEventListener('input', filter);
});