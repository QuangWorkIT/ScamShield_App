export type EducationContentType = "SCENARIO" | "POCKET_CARD"

export type EducationChannelType = "SMS" | "VIDEO" | "CHAT" | "CALL"

export interface EducationCategory {
  code: string
  name: string
}

export interface EducationStructuredContent {
  example?: {
    channelType?: EducationChannelType
    senderName?: string
    displayTime?: string
    message?: string
    highlightedText?: string
  }
  recognitionSigns?: string[]
  scammerGoal?: string
  recommendedActions?: string[]
  tips?: string[]
}

export interface EducationContent {
  id: number
  title: string
  slug: string
  contentType: EducationContentType
  summary: string | null
  structuredContent: EducationStructuredContent | null
  category: EducationCategory | null
  tag: string | null
  badgeLabel: string | null
  imageUrl: string | null
  pdfUrl: string | null
  formatLabel: string | null
  imageWidth: number | null
  imageHeight: number | null
  displayOrder: number | null
  publishedAt: string | null
  updatedAt: string | null
}

export interface EducationFilters {
  contentTypes: EducationContentType[]
  categories: EducationCategory[]
}

export interface EducationHub {
  timezone: string
  generatedAt: string
  filters: EducationFilters
  scenarios: EducationContent[]
  totalScenarios: number
  pocketCards: EducationContent[]
  totalPocketCards: number
}
