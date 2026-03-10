// Roadmap service: generates learning module roadmaps from user's skill gaps
import { getResourcesForSkill, LearningResource } from "@/lib/learning-recommendations";

export type ModuleStatus = "completed" | "active" | "locked";
export type ModuleTag = "required" | "desired";

export interface FocusArea {
    id: string;
    label: string;
    completed: boolean;
}

export interface RoadmapResource {
    label: string;
    icon: "docs" | "book" | "video" | "cloud";
    url: string;
}

export interface RoadmapModule {
    id: string;
    step: number;
    title: string;
    tag: ModuleTag;
    estimatedWeeks: number;
    status: ModuleStatus;
    focusAreas: FocusArea[];
    resources: RoadmapResource[];
}

// Skill grouping templates — maps interest areas to themed module buckets
const MODULE_TEMPLATES: Record<string, { title: string; tag: ModuleTag; weeks: number; keywords: string[] }[]> = {
    frontend: [
        { title: "Master TypeScript", tag: "required", weeks: 3, keywords: ["typescript", "types", "generics", "react"] },
        { title: "Unit Testing with Jest & RTL", tag: "desired", weeks: 2, keywords: ["testing", "jest", "rtl", "mocking", "test"] },
        { title: "Advanced React Patterns", tag: "desired", weeks: 3, keywords: ["react", "hooks", "state", "performance", "component"] },
        { title: "CSS Architecture & Design Systems", tag: "desired", weeks: 2, keywords: ["css", "tailwind", "design", "responsive", "figma"] },
    ],
    backend: [
        { title: "Node.js & Express Deep Dive", tag: "required", weeks: 3, keywords: ["node.js", "express", "api", "rest", "server"] },
        { title: "Database Design & SQL", tag: "required", weeks: 3, keywords: ["sql", "database", "postgres", "mysql", "schema"] },
        { title: "Authentication & Security", tag: "desired", weeks: 2, keywords: ["auth", "security", "jwt", "oauth", "encryption"] },
        { title: "AWS Lambda & Serverless", tag: "desired", weeks: 4, keywords: ["aws", "lambda", "serverless", "cloud", "deployment"] },
    ],
    fullstack: [
        { title: "Master TypeScript", tag: "required", weeks: 3, keywords: ["typescript", "types", "generics"] },
        { title: "Full Stack Architecture", tag: "required", weeks: 3, keywords: ["api", "rest", "graphql", "architecture"] },
        { title: "DevOps & CI/CD", tag: "desired", weeks: 2, keywords: ["docker", "ci/cd", "deployment", "devops", "kubernetes"] },
        { title: "AWS Lambda & Serverless", tag: "desired", weeks: 4, keywords: ["aws", "lambda", "serverless", "cloud"] },
    ],
    mobile: [
        { title: "React Native Fundamentals", tag: "required", weeks: 4, keywords: ["react native", "mobile", "ios", "android"] },
        { title: "Native APIs & Performance", tag: "desired", weeks: 3, keywords: ["performance", "native", "animation", "gesture"] },
        { title: "App Store Deployment", tag: "desired", weeks: 2, keywords: ["deployment", "app store", "publishing"] },
    ],
    data: [
        { title: "Python for Data Science", tag: "required", weeks: 4, keywords: ["python", "pandas", "numpy", "data"] },
        { title: "Machine Learning Fundamentals", tag: "required", weeks: 4, keywords: ["machine learning", "ml", "model", "ai"] },
        { title: "Data Visualization & Storytelling", tag: "desired", weeks: 2, keywords: ["visualization", "chart", "dashboard", "tableau"] },
        { title: "SQL & Data Engineering", tag: "desired", weeks: 3, keywords: ["sql", "etl", "pipeline", "database"] },
    ],
    design: [
        { title: "UI/UX Design Principles", tag: "required", weeks: 3, keywords: ["ui/ux", "design", "user experience", "usability"] },
        { title: "Figma Mastery", tag: "required", weeks: 2, keywords: ["figma", "prototype", "wireframe", "design system"] },
        { title: "Design Systems in Code", tag: "desired", weeks: 3, keywords: ["css", "component", "design system", "tokens"] },
    ],
    marketing: [
        { title: "SEO & Content Strategy", tag: "required", weeks: 3, keywords: ["seo", "content", "marketing", "strategy"] },
        { title: "Analytics & Data-Driven Marketing", tag: "desired", weeks: 2, keywords: ["analytics", "data", "metrics", "conversion"] },
        { title: "Social Media & Growth Hacking", tag: "desired", weeks: 2, keywords: ["social", "growth", "campaign", "ads"] },
    ],
};

