import { useParams, Navigate } from 'react-router-dom'
import { getProjectBySlug } from '@/data/projects'
import ProjectHero from '@/components/project/ProjectHero'
import ProjectOverviewSection from '@/components/project/ProjectOverviewSection'
import ProjectPhilosophySection from '@/components/project/ProjectPhilosophySection'
import ProjectBackgroundSection from '@/components/project/ProjectBackgroundSection'
import ProjectStrategySection from '@/components/project/ProjectStrategySection'
import ProjectProcessSection from '@/components/project/ProjectProcessSection'
import ProjectHorizontalPipeline from '@/components/project/ProjectHorizontalPipeline'
import ProjectDecisionsSection from '@/components/project/ProjectDecisionsSection'
import ProjectDesignFeatures from '@/components/project/ProjectDesignFeatures'
import ProjectQualityAuditSection from '@/components/project/ProjectQualityAuditSection'
import ProjectComparisonSection from '@/components/project/ProjectComparisonSection'
import ProjectWorkflowCompareSection from '@/components/project/ProjectWorkflowCompareSection'
import ProjectTechStackSection from '@/components/project/ProjectTechStackSection'
import ProjectEngineeringHighlightsSection from '@/components/project/ProjectEngineeringHighlightsSection'
import ProjectDeliveryStructureSection from '@/components/project/ProjectDeliveryStructureSection'
import ProjectModuleDetailsSection from '@/components/project/ProjectModuleDetailsSection'
import NextProjectSection from '@/components/project/NextProjectSection'
import MarqueeStrip from '@/components/ui/MarqueeStrip'
import {
  DuanfuShowcase, XcuShowcase, GujiShowcase,
  VideoFactoryShowcase, ImageWorkflowShowcase, PortfolioShowcase,
} from '@/components/project/ProjectShowcase'
const PIPELINE_SLUGS = ['guji', 'video-factory', 'image-workflow']

const SHOWCASE_MAP: Record<string, () => React.ReactNode> = {
  duanfu:        DuanfuShowcase,
  xcu:           XcuShowcase,
  guji:          GujiShowcase,
  'video-factory':    VideoFactoryShowcase,
  'image-workflow':   ImageWorkflowShowcase,
  'portfolio-site':   PortfolioShowcase,
}

/** Where to insert each project's showcase: section index in the render order */
const SHOWCASE_SECTION: Record<string, string> = {
  duanfu:           'strategy',       // 三方案对比图嵌在StrategySection后
  xcu:              'overview',       // 物料矩阵嵌在OverviewSection后
  guji:             'background',     // 古籍原件对比嵌在BackgroundSection后
  'video-factory':  'process',        // 流程图嵌在流程区块后
  'image-workflow': 'process',        // 模块I/O对比嵌在流程区块后
  'portfolio-site': 'overview',       // 组件架构嵌在OverviewSection后
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined
  if (!project) return <Navigate to="/" replace />

  const isPipelineProject = PIPELINE_SLUGS.includes(project.slug)
  const ShowcaseSlot = slug ? SHOWCASE_MAP[slug] : null
  const showcaseAt = slug ? SHOWCASE_SECTION[slug] : null

  const statsText = project.stats.map(s => `${s.value}${s.unit ?? ''} ${s.desc ?? s.label}`).join(' · ')
  const overviewMarquee = `PROJECT OVERVIEW — ${statsText} · ${project.tags.join(' · ')} · `
  const decisionsMarquee = `KEY DECISIONS — ${project.decisions.length} QUESTIONS ANSWERED · DESIGN RATIONALE · TRADEOFFS · WHY IT MATTERS · `

  return (
    <article data-project={project.slug}>
      <ProjectHero project={project} />
      <ProjectOverviewSection project={project} />
      {showcaseAt === 'overview' && ShowcaseSlot && <ShowcaseSlot />}
      <MarqueeStrip text={overviewMarquee} direction="left" />
      <ProjectPhilosophySection project={project} />
      <ProjectBackgroundSection project={project} />
      {showcaseAt === 'background' && ShowcaseSlot && <ShowcaseSlot />}
      <ProjectStrategySection project={project} />
      {showcaseAt === 'strategy' && ShowcaseSlot && <ShowcaseSlot />}
      {isPipelineProject
        ? <ProjectHorizontalPipeline project={project} />
        : <ProjectProcessSection project={project} />
      }
      {showcaseAt === 'process' && ShowcaseSlot && <ShowcaseSlot />}
      <ProjectTechStackSection project={project} />
      {project.decisions.length > 0 && <MarqueeStrip text={decisionsMarquee} direction="right" />}
      <ProjectDecisionsSection project={project} />
      <ProjectDesignFeatures project={project} />
      <ProjectWorkflowCompareSection project={project} />
      <ProjectEngineeringHighlightsSection project={project} />
      <ProjectQualityAuditSection project={project} />
      <ProjectComparisonSection project={project} />
      <ProjectDeliveryStructureSection project={project} />
      <ProjectModuleDetailsSection project={project} />
      <NextProjectSection currentSlug={project.slug} nextSlug={project.nextProject} />
    </article>
  )
}
