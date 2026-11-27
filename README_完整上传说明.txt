Career Model Lab V2.7.1 · 完整部署修正版

这是完整网站，不是补丁包。请使用 GitHub 仓库对应 Pages 发布目录，上传此 ZIP 解压后的全部文件和 tests/（测试可选）。

1. 解压 ZIP：确保 index.html、app.js、ephemeris.json、celestial-people.webp 等文件处在同一层。
2. 在 GitHub 仓库根目录直接上传所有文件，覆盖现有文件，不要上传整个解压文件夹作为子目录。
3. 如果 GitHub Pages 发布设置是 main /root，页面地址应为 https://<用户名>.github.io/<仓库名>/ 。
4. 请注意截图中的仓库路径是 career-model-lab-v2，不要误上传至 career-model-lab 仓库。
5. 等 Pages Actions 完成后访问 https://<用户名>.github.io/<仓库名>/check.html 。全绿后回首页 Ctrl+Shift+R。
6. 新包的首页使用带版本查询的 app.js 引用，减少浏览器旧缓存干扰。

本版本保留: 深紫星空封面、人物插画、完整星历、职业趋势双横条、综合指数、逐年报告、虚构示例、塔罗牌、JSON/PDF导出。
全站是客户端静态项目；未设置上传用户星盘数据的服务器接口。

测试说明：Node 自动化测试 74 项通过；完整 GitHub Pages 浏览器端到端验收需要实际部署后验证。
