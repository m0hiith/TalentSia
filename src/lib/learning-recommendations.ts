// Learning resource recommendations for skills
// Maps skills to learning resources (Coursera, Udemy, YouTube, etc.)

export interface LearningResource {
    title: string;
    platform: "Coursera" | "Udemy" | "YouTube" | "FreeCodeCamp" | "Documentation";
    url: string;
    type: "Course" | "Video" | "Tutorial" | "Docs";
    free: boolean;
}

export interface SkillRecommendation {
    skill: string;
    resources: LearningResource[];
}

// Comprehensive skill to learning resources mapping
const skillResourcesMap: Record<string, LearningResource[]> = {
    // Frontend
    "react": [
        { title: "React - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/react-the-complete-guide/", type: "Course", free: false },
        { title: "React Full Course 2024", platform: "YouTube", url: "https://www.youtube.com/watch?v=SqcY0GlETPk", type: "Video", free: true },
        { title: "React Documentation", platform: "Documentation", url: "https://react.dev/learn", type: "Docs", free: true },
    ],
    "typescript": [
        { title: "TypeScript for Professionals", platform: "Udemy", url: "https://www.udemy.com/course/typescript-course/", type: "Course", free: false },
        { title: "TypeScript Full Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=30LWjhZzg50", type: "Video", free: true },
        { title: "TypeScript Handbook", platform: "Documentation", url: "https://www.typescriptlang.org/docs/handbook/", type: "Docs", free: true },
    ],
    "javascript": [
        { title: "JavaScript Algorithms and Data Structures", platform: "FreeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "Course", free: true },
        { title: "JavaScript - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/", type: "Course", free: false },
    ],
    "css": [
        { title: "CSS - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/", type: "Course", free: false },
        { title: "CSS Crash Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=yfoY53QXEnI", type: "Video", free: true },
    ],
    "html": [
        { title: "HTML5 Crash Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", type: "Video", free: true },
        { title: "Responsive Web Design", platform: "FreeCodeCamp", url: "https://www.freecodecamp.org/learn/responsive-web-design/", type: "Course", free: true },
    ],
    "graphql": [
        { title: "GraphQL with React", platform: "Udemy", url: "https://www.udemy.com/course/graphql-with-react-course/", type: "Course", free: false },
        { title: "GraphQL Tutorial", platform: "YouTube", url: "https://www.youtube.com/watch?v=ed8SzALpx1Q", type: "Video", free: true },
    ],

    // Backend
    "node.js": [
        { title: "Node.js - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/nodejs-the-complete-guide/", type: "Course", free: false },
        { title: "Node.js Full Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", type: "Video", free: true },
    ],
    "python": [
        { title: "Python for Everybody", platform: "Coursera", url: "https://www.coursera.org/specializations/python", type: "Course", free: false },
        { title: "Scientific Computing with Python", platform: "FreeCodeCamp", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", type: "Course", free: true },
        { title: "Python Crash Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", type: "Video", free: true },
    ],
    "sql": [
        { title: "SQL for Data Science", platform: "Coursera", url: "https://www.coursera.org/learn/sql-for-data-science", type: "Course", free: false },
        { title: "SQL Tutorial - Full Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", type: "Video", free: true },
    ],

    // Cloud & DevOps
    "aws": [
        { title: "AWS Certified Solutions Architect", platform: "Udemy", url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", type: "Course", free: false },
        { title: "AWS Tutorial for Beginners", platform: "YouTube", url: "https://www.youtube.com/watch?v=k1RI5locZE4", type: "Video", free: true },
    ],
    "docker": [
        { title: "Docker Mastery", platform: "Udemy", url: "https://www.udemy.com/course/docker-mastery/", type: "Course", free: false },
        { title: "Docker Tutorial for Beginners", platform: "YouTube", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", type: "Video", free: true },
    ],
    "kubernetes": [
        { title: "Kubernetes for Developers", platform: "Udemy", url: "https://www.udemy.com/course/kubernetes-for-developers/", type: "Course", free: false },
        { title: "Kubernetes Crash Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", type: "Video", free: true },
    ],

    // Data Science & ML
    "machine learning": [
        { title: "Machine Learning by Andrew Ng", platform: "Coursera", url: "https://www.coursera.org/learn/machine-learning", type: "Course", free: false },
        { title: "Machine Learning Full Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=9f-GarcDY58", type: "Video", free: true },
    ],
    "pandas": [
        { title: "Data Analysis with Python", platform: "FreeCodeCamp", url: "https://www.freecodecamp.org/learn/data-analysis-with-python/", type: "Course", free: true },
        { title: "Pandas Tutorial", platform: "YouTube", url: "https://www.youtube.com/watch?v=vmEHCJofslg", type: "Video", free: true },
    ],

    // Mobile
    "swift": [
        { title: "iOS App Development with Swift", platform: "Coursera", url: "https://www.coursera.org/specializations/app-development", type: "Course", free: false },
        { title: "Swift Programming Tutorial", platform: "YouTube", url: "https://www.youtube.com/watch?v=comQ1-x2a1Q", type: "Video", free: true },
    ],
    "react native": [
        { title: "React Native - The Practical Guide", platform: "Udemy", url: "https://www.udemy.com/course/react-native-the-practical-guide/", type: "Course", free: false },
        { title: "React Native Crash Course", platform: "YouTube", url: "https://www.youtube.com/watch?v=0-S5a0eXPoc", type: "Video", free: true },
    ],

    // Design
    "figma": [
        { title: "Figma UI/UX Design Essentials", platform: "Udemy", url: "https://www.udemy.com/course/figma-ux-ui-design/", type: "Course", free: false },
        { title: "Figma Tutorial for Beginners", platform: "YouTube", url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", type: "Video", free: true },
    ],
    "ui/ux": [
        { title: "Google UX Design Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", type: "Course", free: false },
        { title: "UI/UX Design Tutorial", platform: "YouTube", url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU", type: "Video", free: true },
    ],
};

// Normalize skill name for lookup
const normalizeSkill = (skill: string): string => {
    return skill.toLowerCase().trim();
};

// Get learning resources for a specific skill
export const getResourcesForSkill = (skill: string): LearningResource[] => {
    const normalized = normalizeSkill(skill);

    // Direct match
    if (skillResourcesMap[normalized]) {
        return skillResourcesMap[normalized];
    }

    // Partial match
    for (const [key, resources] of Object.entries(skillResourcesMap)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return resources;
        }
    }

    // Default fallback - search on Google
    return [
        {
            title: `Learn ${skill}`,
            platform: "YouTube",
            url: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}+tutorial`,
            type: "Video",
            free: true
        },
        {
            title: `${skill} Courses`,
            platform: "Coursera",
            url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
            type: "Course",
            free: false
        },
    ];
};

// Get recommendations for multiple skills
export const getRecommendationsForSkills = (skills: string[]): SkillRecommendation[] => {
    return skills.map(skill => ({
        skill,
        resources: getResourcesForSkill(skill),
    }));
};

// Get a single best free resource for a skill
export const getBestFreeResource = (skill: string): LearningResource | null => {
    const resources = getResourcesForSkill(skill);
    return resources.find(r => r.free) || null;
};

export default {
    getResourcesForSkill,
    getRecommendationsForSkills,
    getBestFreeResource,
};
