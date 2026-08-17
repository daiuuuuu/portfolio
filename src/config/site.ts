export const SITE_CONFIG = {
  owner: {
    name: '孔得宇',
    nameEn: 'KONG DEYU',
    handle: 'daiu',
    role: 'AIGC DESIGNER',
    location: 'SUZHOU / 苏州',
    email: 'daiuuu@agent.qq.com',
    phone: '15893791173',
    wechat: '15893791173',
    qq: '1970143631',
    github: 'https://github.com/daiuuuuu',
    portfolio: 'https://daiuuuuu.github.io/portfolio/',
  },

  tagline: {
    zh: '设计生产系统化 · AIGC 工作流搭建',
    en: 'Design Production Systems · AIGC Workflow Engineering',
  },

  hero: {
    line1: 'AIGC',
    line2: 'DESIGNER',
    descriptor: '/ KONG DEYU',
    statusLine: 'SYS.VER 2026.08 // STATUS: AVAILABLE',
  },

  about: {
    zh: '视觉传达设计科班出身（2020–2024，许昌学院），兼具传统设计审美功底与前沿 AIGC 技术工程落地能力。2024 年起驻扎许昌大学科技园，两年间独立搭建品牌设计工作流、古籍识别管线、AI 视频生产系统和模块化图片工厂——5 套商业生产系统全部在真实商业场景中跑通；你现在看到的这个作品集网站，就是第 6 套。区别于通用设计师，核心竞争力是把设计生产系统化：用可编程工作流代替手工操作，把单次交付变成可复用资产。',
    en: 'Visual communication graduate (Xuchang University, 2020–2024), now AIGC production engineer. Two years at XCU Sci-Tech Park building brand systems, OCR pipelines, automated video factories and modular image workflows — all in live commercial use. The portfolio site you are reading right now is system No.6. The differentiator: treating design production as a system problem, replacing manual operations with programmable workflows, and converting one-off deliverables into reusable assets.',
  },

  aboutHighlights: [
    { label: '6',      desc: '完整交付项目',    descEn: 'Systems Delivered' },
    { label: '2+',     desc: 'AIGC 工程实战年', descEn: 'Years of AIGC hands-on' },
    { label: '90%+',   desc: '平均成本压缩',    descEn: 'Average cost reduction' },
    { label: '100%',   desc: '独立研发交付',    descEn: 'Self-developed & delivered' },
  ],

  education: {
    period: '2020.09 — 2024.06',
    school: '许昌学院',
    major: '视觉传达设计 本科',
    note: '系统修习平面设计、版式、色彩、UI 和数字视觉创作，毕业前已主导多个商业设计项目。',
  },

  experience: [
    {
      period: '2024.03 — 至今',
      company: '许昌大学科技园',
      role: 'AIGC 设计实习生 / 设计专员',
      description: '毕业后入职许昌大学科技园，专职从事视觉设计与 AIGC 智能化设计研发。负责园区官方视觉物料全品类输出，同时独立研发 ComfyUI 工作流、Remotion 视频系统、古籍识别 Agent 等多套 AIGC 工具，并为入驻企业提供前端视觉设计服务。',
      highlights: [
        '独立负责园区所有宣传物料、海报、展板、折页的品牌化设计',
        '从 47 页 VIS 手册提取品牌 DNA，建立可编程设计 token 体系',
        '自主研发古籍 OCR Agent，单页成本压至 ¥0.016',
        '搭建 Remotion 视频工厂，制作周期从数小时压缩至 30 分钟',
        '开发 ComfyUI 积木式图片工作流，单图成本降至 ¥1',
        '为端浮科技完整交付三套差异化官网视觉方案',
      ],
    },
  ],

  skills: [
    {
      category: 'AIGC TOOLS',
      items: ['ComfyUI', 'Remotion', 'Claude Code', 'Codex', 'Midjourney', 'LiblibAI'],
    },
    {
      category: 'AI CAPABILITIES',
      items: ['图像前处理 / 后处理', 'AI 生图工作流', '多模态 OCR', '视频自动化', '品牌色迁移', '4K 超分 / 调色'],
    },
    {
      category: 'DESIGN',
      items: ['品牌视觉系统 / VIS', 'UI 前端视觉', '版式 / 配色', '海报 / 展板', '数据可视化', '折页 / 物料'],
    },
    {
      category: 'ENGINEERING',
      items: ['React / Vite / TypeScript', 'Tailwind CSS', 'Python / OpenCV', 'GitHub Pages', 'Chart.js', 'HTML / CSS'],
    },
  ],

  basePath: '/portfolio/',
} as const
