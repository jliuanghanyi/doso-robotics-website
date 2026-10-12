# DOSO Robotics 官网复现

可直接编辑的 HTML / CSS / JavaScript 网站，新版本不覆盖 `C:/Codex/co/doso-site`。

## 页面与参考图对应

| 页面 | 参考 | 实现 |
|---|---|---|
| `dist/index.html` | 图 1 + 公司介绍 | 首页首屏、公司价值、能力平台、应用场景、产品入口 |
| `dist/products.html` | 图 2 | 四款产品卡片、参数、任务入口、产品详情弹窗 |
| `dist/about.html` | 图 3 + 公司介绍 | 公司定位、全栈研发、现场反馈、行业交付与愿景 |
| `dist/technology.html` | 图 5 + 图 4 | 能力链、技术架构、可点击的数据飞轮 |
| `dist/solutions.html` | Figma 解决方案 | 工业巡检、应急作业、科研教育、系统集成 |
| `dist/contact.html` | Figma 预约流程 | 需求单表单与本地下载 |

设计来源：Figma 文件 `sZ4TjJvAvjeDQatheXpt47`，用户指定首页节点 `764:307`。读取产品 `817:390`、技术 `817:752`、关于 `817:902` 等页面建立映射。本次五张参考图优先决定视觉与文案；Figma 决定页面关系、品牌标识与场景素材。未修改 Figma 文件。

## 编辑与运行

`dist/app.js` 包含页面组件、文案、产品数据、交互和中英切换；`dist/styles.css` 包含样式、布局及移动端适配。无需安装依赖。修改页面组件或文案后，在项目根目录执行 `node build-pages.cjs`，重新生成并检查全部 12 个独立中英文页面。可直接双击 HTML，或在 `dist` 目录执行 `python -m http.server 4186` 后访问 `http://localhost:4186`。

中文页面位于 `dist/`，英文页面位于 `dist/en/`。HTML 已包含完整内容和明确的页面、语言标识，兼容服务器将 `.html` 地址规范化为无扩展名路径的情况。语言按钮切换到当前页面对应的中英文文件，刷新与跨页导航会保留所选语言。

页面文字、导航、按钮、产品参数、结构层级与数据飞轮为 HTML / CSS / SVG；参考图中的绘制素材以独立图像视窗按坐标拆分，保留原图像素，不把整页图片作为网页。相关裁切坐标集中在 `crop()` 调用和产品、技术数据中。后续有高清独立素材时可替换。

首页底图使用内置 ImageGen 工具清除参考图上的网站文案与 UI 后生成，保存为 `dist/assets/hero-clean.png`。这是图像重建，局部纹理与原图可能存在差异。其余产品和技术图片直接显示参考图的图片区域。任务入口和解决方案使用现有 Figma 来源场景资产。蓝色 DOSO 标志沿用现有项目素材。

首页底图生成提示词：

> Edit target is the provided DOSO website screenshot. Produce ONLY its clean photographic background asset, preserving EXACT composition, camera, robot geometry and details, lake, mountains, concrete architecture and floor. Remove ALL website overlay text, logo in top-left, navigation, buttons, scroll indicator, divider line, bottom-right caption. Reconstruct the natural sky/lake/floor behind removed text. Keep DOSO branding engraved on the physical robot. Do NOT add/change robots, do not alter proportions, do not reposition robot. Same 16:9 landscape framing. This will be used as a background with HTML text laid over it.

## 验证与边界

- 已在浏览器检查桌面首页、产品、技术能力链、技术架构、关于页面，以及手机首页、产品、技术和联系页面。
- 产品详情弹窗、数据飞轮节点、手机导航、中英切换、表单生成下载均已进行交互检查。
- 已检查 JS 语法、核心页横向溢出、已加载图片有效性。
- 预约入口当前只生成本地需求单，不提交预约，不向 DOSO 发送内容。接入真实销售邮箱或后台需要正式接收端。
- 产品参数依照本次参考图，其中最大载荷口径与旧 Figma 的整机重量口径不同，不混用旧标注。正式对外发布前应以产品规格书确认。
- 静态首页采用本次参考图的构图，不把旧 Figma 的背景漂移动画施加到包含机器人的合成底图上。

本次站点默认私有，站点身份保存在 `.openai/hosting.json`。

## 2026-10-10 第三版回归修复

站内导航与语言切换改为立即在当前页面渲染，保留独立 HTML 作为直达和刷新入口。构建生成带内容指纹的脚本和样式文件，避免旧缓存复用。切换语言保留当前页面、锚点、产品或场景参数以及尚未提交的表单内容。修复技术架构链接、产品咨询选项传递和英文架构文字遮挡；解决方案按 Figma 补齐首屏、四种场景和五步交付流程。

构建后运行 `python tests/static-audit.py`，验证 12 个页面的链接、锚点、资源、参数和英文内容。浏览器逐项检查结果及实现边界见 `QA-RESULTS.json`。实际预约仍需提供接收后台；当前下载需求单的行为明确标示，不伪报预约提交成功。
