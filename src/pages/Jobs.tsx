import { useState, useMemo, useEffect } from "react";
import { Search, MapPin, DollarSign, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  description: string;
  // Dynamic fields
  match?: number;
}

// Expanded Mock Job Database
const MOCK_JOBS_DB: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Google",
    location: "Remote",
    salary: "$140k-$180k",
    skills: ["React", "TypeScript", "GraphQL", "AWS"],
    description: "We are looking for a talented Senior Frontend Developer..."
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$130k-$170k",
    skills: ["Node.js", "React", "Docker", "MongoDB", "AWS"],
    description: "We are looking for a talented Full Stack Engineer..."
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "Microsoft",
    location: "Remote",
    salary: "$120k-$160k",
    skills: ["Python", "AWS", "Docker", "Redis", "SQL"],
    description: "We are looking for a talented Backend Developer..."
  },
  {
    id: 4,
    title: "Frontend Engineer",
    company: "Meta",
    location: "Menlo Park, CA",
    salary: "$135k-$175k",
    skills: ["React", "TypeScript", "CSS", "GraphQL", "Figma"],
    description: "We are looking for a talented Frontend Engineer..."
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Netflix",
    location: "Remote",
    salary: "$145k-$190k",
    skills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Python"],
    description: "We are looking for a talented DevOps Engineer..."
  },
  {
    id: 6,
    title: "Junior React Developer",
    company: "Shopify",
    location: "Remote",
    salary: "$75k-$100k",
    skills: ["React", "JavaScript", "HTML", "CSS"],
    description: "We are looking for a talented Junior React Developer..."
  },
  {
    id: 7,
    title: "Data Scientist",
    company: "Spotify",
    location: "New York, NY",
    salary: "$130k-$160k",
    skills: ["Python", "Machine Learning", "SQL", "Pandas"],
    description: "Analyze vast amounts of data to improve user experience..."
  },
  {
    id: 8,
    title: "Mobile Developer (iOS)",
    company: "Apple",
    location: "Cupertino, CA",
    salary: "$140k-$190k",
    skills: ["Swift", "iOS", "React Native"],
    description: "Build the next generation of iOS apps..."
  },
  {
    id: 9,
    title: "Digital Marketing Specialist",
    company: "HubSpot",
    location: "Remote",
    salary: "$80k-$110k",
    skills: ["SEO", "Content Marketing", "Social Media", "Google Analytics"],
    description: "Drive growth through innovative marketing campaigns..."
  }
];

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match-desc");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const resumeData = useResumeStore(state => state.resumeData);
  const userSkillsLower = resumeData?.skills.map(s => s.toLowerCase()) || [];

  // Calculate matches dynamically based on user profile
  const jobsWithMatch = useMemo(() => {
    return MOCK_JOBS_DB.map(job => {
      if (!resumeData) return { ...job, match: 0 };

      // 1. Skill Match (60%)
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const userSkills = userSkillsLower;
      const matchedSkills = jobSkills.filter(js => userSkills.some(us => us.includes(js) || js.includes(us)));
      const skillScore = (matchedSkills.length / Math.max(jobSkills.length, 1)) * 100;
      const weightedSkillScore = skillScore * 0.6;

      // 2. Experience Match (20%)
      // Heuristic: If user has >= 3 years, they get full points for most mid-level logic
      // Ideally we'd have a 'required_years' in the job, but we'll infer it or use a standard
      const userYears = resumeData.experience_years || 0;
      let experienceScore = 0;
      if (job.title.toLowerCase().includes("senior")) {
        experienceScore = userYears >= 5 ? 100 : (userYears / 5) * 100;
      } else if (job.title.toLowerCase().includes("junior") || job.title.toLowerCase().includes("intern")) {
        experienceScore = userYears >= 0 ? 100 : 50; // Everyone qualifies for junior
      } else {
        // Mid level
        experienceScore = userYears >= 2 ? 100 : (userYears / 2) * 100;
      }
      const weightedExperienceScore = experienceScore * 0.2;

      // 3. Role/Interest Match (20%)
      let roleScore = 0;
      if (resumeData.interests && resumeData.interests.some(i => job.title.toLowerCase().includes(i.toLowerCase()))) {
        roleScore = 100;
      } else if (resumeData.job_titles && resumeData.job_titles.some(t => job.title.toLowerCase().includes(t.toLowerCase()))) {
        roleScore = 100;
      }
      const weightedRoleScore = roleScore * 0.2;

      const totalScore = Math.round(weightedSkillScore + weightedExperienceScore + weightedRoleScore);

      return { ...job, match: Math.min(100, totalScore) };
    });
  }, [resumeData, userSkillsLower]);

  const filteredAndSortedJobs = useMemo(() => {
    let jobs = jobsWithMatch.filter(job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    switch (sortBy) {
      case "match-desc":
        jobs.sort((a, b) => (b.match || 0) - (a.match || 0));
        break;
      case "salary-desc":
        jobs.sort((a, b) => {
          const aMax = parseInt(a.salary.replace(/\D/g, "").slice(-3));
          const bMax = parseInt(b.salary.replace(/\D/g, "").slice(-3));
          return bMax - aMax;
        });
        break;
      case "title-asc":
        jobs.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return jobs;
  }, [jobsWithMatch, searchQuery, sortBy]);

  const getMatchColor = (match: number) => {
    if (match >= 70) return "bg-success/20 text-success border-success/30";
    if (match >= 40) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  const handleApply = () => {
    toast({
      title: "Application submitted!",
      description: "Your application has been sent to the employer."
    });
    setSelectedJob(null);
  };

  return <div className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Find Your Dream Job   <span className="text-gradient text-primary-foreground">​ </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          {resumeData ? "Discover opportunities tailored to your profile" : "Browse open positions"}
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search by title, company, or skill..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-secondary/50 border-border" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-secondary/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match-desc">Match Score (High)</SelectItem>
                <SelectItem value="salary-desc">Salary (High)</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedJobs.map((job, index) => <div key={job.id} className="glass glass-hover rounded-xl p-6 animate-fade-in-up flex flex-col" style={{
          animationDelay: `${index * 50}ms`
        }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">{job.title}</h3>
              <p className="text-primary font-medium">{job.company}</p>
            </div>
            {resumeData && (
              <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getMatchColor(job.match || 0)}`}>
                {job.match}% Match
              </span>
            )}
          </div>

          <div className="space-y-2 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {job.skills.slice(0, 4).map(skill => <span key={skill} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
              {skill}
            </span>)}
            {job.skills.length > 4 && <span className="text-xs text-muted-foreground">+{job.skills.length - 4} more</span>}
          </div>

          <div className="flex gap-2 mt-auto">
            <Button variant="outline" className="flex-1" onClick={() => setSelectedJob(job)}>
              View Details
            </Button>
            <Button className="flex-1 gradient-primary hover:opacity-90" onClick={handleApply}>
              Apply Now
            </Button>
          </div>
        </div>)}
      </div>

      {filteredAndSortedJobs.length === 0 && <div className="text-center py-16 glass rounded-xl">
        <p className="text-xl text-muted-foreground">No jobs found matching your search.</p>
      </div>}
    </div>

    {/* Job Detail Modal */}
    <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
      <DialogContent className="max-w-2xl glass border-border">
        {selectedJob && <>
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl mb-1">{selectedJob.title}</DialogTitle>
                <p className="text-primary font-medium text-lg">{selectedJob.company}</p>
              </div>
              {resumeData && (
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getMatchColor(selectedJob.match || 0)}`}>
                  {selectedJob.match}% Match
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{selectedJob.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>{selectedJob.salary}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Job Description</h4>
              <p className="text-muted-foreground leading-relaxed">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.map(skill => {
                  const hasSkill = userSkillsLower.includes(skill.toLowerCase());
                  return <span key={skill} className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border ${hasSkill && resumeData ? "bg-success/20 text-success border-success/30" : "bg-secondary text-secondary-foreground border-border"}`}>
                    {hasSkill && resumeData && <Check className="w-3 h-3" />}
                    {skill}
                  </span>;
                })}
              </div>
            </div>

            {resumeData && <div>
              <h4 className="font-semibold mb-3">Skills Gap for This Job</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.filter(skill => !userSkillsLower.includes(skill.toLowerCase())).map(skill => <span key={skill} className="px-3 py-1.5 bg-warning/20 text-warning rounded-full text-sm font-medium border border-warning/30">
                  Learn {skill}
                </span>)}
                {selectedJob.skills.every(skill => userSkillsLower.includes(skill.toLowerCase())) && <p className="text-success">🎉 You have all required skills for this job!</p>}
              </div>
            </div>}

            <Button className="w-full gradient-primary hover:opacity-90 text-lg py-6" onClick={handleApply}>
              Apply Now
            </Button>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
};
export default Jobs;