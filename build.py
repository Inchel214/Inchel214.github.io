#!/usr/bin/env python3
"""简单站点生成脚本：
- 将 `posts/*.md` 转换为 `public/posts/*.html`
- 复制 `assets/` 到 `public/assets`
- 生成 `public/index.html` 列表

依赖：pip install markdown
"""
import os
import pathlib
import shutil
import markdown
try:
    import frontmatter
except Exception:
    frontmatter = None
from datetime import datetime

ROOT = pathlib.Path(__file__).parent.resolve()
POSTS_DIR = ROOT / 'posts'
OUT_DIR = ROOT / 'public'
ASSETS_DIR = ROOT / 'assets'

TEMPLATE_PAGE = None  # 保留为兼容老代码；当前构建会尝试读取根目录的 index.html 作为模板


def slugify(name: str) -> str:
    s = name.lower()
    s = s.replace(' ', '-')
    s = ''.join(c for c in s if c.isalnum() or c in '-_')
    return s


def parse_markdown(md_path: pathlib.Path):
    """解析 Markdown 文件，优先使用 YAML front-matter（若可用），返回 dict:
    { title, date, html, excerpt, tags, cover }
    兼容无 front-matter 的老格式（首行 # 标题、第二行 yyyy-mm-dd）。
    """
    text = md_path.read_text(encoding='utf-8')
    title = md_path.stem
    date = ''
    excerpt = ''
    tags = []
    cover = None

    if frontmatter:
        post = frontmatter.loads(text)
        meta = post.metadata or {}
        title = meta.get('title') or title
        date = meta.get('date') or ''
        excerpt = meta.get('excerpt') or ''
        tags = meta.get('tags') or []
        cover = meta.get('cover')
        body = post.content or ''
    else:
        # 退回兼容解析
        lines = text.splitlines()
        if lines:
            if lines[0].startswith('#'):
                title = lines[0].lstrip('#').strip()
                if len(lines) > 1:
                    maybe = lines[1].strip()
                    try:
                        datetime.strptime(maybe, '%Y-%m-%d')
                        date = maybe
                        body = '\n'.join(lines[2:])
                    except Exception:
                        body = '\n'.join(lines[1:])
            else:
                body = text
        else:
            body = ''

    html = markdown.markdown(body)
    return {
        'title': title,
        'date': date,
        'html': html,
        'excerpt': excerpt,
        'tags': tags,
        'cover': cover,
    }


def build():
    if not POSTS_DIR.exists():
        print('没有 posts 目录，跳过构建（你可以在 posts/ 下添加 .md 文件）。')
        return

    # 清理输出目录
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    # 复制 assets
    if ASSETS_DIR.exists():
        shutil.copytree(ASSETS_DIR, OUT_DIR / 'assets')

    posts_out = OUT_DIR / 'posts'
    posts_out.mkdir(parents=True, exist_ok=True)
    posts_index = []
    md_list = sorted(POSTS_DIR.glob('*.md'))
    for md in md_list:
        post = parse_markdown(md)
        title = post.get('title')
        date = post.get('date')
        html = post.get('html')
        excerpt = post.get('excerpt')
        tags = post.get('tags')
        cover = post.get('cover')
        slug = slugify(md.stem)
        out_file = posts_out / f"{slug}.html"

        # 为单篇文章使用一个简单模板（避免复杂依赖）
        article_page = f'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
  <div class="container article-content">
    <a href="../index.html" style="text-decoration:none;color:inherit"><h1>Inchel214 的技术博客</h1></a>
    <hr>
    <article>
{html}
    </article>
    <hr>
    <footer>生成于 {datetime.utcnow().isoformat()}</footer>
  </div>
</body>
</html>
'''

        out_file.write_text(article_page, encoding='utf-8')
        posts_index.append({'title': title, 'date': date or '', 'url': f'posts/{slug}.html', 'excerpt': excerpt or '', 'tags': tags or [], 'cover': cover})

    # 生成首页：优先使用仓库根的 index.html 作为模板并注入文章卡片
    # 把文章渲染为与根站点一致的卡片列表 HTML
    
    cards = []
    for p in posts_index:
        cards.append(f"""
<article class="post-card">
  <div class="thumb">
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="100" height="60" fill="#dfe6e9"></rect>
    </svg>
  </div>
  <div class="post-body">
    <h3>{p['title']}</h3>
    <p class="meta">{p['date']}</p>
    <a class="read-more" href="./{p['url']}">阅读全文 →</a>
  </div>
</article>
""")

    cards_html = '\n'.join(cards)
    posts_section = f"<section id=\"posts\" class=\"posts-grid\">\n  <h2 class=\"section-title\">最新文章</h2>\n  <div class=\"grid\">\n{cards_html}\n  </div>\n</section>"

    index_template_path = ROOT / 'index.html'
    if index_template_path.exists():
        template_text = index_template_path.read_text(encoding='utf-8')
        if '<!-- CONTENT -->' in template_text:
            out_index = template_text.replace('<!-- CONTENT -->', posts_section)
        else:
            # 如果没找到占位标记，简单把 posts_section 添加到末尾的 main 容器前
            out_index = template_text.replace('</main>', posts_section + '\n</main>')
    else:
        # 回退到简单页（不会出现通常情况）
        out_index = f"<!doctype html><html><body>{posts_section}</body></html>"

    (OUT_DIR / 'index.html').write_text(out_index, encoding='utf-8')

    print('构建完成 ->', OUT_DIR)


if __name__ == '__main__':
    build()
