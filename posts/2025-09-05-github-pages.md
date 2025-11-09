---
title: "从零开始搭建静态博客并部署到 GitHub Pages"
date: 2025-11-05
tags: [部署, 工具链]
excerpt: "一步步讲解如何用最小工具链搭建并通过 GitHub Actions 自动部署静态博客。"
layout: post.njk
---

这是一篇从零开始的实践指南，手把手带你搭建一个静态博客并部署到 GitHub Pages。文中所用到的代码与结构均可直接参考本仓库，力求通用、易懂、可复用。

本文包含：
- 项目初始化与目录结构
- 使用 Eleventy 作为静态站点生成器
- 本地开发与构建
- 通过 GitHub Actions 部署到 GitHub Pages
- 常见问题与排查（404、模板语法、时间戳稳定性、基础路径等）
- 若干优化建议（样式与图标）

提示：如果你只想快速使用模板，可以直接 Fork 本仓库，修改 `_data/site.json` 中的站点信息与 `posts` 下的文章 Markdown，再推送到 `main` 分支即可自动部署。

**最终线上地址示例**：`https://inchel214.github.io/`

## 1. 为什么选择 Eleventy + GitHub Pages

- Eleventy（11ty）是一个简洁的静态站点生成器，支持 Nunjucks、Markdown 等模板；零配置即可用，也能轻松自定义。
- GitHub Pages 原生支持通过 Actions 部署，免费、稳定、可绑定自定义域名。
- 基本流程非常清晰：本地写 Markdown → 模板渲染 → 构建输出 → 通过 Actions 部署到 Pages。

## 2. 项目初始化与目录结构

新建一个空仓库，例如 `yourname/yourname.github.io`（用户名仓库），或任意仓库名（配合 Pages 的 Project 或 Organizational 站点）。在本地创建并进入目录：

```bash
mkdir yourname.github.io
cd yourname.github.io
git init
```

初始化 Node 项目并安装 Eleventy（开发依赖）：

```bash
npm init -y
npm install -D @11ty/eleventy
```

添加脚本到 `package.json`：

```json
{
  "scripts": {
    "build": "eleventy",
    "start": "eleventy --serve",
    "new:post": "node scripts/new-post.js"
  },
  "devDependencies": {
    "@11ty/eleventy": "^1.0.0"
  }
}
```

目录结构建议如下（与本项目一致）：

```
├── .eleventy.js              # Eleventy 配置
├── .github/workflows/pages.yml  # GitHub Actions 工作流
├── _data/
│   ├── site.json            # 站点的公共信息，如 title、url
│   └── env.js               # 环境信息（本地/生产）
├── _includes/layouts/
│   ├── base.njk             # 基础布局（导航、页脚等）
│   └── post.njk             # 文章布局（标题、元信息等）
├── assets/
│   ├── css/style.css        # 站点样式
│   └── img/                 # 图片/图标
├── index.njk                # 首页模板
├── posts/                   # Markdown 文章
│   ├── 2025-09-05-hello.md  # 示例文章
│   └── _template.md         # 新文章模板
└── sitemap.xml.njk, feed.xml.njk 等
```

## 3. 配置 Eleventy：`.eleventy.js`

核心配置如下（本项目片段），将输入目录、布局、输出目录设置清楚，同时添加一些常用的 Nunjucks 过滤器和集合：

