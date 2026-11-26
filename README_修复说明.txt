Career Model Lab V2.0 · 星盘识别按钮无响应修复

问题：此前 V2.0 轻量更新包未包含 career-v2-canonical.js，但 app.js 启动依赖该文件。缺失时整个模块无法加载，继续按钮没有点击响应。

修复：补齐启动所需的完整 JavaScript 依赖文件，替换 index.html，增加模块加载失败的明显错误提示。

安装：把 ZIP 内全部文件直接上传至 GitHub 仓库根目录，覆盖同名文件，等待 Pages 部署，Ctrl+Shift+R 强制刷新。不要删除仓库现有 ephemeris.json 和图片文件。

隐私：修复包无真实用户星盘、出生资料或真实职业记录。
