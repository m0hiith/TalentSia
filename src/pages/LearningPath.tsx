import {
    Check, Lock, Play, ArrowRight, RefreshCw, Clock,
    BookOpen, FileText, Cloud, Video, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useResumeStore } from "@/store/resumeStore";
import { useRoadmapStore } from "@/store/roadmapStore";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { analyzeResume } from "@/lib/ats-service";
import { generateRoadmap, inferTargetRole, RoadmapModule, RoadmapResource } from "@/lib/roadmap-service";

// =============================
// Helper Components
// =============================

const ResourceIcon = ({ icon }: { icon: RoadmapResource["icon"] }) => {
    switch (icon) {
        case "docs": return <FileText className="w-3.5 h-3.5" />;
        case "book": return <BookOpen className="w-3.5 h-3.5" />;
        case "video": return <Video className="w-3.5 h-3.5" />;
        case "cloud": return <Cloud className="w-3.5 h-3.5" />;
    }
};

const StatusIcon = ({ status }: { status: RoadmapModule["status"] }) => {
    if (status === "completed") {
        return (
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
        );
    }
    if (status === "active") {
        return (
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-10">
                <Play className="w-7 h-7 text-white ml-0.5" />
            </div>
        );
    }
    return (
        <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center z-10">
            <Lock className="w-6 h-6 text-muted-foreground/60" />
        </div>
    );
};

const StatusBadge = ({ status }: { status: RoadmapModule["status"] }) => {
    if (status === "completed") {
        return (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                Completed <Check className="w-4 h-4" />
            </span>
        );
    }
    if (status === "active") {
        return (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE NOW
            </span>
        );
    }
    return (
        <span className="text-muted-foreground/60 text-sm font-semibold tracking-wider">
            LOCKED
        </span>
    );
};

const TagBadge = ({ tag }: { tag: "required" | "desired" }) => (
    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tag === "required"
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-primary/20 text-primary border border-primary/30"
        }`}>
        {tag}
    </span>
);

// =============================
// Roadmap Step Card
// =============================
const RoadmapStep = ({
    module,
    onToggleFocus,
    onComplete,
}: {
    module: RoadmapModule;
    onToggleFocus: (moduleId: string, focusId: string) => void;
    onComplete: (moduleId: string) => void;
}) => {
    const isLocked = module.status === "locked";
    const isActive = module.status === "active";

    return (
        <div className="flex gap-6 relative animate-fade-in-up" style={{ animationDelay: `${module.step * 120}ms` }}>
            <div className="flex flex-col items-center">
                <StatusIcon status={module.status} />
                <div className="w-0.5 flex-1 bg-border/50 mt-2" />
            </div>

            <div className={`flex-1 mb-8 rounded-2xl border p-6 transition-all duration-300 ${isActive
                    ? "bg-card/80 border-primary/40 shadow-lg shadow-primary/5"
                    : isLocked
                        ? "bg-card/30 border-border/30 opacity-60"
                        : "bg-card/50 border-border/50"
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold text-muted-foreground tracking-widest">STEP {module.step}</span>
                            <TagBadge tag={module.tag} />
                        </div>
                        <h3 className={`text-xl font-bold mb-1 ${isLocked ? "text-muted-foreground/60" : "text-foreground"}`}>
                            {module.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            Estimated: {module.estimatedWeeks} weeks
                        </div>
                    </div>
                    <StatusBadge status={module.status} />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isLocked ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                            Key Focus Areas
                        </h4>
                        <div className="space-y-2.5">
                            {module.focusAreas.map((fa) => (
                                <div key={fa.id} className="flex items-center gap-2.5">
                                    {isActive ? (
                                        <Checkbox
                                            id={fa.id}
                                            checked={fa.completed}
                                            onCheckedChange={() => onToggleFocus(module.id, fa.id)}
                                            className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    ) : module.status === "completed" ? (
                                        <div className="w-4 h-4 rounded-sm bg-emerald-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        </div>
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 ml-1" />
                                    )}
                                    <label
                                        htmlFor={isActive ? fa.id : undefined}
                                        className={`text-sm ${fa.completed && isActive ? "line-through text-muted-foreground" :
                                                isLocked ? "text-muted-foreground/40" : "text-foreground/80"
                                            } ${isActive ? "cursor-pointer" : ""}`}
                                    >
                                        {fa.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isLocked ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                            Resources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {module.resources.map((res, idx) => (
                                <a
                                    key={idx}
                                    href={isLocked ? undefined : res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${isLocked
                                            ? "bg-muted/20 border-border/20 text-muted-foreground/30 cursor-not-allowed"
                                            : "bg-muted/40 border-border/50 text-foreground/80 hover:bg-muted/60 hover:border-border cursor-pointer"
                                        }`}
                                >
                                    <ResourceIcon icon={res.icon} />
                                    {res.label}
                                </a>
                            ))}
                        </div>

                        {isActive && (
                            <Button
                                className="w-full mt-4 gradient-primary text-base font-semibold py-5 rounded-xl hover:opacity-90 transition-opacity"
                                onClick={() => onComplete(module.id)}
                            >
                                Continue Learning
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================
// LEARNING PATH PAGE
// =============================
const LearningPath = () => {
    const { resumeData, updateResumeData } = useResumeStore();
    const { modules, setModules, toggleFocusArea, completeModule, getProgress } = useRoadmapStore();
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

    if (!resumeData) {
        return (
            <div className="min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-4 text-center">
                    <div className="glass rounded-2xl p-10 max-w-lg mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4">No Profile Data Found</h2>
                        <p className="text-muted-foreground mb-6">
                            Please analyze your resume first to get a personalized learning path.
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
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Building your personalized learning path...</p>
                </div>
            </div>
        );
    }

    const progress = getProgress();
    const targetRole = inferTargetRole(resumeData.interests || []);

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Your Learning Path
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        A step-by-step plan to bridge your skill gaps and become a{" "}
                        <span className="text-primary font-semibold">{targetRole}</span> — what to learn and how.
                    </p>
                </div>

                {/* Overall Progress */}
                <div className="glass rounded-2xl p-6 mb-10 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Overall Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {progress.completed} of {progress.total} modules completed
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-extrabold text-primary">
                            {progress.percentage}%
                        </span>
                        <div className="flex-1">
                            <Progress value={progress.percentage} className="h-2.5" />
                        </div>
                    </div>
                </div>

                {/* Roadmap Timeline */}
                <div className="mb-10">
                    {modules.map((mod) => (
                        <RoadmapStep
                            key={mod.id}
                            module={mod}
                            onToggleFocus={toggleFocusArea}
                            onComplete={completeModule}
                        />
                    ))}
                </div>

                {/* Rescan Resume CTA */}
                <div className="glass rounded-2xl p-8 text-center md:text-left md:flex md:items-center md:justify-between animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold text-primary mb-1">
                            Feeling confident with your progress?
                        </h3>
                        <p className="text-muted-foreground">
                            Update your resume to see how your ATS score improved with your new skills.
                        </p>
                    </div>
                    <Link to="/upload">
                        <Button size="lg" className="gradient-primary rounded-xl px-6 py-5 font-semibold text-base hover:opacity-90 transition-opacity">
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Rescan Resume
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
