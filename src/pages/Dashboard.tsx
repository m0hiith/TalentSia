import { useAuth } from "@/contexts/AuthContext";
import { useResumeStore } from "@/store/resumeStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    User,
    FileText,
    Briefcase,
    TrendingUp,
    BookmarkCheck,
    ChevronRight,
    Sparkles,
    GraduationCap,
    Clock
} from "lucide-react";
import { useSavedJobsStore } from "@/store/savedJobsStore";
import { useApplicationsStore } from "@/store/applicationsStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
    const { user } = useAuth();
    const { resumeData } = useResumeStore();
    const savedJobs = useSavedJobsStore((state) => state.savedJobs);
    const applications = useApplicationsStore((state) => state.applications);

    // Calculate profile completeness
    const calculateCompleteness = () => {
        if (!resumeData) return 0;
        let score = 0;
        if (resumeData.fullName) score += 15;
        if (resumeData.email) score += 10;
        if (resumeData.skills && resumeData.skills.length > 0) score += 20;
        if (resumeData.experience_years) score += 15;
        if (resumeData.education) score += 15;
        if (resumeData.interests && resumeData.interests.length > 0) score += 10;
        if (resumeData.atsScore) score += 15;
        return Math.min(score, 100);
    };

    const profileCompleteness = calculateCompleteness();

    // Mock ATS score history (in real app, fetch from Supabase)
    const scoreHistory = [
        { date: "Jan", score: resumeData?.atsScore ? Math.max(40, (resumeData.atsScore - 30)) : 40 },
        { date: "Feb", score: resumeData?.atsScore ? Math.max(50, (resumeData.atsScore - 20)) : 50 },
        { date: "Mar", score: resumeData?.atsScore ? Math.max(55, (resumeData.atsScore - 15)) : 55 },
        { date: "Apr", score: resumeData?.atsScore ? Math.max(60, (resumeData.atsScore - 10)) : 60 },
        { date: "May", score: resumeData?.atsScore || 65 },
    ];

    const quickActions = [
        { title: "Analyze Resume", description: "Get AI-powered insights", icon: Sparkles, href: "/upload", color: "text-purple-500" },
        { title: "Find Jobs", description: "Discover opportunities", icon: Briefcase, href: "/jobs", color: "text-blue-500" },
        { title: "Cover Letter", description: "Generate AI cover letters", icon: FileText, href: "/cover-letter", color: "text-green-500" },
        { title: "Build Resume", description: "Create your resume", icon: FileText, href: "/resume-builder", color: "text-orange-500" },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Welcome Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Welcome back, <span className="text-primary font-bold">{resumeData?.fullName || user?.email?.split('@')[0] || "User"}</span> 👋
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Here's an overview of your career journey
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* ATS Score Card */}
                    <Card className="glass animate-fade-in-up">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                ATS Score
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-primary">
                                    {resumeData?.atsScore || "—"}
                                </span>
                                <span className="text-muted-foreground mb-1">/100</span>
                            </div>
                            {resumeData?.atsScore && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {resumeData.atsScore >= 70 ? "Great score!" : "Room for improvement"}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Profile Completeness */}
                    <Card className="glass animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Profile Complete
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold">{profileCompleteness}</span>
                                <span className="text-muted-foreground mb-1">%</span>
                            </div>
                            <Progress value={profileCompleteness} className="h-2" />
                        </CardContent>
                    </Card>

                    {/* Saved Jobs */}
                    <Card className="glass animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <BookmarkCheck className="w-4 h-4" />
                                Saved Jobs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold">{savedJobs.length}</span>
                                <span className="text-muted-foreground mb-1">jobs</span>
                            </div>
                            <Link to="/saved-jobs" className="text-sm text-primary hover:underline">
                                View saved →
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Applications */}
                    <Card className="glass animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold">{applications.length}</span>
                                <span className="text-muted-foreground mb-1">active</span>
                            </div>
                            <Link to="/applications" className="text-sm text-primary hover:underline">
                                Track progress →
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Score Chart & Profile */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ATS Score Trend */}
                        <Card className="glass animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    ATS Score Trend
                                </CardTitle>
                                <CardDescription>Your resume score over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={scoreHistory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                                            <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={3}
                                                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Summary */}
                        {resumeData && (
                            <Card className="glass animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Profile Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Experience</p>
                                                <p className="font-semibold">{resumeData.experience_years} years</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <GraduationCap className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Education</p>
                                                <p className="font-semibold">{resumeData.education || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {resumeData.skills && resumeData.skills.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Top Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {resumeData.skills.slice(0, 8).map((skill) => (
                                                    <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {resumeData.skills.length > 8 && (
                                                    <span className="px-3 py-1 text-muted-foreground text-sm">
                                                        +{resumeData.skills.length - 8} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {resumeData.atsSummary && (
                                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                                            <p className="text-sm italic text-muted-foreground">"{resumeData.atsSummary}"</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="space-y-6">
                        <Card className="glass animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Jump to common tasks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {quickActions.map((action) => (
                                    <Link key={action.title} to={action.href}>
                                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer">
                                            <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${action.color}`}>
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{action.title}</p>
                                                <p className="text-sm text-muted-foreground">{action.description}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>

                        {/* No Resume CTA */}
                        {!resumeData && (
                            <Card className="glass border-primary/20 bg-primary/5 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                                <CardContent className="pt-6 text-center">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Upload your resume to unlock personalized insights and job matching
                                    </p>
                                    <Link to="/upload">
                                        <Button className="w-full gradient-primary">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Analyze Resume
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Interests */}
                        {resumeData?.interests && resumeData.interests.length > 0 && (
                            <Card className="glass animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                                <CardHeader>
                                    <CardTitle className="text-base">Your Interests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.interests.map((interest) => (
                                            <span key={interest} className="px-3 py-1.5 bg-secondary rounded-full text-sm capitalize">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
