# Bug 归档 · 回主页卡在「开屏动画最后一帧」（紫色背景）

> 状态：已修复（2026-08-16 · LoadingBoot + HeroSection）
> 复发次数：3 次（均为同一根因的不同触发路径）
> 涉及文件：`src/components/ui/LoadingBoot.tsx` · `src/sections/HeroSection.tsx`

## 症状

从项目详情页点 HOME（或浏览器返回）回到主页，主页卡在**纯紫色背景**——像开屏 Boot 动画播完后的最后一帧。雕塑、滚字幕条、书签全部隐藏，只有紫色底（`#2E1065`）+ 右上角蜡封 + 左下角元数据。实测紫色空窗最长约 **3.5 秒**，之后入场动画才补播。

## 根因

**`window.__bootRevealed` 标志只在 HeroSection 的 `playOnce` 里设置。** 该标志决定 hero 入场走哪条路径：

- `true` → 挂载后立即 `playEntrance()`
- `false`（或 undefined）→ 走 `else` 分支：监听 `boot:reveal` 事件（开屏时只发一次）+ **2600ms 兜底定时器**

当**首屏加载落在项目详情页**（刷新、收藏夹直链进入）时，hero 组件从未挂载 → `playOnce` 从未执行 → `__bootRevealed` 永远是 `undefined`。之后任何一次回主页，hero 都误判为「开屏还没结束」，进入 else 分支等待一个**永远不会再发的** `boot:reveal`，直到 2600ms 兜底定时器触发才播放入场。此前的 3 次「修复」（playOnce 守卫 + fallback 定时器）都只覆盖了「首屏在主页」的路径，没覆盖「首屏在项目页」的路径。

## 触发场景

1. 直接加载 `/project/xxx`（刷新 / 书签 / 分享链接）
2. 页面加载完成（Boot 已播完）
3. 点导航 HOME 回主页
4. → hero 挂载，`__bootRevealed` 为 undefined → 卡紫色 ≈3.5s

（SPA 往返：主页→项目→HOME 不触发，因为首屏在主页时标志已被设置。）

## 复现（Playwright 实测）

```js
await page.goto('/portfolio/project/duanfu')   // 首屏落在项目页
await page.waitForSelector('[data-boot-logo]', { state: 'detached' })
await page.locator('nav a:has-text("HOME")').click()
// 采样 .ticker-band 的 transform：
// 修复前：t≈1200ms 仍为 translateX(1728px)（隐藏），直到 t≈4353ms 才进场
// 修复后：t≈1200ms 已 translateX(940px)（进场中），t≈2300ms 归位
```

## 修复（两层）

**1. LoadingBoot 独立设置全局标志（根治）**

Boot 完成揭幕时，无论 hero 是否挂载都写 `window.__bootRevealed = true`。任何后续 hero 挂载都能直接命中快速路径：

```ts
;(window as unknown as { __bootRevealed?: boolean }).__bootRevealed = true
setTimeout(() => window.dispatchEvent(new Event('boot:reveal')), 20)
onDone()
```

**2. HeroSection 入场加「强制完成」保险丝（兜底）**

入场时间线若被任何竞态 kill/pause（路由重挂载、GSAP 上下文 revert、ScrollTrigger.refresh），4s 后强制把所有 hero 元素 `gsap.set` 到最终可见态并 `tl.progress(1)`——**场景永远不会永久停在隐藏的紫色帧**，最坏情况是入场被跳过而非卡住。cleanup 统一在 useGSAP 返回函数中清理定时器与事件监听。

## 回归防护

- `scripts/repro-hero2.cjs`：首屏落在项目页 → HOME 的时序复现脚本，断言 `t<1500ms` 时 band 已开始进场（`transform` 不再是隐藏位的 translateX(120vw)）。
- 手测路径：直接刷新 `/project/*` → HOME → 主页应立即看到雕塑/字幕进场，无紫屏空窗。
