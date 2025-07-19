// Simplified types for the AI-Powered Site Editor

export interface User {
  id: string;
  email: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  site_url?: string;
  title: string;
  description?: string;
  is_published: boolean;
  published_url?: string;
  created_at: string;
  updated_at: string;
}

export type ComponentType = "text" | "image" | "section" | "hero" | "cta" | "footer" | "navbar";

export interface Component {
  id: string;
  project_id: string;
  component_type: ComponentType;
  content: Record<string, any>;
  position: number;
  styles?: Record<string, any>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

export type PlanType = "daily" | "monthly";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  plan_type: PlanType;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Component content types
export interface TextContent {
  text: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  alignment?: "left" | "center" | "right";
}

export interface ImageContent {
  url: string;
  alt?: string;
  width?: string;
  height?: string;
}

export interface HeroContent {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CTAContent {
  text: string;
  url: string;
  backgroundColor?: string;
  textColor?: string;
  size?: "small" | "medium" | "large";
}

export interface NavbarContent {
  logoText?: string;
  links: Array<{
    text: string;
    url: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
}

export interface FooterContent {
  copyright?: string;
  links?: Array<{
    text: string;
    url: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
}

// Site parsing types
export interface ParsedSiteData {
  title: string;
  description?: string;
  components: Omit<Component, "id" | "project_id" | "created_at" | "updated_at">[];
}

// AI suggestion types
export interface AISuggestionData {
  type: "layout" | "content" | "style" | "ux";
  description: string;
  component_id?: string;
  changes: Record<string, any>;
  confidence: number;
}
