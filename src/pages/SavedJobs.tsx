import { useSavedJobsStore, SavedJob } from "@/store/savedJobsStore";
import { useApplicationsStore } from "@/store/applicationsStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Bookmark,
    MapPin,
    DollarSign,
    Trash2,
    ExternalLink,
    Briefcase,
    Search
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SavedJobs = () => {
    const { savedJobs, unsaveJob } = useSavedJobsStore();
    const { addApplication, getApplicationByJobId } = useApplicationsStore();

    const handleRemove = (jobId: string, jobTitle: string) => {
        unsaveJob(jobId);
        toast({
            title: "Removed from saved jobs",
            description: `${jobTitle} has been removed.`,
        });
    };

    const handleApply = (job: SavedJob) => {
        const existingApp = getApplicationByJobId(job.id);
        if (existingApp) {
            toast({
                title: "Already applied",
                description: `You've already applied to ${job.title}.`,
                variant: "destructive",
            });
            return;
        }

        addApplication({
            jobId: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            status: "applied",
            notes: "",
            url: job.url,
        });

        toast({
            title: "Application tracked!",
            description: `${job.title} at ${job.company} added to your applications.`,
        });
    };

    const getMatchColor = (match: number) => {
        if (match >= 70) return "bg-success/20 text-success border-success/30";
        if (match >= 40) return "bg-warning/20 text-warning border-warning/30";
        return "bg-destructive/20 text-destructive border-destructive/30";
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Saved Jobs 🔖
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Jobs you've bookmarked for later
                    </p>
                </div>

                {savedJobs.length === 0 ? (
                    <Card className="glass animate-fade-in">
                        <CardContent className="text-center py-16">
                            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bookmark className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">No saved jobs yet</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Start browsing jobs and click the bookmark icon to save them here for quick access.
                            </p>
                            <Link to="/jobs">
                                <Button className="gradient-primary">
                                    <Search className="w-4 h-4 mr-2" />
                                    Browse Jobs
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-muted-foreground">
                                {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
                            </p>
                            <Link to="/jobs">
                                <Button variant="outline">
                                    <Search className="w-4 h-4 mr-2" />
                                    Find More Jobs
                                </Button>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedJobs.map((job, index) => (
                                <Card
                                    key={job.id}
                                    className="glass glass-hover animate-fade-in-up flex flex-col"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg leading-tight mb-1">
                                                    {job.title}
                                                </CardTitle>
                                                <p className="text-primary font-medium">{job.company}</p>
                                            </div>
                                            {job.match !== undefined && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getMatchColor(job.match)}`}>
                                                    {job.match}% Match
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col">
                                        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                <span>{job.salary}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {job.skills.slice(0, 3).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills.length > 3 && (
                                                <span className="text-xs text-muted-foreground">
                                                    +{job.skills.length - 3} more
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto space-y-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1 gradient-primary"
                                                    onClick={() => handleApply(job)}
                                                    disabled={!!getApplicationByJobId(job.id)}
                                                >
                                                    {getApplicationByJobId(job.id) ? (
                                                        <>
                                                            <Briefcase className="w-4 h-4 mr-2" />
                                                            Applied
                                                        </>
                                                    ) : (
                                                        "Apply Now"
                                                    )}
                                                </Button>
                                                {job.url && (
                                                    <Button variant="outline" size="icon" asChild>
                                                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemove(job.id, job.title)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;
