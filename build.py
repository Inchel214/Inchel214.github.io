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
from datetime import datetime

ROOT = pathlib.Path(__file__).parent.resolve()
POSTS_DIR = ROOT / 'posts'
OUT_DIR = ROOT / 'public'
ASSETS_DIR = ROOT / 'assets'

TEMPLATE_PAGE = '''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body>
  <div class="container">
    <a href="./index.html" style="text-decoration:none;color:inherit"><h1>Inchel214 的技术博客</h1></a>
    <hr>
    {content}
    <hr>
    <footer>生成于 {time}</footer>
  </div>
</body>
</html>
'''


def slugify(name: str) -> str:
    s = name.lower()
    s = s.replace(' ', '-')
    s = ''.join(c for c in s if c.isalnum() or c in '-_')
    return s


def parse_markdown(md_path: pathlib.Path):
    text = md_path.read_text(encoding='utf-8')
    # 简单规则：第一行以 # 开头视为标题，下一行为日期（可选）
    lines = text.splitlines()
    title = md_path.stem
    date = None
    if lines:
        if lines[0].startswith('#'):
            title = lines[0].lstrip('#').strip()
            # 查找下一行是否是日期形式 yyyy-mm-dd
            if len(lines) > 1:
                maybe = lines[1].strip()
                try:
                    datetime.strptime(maybe, '%Y-%m-%d')
                    date = maybe
                    # 移除前两行用于 markdown 转换
                    body = '\n'.join(lines[2:])
                except Exception:
                    body = '\n'.join(lines[1:])
        else:
            body = text
    else:
        body = ''

    html = markdown.markdown(body)
    return title, date, html


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
    for md in sorted(POSTS_DIR.glob('*.md')):
        title, date, html = parse_markdown(md)
        slug = slugify(md.stem)
        out_file = posts_out / f"{slug}.html"
        page = TEMPLATE_PAGE.format(title=title, content=f"<article>\n{html}\n</article>", time=datetime.utcnow().isoformat())
        out_file.write_text(page, encoding='utf-8')
        posts_index.append({'title': title, 'date': date or '', 'url': f'posts/{slug}.html'})

    # 生成首页（简单列表）
    list_items = '\n'.join(f"<li><a href='./{p['url']}'>{p['title']}</a> <small style='color:#9aa4b2'>{p['date']}</small></li>" for p in posts_index)
    index_content = f"<h2>最新文章</h2>\n<ul>\n{list_items}\n</ul>"
    index_page = TEMPLATE_PAGE.format(title='Inchel214 的技术博客', content=index_content, time=datetime.utcnow().isoformat())
    (OUT_DIR / 'index.html').write_text(index_page, encoding='utf-8')

    print('构建完成 ->', OUT_DIR)


if __name__ == '__main__':
    build()
