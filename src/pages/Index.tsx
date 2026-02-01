import { Link } from "react-router-dom";
import { ArrowRight, FileSearch, Target, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const features = [
    {
      icon: FileSearch,
      title: "Resume Analysis",
      description: "Upload your resume and let our AI extract your skills, experience, and qualifications automatically.",
    },
    {
      icon: Target,
      title: "Skill Gap Finder",
      description: "Discover exactly which skills you need to learn to qualify for your dream roles.",
    },
    {
      icon: Briefcase,
      title: "Job Matching",
      description: "Find jobs that match your profile with personalized match scores and recommendations.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="animate-shimmer absolute inset-0" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Find Your Perfect Job.{" "}
              <span className="text-gradient">Close Every Skill Gap.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 animate-fade-in-up max-w-2xl mx-auto">
              Upload your resume, discover what skills you need, and find jobs that match your profile.
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Link to="/upload">
                <Button size="lg" className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 animate-glow">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
              Everything You Need to{" "}
              <span className="text-gradient">Land Your Dream Job</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our powerful AI-driven tools help you understand your strengths and identify opportunities for growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 gradient-hero opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of job seekers who have found their perfect match with ATS Finder.
              </p>
              <Link to="/upload">
                <Button size="lg" className="gradient-primary hover:opacity-90 transition-opacity">
                  Upload Your Resume
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
