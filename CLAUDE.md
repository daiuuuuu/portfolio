# 作品集网站 — AIGC Designer Portfolio

孔得宇（daiu）的个人作品集网站，展示 6 个商业 AIGC 设计项目。

## 技术栈

- React 19 + Vite 6 + TypeScript 5.8
- Tailwind CSS v4
- React Router v7
- GitHub Pages 部署

## 命令

```bash
npm install          # 安装依赖
npm run dev          # 本地开发 (localhost:5173)
npm run build        # 生产构建 (输出到 dist/)
npm run preview      # 预览生产构建
```

## 项目结构

```
src/
├── components/
│   ├── navigation/       # TopNavBar
│   ├── project/          # 详情页区块组件 + 6个Showcase
│   │   ├── ProjectShowcase.tsx     # 所有项目Showcase（Duanfu/Xcu/Guji/VideoFactory/ImageWorkflow/Portfolio）
│   │   ├── DuanfuComponentShowcase.tsx  # 端浮组件展示（独立文件）
│   │   └── ProjectDesignFeatures.tsx    # Video Factory 设计特点区块
│   ├── shared/           # Footer, ScrollToTop
│   └── ui/               # Badge, Placeholder, SectionLabel, ImageFrame
├── config/site.ts        # 全局站点配置
├── data/projects.ts      # 6个项目完整数据（唯一数据源）
├── layouts/RootLayout.tsx
├── pages/                # Home, ProjectDetail, NotFound
├── routes/index.tsx
├── sections/             # 首页区块（Hero/ProjectIndex/Experience/Skills/Contact）
├── styles/globals.css    # Tailwind v4 @theme + 设计令牌 + SVG滤镜
├── types/project.ts      # TypeScript 类型定义
└── utils/cn.ts

public/
├── images/               # 项目截图 & 海报
├── videos/               # Video Factory 产出视频
└── projects/duanfu/      # 端浮三个方案的HTML文件
```

## 设计系统

