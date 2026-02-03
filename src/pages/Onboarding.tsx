import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Code, LineChart, Megaphone, Smartphone, Globe, Database, PenTool } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const CAREER_INTERESTS = [
    { id: "frontend", label: "Frontend Development", icon: Globe },
    { id: "backend", label: "Backend System", icon: Database },
    { id: "fullstack", label: "Full Stack", icon: Code },
    { id: "mobile", label: "Mobile Development", icon: Smartphone },
    { id: "data", label: "Data Science", icon: LineChart },
    { id: "marketing", label: "Digital Marketing", icon: Megaphone },
    { id: "design", label: "UI/UX Design", icon: PenTool },
];

const Onboarding = () => {
    const navigate = useNavigate();
    const { resumeData, updateResumeData } = useResumeStore();
    // Initialize with existing interests if available (e.g. from resume analysis)
    const [selectedInterests, setSelectedInterests] = useState<string[]>(resumeData?.interests || []);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleComplete = async () => {
        if (selectedInterests.length === 0) {
            toast({
                title: "Selection Required",
                description: "Please select at least one area of interest.",
                variant: "destructive"
            });
            return;
        }

        setIsAnalyzing(true);

        // Save interests first
        updateResumeData({ interests: selectedInterests });

        // Simulate ATS Analysis Phase here (will be replaced by service later)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For now, simple redirect. The analysis logic sits better in the service call or the next page load.

        setIsAnalyzing(false);
        navigate("/skills");
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-3xl font-bold mb-4">What are your career interests?</h1>
                    <p className="text-muted-foreground text-lg">
                        Select the fields you're most interested in to help us tailor your job matches.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up">
                    {CAREER_INTERESTS.map((interest) => {
                        const Icon = interest.icon;
                        const isSelected = selectedInterests.includes(interest.id);
                        return (
                            <Card
                                key={interest.id}
                                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                onClick={() => toggleInterest(interest.id)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                        {isSelected ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                    </div>
                                    <h3 className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                        {interest.label}
                                    </h3>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <Button
                        size="lg"
                        className="gradient-primary text-lg px-8 py-6"
                        onClick={handleComplete}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Analyzing Profile...
                            </>
                        ) : (
                            "Analyze & Continue"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
