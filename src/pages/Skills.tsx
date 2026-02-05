import { useNavigate } from "react-router-dom";
import { GraduationCap, Calendar, Check, X, Info, ArrowRight, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useResumeStore } from "@/store/resumeStore";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { analyzeResume } from "@/lib/ats-service";
import { getResourcesForSkill, LearningResource } from "@/lib/learning-recommendations";

const Skills = () => {
  const { resumeData, updateResumeData } = useResumeStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      if (resumeData && resumeData.interests && !resumeData.atsScore) {
        // Run analysis if likely coming from Onboarding without result yet
        const result = await analyzeResume(resumeData);
        updateResumeData({
          atsScore: result.score,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          atsSummary: result.summary,
          atsImprovements: result.improvements
        });
      }
      setLoading(false);
    };

    if (resumeData) {
      runAnalysis();
    } else {
      setLoading(false);
    }
  }, [resumeData]);

  if (!resumeData) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="glass rounded-2xl p-10 max-w-lg mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">No Profile Data Found</h2>
            <p className="text-muted-foreground mb-6">
              Please create your profile first to see your skills analysis.
            </p>
            <Link to="/upload">
              <Button className="gradient-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || (resumeData.interests && !resumeData.atsScore)) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Analyzing your profile against industry standards...</p>
        </div>
      </div>
    );
  }

  const matchedSkills = resumeData.matchedSkills || [];
  const missingSkills = resumeData.missingSkills || [];
  const score = resumeData.atsScore || 0;

  const SkillWithLearning = ({ skill }: { skill: string }) => {
    const resources = getResourcesForSkill(skill);
    const freeResources = resources.filter(r => r.free);
    const paidResources = resources.filter(r => !r.free);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="px-3 py-1.5 bg-warning/20 text-warning rounded-full text-sm font-medium border border-warning/30 flex items-center gap-1.5 cursor-pointer hover:bg-warning/30 transition-colors">
            {skill}
            <BookOpen className="w-3 h-3" />
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Learn {skill}</h4>
            </div>

            {freeResources.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">🆓 Free Resources</p>
                <div className="space-y-1">
                  {freeResources.slice(0, 2).map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {resource.title}
                      <span className="text-xs text-muted-foreground">({resource.platform})</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {paidResources.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">💎 Premium Courses</p>
                <div className="space-y-1">
                  {paidResources.slice(0, 2).map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {resource.title}
                      <span className="text-xs text-muted-foreground">({resource.platform})</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your Skill Dashboard 📊
          </h1>
          <p className="text-lg text-muted-foreground">
            Analysis based on your interests: <span className="text-foreground font-medium">{resumeData.interests?.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(", ")}</span>
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
              <span className="text-muted-foreground">ATS Match Score</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-primary">{score}/100</p>
            </div>
          </div>
        </div>

        {/* AI Insights and Improvements */}
        {(resumeData.atsSummary || resumeData.atsImprovements?.length > 0) && (
          <div className="grid md:grid-cols-1 gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <div className="glass rounded-xl p-8 border-primary/20 bg-primary/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" />
                Your Career Coach Says...
              </h2>

              {resumeData.atsSummary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-primary">My Take on Your Resume</h3>
                  <p className="text-foreground leading-relaxed bg-background/50 rounded-lg p-4">
                    {resumeData.atsSummary}
                  </p>
                </div>
              )}

              {resumeData.atsImprovements && resumeData.atsImprovements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Here's What I'd Suggest</h3>
                  <ul className="space-y-3">
                    {resumeData.atsImprovements.map((improvement: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-foreground bg-background/50 rounded-lg p-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matched Skills */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-success" />
              <h2 className="text-xl font-bold">Skills You Have</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Matching skills from your profile
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length > 0 ? matchedSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-success/20 text-success rounded-full text-sm font-medium border border-success/30">
                  {skill}
                </span>
              )) : (
                <p className="text-muted-foreground">No matching skills found. Time to upskill!</p>
              )}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-warning" />
              <h2 className="text-xl font-bold">Skills to Learn</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Click on a skill to see learning resources
            </p>
            <div className="flex flex-wrap gap-2">
              {missingSkills.slice(0, 12).map(skill => (
                <SkillWithLearning key={skill} skill={skill} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/jobs">
              <Button size="lg" className="gradient-primary hover:opacity-90 transition-opacity">
                Find Matching Jobs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/cover-letter">
              <Button size="lg" variant="outline">
                Generate Cover Letter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;