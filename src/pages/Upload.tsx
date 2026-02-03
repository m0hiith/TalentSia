import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, X, Loader2, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "@/hooks/use-toast";
import { analyzeResume } from "@/lib/ats-service";
const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const setResumeData = useResumeStore(state => state.setResumeData);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const validateFile = (file: File): boolean => {
    const validTypes = ["application/pdf", "text/plain"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or TXT file.",
        variant: "destructive"
      });
      return false;
    }
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 2MB.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };
  const handleRemoveFile = () => {
    setFile(null);
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);

    try {
      // Get current interests from store if available to provide context
      const currentData = useResumeStore.getState().resumeData || {
        skills: [],
        experience_years: 0,
        education: "",
        job_titles: []
      };

      const result = await analyzeResume(currentData, file);

      // Merge existing data (like interests) with new analysis
      const mergedData = {
        ...currentData,
        // Update basic info from analysis
        fullName: result.basicInfo?.fullName || currentData.fullName,
        email: result.basicInfo?.email || currentData.email,
        skills: [...new Set([...(currentData.skills || []), ...(result.basicInfo?.skills || [])])],
        experience_years: result.basicInfo?.experience_years || currentData.experience_years,
        education: result.basicInfo?.education || currentData.education,
        job_titles: result.basicInfo?.job_titles || currentData.job_titles,

        // Update analysis results
        atsScore: result.score,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills, // These are effectively recommended skills
        atsSummary: result.summary,
        atsImprovements: result.improvements,
        resumeText: result.fullText // Save raw text for Job Matcher
      };

      setResumeData(mergedData);

      toast({
        title: "Analysis Complete",
        description: `Score: ${result.score}/100. ${result.databaseStatus?.success ? "Saved to Profile!" : "⚠️ Data NOT saved: " + result.databaseStatus?.message}`,
        variant: result.databaseStatus?.success ? "default" : "destructive"
      });

      // Navigate to confirmed interests page (Onboarding) instead of skills directly
      // so user can verify inferred categories.
      navigate("/onboarding");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  return <div className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-2xl">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Resume ​<span className="text-gradient text-primary-foreground bg-primary-foreground">​</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload your resume to analyze your skills and find matching jobs.
        </p>
      </div>

      {/* Persistence Info Banner */}
      {useResumeStore.getState().resumeData?.fullName && (
        <div className="glass border-primary/20 bg-primary/5 p-4 rounded-xl mb-6 flex items-center justify-between animate-fade-in">
          <div className="text-left">
            <h3 className="font-semibold text-primary">Resume Active</h3>
            <p className="text-sm text-muted-foreground">
              Analyzed for <span className="font-bold">{useResumeStore.getState().resumeData?.fullName}</span>.
              You can proceed to Job Match or upload a new one.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/match-job")}>
            Go to Job Match
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div className={`glass rounded-2xl p-10 text-center transition-all duration-300 animate-fade-in-up ${isDragging ? "border-primary border-2 bg-primary/10" : "border-dashed border-2 border-border"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {!file ? <div className="py-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <UploadIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Drag & drop your resume here</h3>
          <p className="text-muted-foreground mb-6">or click to browse your files</p>
          <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="hidden" id="file-upload" />
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer w-full" asChild>
                <span>Browse Files</span>
              </Button>
            </label>

            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-px bg-border flex-1"></span>
              <span className="text-xs uppercase">OR</span>
              <span className="h-px bg-border flex-1"></span>
            </div>

            <Button variant="default" className="w-full gradient-primary" onClick={() => navigate("/resume-builder")}>
              <PenTool className="w-4 h-4 mr-2" />
              Create Manually
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Supported formats: PDF, TXT (Max 2MB)
          </p>
        </div> : <div className="py-4">
          <div className="glass rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground truncate max-w-[200px] md:max-w-[300px]">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-muted-foreground hover:text-destructive">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>}
      </div>

      {/* Analyze Button */}
      <div className="mt-8 text-center animate-fade-in-up" style={{
        animationDelay: "200ms"
      }}>
        <Button size="lg" onClick={handleAnalyze} disabled={!file || isAnalyzing} className="gradient-primary hover:opacity-90 transition-opacity text-lg px-12 py-6 w-full md:w-auto">
          {isAnalyzing ? <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing your resume...
          </> : "Analyze Resume"}
        </Button>
      </div>
    </div>
  </div>;
};
export default Upload;