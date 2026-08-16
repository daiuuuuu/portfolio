export type ProjectTag =
  | 'UI Design'
  | 'Brand Identity'
  | 'AIGC'
  | 'ComfyUI'
  | 'Remotion'
  | 'Python'
  | 'React'
  | 'HTML/CSS'
  | 'AI Workflow'
  | 'Data Visualization'
  | 'Video Production'

export interface ProjectStat {
  label: string
  value: string
  unit?: string
  desc?: string
}

export interface ProjectDecision {
  id: string
  question: string
  answer: string
  rationale: string
}

export interface ProcessStep {
  id: string
  phase: string
  label: string
  description: string
  stat?: string
  status: 'completed' | 'planned'
}

export interface ProjectOverview {
  positioning: string
  capability: string
  outcome: string
}

export interface ProjectIndexMeta {
  field: string
  software: string
  direction: string
}

export interface ProjectStrategy {
  id: string
  status: 'PRIMARY' | 'SECONDARY' | 'REJECTED' | 'FLAGGED'
  title: string
  description: string
  notes?: string
}

export interface ProjectQualityItem {
  item: string
  status: 'pass' | 'fail' | 'warning'
  note?: string
}

export interface MethodComparisonItem {
  aspect: string
  industry: string
  ours: string
  advantage: string
}

export interface ProjectApproach {
  philosophy: string
  philosophyEn: string
  tagline: string
}

export interface TechStackItem {
  layer: string
  tech: string
  purpose: string
}

export interface ShowcaseImage {
  src?: string
  caption: string
  aspect?: string
}

export interface EngineeringHighlight {
  label: string
  detail: string
  icon?: string
}

export interface WorkflowComparisonRow {
  stage: string
  traditional: string
  automated: string
}

export interface ModuleDetail {
  title: string
  description: string
  code?: string
}

export interface Project {
  slug: string
  title: string
  titleEn: string
  subtitle: string
  year: string
  period: string
  tags: ProjectTag[]
  indexMeta: ProjectIndexMeta
  featured: boolean
  coverImage?: string
  coverAspect: string
  /** Custom one-liner for the home index marquee strip (per project, varied voice) */
  indexMarquee?: string
  titleImage?: string
  titleFontSize?: string
  philosophyImage?: string
  philosophyBanner?: string
  designFeatures?: { title: string; how: string; why: string }[]
  overview: ProjectOverview
  approach?: ProjectApproach
  background: {
    context: string
    painPoints: Array<{ label: string; detail: string }>
    goal: string
  }
  strategies?: ProjectStrategy[]
  decisions: ProjectDecision[]
  process: ProcessStep[]
  stats: ProjectStat[]
  /** Optional: extra content from MD files */
  techStack?: TechStackItem[]
  engineeringHighlights?: EngineeringHighlight[]
  methodComparison?: MethodComparisonItem[]
  workflowComparison?: WorkflowComparisonRow[]
  moduleDetails?: ModuleDetail[]
  outputStructure?: string[]
  qualityAudit?: ProjectQualityItem[]
  nextProject: string
}
