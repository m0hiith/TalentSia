import {
  Check, X, Info, ArrowRight, Lightbulb,
  AlertTriangle, BookOpen, FileText, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { useRoadmapStore } from "@/store/roadmapStore";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { analyzeResume } from "@/lib/ats-service";
import { generateRoadmap, inferTargetRole } from "@/lib/roadmap-service";
import { getResourcesForSkill } from "@/lib/learning-recommendations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

// Skill badge with learning popover
const SkillWithLearning = ({ skill }: { skill: string }) => {
  const resources = getResourcesForSkill(skill);
  const freeRes = resources.filter(r => r.free);
  const paidRes = resources.filter(r => !r.free);

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
          {freeRes.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">🆓 Free Resources</p>
              <div className="space-y-1">
                {freeRes.slice(0, 2).map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <FileText className="w-3 h-3" />
                    {r.title} <span className="text-xs text-muted-foreground">({r.platform})</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {paidRes.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">💎 Premium Courses</p>
              <div className="space-y-1">
                {paidRes.slice(0, 2).map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                    <FileText className="w-3 h-3" />
                    {r.title} <span className="text-xs text-muted-foreground">({r.platform})</span>
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

// =============================
// SKILLS PAGE (Analysis Only)
// =============================
const Skills = () => {
  const { resumeData, updateResumeData } = useResumeStore();
  const { modules, setModules, getProgress } = useRoadmapStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (resumeData && resumeData.interests && !resumeData.atsScore) {
        const result = await analyzeResume(resumeData);
        updateResumeData({
          atsScore: result.score,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          atsSummary: result.summary,
          atsImprovements: result.improvements,
        });
      }
      setLoading(false);
    };
    if (resumeData) {
      init();
    } else {
      setLoading(false);
    }
  }, [resumeData, updateResumeData]);

  // Generate roadmap modules (for progress display + learning path page)
  useEffect(() => {
    if (
      resumeData?.interests &&
      resumeData.interests.length > 0 &&
      modules.length === 0
    ) {
      const roadmap = generateRoadmap(
        resumeData.interests,
        resumeData.missingSkills || []
      );
      setModules(roadmap);
    }
  }, [resumeData, modules.length, setModules]);

  // Empty state
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

  // Loading state
  if (loading || (resumeData.interests && !resumeData.atsScore)) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Analyzing your profile...</p>
        </div>
      </div>
    );
  }

  const matchedSkills = resumeData.matchedSkills || [];
  const missingSkills = resumeData.missingSkills || [];
  const score = resumeData.atsScore || 0;
  const targetRole = inferTargetRole(resumeData.interests || []);
  const topImprovements = (resumeData.atsImprovements || []).slice(0, 3);
  const progress = getProgress();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Page title */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
            Your Skill Analysis 📊
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on your resume for <span className="text-primary font-semibold">{targetRole}</span>
          </p>
        </div>

        {/* ATS Score + Summary Card */}
        <div className="glass rounded-2xl p-8 mb-8 animate-fade-in-up border-primary/20 bg-primary/5">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Score circle */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/30" />
                  <circle
                    cx="50" cy="50" r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-primary">{score}</span>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">ATS Score</span>
            </div>

            {/* Summary text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Your Career Coach Says...</h2>
              </div>
              {resumeData.atsSummary && (
                <p className="text-foreground/90 leading-relaxed bg-background/50 rounded-xl p-4 text-base">
                  {resumeData.atsSummary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top 3 Recommendations */}
        {topImprovements.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-bold">Top 3 Recommendations</h2>
            </div>
            <div className="space-y-3">
              {topImprovements.map((improvement: string, idx: number) => (
                <div key={idx} className="flex gap-3 items-start bg-background/50 rounded-xl p-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-foreground/90 leading-relaxed text-sm">{improvement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Gaps */}
        <div className="grid md:grid-cols-2 gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {/* Skills You Have */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold">Skills You Have</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Skills that match your target role</p>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length > 0 ? matchedSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                  {skill}
                </span>
              )) : (
                <p className="text-sm text-muted-foreground">No matching skills found yet. Time to upskill!</p>
              )}
            </div>
          </div>

          {/* Skills to Learn */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <h2 className="text-lg font-bold">Skills to Learn</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Click a skill to see learning resources</p>
            <div className="flex flex-wrap gap-2">
              {missingSkills.slice(0, 10).map(skill => (
                <SkillWithLearning key={skill} skill={skill} />
              ))}
            </div>
          </div>
        </div>

        {/* Learning Path CTA */}
        <div className="glass rounded-2xl p-8 animate-fade-in-up border-primary/20" style={{ animationDelay: "300ms" }}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Ready to bridge your skill gaps?</h3>
              <p className="text-muted-foreground mb-3">
                Your personalized learning path is ready — {progress.total} modules covering what you need to learn and how.
              </p>
              {progress.total > 0 && (
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold text-primary">{progress.percentage}% complete</span>
                  <div className="flex-1 max-w-xs">
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                </div>
              )}
            </div>
            <Link to="/learning-path" className="flex-shrink-0">
              <Button size="lg" className="gradient-primary rounded-xl px-8 py-6 font-semibold text-base hover:opacity-90 transition-opacity">
                View Learning Path
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Skills;