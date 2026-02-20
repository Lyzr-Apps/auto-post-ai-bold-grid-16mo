'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  Hash,
  Calendar,
  Clock,
  Image as ImageIcon,
  Send,
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Filter,
  RefreshCw,
  ExternalLink,
  Loader2,
  LayoutDashboard,
  Link2,
  History,
  Trash2,
  Check,
  X,
  Camera,
  Briefcase,
  Music,
  Globe,
  Zap,
  Lightbulb,
  ArrowRight,
  Copy,
} from 'lucide-react'

// ============================================================
// TypeScript Interfaces
// ============================================================

interface PlatformRecommendation {
  platform: string
  strategy: string
}

interface ResearchInsights {
  trending_topics: string[]
  key_findings: string
  platform_recommendations: PlatformRecommendation[]
}

interface CalendarItem {
  post_id: string
  platform: string
  post_date: string
  post_time: string
  content_type: string
  caption: string
  hashtags: string[]
  visual_concept: string
  engagement_hook: string
  status: string
}

interface ContentCalendar {
  total_posts: number
  platforms: string[]
  items: CalendarItem[]
}

interface ContentPlan {
  campaign_overview: string
  research_insights: ResearchInsights
  content_calendar: ContentCalendar
  strategic_recommendations: string[]
}

interface PublishedPost {
  post_id: string
  platform: string
  status: string
  post_url: string
  error_message: string
}

interface PublishResult {
  published_posts: PublishedPost[]
  total_published: number
  total_failed: number
  summary: string
}

interface Campaign {
  id: string
  date: string
  prompt: string
  plan: ContentPlan
  postCount: number
  platforms: string[]
}

interface StatusMessage {
  type: 'success' | 'error' | 'info'
  text: string
}

interface AgentInfo {
  id: string
  name: string
  purpose: string
}

// ============================================================
// Constants
// ============================================================

const AGENTS: AgentInfo[] = [
  { id: '6998cd62344803d1bba89563', name: 'Content Strategy Manager', purpose: 'Orchestrates research and calendar generation' },
  { id: '6998cd4da84911a83d1ac249', name: 'Trend & Platform Research', purpose: 'Sub-agent for trend analysis' },
  { id: '6998cd4d8d370e1a6cc0b9ed', name: 'Content Calendar', purpose: 'Sub-agent for calendar generation' },
  { id: '6998cd7edfb56bc22e407ef6', name: 'Visual Creator', purpose: 'Generates social media images' },
  { id: '6998cd7e6e83201939577095', name: 'Social Publisher', purpose: 'Publishes to social platforms' },
]

const CONTENT_STRATEGY_AGENT_ID = '6998cd62344803d1bba89563'
const VISUAL_CREATOR_AGENT_ID = '6998cd7edfb56bc22e407ef6'
const SOCIAL_PUBLISHER_AGENT_ID = '6998cd7e6e83201939577095'

