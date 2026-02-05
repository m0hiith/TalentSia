import { useApplicationsStore, JobApplication, ApplicationStatus } from "@/store/applicationsStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Briefcase,
    MapPin,
    DollarSign,
    Trash2,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle,
    MessageSquare,
    Calendar,
    Search,
    Send
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const statusConfig: Record<ApplicationStatus, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
    applied: { label: "Applied", icon: Send, color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/20" },
    interview: { label: "Interview", icon: MessageSquare, color: "text-yellow-500", bgColor: "bg-yellow-500/10 border-yellow-500/20" },
    offer: { label: "Offer", icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/20" },
    rejected: { label: "Rejected", icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20" },
};

const Applications = () => {
    const { applications, updateApplicationStatus, updateApplicationNotes, removeApplication } = useApplicationsStore();
    const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
    const [notes, setNotes] = useState("");

    const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
        updateApplicationStatus(appId, newStatus);
        toast({
            title: "Status updated",
            description: `Application status changed to ${statusConfig[newStatus].label}.`,
        });
    };

    const handleRemove = (app: JobApplication) => {
        removeApplication(app.id);
        toast({
            title: "Application removed",
            description: `${app.title} at ${app.company} has been removed.`,
        });
    };

    const handleOpenNotes = (app: JobApplication) => {
        setSelectedApp(app);
        setNotes(app.notes);
    };

    const handleSaveNotes = () => {
        if (selectedApp) {
            updateApplicationNotes(selectedApp.id, notes);
            toast({ title: "Notes saved" });
            setSelectedApp(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Group applications by status
    const groupedApplications = applications.reduce((acc, app) => {
        if (!acc[app.status]) acc[app.status] = [];
        acc[app.status].push(app);
        return acc;
    }, {} as Record<ApplicationStatus, JobApplication[]>);

    const statusOrder: ApplicationStatus[] = ["applied", "interview", "offer", "rejected"];

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Application Tracker 📋
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Track your job applications and their progress
                    </p>
                </div>

                {applications.length === 0 ? (
                    <Card className="glass animate-fade-in">
                        <CardContent className="text-center py-16">
                            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">No applications yet</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Apply to jobs and track your applications here. Start by finding jobs that match your skills.
                            </p>
                            <Link to="/jobs">
                                <Button className="gradient-primary">
                                    <Search className="w-4 h-4 mr-2" />
                                    Find Jobs
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {statusOrder.map((status) => {
                                const config = statusConfig[status];
                                const count = groupedApplications[status]?.length || 0;
                                return (
                                    <Card key={status} className={`glass border ${config.bgColor}`}>
                                        <CardContent className="pt-4 pb-4">
                                            <div className="flex items-center gap-3">
                                                <config.icon className={`w-5 h-5 ${config.color}`} />
                                                <div>
                                                    <p className="text-2xl font-bold">{count}</p>
                                                    <p className="text-sm text-muted-foreground">{config.label}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Applications List */}
                        <div className="space-y-4">
                            {applications.map((app, index) => {
                                const config = statusConfig[app.status];
                                return (
                                    <Card
                                        key={app.id}
                                        className={`glass glass-hover animate-fade-in-up border-l-4`}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                            borderLeftColor: `hsl(var(--${app.status === 'offer' ? 'success' : app.status === 'rejected' ? 'destructive' : app.status === 'interview' ? 'warning' : 'primary'}))`,
                                        }}
                                    >
                                        <CardContent className="pt-4 pb-4">
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Job Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                                                            <config.icon className={`w-5 h-5 ${config.color}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-lg">{app.title}</h3>
                                                            <p className="text-primary font-medium">{app.company}</p>
                                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {app.location}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    {app.salary}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Applied {formatDate(app.appliedAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-3">
                                                    <Select
                                                        value={app.status}
                                                        onValueChange={(value) => handleStatusChange(app.id, value as ApplicationStatus)}
                                                    >
                                                        <SelectTrigger className="w-[140px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statusOrder.map((status) => (
                                                                <SelectItem key={status} value={status}>
                                                                    <div className="flex items-center gap-2">
                                                                        {statusConfig[status].label}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <Button variant="outline" size="icon" onClick={() => handleOpenNotes(app)}>
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Button>

                                                    {app.url && (
                                                        <Button variant="outline" size="icon" asChild>
                                                            <a href={app.url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleRemove(app)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {app.notes && (
                                                <div className="mt-4 pl-13 ml-13">
                                                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                                                        📝 {app.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Notes Dialog */}
            <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Application Notes</DialogTitle>
                        <DialogDescription>
                            {selectedApp?.title} at {selectedApp?.company}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Add notes about this application (interview prep, contacts, etc.)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[150px]"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSelectedApp(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveNotes} className="gradient-primary">
                            Save Notes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Applications;
