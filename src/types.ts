export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  instagram?: string;
  email?: string;
}

export interface Portfolio {
  name: string;
  title: string;
  bio: string;
  aboutMe: string;
  profilePhoto: string;
  coverImage: string;
  logo?: string;
  skills: string[];
  experience: Experience[];
  socialLinks: SocialLinks;
}

export interface Website {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  screenshot: string; // main thumbnail URL or base64
  bannerImage?: string; // high res banner
  featured: boolean;
  rating: number; // admin rating 1-5
  views: number;
  clicks: number;
  createdAt: string;
  screenshots?: string[]; // extra screenshots
  version?: string;
  releaseDate?: string;
  updateDate?: string;
  changelog?: string;
  userRatingSum?: number;
  userRatingCount?: number;
}

export interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string; // app icon URL or base64
  apkUrl: string; // direct download url or simulated upload
  version: string;
  size: string; // e.g., "15.4 MB"
  changelog: string;
  featured: boolean;
  rating: number; // admin rating 1-5
  downloads: number;
  views: number;
  releaseDate: string;
  updateDate: string;
  screenshots: string[]; // gallery screenshot URLs
  banner?: string;
  userRatingSum?: number;
  userRatingCount?: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  active: boolean;
  createdAt: string;
}

export interface AnalyticsStats {
  visitors: number;
  clicks: number;
  downloads: number;
  views: number;
  dailyLogs: {
    [date: string]: {
      visits: number;
      clicks: number;
      downloads: number;
      views: number;
    };
  };
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface Feedback {
  id: string;
  name: string;
  rating: number; // 1 to 5
  comment: string;
  projectId?: string; // empty means global portfolio feedback
  projectName?: string; // project name for ease of reference
  createdAt: string;
}
