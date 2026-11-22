export interface CompanyExperience {
  name: string;
  role: string;
  duration: string;
  type: string;
  description: string;
  technologies: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  status: "In Development" | "Concept" | "Prototype" | "Completed";
  category: string;
  description: string;
  contribution: string;
  technologies: string[];
  icon: string;
  repository?: string;
  demo?: string;
}

export interface SkillCategory {
  title: string;
  icon: string;
  description: string;
  skills: { name: string; emoji?: string; detail: string; highlight?: boolean }[];
}

export interface PortfolioData {
  personal: {
    name: string;
    profession: string;
    primaryFocus: string;
    location: string;
    email: string;
    availability: string;
    github: string;
    linkedin: string;
    headline: string;
    bioIntro: string;
    bioSummary: string;
  };
  experience: {
    yearsBadge: string;
    summary: string;
    companies: CompanyExperience[];
  };
  skills: {
    categories: SkillCategory[];
  };
  projects: ProjectItem[];
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const portfolioData: PortfolioData = {
  personal: {
    name: "Malay Ray",
    profession: "Full-Stack Developer",
    primaryFocus: "React Native Mobile & Interactive Web Engineering",
    location: "West Bengal, India",
    email: "rmoloy83@gmail.com",
    availability: "Available for Full-Stack, Frontend & React Native Roles",
    github: "https://github.com/Mack2003",
    linkedin: "https://www.linkedin.com/in/malay-ray-78600823b/",
    headline:
      "Full-Stack Developer passionate about building high-performance cross-platform mobile apps with React Native, scalable backends, and interactive 3D web experiences.",
    bioIntro:
      "A Full-Stack Developer passionate about building interactive digital experiences, scalable applications, and modern software architectures. I enjoy turning complex ideas into practical software through clean engineering, creative problem-solving, and continuous experimentation.",
    bioSummary:
      "Specializing in JavaScript, TypeScript, React Native mobile apps, and robust Node.js/PostgreSQL backends. Dedicated to building reliable, high-impact products with fluid interactions.",
  },
  experience: {
    yearsBadge: "~1.3 Years Professional Experience",
    summary:
      "Professional experience spanning full-stack web platforms at Websadroit and international remote mobile application contract work at Birdvision AB.",
    companies: [
      {
        name: "Websadroit",
        role: "Full-Stack Developer",
        duration: "1 yr 3 mos",
        type: "Full-time",
        description:
          "Developed responsive user interfaces, API integrations, and mobile features using React, Next.js, and React Native. Conducted Lighthouse performance optimization and managed Nginx/PM2 application deployments.",
        technologies: ["React", "Next.js", "React Native", "Node.js", "Nginx", "PM2"],
      },
      {
        name: "Birdvision AB",
        role: "React Native Developer",
        duration: "1 mo",
        type: "Contract (Remote)",
        description:
          "Collaborated remotely on an international workforce management product covering employee shifts, leaves, expenses, and payments using React Native and Expo.",
        technologies: ["React Native", "Expo", "REST APIs", "TypeScript"],
      },
    ],
  },
  skills: {
    categories: [
      {
        title: "Mobile & Native",
        icon: "smartphone",
        description: "Cross-platform mobile applications for Android & iOS with fluid gestures and 2D physics.",
        skills: [
          {
            name: "React Native",
            emoji: "📱",
            detail: "Primary mobile framework for cross-platform Android and iOS applications.",
            highlight: true,
          },
          {
            name: "Expo",
            emoji: "🚀",
            detail: "Modern EAS build workflows, push notifications, and native hardware API integrations.",
            highlight: true,
          },
          {
            name: "React Native Skia",
            emoji: "🎨",
            detail: "High-performance 2D graphics, custom shaders, and interactive game canvases.",
          },
          {
            name: "Matter.js",
            emoji: "⚙️",
            detail: "Rigid-body 2D physics engine used for interactive mobile learning games.",
          },
        ],
      },
      {
        title: "Frontend & 3D",
        icon: "devices",
        description: "High-speed React web architectures, responsive interfaces, and interactive 3D graphics.",
        skills: [
          {
            name: "React.js",
            emoji: "⚛️",
            detail: "Component architecture, custom hooks, and state management for web applications.",
            highlight: true,
          },
          {
            name: "Next.js",
            emoji: "▲",
            detail: "Server Components, App Router, static site generation, and performance optimization.",
            highlight: true,
          },
          {
            name: "TypeScript",
            emoji: "🔷",
            detail: "Strict type safety across frontend and backend services.",
          },
          {
            name: "Tailwind CSS",
            emoji: "🌊",
            detail: "Utility-first design systems, responsive layouts, and neo-brutalist styling.",
          },
          {
            name: "Three.js & WebGL",
            emoji: "🧊",
            detail: "Interactive 3D scenes, camera choreography, and procedural animations.",
          },
        ],
      },
      {
        title: "Backend & Cloud",
        icon: "cloud_queue",
        description: "Scalable REST APIs, relational/document databases, authentication, and cloud storage.",
        skills: [
          {
            name: "Node.js & Express",
            emoji: "🟢",
            detail: "Event-driven REST microservices, middleware architectures, and rate limiting.",
            highlight: true,
          },
          {
            name: "PostgreSQL",
            emoji: "🐘",
            detail: "Relational database design, relational schemas, indexing, and query optimization.",
          },
          {
            name: "MongoDB",
            emoji: "🍃",
            detail: "Document store for dynamic schemas, aggregations, and SaaS product data.",
          },
          {
            name: "Redis",
            emoji: "⚡",
            detail: "In-memory caching, rate-limiting store, and session management.",
          },
          {
            name: "AWS S3",
            emoji: "☁️",
            detail: "Secure cloud object storage workflows and pre-signed media uploads.",
          },
          {
            name: "Nginx & PM2",
            emoji: "🛡️",
            detail: "Production reverse proxies, SSL configuration, and zero-downtime process management.",
          },
        ],
      },
    ],
  },
  projects: [
    {
      id: "fixy",
      title: "Fixy",
      tagline: "Multi-Tenant SaaS Service Platform",
      status: "In Development",
      category: "Full-Stack & Cloud Architecture",
      description:
        "Comprehensive service backend and web application built with Node.js, Express, and TypeScript backed by PostgreSQL and Redis. Features secure multi-tenant isolation, OTP-based authentication, AWS S3 media pipelines, Zod schema validation, API rate limiting, and structured logging alongside a Next.js client interface.",
      contribution:
        "Architected the database schema, designed the modular service layers, implemented OTP verification workflows, and integrated S3 asset handling.",
      technologies: [
        "Node.js",
        "Express",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "AWS S3",
        "Zod",
        "Next.js",
      ],
      icon: "settings_suggest",
    },
    {
      id: "twinkle-star",
      title: "Twinkle Star",
      tagline: "Interactive 2D Physics Learning Game",
      status: "In Development",
      category: "Cross-Platform Mobile Application",
      description:
        "Child-focused interactive mobile game engineered with React Native and Expo. Leverages React Native Skia for high-performance 2D canvas rendering and Matter.js for rigid-body physics simulations, delivering tactile educational mini-games that engage young learners.",
      contribution:
        "Engineered the physics-driven interaction loops, built custom 2D canvas animations using Skia, and implemented cross-platform touch gesture controls.",
      technologies: [
        "React Native",
        "Expo",
        "React Native Skia",
        "Matter.js",
        "TypeScript",
      ],
      icon: "star",
    },
    {
      id: "coslix",
      title: "Coslix",
      tagline: "Loan Management SaaS Solution",
      status: "Concept",
      category: "Web Application & SaaS",
      description:
        "Modern loan management SaaS architecture conceptualized as a Progressive Web App (PWA) with Next.js and MongoDB. Outlines role-based permission tiers, customer lifecycle management, automated payment schedules, audit trails, and cloud document storage via AWS S3.",
      contribution:
        "Designed the system architecture, entity relationship models, and user workflow wireframes for loan lifecycle management.",
      technologies: ["Next.js", "MongoDB", "AWS S3", "PWA", "Tailwind CSS"],
      icon: "payments",
    },
  ],
  metadata: {
    title: "Malay Ray | Full-Stack & React Native Developer",
    description:
      "Personal portfolio of Malay Ray — Full-Stack Developer based in West Bengal, India specializing in React Native mobile apps, Next.js web applications, and interactive digital experiences.",
    keywords: [
      "Malay Ray",
      "Full-Stack Developer",
      "React Native Developer",
      "Next.js",
      "TypeScript",
      "Node.js",
      "West Bengal India",
      "Mobile App Development",
    ],
  },
};
