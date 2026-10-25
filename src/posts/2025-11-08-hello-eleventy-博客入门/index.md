---
layout: post.njk
title: Hello Eleventy 博客入门
date: 2025-11-08
tags: [随笔, 教程, Eleventy]
excerpt: 以本项目为示例，讲清 Eleventy 的目录结构、模板与过滤器、集合与构建发布流程，并给出写作与常见问题处理。
image: /assets/img/sample-cover.svg
---

## 引言

这是一篇结合你当前仓库的 Eleventy（11ty）实战入门。我们不只讲概念，而是逐步说明项目如何组织目录、定义模板与过滤器、生成集合与 RSS/Sitemap、进行本地预览与自动部署。看完后，你可以独立维护与扩展整个博客站点。

## 项目结构与职责

- `index.njk`：首页模板。展示 Hero、最新文章卡片网格、侧栏信息。
- `posts/`：Markdown 文章目录。每篇文章在 Front Matter 中声明元信息（`title`、`date`、`tags`、`excerpt`、`image`）。
- `_includes/layouts/base.njk`：基础布局。包含 `<head>` 元数据、导航、页脚、JSON-LD 结构化数据与（可选）搜索引擎验证标签。
- `_includes/layouts/post.njk`：文章布局。渲染标题、发布时间（北京时间）、最后更新时间（Git 最后提交或文件时间）、标签列表，并显示正文内容。
- `_data/site.json`：站点元信息（`title`、`url`、`description`、`author`、`language`）。用于生成 RSS、Sitemap 与 JSON-LD。
- `.eleventy.js`：Eleventy 配置与过滤器。定义日期格式化、文件更新时间、文章集合与标签集合等。
- `feed.xml.njk`：RSS 订阅源（RSS 2.0）。供阅读器订阅站点更新。
- `sitemap.xml.njk`：站点地图。辅助搜索引擎抓取。
- `robots.txt.njk`：允许抓取并指向站点地图（已模板化，可用生产地址）。
- `assets/`：静态资源（CSS、图片、JS）。通过 `addPassthroughCopy` 透传到构建输出目录。
- `.github/workflows/pages.yml`：GitHub Actions 自动构建发布到 GitHub Pages。

## Eleventy 配置详解（`.eleventy.js`）

- 透传资源：`eleventyConfig.addPassthroughCopy("assets")`，让 `assets/` 直接复制到 `public/`。
- 日期过滤器：
  - `date(dateObj, format)`: 无格式时输出 ISO；用于 RSS/Sitemap 指定规范日期字符串。
  - `dateLocal(dateObj, format)`: 使用 `Intl.DateTimeFormat` 按 `Asia/Shanghai`（北京时间）输出。如 `yyyy-LL-dd HH:mm`。
    - 你会看到“仅写日期”如 `2025-11-08` 在北京时间会显示为 `08:00`（UTC 零点+8小时）。为避免误导，我们已调整文章页“发布于”只显示日期。
- 文件更新时间：
  - `fileUpdated(inputPath)`: 优先用 `git log -1 --format=%cI` 的最后提交时间；无 git 时回退到 `fs.statSync(inputPath).mtime`。
  - 首页卡片显示的“更新于”来自此过滤器结果（更贴近真实维护时间）。
- 集合：
  - `collections.posts`：从 `posts/*.md` 读取，最后 `.reverse()`，因此默认“按发布日期倒序”（最新在前）。
  - `collections.tagList`：收集所有标签并排序，用于展示标签列表或生成标签聚合页。
- 模板引擎与输出：指定输入/布局/输出目录，`markdownTemplateEngine` 与 `htmlTemplateEngine` 均为 `njk`，输出目录为 `public/`。

## 模板与渲染逻辑

- 文章页（`_includes/layouts/post.njk`）：
  - 标题：`{{ title }}`
  - 发布于：`{{ page.date | dateLocal('yyyy-LL-dd') }}`（仅日期）
  - 最后更新：`{{ page.inputPath | fileUpdated | dateLocal('yyyy-LL-dd HH:mm') }}`
  - 标签：循环渲染 `tags`，用于主题归类与内部链接。
  - JSON-LD：以 `BlogPosting` 输出结构化数据（包含发布时间、修改时间、作者、规范链接等）。