```js
module.exports = function(eleventyConfig) {
  const fs = require('fs');
  const { execSync } = require('child_process');

  // 透传静态资源（例如 assets）
  eleventyConfig.addPassthroughCopy("assets");

  // 年份过滤器
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // 北京时间格式化过滤器（示例）
  eleventyConfig.addFilter("dateLocal", function(dateObj, format) {
    if(!dateObj) return '';
    const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
    if (isNaN(d.getTime())) return '';
    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(d).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
    const yyyy = parts.year, mm = parts.month, dd = parts.day;
    const HH = parts.hour, min = parts.minute, ss = parts.second;
    if(!format || format === 'yyyy-LL-dd') return `${yyyy}-${mm}-${dd}`;
    if(format === 'yyyy-LL-dd HH:mm') return `${yyyy}-${mm}-${dd} ${HH}:${min}`;
    if(format === 'yyyy-LL-dd HH:mm:ss') return `${yyyy}-${mm}-${dd} ${HH}:${min}:${ss}`;
    return `${yyyy}-${mm}-${dd} ${HH}:${min}:${ss}`;
  });

  // 使用 Git 最后提交时间作为“最后更新”，构建更稳定
  function gitLastModifiedDate(inputPath) {
    if(!inputPath) return null;
    try {
      const out = execSync(`git log -1 --format=%cI -- "${inputPath}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if(out) {
        const d = new Date(out);
        if(!isNaN(d.getTime())) return d;
      }
    } catch (e) {}
    return null;
  }

  eleventyConfig.addFilter("fileUpdated", function(inputPath) {
    if(!inputPath) return '';
    const gitDate = gitLastModifiedDate(inputPath);
    if(gitDate) return gitDate;
    try { return fs.statSync(inputPath).mtime; } catch(e) { return ''; }
  });

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .map(item => {
        const gitDate = gitLastModifiedDate(item.inputPath);
        if(gitDate) item.data.updated = gitDate;
        else {
          try { item.data.updated = fs.statSync(item.inputPath).mtime; } catch(e) {}
        }
        return item;
      })
      .reverse();
  });

  return {
    dir: { input: ".", includes: "_includes", data: "_data", layouts: "_includes/layouts", output: "public" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};
```

## 4. 站点数据与模板

站点数据文件 `_data/site.json`：

```json
{
  "title": "Inchel Lee 的技术博客",
  "description": "记录项目、分享工程实践。",
  "url": "https://inchel214.github.io"
}
```

环境数据 `_data/env.js`：用于区分本地与线上环境，生成正确的首页链接（避免 Pages 上不必要的 404）。

```js
module.exports = {
  isProd: true // GitHub Pages 上构建时可设为 true；本地预览也可按需控制
};
```

基础布局 `_includes/layouts/base.njk`（片段）：注意这里使用 Nunjucks 的 `if/set` 写法而不是三目表达式，以兼容 Eleventy 的解析器。

{% raw %}
```njk
{% if env and env.isProd %}
  {% set homeHref = (site.url | trim('/')) ~ '/' %}
{% else %}
  {% set homeHref = '/' %}
{% endif %}

<a class="brand" href="{{ homeHref }}">Inchel Lee</a>
<nav class="main-nav">
  <a href="{{ homeHref }}">首页</a>
  <a href="{{ homeHref }}#projects">项目</a>
  <a href="{{ homeHref }}#posts">文章</a>
  <a href="{{ homeHref }}#about">关于</a>
  <a href="{{ homeHref }}#contact">联系我</a>
  </nav>
```
{% endraw %}

文章布局 `_includes/layouts/post.njk`（片段）：

{% raw %}
```njk
{% if env and env.isProd %}
  {% set homeHref = (site.url | trim('/')) ~ '/' %}
{% else %}
  {% set homeHref = '/' %}
{% endif %}

<a href="{{ homeHref }}">← 返回首页</a>
```
{% endraw %}

首页模板 `index.njk`：将最新文章列表渲染到主页；“阅读全文”链接跳转到对应文章页。

{% raw %}
```njk
{% for post in collections.posts %}
  <article class="post-card">
    <h3><a href="{{ post.url }}">{{ post.data.title or post.fileSlug }}</a></h3>
    <p class="meta">更新于：{{ post.data.updated | dateLocal("yyyy-LL-dd HH:mm") }}</p>
    {% if post.data.excerpt %}
      <p class="excerpt">{{ post.data.excerpt }}</p>
    {% endif %}
    <a class="read-more" href="{{ post.url }}">阅读全文 →</a>
  </article>
{% endfor %}
```
{% endraw %}

## 5. 本地开发与构建

启动本地预览：

```bash
npm start
# 访问 http://localhost:8080/
```

构建静态文件（输出到 `public/`）：

```bash
npm run build
```

Windows PowerShell 小提示：不要使用 `&&` 连接命令（在某些版本 PowerShell 中不可用），可以用分号 `;` 分隔：

```powershell
git add -A ; git commit -m "feat: add first post" ; git push origin main
```

## 6. 通过 GitHub Actions 部署到 GitHub Pages

推荐使用 Actions 模式，而不是 “Deploy from a branch”。在 `.github/workflows/pages.yml` 添加如下工作流（本项目使用的版本）：

{% raw %}
```yaml
name: build-and-deploy-pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build site (Eleventy)
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.pages_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
{% endraw %}

部署设置：进入仓库 `Settings → Pages → Build and deployment`，将 Source 设置为 “GitHub Actions”。然后每次推送到 `main`，都会自动构建并部署。

## 7. 常见问题与排查

### 7.1 首页面 404 或出现 “For root URLs… you must provide an index.html”

- 现象：根地址 404 或提示需要 `index.html`。
- 原因：如果选择了 “Deploy from a branch”，Pages 直接使用仓库中的静态文件，此时需要在根目录提供 `index.html`；而使用 Actions 模式时，Pages 使用工作流上传的构建产物作为站点根，仓库根目录的 `index.html` 反而会引起误导重定向（例如跳转到不存在的 `/public/index.html`）。
- 解决：使用 “GitHub Actions” 模式，并确保工作流中 `upload-pages-artifact` 指向 `./public`。

### 7.2 模板报错：`parseAggregate: expected comma after expression`

- 现象：构建失败，堆栈指向 Nunjucks 模板。
{% raw %}
- 原因：Eleventy 的 Nunjucks 引擎不支持 JS 风格的三目表达式写法（例如 `{% set x = (cond ? a : b) %}`）。
{% endraw %}
- 解决：改用标准的 Nunjucks `if/set` 写法：

{% raw %}
```njk
{% if cond %}{% set x = a %}{% else %}{% set x = b %}{% endif %}
```
{% endraw %}

### 7.3 “返回首页”或导航链接在 Pages 上偶发 404

- 原因：线上环境的路径解析与本地不同，根路径需要依据站点 URL 生成。
- 解决：通过 `_data/env.js` 与 `_data/site.json`，在模板里动态生成 `homeHref`（见上文布局片段）。

### 7.4 文章“最后更新”时间每次构建都会变化

- 原因：如果取文件系统的 `mtime`，在 CI（Actions）环境下检出时会刷新，导致时间不稳定。
- 解决：使用 Git 最后提交时间（见上文 `.eleventy.js` 片段），无法获取时再回退到 `mtime`。

### 7.5 本地预览端口或命令问题

- Windows PowerShell 中不要用 `&&`，改用分号 `;`。
- 端口占用时可通过 `eleventy --serve --port=8081` 指定其他端口。

## 8. 样式与图标的小优化（可选）

- 背景从渐变改为纯色变量 `--bg`，整体更简洁；卡片面板的透明度适当提高（例如从 `0.02` 到 `0.06`），提升内容清晰度。
- `github.svg` 使用 `fill="currentColor"`，图标继承文字颜色，能自然适配主题与悬停状态。
- 所有图标统一复用 `.icon` 样式（大小与对齐一致），例如：

```html
<p><img class="icon" src="/assets/img/github.svg" alt="GitHub">GitHub：<a href="https://github.com/YourName">YourName</a></p>
```

## 9. 总结与下一步

至此，你已经完成：本地用 Eleventy 写博客 → 通过 GitHub Actions 自动构建与部署到 Pages → 解决常见路径与时间戳问题。后续你可以：

- 在 `posts/` 中添加更多 Markdown 文章；
- 扩展 `_includes/layouts/` 模板，实现标签页、归档页；
- 在 `assets/css/style.css` 自定义主题色与排版；
- 配置自定义域名（`Settings → Pages → Custom domain`）。