const DEFAULT_TEMPLATE = [
    { title: "Core Technical Skills", tag: "required" as ModuleTag, weeks: 3, keywords: [] as string[] },
    { title: "Advanced Concepts", tag: "desired" as ModuleTag, weeks: 3, keywords: [] as string[] },
    { title: "Industry Tools & Practices", tag: "desired" as ModuleTag, weeks: 2, keywords: [] as string[] },
];

function mapResourceIcon(platform: string): RoadmapResource["icon"] {
    switch (platform.toLowerCase()) {
        case "documentation": return "docs";
        case "youtube": return "video";
        case "coursera":
        case "udemy":
        case "freecodecamp": return "book";
        default: return "cloud";
    }
}

function buildResourcesForModule(keywords: string[], missingSkills: string[]): RoadmapResource[] {
    // Find skills relevant to this module
    const relevant = missingSkills.filter(skill => {
        const lower = skill.toLowerCase();
        return keywords.some(kw => lower.includes(kw) || kw.includes(lower));
    });

    const skillsToUse = relevant.length > 0 ? relevant : missingSkills.slice(0, 2);
    const resources: RoadmapResource[] = [];
    const seen = new Set<string>();

    for (const skill of skillsToUse) {
        const lr = getResourcesForSkill(skill);
        for (const r of lr.slice(0, 1)) {
            if (!seen.has(r.title)) {
                seen.add(r.title);
                resources.push({
                    label: r.title,
                    icon: mapResourceIcon(r.platform),
                    url: r.url,
                });
            }
        }
        if (resources.length >= 2) break;
    }

    return resources;
}

function buildFocusAreas(keywords: string[], missingSkills: string[]): FocusArea[] {
    // Match missing skills to this module's keywords
    const relevant = missingSkills.filter(skill => {
        const lower = skill.toLowerCase();
        return keywords.some(kw => lower.includes(kw) || kw.includes(lower));
    });

    const areas = relevant.length > 0 ? relevant.slice(0, 3) : keywords.slice(0, 3);

    return areas.map((area, idx) => ({
        id: `${area.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idx}`,
        label: area.charAt(0).toUpperCase() + area.slice(1),
        completed: false,
    }));
}

/**
 * Generate a roadmap from interests and missing skills
 */
export function generateRoadmap(
    interests: string[],
    missingSkills: string[],
    targetRole?: string
): RoadmapModule[] {
    // Pick the best template based on first interest
    const primaryInterest = interests[0] || "fullstack";
    const templates = MODULE_TEMPLATES[primaryInterest] || DEFAULT_TEMPLATE;

    return templates.map((tmpl, idx) => ({
        id: `module-${idx + 1}`,
        step: idx + 1,
        title: tmpl.title,
        tag: tmpl.tag,
        estimatedWeeks: tmpl.weeks,
        status: (idx === 0 ? "completed" : idx === 1 ? "active" : "locked") as ModuleStatus,
        focusAreas: buildFocusAreas(tmpl.keywords, missingSkills),
        resources: buildResourcesForModule(tmpl.keywords, missingSkills),
    }));
}

/**
 * Infer the target role name from interests
 */
export function inferTargetRole(interests: string[]): string {
    const roleMap: Record<string, string> = {
        frontend: "Senior Frontend Engineer",
        backend: "Senior Backend Engineer",
        fullstack: "Senior Full Stack Developer",
        mobile: "Mobile App Developer",
        data: "Data Scientist",
        design: "Senior UI/UX Designer",
        marketing: "Digital Marketing Manager",
    };
    return roleMap[interests[0]] || "Software Engineer";
}
