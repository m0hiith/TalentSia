
import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { matchResumeToJob, JobMatchResult } from "@/lib/job-matcher";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const JobMatch = () => {
    const { resumeData } = useResumeStore();
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<JobMatchResult | null>(null);

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) {
            toast({ title: "Error", description: "Please paste a job description.", variant: "destructive" });
            return;
        }

        // Check if we have any data at all
        if (!resumeData) {
            toast({ title: "No Resume Found", description: "Please upload your resume first.", variant: "destructive" });
            return;
        }

        setIsAnalyzing(true);
        try {
            // FALLBACK: If resumeText is missing (e.g. legacy data or storage limit), construct it from structured data
            let textToAnalyze = resumeData.resumeText || "";

            if (!textToAnalyze.trim()) {
                console.log("JobMatch: resumeText missing, generating fallback from profile.");
                textToAnalyze = `
                Candidate Name: ${resumeData.fullName || "Candidate"}
                Email: ${resumeData.email || ""}
                Skills: ${resumeData.skills.join(", ")}
                Experience: ${resumeData.experience_years} years
                Previous Roles: ${resumeData.job_titles?.join(", ")}
                Education: ${resumeData.education}
                Summary: ${resumeData.atsSummary || ""}
                `;

                toast({
                    title: "Using Profile Data",
                    description: "Original resume text not found. Analyzing based on your extracted profile skills and experience.",
                });
            }

            const matchResult = await matchResumeToJob(textToAnalyze, jobDescription);
            if (matchResult.error) {
                throw new Error(matchResult.error);
            }
            setResult(matchResult);
            toast({ title: "Analysis Complete", description: `Match Score: ${matchResult.matchScore}/100` });
        } catch (error) {
            toast({ title: "Analysis Failed", description: "Please try again later.", variant: "destructive" });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 gradient-text">Job Match Analysis</h1>
                <p className="text-muted-foreground">Paste a job description to see how well your resume matches.</p>
            </div>

            <Card className="glass mb-8">
                <CardContent className="pt-6">
                    {!resumeData?.resumeText ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Resume Found</h3>
                            <p className="text-muted-foreground mb-6">You need to upload and analyze your resume before checking for job matches.</p>
                            <Button onClick={() => window.location.href = '/upload'} className="gradient-primary">
                                Upload Resume
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Textarea
                                placeholder="Paste the job description here..."
                                className="min-h-[200px] mb-4 bg-background/50"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !jobDescription}
                                className="w-full gradient-primary"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    "Analyze Match"
                                )}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-scale-in">
                    {/* Score Section */}
                    <Card className="glass border-primary/20">
                        <CardHeader className="text-center pb-2">
                            <CardTitle>Match Score</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.matchScore)}`}>
                                {result.matchScore}%
                            </div>
                            <p className="text-muted-foreground">Probability of passing ATS</p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Matched Keywords */}
                        <Card className="glass border-green-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-500">
                                    <CheckCircle className="w-5 h-5" /> Matched Keywords
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.matchedKeywords.length > 0 ? (
                                        result.matchedKeywords.map((kw, i) => (
                                            <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                                {kw}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground text-sm">No matches found.</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Missing Keywords */}
                        <Card className="glass border-red-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-500">
                                    <XCircle className="w-5 h-5" /> Missing Keywords
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingKeywords.length > 0 ? (
                                        result.missingKeywords.map((kw, i) => (
                                            <Badge key={i} variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                                {kw}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Great job! No key skills missing.</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-500" /> Recommendations
                            </CardTitle>
                            <CardDescription>Actionable steps to improve your match score</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {result.recommendedChanges.map((rec, i) => (
                                    <li key={i} className="flex gap-2 text-sm">
                                        <span className="text-primary">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default JobMatch;
