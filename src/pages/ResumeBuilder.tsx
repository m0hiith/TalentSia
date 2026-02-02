import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useResumeStore, WorkExperience, ResumeData } from "@/store/resumeStore";
import { toast } from "@/hooks/use-toast";

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const setResumeData = useResumeStore((state) => state.setResumeData);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        education: "",
        experience_years: 0,
        skills: "",
    });

    const [experiences, setExperiences] = useState<WorkExperience[]>([
        { id: crypto.randomUUID(), company: "", role: "", duration: "", description: "" }
    ]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            const skillsList = formData.skills.split(",").map(s => s.trim()).filter(Boolean);

            const resumeData: ResumeData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                education: formData.education,
                experience_years: Number(formData.experience_years),
                skills: skillsList,
                job_titles: experiences.map(e => e.role), // Infer job titles from roles
                workExperience: experiences,
            };

            setResumeData(resumeData);

            toast({
                title: "Profile Created",
                description: "Your profile has been saved successfully.",
            });

            navigate("/onboarding"); // Proceed to interest selection
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

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-3xl">
                <Button variant="ghost" onClick={() => navigate("/upload")} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
                </Button>

                <div className="animate-fade-in-up">
                    <h1 className="text-3xl font-bold mb-2">Build Your Profile</h1>
                    <p className="text-muted-foreground mb-8">Enter your details manually to get started.</p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
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
                        <Card>
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
                        <Card>
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

                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={exp.description}
                                                onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                                                placeholder="Briefly describe your responsibilities..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button type="submit" size="lg" className="gradient-primary" disabled={loading}>
                                {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save & Continue</>}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
