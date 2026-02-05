/**
 * Adzuna Job Search API Service
 * Connects to Adzuna API for real job listings
 */

export interface AdzunaJob {
    id: string;
    title: string;
    company: { display_name: string };
    location: { display_name: string; area: string[] };
    description: string;
    salary_min?: number;
    salary_max?: number;
    redirect_url: string;
    created: string;
    category: { label: string };
}

export interface AdzunaResponse {
    count: number;
    results: AdzunaJob[];
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    skills: string[];
    description: string;
    url?: string;
    match?: number;
    postedDate?: string;
}

// API Configuration
const ADZUNA_APP_ID = "cae50a9c";
const ADZUNA_APP_KEY = "b2ecca899c07105180a52eda9172863f";
const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const DEFAULT_COUNTRY = "in"; // India

// Extract skills from job description
function extractSkillsFromDescription(description: string): string[] {
    const commonSkills = [
        "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python",
        "Java", "C++", "C#", ".NET", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
        "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "AWS", "Azure",
        "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "REST", "GraphQL", "API",
        "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "Redux", "Next.js", "Express",
        "Django", "Flask", "Spring", "Machine Learning", "AI", "Data Science",
        "Pandas", "TensorFlow", "PyTorch", "Agile", "Scrum", "JIRA", "Linux",
        "Figma", "UI/UX", "Mobile", "iOS", "Android", "React Native", "Flutter"
    ];

    const descLower = description.toLowerCase();
    return commonSkills.filter(skill =>
        descLower.includes(skill.toLowerCase())
    ).slice(0, 6); // Return max 6 skills
}

// Format salary range
function formatSalary(min?: number, max?: number): string {
    if (!min && !max) return "Salary not disclosed";

    const formatNum = (n: number) => {
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
        return `₹${n}`;
    };

    if (min && max) {
        return `${formatNum(min)} - ${formatNum(max)}`;
    }
    if (min) return `${formatNum(min)}+`;
    if (max) return `Up to ${formatNum(max)}`;
    return "Salary not disclosed";
}

// Transform Adzuna job to our Job interface
function transformAdzunaJob(adzunaJob: AdzunaJob): Job {
    return {
        id: adzunaJob.id,
        title: adzunaJob.title,
        company: adzunaJob.company?.display_name || "Company",
        location: adzunaJob.location?.display_name || "Location not specified",
        salary: formatSalary(adzunaJob.salary_min, adzunaJob.salary_max),
        skills: extractSkillsFromDescription(adzunaJob.description || ""),
        description: adzunaJob.description || "No description available",
        url: adzunaJob.redirect_url,
        postedDate: adzunaJob.created
    };
}

export interface SearchOptions {
    query?: string;
    location?: string;
    page?: number;
    resultsPerPage?: number;
    salaryMin?: number;
    fullTime?: boolean;
}

/**
 * Search for jobs using Adzuna API
 */
export async function searchJobs(options: SearchOptions = {}): Promise<{
    jobs: Job[];
    total: number;
    error?: string;
}> {
    const {
        query = "software developer",
        location = "",
        page = 1,
        resultsPerPage = 12,
        salaryMin,
        fullTime
    } = options;

    try {
        const params = new URLSearchParams({
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY,
            results_per_page: resultsPerPage.toString(),
            what: query,
            content_type: "application/json"
        });

        if (location) {
            params.append("where", location);
        }

        if (salaryMin) {
            params.append("salary_min", salaryMin.toString());
        }

        if (fullTime) {
            params.append("full_time", "1");
        }

        const url = `${ADZUNA_BASE_URL}/${DEFAULT_COUNTRY}/search/${page}?${params.toString()}`;

        console.log("Fetching jobs from Adzuna:", url.replace(ADZUNA_APP_KEY, "***"));

        const response = await fetch(url);

        if (!response.ok) {
            console.error("Adzuna API error:", response.status, response.statusText);
            throw new Error(`API returned ${response.status}`);
        }

        const data: AdzunaResponse = await response.json();

        const jobs = data.results.map(transformAdzunaJob);

        return {
            jobs,
            total: data.count
        };
    } catch (error) {
        console.error("Failed to fetch jobs from Adzuna:", error);
        return {
            jobs: [],
            total: 0,
            error: error instanceof Error ? error.message : "Failed to fetch jobs"
        };
    }
}

/**
 * Get job categories from Adzuna
 */
export async function getJobCategories(): Promise<string[]> {
    try {
        const params = new URLSearchParams({
            app_id: ADZUNA_APP_ID,
            app_key: ADZUNA_APP_KEY
        });

        const response = await fetch(
            `${ADZUNA_BASE_URL}/${DEFAULT_COUNTRY}/categories?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        return data.results?.map((cat: { label: string }) => cat.label) || [];
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}
