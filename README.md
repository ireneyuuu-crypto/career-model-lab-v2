# Career Model Lab V1.2 — Single-file Ephemeris Beta

无需服务器 API 的 **职业时间信号探索 Web App**。用户粘贴第三方星盘文本并确认出生时间、时区、经度（或本命 MC），网站在浏览器中计算连续十年的 GR / C 相位时间段，显示交互图、逐年证据和中文解释，并使用浏览器打印功能保存 PDF，或导出 JSON。

**当前测试版可以计算真实的行运/次限相位，但不生成未经验证的晋升概率、Career Jump 标签或 0–100 职业评分。** 完整的 O/E/P/V/S/ST/Cost 到 0/O/E/P/J/R 自动化候选分类，仍需 Canonical 完整映射、聚合与分级权重冻结。

## 一键运行

电脑安装 Python 后，在项目根目录执行：

```bash
python3 -m http.server 8080
```

然后打开 http://localhost:8080 。不能直接双击 `index.html`，因为浏览器会限制读取本地 JSON 星历文件。

运行自动测试：`node --test tests/*.test.js`。不需要 npm install，也没有外部 JS/CDN 依赖。

## GitHub Pages 部署（适合网页上传）

V1.2 将原来的171个 `data/*.json` 合并成 **一个 `ephemeris.json`（约6.7MB）**。现在整个部署所需的文件数量少于20个，**只需要一次上传**。

1. **建议创建一个新仓库**，例如 `career-model-lab-v12`，避免旧仓库根目录的171个 JSON 和部署配置干扰。也可继续用旧仓库，但请先删除旧的根目录逐年 JSON，避免混淆。
2. 从 ZIP 解压后，打开 `career-model-lab-v1-2-simplified` 文件夹，将**里面的文件和 assets 文件夹**上传到 GitHub 仓库根目录。不要上传 ZIP 本身，不要多套一层文件夹。
3. 确认根目录能看到 `index.html`、`engine.js`、`app.js`、`landing.js`、`styles.css` 和 `ephemeris.json`。其中 `ephemeris.json` 约6.7 MB，务必等待上传完成。
4. `Settings → Pages → Deploy from a branch → main → /(root) → Save`。
5. 用 GitHub Pages 网址访问；打开 `.../ephemeris.json` 应该能看到以 `{"1900":` 开头的 JSON 内容。

注意：站点需要 HTTP 服务，不能直接双击本地 `index.html`。星历表可在浏览器本地解析，不调用外部 API，不上传用户出生信息。

## 本版已实现

- 粘贴中文星盘导出文本，提取出生日期/时间/时区/经纬度/MC/第二宫头/部分本命行星度数。
- 数据预览、手动修订、黄道体系拦截和缺失字段提示。
- 自动预计算本命行星、MC（缺失时由出生经度、时间计算）、十宫主与二宫主（采用**传统宫主星**映射）。
- 读取每日回归黄道地心天体黄经（1900–2070），在浏览器中进行行运与次限的时间序列计算。
- GR: 木/土/天/海/冥，与 MC/十宫主/太阳/土星/二宫头/主的合/刑/冲，orb ≤3°。
- C: 次限日/月/水/金/火，与 MC/十宫主/太阳/土星/二宫主的合/刑/冲，orb ≤2°，非 J 必要条件。
- 每年符合规则的相位段数量、逐条证据及日期、年度可视化、术语词典、PDF（打印保存）和 JSON 导出。

## 重要限制

1. 支持 **回归黄道** 及 **恒星黄道 Lahiri** 两种模式，自动识别可手动修正；其他恒星黄道 ayanamsa 模式不支持，请勿混用。
2. 当前使用传统宫主星体系；如 Canonical 另有定义，需要先冻结配置再调整。
3. MC 在用户未提供时由当地恒星时推算（近似），若源 App 直接给出 MC，请优先填入；缺失第二宫宫头时跳过对应 P3 信号。
4. 预先生成的星历是**每天 UTC 00:00** 的天体黄经，非连续高精度数值星历。逐日线性插值可能遗漏短暂进出容许度的信号；标示的最接近相位日期不是求得的精确时刻。次限采用一日对应一年近似，尚未验证对 Canonical 的时间标准完全一致。
5. 目前事件显示是**天象相位段**，不是正式确定的 Career Event Window；同一事件可能因不同相位/时间段形成多条记录。年度信号数量不能解释为概率或评分。
6. 出生地点坐标原文的顺序需为纬度、经度（lat/lng）；检查界面只使用经度计算 MC。出生时间记录错误会明显影响结果。
7. 该工具属于占星解释性探索，不属于经过科学证明的职业预测模型，不可用于单独作出重大工作、薪酬或投资决定。

## 数据与许可

`data/*.json` 为 `generate_ephemeris.py` 使用 `pyswisseph` / Swiss Ephemeris 的 Moshier 方法产生的每日黄经数值。请在公开分发、商业化或修改星历实现前审查 Swiss Ephemeris、pyswisseph 的适用许可。不要将 Python 生成脚本中的库视为此静态网站在浏览器中直接运行的依赖。

## 下一版本缺口

- 确认用户目标星盘 App 的完整真实导出格式（当前解析器只涵盖一般常见文本形式）。
- 对真实软件本命 MC、行星位置、时区和主星映射进行黄金样本比对。
- 按冻结规则补全 Exact Window 的事件聚合、逆行处理、年度等级、相位信号到候选结果分类的独立映射。
- 完整报告的复杂排版（目前打印含全部十年的相位明细，浏览器保存 PDF）。
- 如需正式精确窗口，替换日采样数据为有许可的高精度星历计算服务或经充分测试的浏览器端计算。

## 文件

- `index.html`, `styles.css`, `app.js` — 页面与交互
- `engine.js` — 解析、数据校验、GR/C 计算
- `data/YYYY.json` — 1900–2070 年每日位置
- `generate_ephemeris.py` — 数据生成脚本
- `.github/workflows/pages.yml` — GitHub Pages 自动部署
- `tests/engine.test.js` — 基础单元测试

## V1.1 · 极简手绘交互首页

- 新增柔和暖白首页、双人手绘人物、产品功能、使用步骤及示例结构。
- 首页 CTA 直达原有星盘导入面板；报告计算引擎原样保留。
- 小幅滚动淡入、星光呼吸、响应式布局，并支持系统减少动态效果设置。
- 新增 `assets/future-life-illustration.webp` 与 `landing.js`。
- 修复校验页缺少 `zodiac-mode` 下拉框的问题。
- **注意：本次仅更新前端视觉与操作入口，并未增加模型结果验证能力。**


## V1.3 Celestial Night UI
- Homepage: user-selected indigo celestial cover and watercolor people; original upload used as design/illustration reference.
- Sample report: sample.html + sample.css + sample.js; illustrative data clearly labeled, no fabricated personal prediction.
- Results styling follows the cover's type, colors, and line treatment.
- Loading: a subtle animated zodiac-line motif shown during the real async calculation.
- Static GitHub Pages: all site files should be at repository root; ephemeris.json stays as the one precomputed database.


## V1.4 — Career Tarot
报告结尾新增 Career Tarot 职业启示牌。一次完整分析后点击「翻开我的职业启示牌」，根据当前报告实际 GR/C 信号主题匹配候选牌组，再以固定种子抽取一张，报告 JSON 与 PDF 将携带同一张牌。无网络 API、无需密钥、不会上传出生资料。

示例报告 `sample.html` 也支持翻牌，但它使用虚构的演示数据。塔罗仅提供象征性反思，不构成预测，不影响 Career V2.0 计算。
