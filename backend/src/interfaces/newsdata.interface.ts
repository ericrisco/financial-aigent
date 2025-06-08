export interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  keywords?: string[];
  creator?: string[];
  video_url?: string;
  description?: string;
  content?: string;
  pubDate: string;
  image_url?: string;
  source_id: string;
  source_priority: number;
  source_url: string;
  source_icon?: string;
  language: string;
  country: string[];
  category: string[];
  ai_tag?: string;
  sentiment?: string;
  sentiment_stats?: string;
  ai_region?: string;
  ai_org?: string;
  duplicate?: boolean;
}

export interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

export interface NewsDataSearchParams {
  apikey?: string;
  q?: string;
  qInTitle?: string;
  qInMeta?: string;
  country?: string;
  category?: string;
  excludecategory?: string;
  language?: string;
  domain?: string;
  domainurl?: string;
  excludedomain?: string;
  prioritydomain?: 'top' | 'medium' | 'low';
  timezone?: string;
  full_content?: 0 | 1;
  image?: 0 | 1;
  video?: 0 | 1;
  size?: number;
  page?: string;
  from_date?: string;
  to_date?: string;
}

export interface NewsData {
  articles: NewsDataArticle[];
  totalResults: number;
  nextPage?: string;
  summary?: string;
  searchParams?: NewsDataSearchParams;
} 