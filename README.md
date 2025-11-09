
# Inchel214.github.io（Eleventy 博客）

一个用 Eleventy（11ty）构建的静态博客站点。保持功能简单可靠，默认开启：文章列表、封面图、RSS、站点地图与易读的暗色主题。

## 特性概览
- 基于 Eleventy 的静态生成，输出目录 `public/`
- 文章集合 `collections.posts` 自动按更新时间倒序
- 首页文章卡片支持封面图（Front Matter `image` 字段）或渐变占位
- 无障碍与可读性：键盘聚焦可见、链接悬停出现下划线提示
- 订阅与 SEO：`/feed.xml`、`/sitemap.xml`

## 目录结构
- `posts/` 文章 Markdown 文件（Front Matter 定义元信息）
- `_includes/layouts/` 页面与文章模板（`base.njk`、`post.njk`）
- `index.njk` 首页模板（Hero、最新文章、侧栏）
- `assets/` 静态资源（CSS、图片）
- `.eleventy.js` Eleventy 配置与过滤器
- `.github/workflows/pages.yml` 自动部署到 GitHub Pages

## 本地开发
```bash
# 1) 安装依赖（首次或依赖变化时）
npm ci

# 2) 本地预览（含热刷新）
npm start
# 预览地址：http://localhost:8080/

# 3) 仅构建（生成静态文件到 public/）
npm run build
```

备注：仓库中附带 `nodejs-portable`（仅用于本地开发环境），GitHub Actions 部署使用官方 Node 环境，不依赖该目录。

## 写作与 Front Matter
推荐使用脚本快速新建文章：
```bash
npm run new:post -- "文章标题" --tags "后端,微服务" --excerpt "一两句摘要"
```
生成文件位于 `posts/YYYY-MM-DD-标题转slug.md`。可选封面：在 Front Matter 增加 `image` 字段：
```yaml
---
layout: post.njk
title: 如何设计高可用的微服务架构
date: 2025-11-08
tags: [架构, 后端, 微服务]
excerpt: 介绍构建高可用微服务的关键原则……
image: /assets/img/sample-cover.svg  # 可选：文章封面图
---

正文内容从这里开始（支持 Markdown）。
```

字段说明：
- `layout` 固定为 `post.njk`（使用文章模板）
- `date` 用于文章发布时间；页面显示为北京时间（Asia/Shanghai）格式化值
- `tags` 用于生成标签集合（`_includes/layouts/post.njk` 中显示）
- `excerpt` 首页卡片摘要（可选）
- `image` 首页卡片封面图（可选）。建议尺寸比例 3:2，示例路径 `/assets/img/xxx.svg|png|jpg`

## 部署与自动化
- 推送到 `main` 分支后，`pages.yml` 会执行构建并把 `public/` 发布到 GitHub Pages。
- 构建中使用的日期过滤器对无效日期具备容错（避免由于错误 Front Matter 导致构建失败）。

## 如何上传 Markdown 文件（推荐流程）
你可以通过 GitHub 网页或命令行上传文章，二选一：

1) 网页方式（最简单）
- 打开仓库的 `posts/` 目录，点击“Add file” → “Create new file”
- 粘贴完整的 Markdown（含上面的 Front Matter）
- 命名文件（例如：`2025-11-08-hello-eleventy.md`），提交到 `main`
- GitHub Actions 会自动构建并发布，几分钟后访问站点即可看到更新

2) 命令行方式（配合脚本）
```bash
git checkout main
git pull
npm run new:post -- "你的标题" --tags "随笔" --excerpt "摘要"
# 可选：在生成的文件头部增加封面 image 字段
git add posts/*.md
git commit -m "Add post: 你的标题"
git push
```

（可选，高级）私有内容仓库
- 如需在构建时从私有内容仓库拉取 `posts/`，可使用 GitHub Actions 在构建步骤中 checkout 私库并复制到当前仓库的 `posts/`。本仓库当前未启用该方案；如需启用，请在 Issues 中说明，我会提供工作流与权限配置示例。

## 维护建议
- 在 `assets/img/` 放置图片资源，并在 Front Matter 中引用相对路径（以 `/assets/...` 开头）。
- 标签尽量使用简短中文或英文单词，避免特殊符号。
- 如需调整链接样式或封面高度，可在 `assets/css/style.css` 中修改对应注释段落。