- 首页（`index.njk`）：
  - 最新文章卡片：循环 `collections.posts`，展示标题、`updated` 的北京时间、摘要与封面图。
  - Hero 插图：右侧使用 `assets/img/deep-learning-avatar.svg`，与暗色主题协调。

- 基础布局（`_includes/layouts/base.njk`）：
  - SEO 验证标签：支持 Google/Bing/百度，通过 `_data/site.json` 配置字段注入。
  - 结构化数据：输出 `WebSite` 与 `Person` 的 JSON-LD，帮助搜索引擎理解站点。
  - 国际化：页面有中英文切换按钮（样式已统一为胶囊版），`assets/js/lang.js` 负责切换；此外在 `.eleventy.js` 中提供 `{% zh %}{% endzh %}` 与 `{% en %}{% enden %}` 这两个成对短代码，方便在 Markdown 中写双语内容。

## 开发与构建

- 本地预览：`npm start`，访问 `http://localhost:8080/`。
- 仅构建：`npm run build`，输出到 `public/`。
- 自动部署：推送到 `main` 分支后，Actions 会执行构建并发布到 GitHub Pages（用户名仓库地址通常为 `https://<username>.github.io/`）。

## RSS 与 Sitemap 与 robots

- RSS：`/feed.xml`，每条 `<item>` 包含 `title`、`link`、`guid`、`pubDate`、`description`。阅读器可订阅你的更新。
- Sitemap：`/sitemap.xml`，包含所有页面的 `<loc>` 与 `<lastmod>`，辅助搜索引擎抓取与更新。
- robots：`/robots.txt`，允许所有 UA 抓取，并指向站点地图。生产环境下应在 `_data/site.json` 保持 `url` 为你的线上域名，以输出绝对链接。

## 写作流程与 Front Matter

- 推荐脚本：`npm run new:post -- "文章标题" --tags "后端,微服务" --excerpt "一两句摘要"` 会在 `posts/` 下生成带 Front Matter 的新文件。
- 常用字段：
  - `layout: post.njk`
  - `title: 文章标题`
  - `date: YYYY-MM-DD` 或 `YYYY-MM-DDTHH:mm:ss+08:00`（如需显示具体时间，使用带时区的完整时间）
  - `tags: [标签1, 标签2]`
  - `excerpt: 摘要`
  - `image: /assets/img/sample-cover.svg`（可选封面，建议 3:2）

## 时间与排序策略（实践建议）

- 发布显示：文章页“发布于”只显示日期，避免仅日期被解析为 UTC 后在北京时间显示 `08:00` 的困惑。
- 首页排序：默认按“发布日期倒序”。如果希望“按最后更新时间倒序”，可以在 `.eleventy.js` 中改用 `item.data.updated` 排序。
- RSS 顺序：当前模板已按集合顺序输出；如需保证“最新在前”，可移除额外的 `| reverse`。

## 样式与交互小结

- 语言切换按钮：已统一为胶囊样式，与导航链接保持一致的视觉与间距（12px）。
- Hero 插图样式：为 `img`/`svg` 做了统一的圆角与投影，适配暗色主题。

## 常见问题与排查

- 本地预览不可用：重启开发服务器（`npm start`），查看终端是否显示 Browsersync 的访问地址；修复模板错误后保存即可自动刷新。
- 推送失败（`Recv failure: Connection was reset`）：多数是网络防火墙/代理导致。建议改用 SSH 推送：生成密钥 → 添加到 GitHub → `git remote set-url origin git@github.com:<User>/<Repo>.git` → `ssh -T git@github.com` 验证 → `git push`。

## 总结

Eleventy 的优势在于“简单 + 可扩展”：用少量配置就能完成模板渲染、集合生成与输出，必要时再通过过滤器与脚本增强。你现在的项目已经具备完整的写作、预览、订阅与收录能力；后续可以继续增加标签/分类聚合页、归档页以及更丰富的组件与样式。
