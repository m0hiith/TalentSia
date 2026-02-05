import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Save, ArrowLeft, Download, FileText, Check } from "lucide-react";
import { useResumeStore, WorkExperience, ResumeData } from "@/store/resumeStore";
import { toast } from "@/hooks/use-toast";
import { generateResumePDF, TEMPLATES, TemplateId } from "@/lib/pdf-generator";

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const { resumeData: existingData, setResumeData } = useResumeStore();
    const [loading, setLoading] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("professional");

    // Initialize form with existing data if available
    const [formData, setFormData] = useState({
        fullName: existingData?.fullName || "",
        email: existingData?.email || "",
        phone: existingData?.phone || "",
        education: existingData?.education || "",
        experience_years: existingData?.experience_years || 0,
        skills: existingData?.skills?.join(", ") || "",
    });

    const [experiences, setExperiences] = useState<WorkExperience[]>(
        existingData?.workExperience || [
            { id: crypto.randomUUID(), company: "", role: "", duration: "", description: "" }
        ]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExperienceChange = (id: string, field: keyof WorkExperience, value: string) => {
        setExperiences(prev => prev.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const addExperience = () => {
        setExperiences(prev => [...prev, { id: crypto.randomUUID(), company: "", role: "", duration: "", description: "" }]);
    };

    const removeExperience = (id: string) => {
        setExperiences(prev => prev.filter(exp => exp.id !== id));
    };

    const buildResumeData = (): ResumeData => {
        const skillsList = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
        return {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            education: formData.education,
            experience_years: Number(formData.experience_years),
            skills: skillsList,
            job_titles: experiences.map(e => e.role).filter(Boolean),
            workExperience: experiences,
            // Preserve existing analysis data
            interests: existingData?.interests,
            atsScore: existingData?.atsScore,
            matchedSkills: existingData?.matchedSkills,
            missingSkills: existingData?.missingSkills,
            atsSummary: existingData?.atsSummary,
            atsImprovements: existingData?.atsImprovements,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const resumeData = buildResumeData();
            setResumeData(resumeData);

            toast({
                title: "Profile Saved",
                description: "Your profile has been saved successfully.",
            });

            navigate("/onboarding");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save profile.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (templateId: TemplateId = selectedTemplate) => {
        setDownloadingPDF(true);
        try {
            const resumeData = buildResumeData();

            // Save current data first
            setResumeData(resumeData);

            // Generate and download PDF with selected template
            generateResumePDF(resumeData, templateId);

            toast({
                title: "PDF Downloaded!",
                description: `Your ${templateId} resume has been saved as a PDF file.`,
            });
            setShowTemplateDialog(false);
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({
                title: "Error",
                description: "Failed to generate PDF. Please try again.",
                variant: "destructive"
            });
        } finally {
            setDownloadingPDF(false);
        }
    };

    const hasContent = formData.fullName.trim() || formData.skills.trim() || experiences.some(e => e.role.trim());

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate("/upload")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
                    </Button>

                    {hasContent && (
                        <Button
                            variant="outline"
                            onClick={() => setShowTemplateDialog(true)}
                            disabled={downloadingPDF}
                        >
                            {downloadingPDF ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <div className="animate-fade-in-up">
                    <h1 className="text-3xl font-bold mb-2">Build Your Profile</h1>
                    <p className="text-muted-foreground mb-8">Enter your details manually to get started.</p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="education">Highest Education</Label>
                                        <Input id="education" name="education" placeholder="e.g. BS Computer Science" value={formData.education} onChange={handleInputChange} required />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & Experience */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle>Skills & Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="skills">Skills (comma separated)</Label>
                                    <Textarea
                                        id="skills"
                                        name="skills"
                                        placeholder="React, Node.js, Python, Project Management..."
                                        value={formData.skills}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experience_years">Years of Experience</Label>
                                    <Input
                                        id="experience_years"
                                        name="experience_years"
                                        type="number"
                                        min="0"
                                        value={formData.experience_years}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Work Experience */}
                        <Card className="glass">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Work Experience</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Position
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {experiences.map((exp, index) => (
                                    <div key={exp.id} className="p-4 border rounded-lg bg-secondary/20 relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeExperience(exp.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <Label>Job Title</Label>
                                                <Input
                                                    value={exp.role}
                                                    onChange={(e) => handleExperienceChange(exp.id, "role", e.target.value)}
                                                    placeholder="e.g. Senior Developer"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Company</Label>
                                                <Input
                                                    value={exp.company}
                                                    onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                                                    placeholder="e.g. Acme Inc"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <Label>Duration</Label>
                                                <Input
                                                    value={exp.duration}
                                                    onChange={(e) => handleExperienceChange(exp.id, "duration", e.target.value)}
                                                    placeholder="e.g. Jan 2020 - Present"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={exp.description}
                                                onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                                                placeholder="Briefly describe your responsibilities and achievements..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => setShowTemplateDialog(true)}
                                disabled={downloadingPDF || !hasContent}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button type="submit" size="lg" className="gradient-primary" disabled={loading}>
                                {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save & Continue</>}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Template Selection Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="glass max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Choose Resume Template</DialogTitle>
                        <DialogDescription>
                            Select a template style for your PDF resume
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 mt-4">
                        {TEMPLATES.map((template) => (
                            <div
                                key={template.id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${selectedTemplate === template.id
                                        ? "border-primary bg-primary/10"
                                        : "border-border"
                                    }`}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{template.preview}</span>
                                        <div>
                                            <h4 className="font-semibold">{template.name}</h4>
                                            <p className="text-sm text-muted-foreground">{template.description}</p>
                                        </div>
                                    </div>
                                    {selectedTemplate === template.id && (
                                        <Check className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="gradient-primary"
                            onClick={() => handleDownloadPDF(selectedTemplate)}
                            disabled={downloadingPDF}
                        >
                            {downloadingPDF ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Resume
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ResumeBuilder;
