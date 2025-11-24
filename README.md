
# Inchel214.github.io（Eleventy 博客）

一个基于 Eleventy（11ty）的静态博客与项目展示站点。聚焦稳定构建、易读主题与轻量交互，内置标签体系、项目数据、双语切换、RSS 与站点地图。

## 功能概览
- 静态生成与输出：`eleventy` 生成至 `public/`
- 文章集合：`collections.posts` 按“最后更新”倒序（优先 Git 提交时间）
- 封面图：支持 Front Matter `image` 或自动提取正文第一张图片；相对路径自动规范化
- 标签系统：标签索引页与标签聚合页；侧栏 Top10 自动排除“项目相关标签”
- 项目模块：从 `_data/projects/*.json` 与 `data/projects.base.json` 聚合；首页项目卡片与项目列表页
- 国际化：`data-i18n` 字典 + `data-lang` 双语片段 + 语言切换按钮（中文/英文）
- 无障碍与交互：可见的键盘聚焦、链接悬停提示、同页锚点平滑滚动
- 订阅与 SEO：`/feed.xml`、`/sitemap.xml`、Canonical、OG、结构化数据（WebSite/Person）

## 目录结构
- `posts/` 文章 Markdown（Front Matter 定义标题、日期、标签、摘要、封面等）
- `_includes/layouts/` 模板（`base.njk` 页面框架、`post.njk` 文章模板）
- `index.njk` 首页模板（Hero、项目、最新文章、侧栏）
- `projects.njk` 项目列表页
- `tags.njk` 标签聚合页；`tags-index.njk` 标签索引页（支持搜索）
- `assets/` 静态资源（`css/`、`img/`、`js/`）
- `_data/` 站点数据（`site.json`、`env.js`、`projects.js` 与 `projects/*.json`）
- `.eleventy.js` Eleventy 配置：过滤器、集合、短代码、浏览器同步配置
- `.github/workflows/pages.yml` 自动部署到 GitHub Pages

## 本地开发
```bash
# 1) 安装依赖（首次或依赖变化时）
npm ci

# 2) 本地预览（含热刷新）
npm start
# 默认预览：http://localhost:8080/

# 3) 仅构建（生成静态文件到 public/）
npm run build
```
说明：`_data/env.js` 暴露 `isProd`，用于生产环境样式版本戳与首页链接根路径；浏览器同步在 `.eleventy.js` 中配置（关闭热注入、降低抖动，提升稳定性）。

## 写作与 Front Matter
推荐使用脚本快速新建文章：
```bash
npm run new:post -- "文章标题" --tags "后端,微服务" --excerpt "一两句摘要"
```
示例 Front Matter：
```yaml
---
layout: post.njk
title: 如何设计高可用的微服务架构
date: 2025-11-08
tags: [架构, 后端, 微服务]
excerpt: 介绍构建高可用微服务的关键原则……
image: /assets/img/sample-cover.svg
---
```
字段说明：
- `layout` 固定为 `post.njk`
- `date` 文章发布时间；页面显示为北京时间（Asia/Shanghai）
- `tags` 生成标签集合（出现在文章页与标签索引/聚合页）
- `excerpt` 首页卡片摘要（可选）
- `image` 首页卡片封面图（可选，建议 3:2）；正文相对图片路径如 `./img/xxx.png` 会被规范化到 `posts/.../img/xxx.png`

### 双语内容与文案切换
- 页面内文案：在元素上使用 `data-i18n="key"`，中文/英文文案在 `assets/js/lang.js` 的 `dict.zh/en` 中维护
- 双语片段：在 Markdown 内使用短代码
  ```njk
  {% zh %}中文内容{% endzh %}
  {% en %}English content{% enden %}
  ```
- 语言切换：点击右上角按钮在 `zh/en` 间切换；`data-lang="zh|en"` 片段会随语言显示/隐藏

## 标签页与搜索
- 标签索引：`/tags/` 展示所有标签，附带最近更新日期与文章数量
- 即时搜索：输入框 `#tagSearch`（`tags-index.njk`）配合 `assets/js/tags-search.js`，按标签名称实时筛选；无匹配时显示提示
- 标签聚合页：`/tags/{tag}/` 展示该标签下的所有文章卡片

## 部署与自动化
- 推送到 `main` 分支后，`pages.yml` 执行构建，将 `public/` 发布到 GitHub Pages
- Eleventy 配置中的日期过滤器与更新时间获取（优先 Git 最后提交时间，失败回退到文件 mtime）提升构建稳定性

## 常见问题与修复
- 项目标签参与侧栏前十：已通过集合层与模板层双重过滤排除（`.eleventy.js` 中 `topTags` + `index.njk` 二次过滤）
- 导航“冻结”：首页同页锚点已启用平滑滚动脚本；“项目”链接改为 `/projects/`，避免误触发锚点逻辑
- 图片路径规范化：正文相对路径（如 `./img/xxx.png`）在构建时自动转为站点内可访问路径

## 维护建议
- 图片放置在 `assets/img/` 并使用以 `/assets/...` 开头的站点路径或相对路径加 `normalizeCoverPath`
- 标签简洁明确（中文或英文），避免特殊符号；项目 `tag` 或 `slug` 建议与文章标签保持一致以启用点击跳转
- 样式调整可在 `assets/css/style.css` 完成；移动端默认隐藏 `.main-nav`，需要导航可新增开合菜单