const SAMPLE_PLAN: ContentPlan = {
  campaign_overview: 'A comprehensive 7-day social media campaign focused on promoting sustainable living practices. The campaign leverages trending environmental awareness topics and uses a mix of educational, inspirational, and actionable content across Twitter and Instagram to drive engagement and build community around eco-conscious living.',
  research_insights: {
    trending_topics: ['#SustainableLiving', '#EcoFriendly', '#ZeroWaste', '#ClimateAction', '#GreenTech', '#PlantBased'],
    key_findings: 'Environmental content sees 3.2x higher engagement rates compared to average posts. Video content and carousel posts perform best on Instagram, while thread-style content drives the most engagement on Twitter. Peak posting times are 9-11 AM and 7-9 PM across both platforms.',
    platform_recommendations: [
      { platform: 'Twitter', strategy: 'Focus on thread-style educational content, quick tips, and engagement polls. Use trending hashtags and respond to environmental news in real-time.' },
      { platform: 'Instagram', strategy: 'Prioritize carousel posts with infographics and before/after comparisons. Use Stories for daily eco-tips and Reels for product alternatives.' },
    ],
  },
  content_calendar: {
    total_posts: 5,
    platforms: ['Twitter', 'Instagram'],
    items: [
      {
        post_id: 'post-001',
        platform: 'Twitter',
        post_date: '2025-02-24',
        post_time: '09:00 AM',
        content_type: 'Thread',
        caption: '5 Simple Swaps for a More Sustainable Kitchen\n\nThread: Let me walk you through the easiest changes that saved me $200/month and reduced my waste by 60%.',
        hashtags: ['#SustainableLiving', '#EcoTips', '#ZeroWaste'],
        visual_concept: 'Clean, minimal infographic showing 5 kitchen items with eco-friendly alternatives side by side, warm earth tones',
        engagement_hook: 'Which of these swaps have you already made? Reply with your number!',
        status: 'Draft',
      },
      {
        post_id: 'post-002',
        platform: 'Instagram',
        post_date: '2025-02-25',
        post_time: '11:00 AM',
        content_type: 'Carousel',
        caption: 'Your guide to zero-waste grocery shopping. Swipe to see how one family cut their plastic waste by 80% in just 30 days.',
        hashtags: ['#ZeroWaste', '#SustainableShopping', '#EcoFriendly', '#PlasticFree'],
        visual_concept: 'Carousel with 5 slides: Cover slide with bold text overlay on grocery produce photo, then step-by-step guide with illustrations',
        engagement_hook: 'Save this post for your next grocery trip! Tag a friend who needs to see this.',
        status: 'Draft',
      },
      {
        post_id: 'post-003',
        platform: 'Twitter',
        post_date: '2025-02-26',
        post_time: '07:00 PM',
        content_type: 'Poll',
        caption: 'Quick poll: What is your biggest barrier to living more sustainably?\n\nA) Cost\nB) Convenience\nC) Not knowing where to start\nD) Limited options in my area',
        hashtags: ['#SustainableLiving', '#ClimateAction'],
        visual_concept: 'Simple branded graphic with the poll question in bold typography against a green gradient background',
        engagement_hook: 'Vote and share your thoughts! We will address the top answer in our next thread.',
        status: 'Draft',
      },
      {
        post_id: 'post-004',
        platform: 'Instagram',
        post_date: '2025-02-27',
        post_time: '09:30 AM',
        content_type: 'Image',
        caption: 'Before vs After: Our office went green in 30 days. Here is what changed and how you can do it too. Full breakdown in the caption below.',
        hashtags: ['#GreenOffice', '#SustainableBusiness', '#EcoFriendly', '#GreenTech'],
        visual_concept: 'Split-screen before/after photo of an office space, left side cluttered with disposables, right side clean with plants and reusable items',
        engagement_hook: 'Double tap if your office needs a green makeover! Drop a comment with your best office sustainability tip.',
        status: 'Draft',
      },
      {
        post_id: 'post-005',
        platform: 'Twitter',
        post_date: '2025-02-28',
        post_time: '10:00 AM',
        content_type: 'Thread',
        caption: 'The TRUE cost of fast fashion (a thread)\n\nWhat you pay at checkout is just the beginning. Here is what the environment pays for every $10 t-shirt.',
        hashtags: ['#FastFashion', '#SustainableFashion', '#ClimateAction', '#EthicalFashion'],
        visual_concept: 'Data visualization showing environmental cost breakdown of fast fashion, dark theme with accent colors highlighting key stats',
        engagement_hook: 'RT to spread awareness. What sustainable fashion brands do you recommend?',
        status: 'Draft',
      },
    ],
  },
  strategic_recommendations: [
    'Post consistently at peak engagement times (9-11 AM and 7-9 PM) for maximum reach.',
    'Use carousel format on Instagram whenever possible, as it generates 3x more engagement than single images.',
    'Include a clear call-to-action in every post to drive comments and shares.',
    'Cross-promote Twitter threads on Instagram Stories to drive cross-platform traffic.',
    'Engage with replies within the first hour of posting to boost algorithmic visibility.',
    'Monitor trending environmental hashtags daily and create reactive content when relevant.',
  ],
}

// ============================================================
// Helpers
// ============================================================

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function getPlatformIcon(platform: string) {
  const p = (platform ?? '').toLowerCase()
  if (p.includes('twitter') || p.includes('x')) return <span className="font-bold text-xs leading-none">X</span>
  if (p.includes('instagram')) return <Camera className="h-3.5 w-3.5" />
  if (p.includes('linkedin')) return <Briefcase className="h-3.5 w-3.5" />
  if (p.includes('facebook')) return <span className="font-bold text-xs leading-none">f</span>
  if (p.includes('tiktok')) return <Music className="h-3.5 w-3.5" />
  return <Globe className="h-3.5 w-3.5" />
}

function getPlatformColor(platform: string) {
  const p = (platform ?? '').toLowerCase()
  if (p.includes('twitter') || p.includes('x')) return 'bg-black text-white'
  if (p.includes('instagram')) return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
  if (p.includes('linkedin')) return 'bg-blue-600 text-white'
  if (p.includes('facebook')) return 'bg-blue-500 text-white'
  if (p.includes('tiktok')) return 'bg-black text-white'
  return 'bg-muted text-muted-foreground'
}

function getStatusBadge(status: string) {
  const s = (status ?? '').toLowerCase()
  if (s.includes('published')) return <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/15">{status}</Badge>
  if (s.includes('visuals ready') || s.includes('ready')) return <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15">{status}</Badge>
  if (s.includes('fail')) return <Badge className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/15">{status}</Badge>
  return <Badge variant="secondary">{status || 'Draft'}</Badge>
}

