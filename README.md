
# Inchel.github.io
个人技术博客 — 已迁移到 Eleventy（11ty）

本仓库现在使用 Eleventy（Node + @11ty/eleventy）作为静态站点生成器。为了避免与新构建流程混淆，遗留的 Python 构建脚本 `build.py` 已被移除。

本地预览与构建：

```bash
# 安装依赖并构建（在仓库根目录）：
npm ci
npm run build

# 本地预览生成结果：
python3 -m http.server --directory public 8000
# 然后在浏览器打开 http://localhost:8000/
```

自动化：

- `.github/workflows/pages.yml`：在 `main` 分支每次 push 时会运行 `npm ci`、`npm run build` 并把 `public/` 部署到 GitHub Pages（通过官方 actions）。

如果你需要使用 Python 脚本构建（例如离线或特定定制需求），可以在版本历史中恢复 `build.py` 的旧版本，或联系我我可以为你添加一个独立的 Python 构建分支作为备份。

常用命令回顾：

```bash
npm ci
npm run build
python3 -m http.server --directory public 8000
```

如果想让我把 `build.py` 恢复到仓库的某个历史提交或添加替代的 Python 构建脚本作为可选方案，请告诉我。

