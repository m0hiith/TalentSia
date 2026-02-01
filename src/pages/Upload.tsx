import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { toast } from "@/hooks/use-toast";
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

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock data
    const mockData = {
      skills: ["JavaScript", "React", "Node.js", "CSS", "HTML", "Git", "Python", "SQL"],
      experience_years: 3,
      education: "Bachelor's in Computer Science",
      job_titles: ["Frontend Developer", "Junior Software Engineer"]
    };
    setResumeData(mockData);
    setIsAnalyzing(false);
    navigate("/skills");
  };
  return <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Upload Your <span className="text-gradient bg-secondary text-primary-foreground">Resume</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your resume to analyze your skills and find matching jobs.
          </p>
        </div>

        {/* Upload Area */}
        <div className={`glass rounded-2xl p-10 text-center transition-all duration-300 animate-fade-in-up ${isDragging ? "border-primary border-2 bg-primary/10" : "border-dashed border-2 border-border"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          {!file ? <div className="py-8">
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