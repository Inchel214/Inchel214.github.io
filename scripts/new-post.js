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

function parseArgs(argv) {
  const args = { title: '', date: '', tags: '', excerpt: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--title' && argv[i+1]) { args.title = argv[++i]; continue; }
    if (a === '--date' && argv[i+1]) { args.date = argv[++i]; continue; }
    if (a === '--tags' && argv[i+1]) { args.tags = argv[++i]; continue; }
    if (a === '--excerpt' && argv[i+1]) { args.excerpt = argv[++i]; continue; }
    if (!args.title) { args.title = a; }
  }
  if (!args.title) {
    console.error('用法: npm run new:post -- "标题" [--date YYYY-MM-DD] [--tags "tag1,tag2"] [--excerpt "摘要"]');
    process.exit(1);
  }
  if (!args.date) args.date = today();
  return args;
}

function main() {
  const { title, date, tags, excerpt } = parseArgs(process.argv);
  const slug = toSlug(title);
  const fileName = `${date}-${slug || 'post'}.md`;
  const postsDir = path.join(process.cwd(), 'posts');
  const filePath = path.join(postsDir, fileName);

  if (!fs.existsSync(postsDir)) {
    console.error(`未找到目录: ${postsDir}`);
    process.exit(1);
  }
  if (fs.existsSync(filePath)) {
    console.error(`文件已存在: ${filePath}`);
    process.exit(1);
  }

  const fmTags = tags ? `[${tags.split(',').map(t => t.trim()).filter(Boolean).join(', ')}]` : '[]';
  const fmExcerpt = excerpt || '';

  const content = `---\nlayout: post.njk\ntitle: ${title}\ndate: ${date}\ntags: ${fmTags}\nexcerpt: ${fmExcerpt}\n---\n\n开始写作吧！\n`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`已创建新文章: ${filePath}`);
}

main();