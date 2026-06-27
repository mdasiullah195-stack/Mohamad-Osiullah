import { Portfolio, Website, App, RoadmapItem, Announcement } from './types';

export const defaultPortfolio: Portfolio = {
  name: "Mohamad Osiullah",
  title: "Full-Stack Engineer & Mobile App Architect",
  bio: "Crafting beautiful, high-performance web applications and native Android solutions.",
  aboutMe: "I am a passionate software engineer specializing in cross-platform mobile architecture (Kotlin, Android, Flutter) and modern web ecosystems (React, Node.js, Next.js, and Cloud Infrastructure). I focus on elegant user experiences, high-performance animations, and zero-trust security integration.",
  profilePhoto: "/input_file_0.png", // use uploaded image as profile photo
  coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  logo: "/input_file_0.png",
  skills: [
    "Android Development (Kotlin/Java)",
    "React & Next.js",
    "Flutter / React Native",
    "Node.js & Express.js",
    "Firebase & Firestore",
    "PostgreSQL & Cloud SQL",
    "UI/UX Design (Figma)",
    "Tailwind CSS & Framer Motion",
    "Docker & Cloud Run",
    "SEO & Web Performance"
  ],
  experience: [
    {
      id: "exp1",
      role: "Lead Full-Stack Developer",
      company: "Apex Digital Solutions",
      duration: "2024 - Present",
      description: "Architecting microservices on Cloud Run, structuring multi-tenant SQL databases, and leading high-fidelity React dashboard designs."
    },
    {
      id: "exp2",
      role: "Mobile App Engineer",
      company: "ByteCraft Studio",
      duration: "2022 - 2024",
      description: "Built three native Android productivity apps in Kotlin, achieving 100k+ organic Google Play downloads. Integrated off-line SQLite caching and secure background workers."
    },
    {
      id: "exp3",
      role: "UI/UX & Frontend Contractor",
      company: "Freelance / Remote",
      duration: "2020 - 2022",
      description: "Designed responsive Web/App layouts on Figma and developed glassmorphism UI templates using Tailwind CSS and Framer Motion for diverse global clients."
    }
  ],
  socialLinks: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
    email: "mdasiullah195@gmail.com"
  }
};

export const defaultWebsites: Website[] = [
  {
    id: "web-am-resume",
    name: "AM Resume Builder",
    description: "Professional resume and cover letter builder with multi-layout real-time editors, dynamic template switches, and high-fidelity PDF exporting tools.",
    category: "Resume Builder",
    url: "https://example.com/resume-builder",
    screenshot: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80",
    bannerImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    rating: 5,
    views: 1240,
    clicks: 432,
    createdAt: "2025-10-12T08:00:00Z",
    screenshots: [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "web-docuchat",
    name: "DocuChat AI",
    description: "An AI-powered document analyzer enabling users to upload PDFs or Word documents and instantly chat, summarize, or extract structured keys via Gemini API models.",
    category: "AI Tools",
    url: "https://example.com/docuchat",
    screenshot: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    bannerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    rating: 5,
    views: 890,
    clicks: 310,
    createdAt: "2025-12-01T10:30:00Z",
    screenshots: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "web-agritrack",
    name: "AgriTrack IoT",
    description: "Real-time farming automation and irrigation planning dashboard with historical humidity, temperature, and soil metrics visualizers designed in D3.",
    category: "Utility",
    url: "https://example.com/agritrack",
    screenshot: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=600&q=80",
    bannerImage: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    rating: 4,
    views: 450,
    clicks: 120,
    createdAt: "2026-02-15T14:20:00Z",
    screenshots: [
      "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=600&q=80"
    ]
  }
];

export const defaultApps: App[] = [
  {
    id: "app-taskflow",
    name: "TaskFlow Mobile",
    description: "Premium Android productivity ecosystem centering Pomodoro session focus, interactive calendars, offline local synchronization, and custom home widgets.",
    category: "Productivity",
    icon: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=150&h=150&q=80",
    apkUrl: "https://github.com/osiullah/releases/raw/main/TaskFlow_v2.1.0.apk",
    version: "v2.1.0",
    size: "14.2 MB",
    changelog: "- Redesigned statistics widgets with dark theme support.\n- Added custom home screen widget shortcuts.\n- Fixed SQLite worker synchronization delays on Android 14.\n- Added local backup exports.",
    featured: true,
    rating: 5,
    downloads: 320,
    views: 1105,
    releaseDate: "2025-05-10",
    updateDate: "2026-06-01",
    screenshots: [
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80"
    ],
    banner: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "app-securegate",
    name: "SecureGate 2FA",
    description: "Open-source 2FA authenticator with local SQLite encryption key-store, secure biometric entry locks, and visual QR scanning generators.",
    category: "Utility",
    icon: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=150&h=150&q=80",
    apkUrl: "https://github.com/osiullah/releases/raw/main/SecureGate_v1.0.4.apk",
    version: "v1.0.4",
    size: "8.5 MB",
    changelog: "- Implemented hardware-backed Android KeyStore protection.\n- Optimized visual QR code scanning focus.\n- Added cloud-free encrypted backup exports.",
    featured: true,
    rating: 5,
    downloads: 185,
    views: 650,
    releaseDate: "2025-09-20",
    updateDate: "2025-11-15",
    screenshots: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
    ],
    banner: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "app-convertpro",
    name: "ConvertPro Converter",
    description: "Offline universal currency, unit, and media converter featuring a smart custom keypad, dark mode, and currency updates auto-synced.",
    category: "Converter",
    icon: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=150&h=150&q=80",
    apkUrl: "https://github.com/osiullah/releases/raw/main/ConvertPro_v1.2.0.apk",
    version: "v1.2.0",
    size: "6.1 MB",
    changelog: "- Added dynamic offline converter engine.\n- Expanded list of currencies and metric conversions.\n- Improved haptic feedback parameters.",
    featured: false,
    rating: 4,
    downloads: 88,
    views: 290,
    releaseDate: "2026-01-05",
    updateDate: "2026-03-12",
    screenshots: [
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80"
    ],
    banner: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80"
  }
];

export const defaultRoadmap: RoadmapItem[] = [
  {
    id: "road-1",
    title: "AgriTrack Native Integration",
    description: "Launch direct Flutter BLE client supporting immediate smart sensors configuration.",
    date: "Q3 2026",
    status: "in_progress",
    createdAt: "2026-05-12T09:00:00Z"
  },
  {
    id: "road-2",
    title: "Resume Builder ATS Optimization Scanners",
    description: "Incorporate localized ATS analyzer scoring bullet metrics against custom jobs requirements.",
    date: "Q4 2026",
    status: "planned",
    createdAt: "2026-06-01T11:00:00Z"
  },
  {
    id: "road-3",
    title: "SecureGate Authenticator Extension",
    description: "Build matching desktop Chrome/Firefox extensions auto-filling authenticators securely over encrypted channels.",
    date: "Q1 2027",
    status: "planned",
    createdAt: "2026-06-25T06:00:00Z"
  }
];

export const defaultAnnouncements: Announcement[] = [];