- **风格**: Radical Helvetica-Modernism（瑞士国际主义 + 1980s 数字终端）
- **参考**: `D:\6_work\项目\8_作品集参考\组件库集合\index.html`
- **组件库**: 43个独立组件（`D:\6_work\项目\8_作品集参考\组件库\`）
- **色彩**: 灰阶系统 + 深紫信号色 (#2E1065)
- **字体**: Inter (全角色) · JetBrains Mono (mono-technical) · Geologica (英文大标题, font-weight 900)
- **网格**: 12列 · 0px圆角 · 1px outline边线

## 关键约定

- **数据驱动**: 新增项目只需在 `projects.ts` 追加对象，路由和页面自动生成
- **组件库优先**: 不自由发挥新视觉语言
- **信息密度最大化**: 不为了留白削减有效内容
- **紫色仅非文字使用**: 文字只用黑白灰，紫色只用于背景/边线/纹理
- **图片命名**: 中文描述式命名 (`项目名-描述.png`)
- **横纹效果**: `heading-scanlines` 和 `text-scanlines` 使用 background-clip: text 裁切在字形内部
- **项目详情页英雄区**: 左文右图 50/50 分屏，英文标题用 Geologica font-black + text-letterpress 效果
- **板块高度不超一屏**: 单个板块（含上下留白）的总高度不超过一个视口（约 ≤100vh）。内容多时压缩内部留白，不靠放大上下 padding 撑开

## 文字特效

- **text-letterpress**: SVG feTurbulence(type="turbulence") + feColorMatrix(零化GB通道) + feDisplacementMap(X轴位移)，产生水平方向尖锐稀疏的油墨渗透凸起
- **text-letterpress-sm**: 同原理，scale=2 的弱化版
- 滤镜定义在 `index.html` 的 `<svg><defs>` 中，CSS 通过 `url(#letterpress-rough)` 引用
- letterpress-rough: scale=18, baseFrequency X=0.000012 Y=0.5

## Image Workflow Showcase 布局数学

啤酒工作流 输入→输出 对比区块，左右严格对齐：

- 右列预览: `aspectRatio: 1086/1446`（第一页 = 7231÷5，宽高比精确匹配）
- 左列每图: `maxHeight: calc(17.8vw - 28px)`（由右列高度反推得出，3图叠加 = 右列总高）
- 图片去边框去底色，右对齐，无箭头分隔
- 公式推导: 右预览高 ≈ (40vw-56px)×1446/1086, 左单图 = (右总高-120px)÷3

## 动画

- **最终版 (2026-08-01)**: GSAP 3.15 + ScrollTrigger + @gsap/react + SplitText + ScrambleTextPlugin
  - 核心模块 `src/animations/scrollReveal.ts`：进出对称——入场永远是遮罩（clip-path wipe），出场永远是淡出（opacity scrub 旅程，下边缘锚定 15%→7%，停滚冻结）。每行独立 ScrollTrigger（`top 92%` → `top 15%`），双向 play/reverse 可重播。只动 transform/opacity/clip-path
  - `src/animations/smoothWheel.ts`：**速度模型**——`gsap.ticker` 单循环 lerp 趋近目标速度。滚轮事件只更新目标速度（指数平滑），停手后自然衰减，全程一条曲线零换挡。raw wheel 监听，内部滚动容器自动放行
  - `src/animations/useScrollReveals.ts`：路由感知挂载 + resize/fonts.ready 自动 rebuild SplitText + ScrollTrigger
  - `src/components/ui/MarqueeStrip.tsx`：`gsap.fromTo` scrub 字幕条（双 span 无缝），全宽 py-1.5 全英文 Geologica 800，方向交替，`data-reveal="marquee"`
  - `src/components/ui/SectionLabel.tsx`：ScrambleText 终端式入场（█▓▒░ 字符集 0.5s）+ 逐行遮罩淡出同步
  - 首页 Hero：加载 intro（标题线汇聚）+ ScrambleText boot（系统状态行）
  - 详情页 Hero：加载 intro（project.slug 依赖跨项目重播）+ 封面 top-down 揭开
  - 目录卡片 hover 负片反转（clip-path circle，桌面端 hover 专属，impeccable 审计豁免的 bounce easing）
  - XCU 横向物料滚动 pin+scrub（≥768px，移动端自然滚动）
  - reduced-motion：JS 不创建任何触发器 + CSS transition 降为瞬时，双保险
  - 全局注册：`gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin)`

- **开屏 Boot 动画 (2026-08-14 定稿)**: `src/components/ui/LoadingBoot.tsx` —— 站点出现前的终端 boot 序列：纯紫底 ASCII logo + 5 行 boot log 逐字符揭示（`charByChar`，见下）+ 全宽 ASCII 进度条 + 闪烁光标。
  - **揭幕 = 内容原地淡出**（不再上滑）：boot 内容淡出 0.45s 后遮罩卸载（紫色对紫色无缝）。`onComplete` 用宏任务 `setTimeout(20ms)` 派发 `boot:reveal` 事件——不能在时间线 tick 内同步派发（GSAP 会吞掉）。
  - **进度条与文字严格同步**：行等权进度，填条发生在字符出现瞬间，同刻到 100%。
  - **进度条纯白填充无灰轨**：去掉 `░` 底轨只留 `█`，0% 用 NBSP 占行高。`barTotal` 实测 `█` 真实推进宽（~5px），精确填满容器（`offsetWidth/4` 会少算 ~20%）。
  - **滚动锁定 + 滚轮快进**：boot 期间 `RootLayout` 锁 `documentElement.overflow:hidden`，`smoothWheel` 延后到 boot 结束才初始化；开屏时滚轮推进 `tl.progress+0.15` 快速跳过；`onComplete` 等雕塑图加载完（2.5s 兜底）才揭幕。
  - `RootLayout` 用 `booting` state 控制，`prefers-reduced-motion` 下直接 `onDone()` 跳过。
- **逐字揭示共享模块 (2026-08-14)**: `src/animations/charReveal.ts` 导出 `charByChar` + `GLITCH_CHARS`。开屏日志与书签文字共用，逐字「噪点→真字」效果完全一致。
- **首页 Hero 入场编排 (2026-08-14)**: `HeroSection.tsx` 由 `boot:reveal` 触发，首次加载播一次（SPA 回首页静态，`window.__bootRevealed`）。顺序：① 背景（色块从左上沿 45° 轴滑入 + 滚动条从屏外滑入）→ ② 书签（从右沿 2° 斜度）+ 印章（从上方落下）→ ③ 雕塑（书签中点起，从左滑入，无淡入）。书签左端有 SVG 三角头（尖端圆弧）。书签文字滑动时隐藏，到位后主文字与 PORTFOLIO 2026 同时逐字揭示，主文字随后每 4s 周期 ScrambleText 重播。


## Python 工具链

- Python 启动: `py` (Python 3.13, Windows)
- Pillow: 图像裁剪、尺寸分析
- visual-proxy skill: `py "C:\Users\n1589\.claude\skills\visual-proxy\scripts\vision.py" --image <路径> --question "问题"`
  - API: dashscope / qwen3.6-flash
  - 大图需先缩小再发送，避免超时

## 海报规格

- 主海报: 2048×2048 (1:1)
- 横幅: 2048×280，裁切取中心 1/3
- Banner: 2048×512，生成后裁 1/3 高度 (`memory/banner-poster-spec.md`)
