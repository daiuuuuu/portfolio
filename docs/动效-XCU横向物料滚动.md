# XCU 多场景物料矩阵 · 横向滚动动效

> 状态：已实现 （GSAP 3.15 · XcuShowcase · pin + scrub + matchMedia ≥768px）
> 日期：2026-07-17

## 触发

用户垂直滚动到达 XCU 详情页的"多场景物料矩阵"区域

## 动效描述

1. 页面垂直滚动暂停——ScrollTrigger `pin` 钉住该区域
2. 用户继续滚轮 → 控制水平位移
3. 内部横排物料图（5 张）从右向左缓慢平移
4. 横图滚动到尽头后，pin 解除，垂直滚动恢复

## 时间线

```
进入区域  · ScrollTrigger pin: true, anticipatePin: 1
滚动中    · scrub: 1, 垂直滚动距离映射为水平 translateX
到达尽头  · end: "+=200%", pin 解除, 页面继续向下
```

## 技术要点

| 点 | 说明 |
|------|------|
| **容器** | `overflow-hidden` 的 track，固定视口高度 |
| **内部条** | `flex flex-nowrap` + `width: max-content`，宽度超过视口 |
| **pin** | ScrollTrigger `pin: ".horizontal-scroll-track"` |
| **动画** | `gsap.to(".horizontal-scroll-strip", { x: -(stripWidth - trackWidth), ease: "none" })` |
| **水平位移量** | `stripWidth - trackWidth`，确保刚好滚动到末尾 |
| **移动端** | 触摸滑动自然支持水平滚动；pin 在移动端表现需测试 |

## 涉及文件

- `src/components/project/ProjectShowcase.tsx` — XcuShowcase 组件（已建好静态结构）
- GSAP + ScrollTrigger 引入后实现

## 当前静态状态

- 5 张物料图横排，`h-[50vh] max-h-[540px]`
- 每张图有 `border-outline-variant` 边框 + 底部 caption
- `data-animate` 属性已预留：`horizontal-scroll` / `horizontal-scroll-track` / `horizontal-scroll-strip` / `horizontal-scroll-item`
