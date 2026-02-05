import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileText, Copy, Download, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Link } from "react-router-dom";

const getGenAI = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is missing in .env");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

const CoverLetter = () => {
    const { resumeData } = useResumeStore();
    const [jobDescription, setJobDescription] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");

    const generateCoverLetter = async () => {
        if (!jobDescription.trim()) {
            toast({ title: "Error", description: "Please paste a job description.", variant: "destructive" });
            return;
        }

        if (!resumeData) {
            toast({ title: "Error", description: "Please upload your resume first.", variant: "destructive" });
            return;
        }

        const genAI = getGenAI();
        if (!genAI) {
            toast({ title: "Error", description: "API key missing. Add VITE_GEMINI_API_KEY to .env", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            const resumeContext = `
        Name: ${resumeData.fullName || "Candidate"}
        Email: ${resumeData.email || ""}
        Skills: ${resumeData.skills?.join(", ") || "Not specified"}
        Experience: ${resumeData.experience_years || 0} years
        Job Titles: ${resumeData.job_titles?.join(", ") || "Not specified"}
        Education: ${resumeData.education || "Not specified"}
        Interests: ${resumeData.interests?.join(", ") || "Not specified"}
      `;

            const prompt = `
        You are a professional cover letter writer. Write a compelling, personalized cover letter based on the following:
        
        CANDIDATE PROFILE:
        ${resumeContext}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        ${companyName ? `COMPANY NAME: ${companyName}` : ""}
        
        INSTRUCTIONS:
        1. Write a professional cover letter (3-4 paragraphs)
        2. Highlight relevant skills and experience that match the job
        3. Show enthusiasm for the role and company
        4. Be specific but concise
        5. Use a professional but warm tone
        6. Do NOT include placeholder brackets like [Company Name] - use the actual company name if provided, or write generically if not
        7. Do NOT include the date or address headers - just the letter body
        8. Start with "Dear Hiring Manager," or similar appropriate greeting
        9. End with a strong closing paragraph and "Sincerely," followed by the candidate's name
        
        Write the cover letter now:
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setCoverLetter(text);
            toast({ title: "Cover letter generated!", description: "Review and customize as needed." });
        } catch (error: any) {
            console.error("Error generating cover letter:", error);
            toast({
                title: "Generation failed",
                description: error.message || "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        toast({ title: "Copied!", description: "Cover letter copied to clipboard." });
    };

    const handleDownload = () => {
        const blob = new Blob([coverLetter], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cover-letter-${companyName || "job"}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Downloaded!", description: "Cover letter saved as text file." });
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        AI Cover Letter Generator ✍️
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Create a personalized cover letter tailored to any job
                    </p>
                </div>

                {!resumeData ? (
                    <Card className="glass animate-fade-in">
                        <CardContent className="text-center py-12">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Resume Required</h3>
                            <p className="text-muted-foreground mb-6">
                                Upload and analyze your resume first to generate personalized cover letters.
                            </p>
                            <Link to="/upload">
                                <Button className="gradient-primary">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Upload Resume
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {/* Input Section */}
                        <Card className="glass animate-fade-in-up">
                            <CardHeader>
                                <CardTitle>Job Details</CardTitle>
                                <CardDescription>
                                    Paste the job description you're applying for
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Company Name (optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Google, Microsoft, Startup Inc."
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Job Description *
                                    </label>
                                    <Textarea
                                        placeholder="Paste the full job description here..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        className="min-h-[200px] bg-secondary/50"
                                    />
                                </div>
                                <Button
                                    onClick={generateCoverLetter}
                                    disabled={isGenerating || !jobDescription.trim()}
                                    className="w-full gradient-primary"
                                    size="lg"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Cover Letter
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Output Section */}
                        {coverLetter && (
                            <Card className="glass animate-fade-in-up border-primary/20">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-primary" />
                                                Your Cover Letter
                                            </CardTitle>
                                            <CardDescription>
                                                Review, edit, and customize as needed
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-secondary/30 rounded-lg p-6 whitespace-pre-wrap leading-relaxed">
                                        {coverLetter}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tips */}
                        <Card className="glass animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                            <CardHeader>
                                <CardTitle className="text-base">💡 Tips for a Great Cover Letter</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• <strong>Customize:</strong> Always tailor the generated letter to add personal touches</li>
                                    <li>• <strong>Research:</strong> Add specific details about the company you've researched</li>
                                    <li>• <strong>Quantify:</strong> Add metrics and achievements where possible</li>
                                    <li>• <strong>Proofread:</strong> Double-check for any errors before sending</li>
                                    <li>• <strong>Length:</strong> Keep it concise - one page maximum</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoverLetter;
