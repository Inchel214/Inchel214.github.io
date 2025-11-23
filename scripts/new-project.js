const fs = require('fs');
const path = require('path');

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-\u4e00-\u9fa5]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$|_/g, '');
}

function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseList(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function parseMetrics(str) {
  if (!str) return [];
  return str.split(',').map(item => {
    const [label, value] = item.split(':');
    const l = (label || '').trim();
    const v = (value || '').trim();
    if (!l || !v) return null;
    return { label_zh: l, label_en: l, value: v };
  }).filter(Boolean);
}

function parseArgs(argv) {
  const args = {
    titleZh: '',
    titleEn: '',
    oneZh: '',
    oneEn: '',
    period: '',
    status: 'in_progress',
    cover: '/assets/img/sample-cover.svg',
    stack: '',
    metrics: '',
    demo: '',
    post: '',
    insert: 'start'
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--title-zh' && argv[i+1]) { args.titleZh = argv[++i]; continue; }
    if (a === '--title-en' && argv[i+1]) { args.titleEn = argv[++i]; continue; }
    if (a === '--one-zh' && argv[i+1]) { args.oneZh = argv[++i]; continue; }
    if (a === '--one-en' && argv[i+1]) { args.oneEn = argv[++i]; continue; }
    if (a === '--period' && argv[i+1]) { args.period = argv[++i]; continue; }
    if (a === '--status' && argv[i+1]) { args.status = argv[++i]; continue; }
    if (a === '--cover' && argv[i+1]) { args.cover = argv[++i]; continue; }
    if (a === '--stack' && argv[i+1]) { args.stack = argv[++i]; continue; }
    if (a === '--metrics' && argv[i+1]) { args.metrics = argv[++i]; continue; }
    if (a === '--links-demo' && argv[i+1]) { args.demo = argv[++i]; continue; }
    if (a === '--links-post' && argv[i+1]) { args.post = argv[++i]; continue; }
    if (a === '--insert' && argv[i+1]) { args.insert = argv[++i]; continue; }
    if (!args.titleZh) { args.titleZh = a; }
  }
  if (!args.titleZh) {
    console.error('用法: npm run new:project -- "中文标题" [--title-en EN] [--one-zh 句子] [--one-en EN] [--period 2023–2025] [--status in_production|in_progress|experimental] [--cover /assets/img/sample-cover.svg] [--stack "Node.js,Python"] [--metrics "CPU 占用:-40%,部署成本:-30%"] [--links-demo URL] [--links-post URL] [--insert start|end]');
    process.exit(1);
  }
  if (!args.titleEn) args.titleEn = args.titleZh;
  if (!args.period) args.period = String(new Date().getFullYear());
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const dir = path.join(__dirname, '..', '_data', 'projects');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const slug = toSlug(args.titleEn || args.titleZh);
  const item = {
    slug,
    title_zh: args.titleZh,
    title_en: args.titleEn,
    one_liner_zh: args.oneZh || '',
    one_liner_en: args.oneEn || '',
    period: args.period,
    status: args.status,
    roles: [],
    stack: parseList(args.stack),
    domains: [],
    metrics: parseMetrics(args.metrics),
    cover: args.cover,
    links: {
      demo: args.demo || '#',
      post: args.post || ''
    },
    updated: today()
  };
  const outPath = path.join(dir, `${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(item, null, 2) + '\n', 'utf8');
  console.log('已添加项目文件:', outPath);
}

main();