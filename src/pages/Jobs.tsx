import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, DollarSign, Filter, Bookmark, BookmarkCheck, Check, ExternalLink, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResumeStore } from "@/store/resumeStore";
import { useSavedJobsStore } from "@/store/savedJobsStore";
import { useApplicationsStore } from "@/store/applicationsStore";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { calculateJobMatch, type Job } from "@/lib/job-match";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

// Re-export the canonical Job type for any consumer importing it from here.
export type { Job } from "@/lib/job-match";

// Raw Supabase row (capitalized columns; skills may be array or comma string).
interface JobRow {
  id?: string;
  Title?: string;
  Company?: string;
  Location?: string;
  Salary?: string;
  Experience?: string;
  Stipend?: string;
  Link?: string;
  Description?: string;
  skills?: string[] | string | null;
}

// Single mapping boundary: Supabase row → the app's canonical Job. (P10)
function mapJobRow(row: JobRow, idx: number): Job {
  const skills = Array.isArray(row.skills)
    ? row.skills
    : typeof row.skills === "string" && row.skills
      ? row.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  return {
    id: row.id || String(idx),
    Title: row.Title || "Untitled",
    Company: row.Company || "Unknown Company",
    Location: row.Location || "Not specified",
    Salary: row.Salary || row.Stipend || "Not disclosed",
    Experience: row.Experience || "",
    Stipend: row.Stipend || "",
    Link: row.Link || "",
    Description: row.Description || "No description available",
    skills,
  };
}

