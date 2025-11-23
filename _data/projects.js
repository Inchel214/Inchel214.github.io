const fs = require('fs');
const path = require('path');

module.exports = () => {
  const dir = path.join(__dirname, 'projects');
  const arrPath = path.join(__dirname, '..', 'data', 'projects.base.json');
  let items = [];
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const obj = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (obj && obj.slug) items.push(obj);
      } catch {}
    }
  }
  if (fs.existsSync(arrPath)) {
    try {
      const arr = JSON.parse(fs.readFileSync(arrPath, 'utf8'));
      if (Array.isArray(arr)) items = items.concat(arr);
    } catch {}
  }
  const map = new Map();
  for (const it of items) {
    if (!it || !it.slug) continue;
    map.set(it.slug, it);
  }
  const out = Array.from(map.values());
  out.sort((a, b) => {
    const ad = new Date(a.updated || 0).getTime();
    const bd = new Date(b.updated || 0).getTime();
    return bd - ad;
  });
  return out;
};