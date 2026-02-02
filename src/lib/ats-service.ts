import { ResumeData } from "@/store/resumeStore";

// WEIGHTED SKILL DATABASE
// 3: Critical (Must Have), 2: Important (Nice to Have), 1: Bonus
interface SkillWeight {
    name: string;
    weight: number;
}

const SKILL_WEIGHTS: Record<string, SkillWeight[]> = {
    frontend: [
        { name: "React", weight: 3 }, { name: "TypeScript", weight: 3 }, { name: "JavaScript", weight: 3 },
        { name: "HTML", weight: 2 }, { name: "CSS", weight: 2 }, { name: "Tailwind CSS", weight: 2 },
        { name: "Next.js", weight: 2 }, { name: "Redux", weight: 1 }, { name: "GraphQL", weight: 1 }, { name: "Figma", weight: 1 }
    ],
    backend: [
        { name: "Node.js", weight: 3 }, { name: "Python", weight: 3 }, { name: "SQL", weight: 3 },
        { name: "Java", weight: 2 }, { name: "PostgreSQL", weight: 2 }, { name: "MongoDB", weight: 2 },
        { name: "Docker", weight: 2 }, { name: "AWS", weight: 2 }, { name: "Redis", weight: 1 }, { name: "API Design", weight: 1 }
    ],
    fullstack: [
        { name: "React", weight: 3 }, { name: "Node.js", weight: 3 }, { name: "TypeScript", weight: 3 },
        { name: "SQL", weight: 2 }, { name: "MongoDB", weight: 2 }, { name: "AWS", weight: 2 },
        { name: "Docker", weight: 2 }, { name: "Next.js", weight: 2 }, { name: "CI/CD", weight: 1 }
    ],
    mobile: [
        { name: "React Native", weight: 3 }, { name: "Swift", weight: 3 }, { name: "Kotlin", weight: 3 },
        { name: "Flutter", weight: 2 }, { name: "iOS", weight: 2 }, { name: "Android", weight: 2 }, { name: "Firebase", weight: 1 }
    ],
    data: [
        { name: "Python", weight: 3 }, { name: "SQL", weight: 3 }, { name: "Pandas", weight: 2 },
        { name: "NumPy", weight: 2 }, { name: "Machine Learning", weight: 2 }, { name: "PowerBI", weight: 1 }, { name: "Tableau", weight: 1 }
    ],
    marketing: [
        { name: "SEO", weight: 3 }, { name: "Google Analytics", weight: 3 }, { name: "Content Marketing", weight: 2 },
        { name: "Social Media", weight: 2 }, { name: "Copywriting", weight: 2 }, { name: "Email Marketing", weight: 1 }, { name: "CRM", weight: 1 }
    ],
    design: [
        { name: "Figma", weight: 3 }, { name: "Adobe XD", weight: 2 }, { name: "Photoshop", weight: 2 },
        { name: "Illustrator", weight: 2 }, { name: "User Research", weight: 2 }, { name: "Prototyping", weight: 2 }, { name: "Wireframing", weight: 1 }
    ],
};

export interface ATSResult {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendedSkills: string[];
    details: {
        skillScore: number;
        experienceScore: number;
        roleScore: number;
    };
}

export const analyzeResume = async (resume: ResumeData): Promise<ATSResult> => {
    // Simulate network delay for "Analysis" feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userSkills = resume.skills.map(s => s.toLowerCase());
    const userInterests = resume.interests || [];

    if (userInterests.length === 0) {
        return { score: 0, matchedSkills: [], missingSkills: [], recommendedSkills: [], details: { skillScore: 0, experienceScore: 0, roleScore: 0 } };
    }

    // 1. Calculate Skill Score (60% of Total)
    let totalPossibleWeight = 0;
    let userEarnedWeight = 0;
    const matchedSkills = new Set<string>();
    const missingSkillsSet = new Set<string>();

    userInterests.forEach(interestId => {
        const skills = SKILL_WEIGHTS[interestId];
        if (skills) {
            skills.forEach(skill => {
                totalPossibleWeight += skill.weight;
                const isMatched = userSkills.some(userSkill =>
                    userSkill.includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(userSkill)
                );

                if (isMatched) {
                    userEarnedWeight += skill.weight;
                    matchedSkills.add(skill.name);
                } else {
                    missingSkillsSet.add(skill.name);
                }
            });
        }
    });

    const skillScoreRaw = totalPossibleWeight > 0 ? (userEarnedWeight / totalPossibleWeight) * 100 : 0;
    const weightedSkillScore = skillScoreRaw * 0.6; // 60% Weight

    // 2. Calculate Experience Score (20% of Total)
    // Heuristic: 0-1 yr = Junior (40%), 1-3 yrs = Mid (70%), 3-5 yrs = Senior (90%), 5+ = Expert (100%)
    const years = resume.experience_years || 0;
    let experienceScoreRaw = 0;
    if (years < 1) experienceScoreRaw = 40;
    else if (years < 3) experienceScoreRaw = 70;
    else if (years < 5) experienceScoreRaw = 90;
    else experienceScoreRaw = 100;

    const weightedExperienceScore = experienceScoreRaw * 0.2; // 20% Weight

    // 3. Calculate Role/Title Score (20% of Total)
    // Check if any previous job title matches the interest keywords
    let roleScoreRaw = 0;
    const jobTitles = resume.job_titles || [];
    const interestKeywords = userInterests.join(" ").toLowerCase().split(" "); // e.g., ["frontend", "development"]

    const hasRelevantRole = jobTitles.some(title =>
        interestKeywords.some(keyword => title.toLowerCase().includes(keyword))
    );

    if (hasRelevantRole) roleScoreRaw = 100;
    else if (jobTitles.length > 0) roleScoreRaw = 50; // Has work exp but not exact title match
    else roleScoreRaw = 0; // No work exp

    const weightedRoleScore = roleScoreRaw * 0.2; // 20% Weight

    // Final Total Score
    const totalScore = Math.round(weightedSkillScore + weightedExperienceScore + weightedRoleScore);

    return {
        score: Math.min(100, totalScore),
        matchedSkills: Array.from(matchedSkills),
        missingSkills: Array.from(missingSkillsSet),
        recommendedSkills: Array.from(missingSkillsSet).slice(0, 5), // Top 5 missing
        details: {
            skillScore: Math.round(skillScoreRaw),
            experienceScore: Math.round(experienceScoreRaw),
            roleScore: Math.round(roleScoreRaw)
        }
    };
};
