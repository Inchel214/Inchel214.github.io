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

自动化（已添加）：

- `build.py`：一个最小的 Python 构建脚本，会把 `posts/*.md` 转成 `public/` 下的 HTML，并复制 `assets/`。依赖 `markdown` Python 包。
- `.github/workflows/pages.yml`：在 `main` 上的每次 push 会运行 `build.py` 并把 `public/` 部署到 GitHub Pages（通过官方 actions）。

使用说明：

1. 在本地安装依赖并构建：

```bash
pip install markdown
python3 build.py
python3 -m http.server --directory public 8000
# 打开 http://localhost:8000/
```

2. 推送到远程触发自动部署：

```bash
git add -A
git commit -m "chore: add static build and pages workflow"
git push origin main
```

