# 大算机器人网站

网站入口：[打开中文网站](https://jliuanghanyi.github.io/doso-robotics-website/index.html?lang=zh)。

本仓库公开，包含可继续编辑和构建的中英文静态网站。

## 修改位置

- `dist/app.js`：页面文案、产品数据、页面组件和交互。
- `dist/styles.css`：页面样式和移动端布局。
- `site-metadata.json`：中英文页面标题和摘要。
- `dist/assets/`：图片、图标、字体和必要许可证。
- `docs/typography.md`：字体与排版维护说明。
- `build-pages.cjs`：生成12个中英文页面及带内容指纹的资源文件。
- `tests/`：链接、资源、产品参数和语言切换检查。
- `.openai/hosting.json`：保留现有发布配置，维护时不要随意改动站点标识。

不要直接修改带随机字母数字后缀的脚本、样式或生成的HTML；请修改上述源码后重新构建。

## 本地预览与检查

需要 Node.js 和 Python 3。网站无需安装额外的JavaScript依赖。

```sh
node build-pages.cjs
node tests/language-routing.cjs
python tests/static-audit.py
python -m http.server 4186 --directory dist
```

打开 `http://localhost:4186/index.html?lang=zh`。构建成功后会自动移除旧版带指纹的JS/CSS，保留当前资源及可编辑源码。

## 发布到 GitHub Pages

`main` 分支保存源码；`gh-pages` 分支根目录保存 `dist/` 的构建结果，并保留 `.nojekyll`。

修改后先运行构建和检查，提交 `main` 的源码及构建结果，再将最新 `dist/` 同步到 `gh-pages` 并推送。只推送 `main` 不会自动更新当前网页。同步时应移除 `gh-pages` 中已不再属于最新 `dist/` 的旧文件，但保留其Git目录及 `.nojekyll`；不要把整个源码仓库上传到网页发布分支。

制作记录、提示词及备份请保存在仓库之外，或放入已忽略的 `private-notes/`、`local-backups/`。字体许可和开源署名应继续随对应资源保留。