const Jobs = () => {
  useDocumentMeta({
    title: "Find Jobs",
    description: "Search and discover jobs that match your skills and experience. AI-powered job matching with personalized match scores.",
    canonicalPath: "/jobs",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("match-desc");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState<{ query: string; location: string }>({ query: "", location: "" });

  const resumeData = useResumeStore(state => state.resumeData);
  const { saveJob, unsaveJob, isJobSaved } = useSavedJobsStore();
  const { addApplication, getApplicationByJobId } = useApplicationsStore();

  const userSkillsLower = useMemo(() => resumeData?.skills.map(s => s.toLowerCase()) || [], [resumeData?.skills]);

  const PAGE_SIZE = 20;

  // Server-side search + pagination via Supabase — one request per page/search,
  // never the whole table, no client-side filtering, no debug logging. (P6)
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["jobs", applied.query, applied.location, page],
    queryFn: async () => {
      let q = supabase.from("jobs").select("*", { count: "exact" });
      if (applied.query) {
        q = q.or(
          `Title.ilike.%${applied.query}%,Company.ilike.%${applied.query}%,Description.ilike.%${applied.query}%`,
        );
      }
      if (applied.location) {
        q = q.ilike("Location", `%${applied.location}%`);
      }
      const { data: rowData, count, error } = await q.range(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE - 1,
      );
      if (error) throw error;
      return { rows: (rowData ?? []) as JobRow[], total: count ?? 0 };
    },
  });

  const jobs = useMemo<Job[]>(() => (data?.rows ?? []).map(mapJobRow), [data]);
  const totalJobs = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  const handleSearch = () => {
    setPage(1);
    setApplied({ query: searchQuery.trim(), location: locationFilter.trim() });
  };

  const handleRefresh = () => {
    refetch();
  };

  // Match scores via the pure, unit-tested calculateJobMatch helper. (P10/P14)
  const jobsWithMatch = useMemo(
    () => jobs.map(job => ({ ...job, match: calculateJobMatch(job, resumeData) })),
    [jobs, resumeData],
  );

  const filteredAndSortedJobs = useMemo(() => {
    const filtered = jobsWithMatch;

    switch (sortBy) {
      case "match-desc":
        filtered.sort((a, b) => (b.match || 0) - (a.match || 0));
        break;
      case "salary-desc":
        // Sort by salary (extract number from string)
        filtered.sort((a, b) => {
          const aMatch = (a.Salary || "").match(/\d+/);
          const bMatch = (b.Salary || "").match(/\d+/);
          return (bMatch ? parseInt(bMatch[0]) : 0) - (aMatch ? parseInt(aMatch[0]) : 0);
        });
        break;
      case "title-asc":
        filtered.sort((a, b) => a.Title.localeCompare(b.Title));
        break;
    }
    return filtered;
  }, [jobsWithMatch, sortBy]);

  const getMatchColor = (match: number) => {
    if (match >= 70) return "bg-success/20 text-success border-success/30";
    if (match >= 40) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  const handleToggleSave = (job: Job, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isJobSaved(job.id)) {
      unsaveJob(job.id);
      toast({ title: "Removed from saved jobs", description: job.Title });
    } else {
      saveJob({
        id: job.id,
        title: job.Title,
        company: job.Company,
        location: job.Location,
        salary: job.Salary,
        skills: job.skills,
        description: job.Description,
        url: job.Link,
        match: job.match,
      });
      toast({ title: "Job saved!", description: `${job.Title} added to saved jobs.` });
    }
  };

  const handleApply = (job: Job) => {
    const existingApp = getApplicationByJobId(job.id);
    if (existingApp) {
      toast({
        title: "Already applied",
        description: `You've already applied to ${job.Title}.`,
        variant: "destructive",
      });
      return;
    }

    addApplication({
      jobId: job.id,
      title: job.Title,
      company: job.Company,
      location: job.Location,
      salary: job.Salary,
      status: "applied",
      notes: "",
      url: job.Link,
    });

    toast({
      title: "Application submitted!",
      description: `${job.Title} at ${job.Company} added to your applications.`,
    });

    // Open job URL in new tab
    if (job.Link) {
      window.open(job.Link, "_blank");
    }

    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Dream Job 🚀
          </h1>
          <p className="text-lg text-muted-foreground">
            {resumeData ? "Discover opportunities tailored to your profile" : "Browse open positions"}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="glass rounded-xl p-4 mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by job title, skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>
            <div className="relative flex-1 md:max-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSearch} className="gradient-primary flex-1 md:flex-none">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isFetching} className="shrink-0">
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-secondary/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match-desc">Match Score (High)</SelectItem>
                <SelectItem value="salary-desc">Salary (High)</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-4">
              {totalJobs > 0 ? `${totalJobs.toLocaleString()} jobs found` : ""}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Searching for jobs...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">We couldn't load jobs right now.</p>
            <Button onClick={handleRefresh}>Try again</Button>
          </div>
        )}

        {/* Job Grid */}
        {!isLoading && !isError && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedJobs.map((job, index) => (
              <div
                key={job.id}
                className="glass glass-hover rounded-xl p-6 animate-fade-in-up flex flex-col cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{job.Title}</h3>
                    <p className="text-primary font-medium">{job.Company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {resumeData && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getMatchColor(job.match || 0)}`}>
                        {job.match}%
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleToggleSave(job, e)}
                    >
                      {isJobSaved(job.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-primary" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{job.Location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.Salary || "Not specified"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(job.skills || []).slice(0, 4).map(skill => {
                    const isMatch = userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
                    return (
                      <span
                        key={skill}
                        className={`px-2 py-1 rounded-full text-xs ${isMatch
                          ? "bg-success/20 text-success"
                          : "bg-secondary text-muted-foreground"
                          }`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                  {(job.skills || []).length > 4 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}>
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 gradient-primary" onClick={(e) => { e.stopPropagation(); handleApply(job); }}>
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredAndSortedJobs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No jobs found matching your criteria.</p>
            <Button onClick={() => { setSearchQuery(""); setLocationFilter(""); setApplied({ query: "", location: "" }); setPage(1); }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Job Detail Modal */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedJob && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedJob.Title}</DialogTitle>
                  <p className="text-primary font-medium text-lg">{selectedJob.Company}</p>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <span>{selectedJob.Location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-5 h-5" />
                      <span>{selectedJob.Salary}</span>
                    </div>
                    {resumeData && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getMatchColor(selectedJob.match || 0)}`}>
                        {selectedJob.match}% Match
                      </span>
                    )}
                  </div>

                  {(selectedJob.skills || []).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedJob.skills || []).map(skill => {
                        const isMatch = userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
                        return (
                          <span
                            key={skill}
                            className={`px-3 py-1.5 rounded-full text-sm ${isMatch
                              ? "bg-success/20 text-success border border-success/30"
                              : "bg-secondary text-muted-foreground"
                              }`}
                          >
                            {isMatch && <Check className="w-3 h-3 inline mr-1" />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Job Description</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{selectedJob.Description}</p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-border">
                    <Button variant="outline" className="flex-1" onClick={() => handleToggleSave(selectedJob)}>
                      {isJobSaved(selectedJob.id) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save Job
                        </>
                      )}
                    </Button>
                    <Button className="flex-1 gradient-primary" onClick={() => handleApply(selectedJob)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Jobs;