function getContentTypeBadge(contentType: string) {
  const ct = (contentType ?? '').toLowerCase()
  if (ct.includes('carousel')) return <Badge variant="outline" className="text-xs gap-1"><Copy className="h-3 w-3" />{contentType}</Badge>
  if (ct.includes('image')) return <Badge variant="outline" className="text-xs gap-1"><ImageIcon className="h-3 w-3" />{contentType}</Badge>
  if (ct.includes('video') || ct.includes('reel')) return <Badge variant="outline" className="text-xs gap-1"><Eye className="h-3 w-3" />{contentType}</Badge>
  if (ct.includes('thread')) return <Badge variant="outline" className="text-xs gap-1"><Hash className="h-3 w-3" />{contentType}</Badge>
  if (ct.includes('poll')) return <Badge variant="outline" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />{contentType}</Badge>
  return <Badge variant="outline" className="text-xs">{contentType}</Badge>
}

// ============================================================
// ErrorBoundary
// ============================================================

class PageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// Sub-components
// ============================================================

function StatusBanner({ statusMessage, onDismiss }: { statusMessage: StatusMessage | null; onDismiss: () => void }) {
  if (!statusMessage) return null
  const colors: Record<string, string> = {
    success: 'bg-green-500/10 border-green-500/30 text-green-700',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
    info: 'bg-primary/10 border-primary/30 text-primary',
  }
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 mb-4 ${colors[statusMessage.type] ?? colors.info}`}>
      <div className="flex items-center gap-2">
        {statusMessage.type === 'success' && <CheckCircle className="h-4 w-4 flex-shrink-0" />}
        {statusMessage.type === 'error' && <XCircle className="h-4 w-4 flex-shrink-0" />}
        {statusMessage.type === 'info' && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
        <span className="text-sm">{statusMessage.text}</span>
      </div>
      <button onClick={onDismiss} className="ml-2 p-1 rounded hover:bg-black/5 transition-colors"><X className="h-3.5 w-3.5" /></button>
    </div>
  )
}

function SidebarNav({ activeSection, setActiveSection, activeAgentId }: { activeSection: string; setActiveSection: (s: 'dashboard' | 'accounts' | 'history') => void; activeAgentId: string | null }) {
  const navItems = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'accounts' as const, label: 'Connected Accounts', icon: Link2 },
    { key: 'history' as const, label: 'Campaign History', icon: History },
  ]

  return (
    <div className="w-64 min-h-screen flex-shrink-0 border-r border-border/50 bg-card/60 backdrop-blur-xl flex flex-col">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">SocialFlow</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">AI Content Engine</p>
          </div>
        </div>
      </div>
      <Separator className="mx-4 mb-2" />
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeSection === item.key
          return (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <Separator className="mx-4 mb-2" />
      <div className="p-4 space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Agents</p>
        {AGENTS.map(agent => {
          const isActive = activeAgentId === agent.id
          return (
            <div key={agent.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 transition-colors duration-300 ${isActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className={`truncate ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{agent.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GenerationSkeletons() {
  return (
    <div className="space-y-6 mt-6">
      <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md p-6 shadow-md">
        <Skeleton className="h-5 w-48 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md p-5 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PostCard({
  item,
  isSelected,
  onToggleSelect,
  onGenerateVisuals,
  isGeneratingVisual,
  images,
  currentStatus,
  editingCaption,
  editedCaption,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
}: {
  item: CalendarItem
  isSelected: boolean
  onToggleSelect: () => void
  onGenerateVisuals: () => void
  isGeneratingVisual: boolean
  images: string[]
  currentStatus: string
  editingCaption: boolean
  editedCaption: string
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onEditChange: (v: string) => void
}) {
  const [showVisualConcept, setShowVisualConcept] = useState(false)

  return (
    <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-border/80">
      <div className="p-5 space-y-3">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${getPlatformColor(item.platform)}`}>
              {getPlatformIcon(item.platform)}
            </span>
            <span className="text-sm font-medium text-foreground">{item.platform}</span>
            {getContentTypeBadge(item.content_type)}
            {getStatusBadge(currentStatus)}
          </div>
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="h-5 w-5" />
        </div>

        {/* Date/time */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{item.post_date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.post_time}</span>
        </div>

        {/* Caption */}
        <div>
          {editingCaption ? (
            <div className="space-y-2">
              <Textarea value={editedCaption} onChange={(e) => onEditChange(e.target.value)} rows={4} className="text-sm bg-background/50" />
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={onSaveEdit}><Check className="h-3.5 w-3.5 mr-1" />Save</Button>
                <Button size="sm" variant="ghost" onClick={onCancelEdit}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pr-6">{editedCaption || item.caption}</p>
              <button onClick={onStartEdit} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted/50">
                <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Hashtags */}
        {Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.hashtags.map((tag, idx) => (
              <span key={idx} className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                <Hash className="h-2.5 w-2.5" />{(tag ?? '').replace('#', '')}
              </span>
            ))}
          </div>
        )}

        {/* Engagement hook */}
        {item.engagement_hook && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5 border border-border/30">
            <span className="font-semibold text-foreground/80 flex items-center gap-1 mb-0.5"><Zap className="h-3 w-3 text-primary" />Engagement Hook</span>
            {item.engagement_hook}
          </div>
        )}

        {/* Visual concept collapsible */}
        {item.visual_concept && (
          <Collapsible open={showVisualConcept} onOpenChange={setShowVisualConcept}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Eye className="h-3 w-3" />
              Visual Concept
              {showVisualConcept ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="text-xs text-muted-foreground mt-1.5 pl-4 border-l-2 border-primary/20">{item.visual_concept}</p>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Generated images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden border border-border/50 aspect-square bg-muted/20">
                <img src={url} alt={`Generated visual ${idx + 1}`} className="w-full h-full object-cover" />
                <a href={url} target="_blank" rel="noopener noreferrer" className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Generate visuals button */}
        {images.length === 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerateVisuals}
            disabled={isGeneratingVisual}
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            {isGeneratingVisual ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating Visuals...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" />Generate Visuals</>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function ConnectedAccountsScreen() {
  const platforms = [
    { name: 'Twitter / X', icon: <span className="font-bold text-lg leading-none">X</span>, color: 'bg-black text-white', status: 'Connected', connected: true, tools: ['TWITTER_CREATION_OF_A_POST', 'TWITTER_USER_LOOKUP_ME'] },
    { name: 'Instagram', icon: <Camera className="h-5 w-5" />, color: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white', status: 'Connected', connected: true, tools: ['INSTAGRAM_CREATE_A_MEDIA_OBJECT_CONTAINER', 'INSTAGRAM_PUBLISH_A_MEDIA_OBJECT_CONTAINER'] },
    { name: 'LinkedIn', icon: <Briefcase className="h-5 w-5" />, color: 'bg-blue-600 text-white', status: 'Connected', connected: true, tools: ['LINKEDIN_CREATE_A_LINKED_IN_TEXT_POST'] },
    { name: 'Facebook', icon: <span className="font-bold text-lg leading-none">f</span>, color: 'bg-blue-500 text-white', status: 'Connected', connected: true, tools: ['FACEBOOK_CREATE_A_PAGE_FEED_POST'] },
    { name: 'TikTok', icon: <Music className="h-5 w-5" />, color: 'bg-black text-white', status: 'Coming Soon', connected: false, tools: [] },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Connected Accounts</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your social media platform connections. The agent handles authentication internally.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map(p => (
          <div key={p.name} className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md p-6 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-12 w-12 rounded-xl ${p.color} flex items-center justify-center`}>
                {p.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`h-2 w-2 rounded-full ${p.connected ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                  <span className={`text-xs ${p.connected ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>{p.status}</span>
                </div>
              </div>
            </div>
            {p.connected ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 rounded-lg px-3 py-2 border border-green-500/20">
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Authenticated via agent. Ready to publish.</span>
                </div>
                {Array.isArray(p.tools) && p.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tools.map((tool: string) => (
                      <span key={tool} className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/30 font-mono">
                        {tool.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/30">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Integration available in a future update.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CampaignHistoryScreen({
  campaigns,
  onReuse,
  onDelete,
  platformFilter,
  setPlatformFilter,
}: {
  campaigns: Campaign[]
  onReuse: (prompt: string) => void
  onDelete: (id: string) => void
  platformFilter: string
  setPlatformFilter: (v: string) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredCampaigns = platformFilter
    ? campaigns.filter(c => Array.isArray(c.platforms) && c.platforms.some(p => p.toLowerCase().includes(platformFilter.toLowerCase())))
    : campaigns

  const allPlatforms: string[] = []
  campaigns.forEach(c => {
    if (Array.isArray(c.platforms)) {
      c.platforms.forEach(p => {
        if (!allPlatforms.includes(p)) allPlatforms.push(p)
      })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Campaign History</h2>
          <p className="text-sm text-muted-foreground mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} saved locally</p>
        </div>
        {allPlatforms.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1.5">
              <button onClick={() => setPlatformFilter('')} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${!platformFilter ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>All</button>
              {allPlatforms.map(p => (
                <button key={p} onClick={() => setPlatformFilter(p)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${platformFilter === p ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md p-12 text-center shadow-md">
          <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{campaigns.length === 0 ? 'No campaigns yet. Generate your first content plan from the Dashboard.' : 'No campaigns match this filter.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map(campaign => {
            const isExpanded = expandedId === campaign.id
            let dateStr = 'Unknown date'
            try {
              dateStr = campaign.date ? new Date(campaign.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'
            } catch {
              dateStr = campaign.date ?? 'Unknown date'
            }
            return (
              <div key={campaign.id} className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md shadow-md overflow-hidden transition-all duration-200">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {dateStr}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{(campaign.prompt ?? '').slice(0, 100)}{(campaign.prompt?.length ?? 0) > 100 ? '...' : ''}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{campaign.postCount ?? 0} posts</span>
                        <div className="flex gap-1">
                          {Array.isArray(campaign.platforms) && campaign.platforms.map(p => (
                            <span key={p} className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${getPlatformColor(p)}`}>
                              {getPlatformIcon(p)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => onReuse(campaign.prompt)} className="gap-1 text-xs"><RefreshCw className="h-3 w-3" />Re-use</Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(campaign.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      <button onClick={() => setExpandedId(isExpanded ? null : campaign.id)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                {isExpanded && campaign.plan && (
                  <div className="border-t border-border/50 p-5 bg-muted/10 space-y-3">
                    <p className="text-sm text-foreground/80">{campaign.plan?.campaign_overview ?? ''}</p>
                    {Array.isArray(campaign.plan?.content_calendar?.items) && campaign.plan.content_calendar.items.map(item => (
                      <div key={item.post_id} className="rounded-xl border border-border/30 bg-card/50 p-3 flex items-start gap-3 text-xs">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full flex-shrink-0 ${getPlatformColor(item.platform)}`}>
                          {getPlatformIcon(item.platform)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-foreground">{item.platform}</span>
                            <span className="text-muted-foreground">{item.post_date} {item.post_time}</span>
                          </div>
                          <p className="text-muted-foreground truncate">{item.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================

export default function Page() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'accounts' | 'history'>('dashboard')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [generatingVisuals, setGeneratingVisuals] = useState<Set<string>>(new Set())
  const [postImages, setPostImages] = useState<Record<string, string[]>>({})
  const [postStatuses, setPostStatuses] = useState<Record<string, string>>({})
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [editedCaptions, setEditedCaptions] = useState<Record<string, string>>({})
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResults, setPublishResults] = useState<PublishResult | null>(null)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [platformFilter, setPlatformFilter] = useState('')
  const [samplePlanRef, setSamplePlanRef] = useState<ContentPlan | null>(null)

  // Load campaigns from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('socialflow_campaigns')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setCampaigns(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  const saveCampaign = useCallback((plan: ContentPlan, campaignPrompt: string) => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      prompt: campaignPrompt,
      plan,
      postCount: plan?.content_calendar?.total_posts ?? 0,
      platforms: Array.isArray(plan?.content_calendar?.platforms) ? plan.content_calendar.platforms : [],
    }
    setCampaigns(prev => {
      const updated = [campaign, ...prev]
      try { localStorage.setItem('socialflow_campaigns', JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }, [])

  // Sample data toggle
  useEffect(() => {
    if (showSampleData && !contentPlan) {
      setContentPlan(SAMPLE_PLAN)
      setSamplePlanRef(SAMPLE_PLAN)
      setPrompt('Create a 7-day social media campaign promoting sustainable living practices across Twitter and Instagram')
      const statuses: Record<string, string> = {}
      SAMPLE_PLAN.content_calendar.items.forEach(item => { statuses[item.post_id] = 'Draft' })
      setPostStatuses(statuses)
    }
    if (!showSampleData && samplePlanRef && contentPlan === samplePlanRef) {
      setContentPlan(null)
      setSamplePlanRef(null)
      setPrompt('')
      setPostStatuses({})
      setSelectedPosts(new Set())
      setPostImages({})
      setEditedCaptions({})
      setPublishResults(null)
    }
  }, [showSampleData, contentPlan, samplePlanRef])

  const handleGeneratePlan = useCallback(async () => {
    if (!prompt.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a campaign description.' })
      return
    }
    setIsGenerating(true)
    setContentPlan(null)
    setSamplePlanRef(null)
    setSelectedPosts(new Set())
    setPostImages({})
    setPostStatuses({})
    setEditedCaptions({})
    setPublishResults(null)
    setActiveAgentId(CONTENT_STRATEGY_AGENT_ID)
    setStatusMessage({ type: 'info', text: 'Generating your content plan... This may take a moment as research and calendar agents work together.' })

    try {
      const result = await callAIAgent(prompt, CONTENT_STRATEGY_AGENT_ID)
      if (result.success && result?.response?.result) {
        const plan = result.response.result as ContentPlan
        setContentPlan(plan)
        const statuses: Record<string, string> = {}
        if (Array.isArray(plan?.content_calendar?.items)) {
          plan.content_calendar.items.forEach(item => { statuses[item.post_id] = 'Draft' })
        }
        setPostStatuses(statuses)
        setStatusMessage({ type: 'success', text: 'Content plan generated successfully!' })
        saveCampaign(plan, prompt)
      } else {
        setStatusMessage({ type: 'error', text: result?.error ?? 'Failed to generate content plan. Please try again.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred while generating the plan. Please try again.' })
    }
    setActiveAgentId(null)
    setIsGenerating(false)
  }, [prompt, saveCampaign])

  const handleGenerateVisuals = useCallback(async (item: CalendarItem) => {
    setGeneratingVisuals(prev => new Set(prev).add(item.post_id))
    setActiveAgentId(VISUAL_CREATOR_AGENT_ID)

    try {
      const caption = editedCaptions[item.post_id] || item.caption
      const message = `Generate a social media image for ${item.platform}. Visual concept: ${item.visual_concept}. Caption context: ${caption}. Content type: ${item.content_type}. Make it visually engaging and optimized for ${item.platform}.`
      const result = await callAIAgent(message, VISUAL_CREATOR_AGENT_ID)
      if (result.success) {
        const images = result?.module_outputs?.artifact_files
        if (Array.isArray(images) && images.length > 0) {
          const imageUrls = images.map((img: { file_url?: string }) => img?.file_url).filter(Boolean) as string[]
          if (imageUrls.length > 0) {
            setPostImages(prev => ({ ...prev, [item.post_id]: imageUrls }))
            setPostStatuses(prev => ({ ...prev, [item.post_id]: 'Visuals Ready' }))
            setStatusMessage({ type: 'success', text: `Visuals generated for ${item.platform} post!` })
          } else {
            setStatusMessage({ type: 'error', text: 'Visual generation completed but no image URLs were returned.' })
          }
        } else {
          setStatusMessage({ type: 'error', text: 'Visual generation completed but no images were returned.' })
        }
      } else {
        setStatusMessage({ type: 'error', text: result?.error ?? 'Failed to generate visuals.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred while generating visuals.' })
    }

    setActiveAgentId(null)
    setGeneratingVisuals(prev => {
      const n = new Set(prev)
      n.delete(item.post_id)
      return n
    })
  }, [editedCaptions])

  const handlePublishSelected = useCallback(async () => {
    if (selectedPosts.size === 0) {
      setStatusMessage({ type: 'error', text: 'Please select posts to publish.' })
      return
    }
    setIsPublishing(true)
    setActiveAgentId(SOCIAL_PUBLISHER_AGENT_ID)
    setStatusMessage({ type: 'info', text: `Publishing ${selectedPosts.size} post${selectedPosts.size > 1 ? 's' : ''}...` })

    const items = Array.isArray(contentPlan?.content_calendar?.items) ? contentPlan.content_calendar.items : []
    const postsToPublish = items.filter(item => selectedPosts.has(item.post_id))
    const publishData = postsToPublish.map(post => ({
      post_id: post.post_id,
      platform: post.platform,
      caption: editedCaptions[post.post_id] || post.caption,
      hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
      image_urls: postImages[post.post_id] ?? [],
    }))
    const message = `Publish the following social media posts to their respective platforms:\n${JSON.stringify(publishData, null, 2)}`

    try {
      const result = await callAIAgent(message, SOCIAL_PUBLISHER_AGENT_ID)
      if (result.success && result?.response?.result) {
        const pubResult = result.response.result as PublishResult
        setPublishResults(pubResult)
        if (Array.isArray(pubResult?.published_posts)) {
          pubResult.published_posts.forEach(pp => {
            const s = (pp?.status ?? '').toLowerCase()
            setPostStatuses(prev => ({ ...prev, [pp.post_id]: s.includes('success') || s.includes('publish') ? 'Published' : 'Failed' }))
          })
        }
        setSelectedPosts(new Set())
        const published = pubResult?.total_published ?? 0
        const failed = pubResult?.total_failed ?? 0
        setStatusMessage({ type: failed > 0 ? 'error' : 'success', text: pubResult?.summary ?? `Published: ${published}, Failed: ${failed}` })
      } else {
        setStatusMessage({ type: 'error', text: result?.error ?? 'Failed to publish posts.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An error occurred while publishing.' })
    }
    setActiveAgentId(null)
    setIsPublishing(false)
  }, [selectedPosts, contentPlan, editedCaptions, postImages])

  const togglePostSelection = useCallback((postId: string) => {
    setSelectedPosts(prev => {
      const n = new Set(prev)
      if (n.has(postId)) n.delete(postId)
      else n.add(postId)
      return n
    })
  }, [])

  const calendarItems = Array.isArray(contentPlan?.content_calendar?.items) ? contentPlan.content_calendar.items : []

  const toggleSelectAll = useCallback(() => {
    if (selectedPosts.size === calendarItems.length && calendarItems.length > 0) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(calendarItems.map(i => i.post_id)))
    }
  }, [calendarItems, selectedPosts.size])

  const handleReuseCampaign = useCallback((campaignPrompt: string) => {
    setPrompt(campaignPrompt ?? '')
    setActiveSection('dashboard')
    setStatusMessage({ type: 'info', text: 'Campaign prompt loaded. Click "Generate Content Plan" to regenerate.' })
  }, [])

  const handleDeleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => {
      const updated = prev.filter(c => c.id !== id)
      try { localStorage.setItem('socialflow_campaigns', JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }, [])

  // ============================================================
  // Dashboard Render
  // ============================================================
  function renderDashboard() {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Content Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">Generate, customize, and publish your social media content</p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="sample-toggle" className="text-sm text-muted-foreground cursor-pointer">Sample Data</Label>
            <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
          </div>
        </div>

        {/* Status banner */}
        <StatusBanner statusMessage={statusMessage} onDismiss={() => setStatusMessage(null)} />

        {/* Input area */}
        <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Campaign Builder</h3>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your content campaign... e.g., 'Create a week-long social media campaign for a new product launch targeting tech professionals on Twitter and Instagram'"
            rows={4}
            className="resize-none text-sm bg-background/50 border-border/50"
          />
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">The AI will research trends, build a content calendar, and generate post captions with hashtags.</p>
            <Button onClick={handleGeneratePlan} disabled={isGenerating || !prompt.trim()} className="gap-2 px-6 shadow-md shadow-primary/20 flex-shrink-0">
              {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate Content Plan</>}
            </Button>
          </div>
        </div>

        {/* Loading skeletons */}
        {isGenerating && <GenerationSkeletons />}

        {/* Content Plan Results */}
        {contentPlan && !isGenerating && (
          <div className="space-y-6">
            {/* Campaign Overview */}
            {contentPlan.campaign_overview && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-md p-6 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Campaign Overview</h3>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed">
                  {renderMarkdown(contentPlan.campaign_overview)}
                </div>
              </div>
            )}

            {/* Research Insights */}
            {contentPlan.research_insights && (
              <Collapsible open={showInsights} onOpenChange={setShowInsights}>
                <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md shadow-md overflow-hidden">
                  <CollapsibleTrigger className="w-full p-5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Research Insights</h3>
                    </div>
                    {showInsights ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-5 pb-5 space-y-4">
                      <Separator />
                      {/* Trending Topics */}
                      {Array.isArray(contentPlan.research_insights?.trending_topics) && contentPlan.research_insights.trending_topics.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trending Topics</p>
                          <div className="flex flex-wrap gap-2">
                            {contentPlan.research_insights.trending_topics.map((topic, idx) => (
                              <Badge key={idx} variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" />{topic}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Key Findings */}
                      {contentPlan.research_insights?.key_findings && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Findings</p>
                          <div className="text-sm text-foreground/80 leading-relaxed bg-muted/20 rounded-xl p-4 border border-border/30">
                            {renderMarkdown(contentPlan.research_insights.key_findings)}
                          </div>
                        </div>
                      )}
                      {/* Platform Recommendations */}
                      {Array.isArray(contentPlan.research_insights?.platform_recommendations) && contentPlan.research_insights.platform_recommendations.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform Recommendations</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {contentPlan.research_insights.platform_recommendations.map((rec, idx) => (
                              <div key={idx} className="rounded-xl border border-border/30 bg-card/50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${getPlatformColor(rec.platform)}`}>
                                    {getPlatformIcon(rec.platform)}
                                  </span>
                                  <span className="font-medium text-sm text-foreground">{rec.platform}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{rec.strategy}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Strategic Recommendations */}
            {Array.isArray(contentPlan.strategic_recommendations) && contentPlan.strategic_recommendations.length > 0 && (
              <Collapsible open={showRecommendations} onOpenChange={setShowRecommendations}>
                <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md shadow-md overflow-hidden">
                  <CollapsibleTrigger className="w-full p-5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Strategic Recommendations</h3>
                      <Badge variant="secondary" className="text-xs">{contentPlan.strategic_recommendations.length}</Badge>
                    </div>
                    {showRecommendations ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-5 pb-5">
                      <Separator className="mb-4" />
                      <div className="space-y-2">
                        {contentPlan.strategic_recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm p-3 rounded-lg bg-muted/20 border border-border/20">
                            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0 mt-0.5">{idx + 1}</span>
                            <span className="text-foreground/80 leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Content Calendar Header */}
            {calendarItems.length > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Content Calendar</h3>
                  <Badge variant="secondary">{contentPlan?.content_calendar?.total_posts ?? calendarItems.length} posts</Badge>
                  {Array.isArray(contentPlan?.content_calendar?.platforms) && contentPlan.content_calendar.platforms.map(p => (
                    <span key={p} className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${getPlatformColor(p)}`}>
                      {getPlatformIcon(p)}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={toggleSelectAll} className="text-xs gap-1">
                    {selectedPosts.size === calendarItems.length && calendarItems.length > 0 ? <><X className="h-3 w-3" />Deselect All</> : <><Check className="h-3 w-3" />Select All</>}
                  </Button>
                </div>
              </div>
            )}

            {/* Batch action bar */}
            {selectedPosts.size > 0 && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-md p-4 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{selectedPosts.size} post{selectedPosts.size > 1 ? 's' : ''} selected</span>
                </div>
                <Button onClick={handlePublishSelected} disabled={isPublishing} className="gap-2 shadow-md shadow-primary/20">
                  {isPublishing ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing...</> : <><Send className="h-4 w-4" />Publish Selected</>}
                </Button>
              </div>
            )}

            {/* Publish Results */}
            {publishResults && (
              <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md p-5 shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Publish Results</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {(publishResults.total_published ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" />{publishResults.total_published} published</span>
                  )}
                  {(publishResults.total_failed ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" />{publishResults.total_failed} failed</span>
                  )}
                </div>
                {publishResults.summary && (
                  <p className="text-sm text-muted-foreground">{publishResults.summary}</p>
                )}
                {Array.isArray(publishResults.published_posts) && publishResults.published_posts.length > 0 && (
                  <div className="space-y-2">
                    {publishResults.published_posts.map((pp, idx) => {
                      const isSuccess = (pp?.status ?? '').toLowerCase().includes('success') || (pp?.status ?? '').toLowerCase().includes('publish')
                      return (
                        <div key={idx} className="flex items-center gap-3 text-xs p-2.5 rounded-lg bg-muted/20 border border-border/20">
                          <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${getPlatformColor(pp.platform)}`}>
                            {getPlatformIcon(pp.platform)}
                          </span>
                          <span className="font-medium text-foreground">{pp.post_id}</span>
                          {isSuccess ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <span className="text-muted-foreground">{pp.status}</span>
                          {pp.post_url && (
                            <a href={pp.post_url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-primary hover:underline">
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {pp.error_message && !isSuccess && (
                            <span className="ml-auto text-destructive truncate max-w-[200px]">{pp.error_message}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Post Cards Grid */}
            {calendarItems.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {calendarItems.map(item => (
                  <PostCard
                    key={item.post_id}
                    item={item}
                    isSelected={selectedPosts.has(item.post_id)}
                    onToggleSelect={() => togglePostSelection(item.post_id)}
                    onGenerateVisuals={() => handleGenerateVisuals(item)}
                    isGeneratingVisual={generatingVisuals.has(item.post_id)}
                    images={postImages[item.post_id] ?? []}
                    currentStatus={postStatuses[item.post_id] ?? item.status ?? 'Draft'}
                    editingCaption={editingCaption === item.post_id}
                    editedCaption={editedCaptions[item.post_id] ?? item.caption}
                    onStartEdit={() => {
                      setEditingCaption(item.post_id)
                      if (!editedCaptions[item.post_id]) {
                        setEditedCaptions(prev => ({ ...prev, [item.post_id]: item.caption }))
                      }
                    }}
                    onCancelEdit={() => setEditingCaption(null)}
                    onSaveEdit={() => setEditingCaption(null)}
                    onEditChange={(v) => setEditedCaptions(prev => ({ ...prev, [item.post_id]: v }))}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!contentPlan && !isGenerating && (
          <div className="rounded-2xl border border-border/50 bg-card/75 backdrop-blur-md p-12 shadow-md text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Create</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Describe your campaign above and the AI will research trends, generate a content calendar, and create post captions with platform-specific strategies.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ArrowRight className="h-3 w-3" />
                <span>Or toggle &quot;Sample Data&quot; to see a preview</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 35%, hsl(40 40% 96%) 70%, hsl(15 35% 97%) 100%)' }}>
        {/* Sidebar */}
        <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} activeAgentId={activeAgentId} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="h-screen">
            <div className="p-8 max-w-5xl mx-auto">
              {activeSection === 'dashboard' && renderDashboard()}
              {activeSection === 'accounts' && <ConnectedAccountsScreen />}
              {activeSection === 'history' && (
                <CampaignHistoryScreen
                  campaigns={campaigns}
                  onReuse={handleReuseCampaign}
                  onDelete={handleDeleteCampaign}
                  platformFilter={platformFilter}
                  setPlatformFilter={setPlatformFilter}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </PageErrorBoundary>
  )
}
