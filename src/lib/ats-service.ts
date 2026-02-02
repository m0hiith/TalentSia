import { ResumeData } from "@/store/resumeStore";
import { CAREER_INTERESTS } from "@/pages/Onboarding";

// MOCK SKILL DATABASE MAPPING
const SKILLS_BY_INTEREST: Record<string, string[]> = {
    frontend: ["React", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Next.js", "Redux", "GraphQL", "Figma"],
    backend: ["Node.js", "Python", "Java", "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "API Design"],
    fullstack: ["React", "Node.js", "TypeScript", "SQL", "MongoDB", "AWS", "Docker", "Next.js", "CI/CD"],
    mobile: ["React Native", "Swift", "Kotlin", "Flutter", "iOS", "Android", "Firebase"],
    data: ["Python", "SQL", "Pandas", "NumPy", "PowerBI", "Tableau", "Machine Learning", "Statistics"],
    marketing: ["SEO", "Google Analytics", "Content Marketing", "Social Media", "Copywriting", "Email Marketing", "CRM"],
    design: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "User Research", "Prototyping", "Wireframing"],
};

export interface ATSResult {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendedSkills: string[];
}

export const analyzeResume = async (resume: ResumeData): Promise<ATSResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userSkills = resume.skills.map(s => s.toLowerCase());
    const userInterests = resume.interests || [];

    if (userInterests.length === 0) {
        return { score: 0, matchedSkills: [], missingSkills: [], recommendedSkills: [] };
    }

    // Aggregate target skills based on selected interests
    const targetSkillsSet = new Set<string>();
    userInterests.forEach(interestId => {
        const skills = SKILLS_BY_INTEREST[interestId];
        if (skills) {
            skills.forEach(s => targetSkillsSet.add(s));
        }
    });

    const targetSkills = Array.from(targetSkillsSet);

    // Calculate Matches
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    targetSkills.forEach(target => {
        // Simple detailed matching
        if (userSkills.some(userSkill => userSkill.includes(target.toLowerCase()) || target.toLowerCase().includes(userSkill))) {
            matchedSkills.push(target);
        } else {
            missingSkills.push(target);
        }
    });

    // Calculate Score
    // Weighted: 60% based on skills, 20% on experience (mocked), 20% base
    const skillMatchRatio = matchedSkills.length / Math.max(targetSkills.length, 1);
    let score = Math.round(skillMatchRatio * 80) + 20; // Base score 20

    // Cap at 100
    score = Math.min(100, score);

    return {
        score,
        matchedSkills,
        missingSkills,
        recommendedSkills: missingSkills.slice(0, 5), // Top 5 missing skills
    };
};
