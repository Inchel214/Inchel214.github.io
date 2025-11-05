# Inchel214.github.io
个人技术博客 — 首页已生成

本仓库为 GitHub Pages 静态站点的源代码示例。此改动包含一个简洁的技术博客首页（`index.html`）与基础样式（`assets/css/style.css`）。

本地预览：

```bash
# 在仓库根目录运行简单静态服务器（Python 3）
python3 -m http.server 8000
# 然后在浏览器打开 http://localhost:8000/
```

提交变更：

```bash
git add -A
git commit -m "chore: add blog homepage and styles"
```

后续建议：
- 若要部署到 GitHub Pages，可直接把 `main` 分支作为 Pages 源或者添加 GitHub Actions 自动化工作流。
- 可替换示例文章内容，改为使用静态站点生成器（如 Hugo / Jekyll / Eleventy）以便管理大量文章与模板。
