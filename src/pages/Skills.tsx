import { useNavigate } from "react-router-dom";
import { GraduationCap, Calendar, Check, X, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useResumeStore } from "@/store/resumeStore";
import { Link } from "react-router-dom";

const IN_DEMAND_SKILLS = [
  "TypeScript", "React", "Node.js", "AWS", "Docker", "Kubernetes", 
  "GraphQL", "Python", "Machine Learning", "CI/CD", "MongoDB", 
  "Redis", "WebSockets", "Tailwind CSS", "Next.js"
];

const Skills = () => {
  const resumeData = useResumeStore((state) => state.resumeData);
  const navigate = useNavigate();

  if (!resumeData) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="glass rounded-2xl p-10 max-w-lg mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">No Resume Data Found</h2>
            <p className="text-muted-foreground mb-6">
              Please upload your resume first to see your skills analysis.
            </p>
            <Link to="/upload">
              <Button className="gradient-primary">Upload Resume</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userSkillsLower = resumeData.skills.map(s => s.toLowerCase());
  const skillsYouHave = IN_DEMAND_SKILLS.filter(skill => 
    userSkillsLower.includes(skill.toLowerCase())
  );
  const skillsYouNeed = IN_DEMAND_SKILLS.filter(skill => 
    !userSkillsLower.includes(skill.toLowerCase())
  );
  
  const matchPercentage = Math.round((skillsYouHave.length / IN_DEMAND_SKILLS.length) * 100);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your <span className="text-gradient">Skills Dashboard</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            See how your skills compare to market demands
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="glass rounded-xl p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Experience</span>
            </div>
            <p className="text-2xl font-bold">{resumeData.experience_years} Years</p>
          </div>

          <div className="glass rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Education</span>
            </div>
            <p className="text-lg font-bold">{resumeData.education}</p>
          </div>

          <div className="glass rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-muted-foreground">Match Score</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-gradient">{matchPercentage}%</p>
              <Progress value={matchPercentage} className="flex-1 h-2" />
            </div>
          </div>
        </div>

        {/* Your Skills */}
        <div className="glass rounded-xl p-6 mb-10 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xl font-bold mb-4">Your Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-success/20 text-success rounded-full text-sm font-medium border border-success/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-success" />
              <h2 className="text-xl font-bold">Skills You Have</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              In-demand skills that match your profile
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsYouHave.length > 0 ? (
                skillsYouHave.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-success/20 text-success rounded-full text-sm font-medium border border-success/30"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground">No matching in-demand skills found</p>
              )}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-warning" />
              <h2 className="text-xl font-bold">Skills You Need</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              In-demand skills to learn for better opportunities
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsYouNeed.map((skill) => (
                <Tooltip key={skill}>
                  <TooltipTrigger>
                    <span className="px-3 py-1.5 bg-warning/20 text-warning rounded-full text-sm font-medium border border-warning/30 flex items-center gap-1.5 cursor-help">
                      {skill}
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This skill is in high demand</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <Link to="/jobs">
            <Button size="lg" className="gradient-primary hover:opacity-90 transition-opacity">
              Find Matching Jobs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Skills;
