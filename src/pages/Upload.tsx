import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, X, Loader2, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "@/hooks/use-toast";
import { analyzeResume } from "@/lib/ats-service";
import { supabase } from "@/lib/supabase";

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
        missingSkills: result.missingSkills,
        formatFeedback: result.formatFeedback,
        aiInsights: result.aiInsights,
        resumeText: result.resumeText,
        fileName: file.name,
      };

      setResumeData(mergedData);

      toast({
        title: "Resume Analyzed Successfully!",
        description: `Your ATS score is ${result.score}. Check your skills analysis.`,
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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Resume</h1>
          <p className="text-lg text-muted-foreground">
            Upload your resume to analyze your skills and find matching jobs.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`glass rounded-2xl p-10 text-center transition-all duration-300 animate-fade-in-up ${isDragging ? "border-primary border-2 bg-primary/10" : "border-dashed border-2 border-border"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="py-8">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
                <UploadIcon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag & drop your resume here</h3>
              <p className="text-muted-foreground mb-6">or click to browse your files</p>
              <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
              <p className="text-sm text-muted-foreground mt-4">
                Supports PDF and TXT (max 2MB)
              </p>
            </div>
          ) : (
            <div className="py-6">
              <div className="flex items-center justify-between glass p-4 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button
                className="gradient-primary w-full h-12 text-lg font-semibold"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Or create resume section */}
        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-muted-foreground mb-4">Don't have a resume yet?</p>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/resume-builder")}>
            <PenTool className="w-4 h-4" />
            Build Your Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
