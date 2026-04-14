import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Briefcase, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisResults from "@/components/AnalysisResults";

export interface AnalysisData {
  candidateSummary: string;
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  experience: { role: string; company: string; duration: string }[];
  projects: { title: string; techStack: string; impact: string }[];
  education: string[];
  atsScore: number;
  keywordScore: number;
  formattingScore: string;
  sectionCompleteness: string;
  matchingSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  jdKeywords: string[];
  presentKeywords: string[];
  missingKeywords: string[];
  keywordDensity: string;
  experienceRelevance: string;
  projectQuality: string;
  metricsUsage: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  bulletImprovements: { original: string; improved: string }[];
  selectionProbability: string;
  verdictReasoning: string;
  topActions: string[];
}

const Index = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const prompt = `You are an expert AI Resume Analyzer. Analyze this resume against the job description and return a JSON response.

Resume:
${resumeText}

Job Description:
${jobDescription}

Target Role: ${targetRole || "Not specified"}
Experience Level: ${experienceLevel}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "candidateSummary": "3-4 line professional summary",
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "experience": [{"role": "", "company": "", "duration": ""}],
  "projects": [{"title": "", "techStack": "", "impact": ""}],
  "education": ["degree details"],
  "atsScore": 75,
  "keywordScore": 70,
  "formattingScore": "Good/Poor/Excellent with brief reason",
  "sectionCompleteness": "assessment",
  "matchingSkills": ["skill1"],
  "missingSkills": ["skill1"],
  "partialSkills": ["skill1"],
  "jdKeywords": ["keyword1"],
  "presentKeywords": ["keyword1"],
  "missingKeywords": ["keyword1"],
  "keywordDensity": "evaluation",
  "experienceRelevance": "assessment",
  "projectQuality": "assessment",
  "metricsUsage": "assessment",
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "recommendations": ["recommendation1"],
  "bulletImprovements": [{"original": "weak bullet", "improved": "strong bullet"}],
  "selectionProbability": "High/Medium/Low",
  "verdictReasoning": "reasoning",
  "topActions": ["action1", "action2", "action3"]
}`;

      const response = await fetch("https://ai-gateway.lovable.dev/api/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": window.location.hostname.split(".")[0] || "local",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-preview",
          messages: [
            { role: "system", content: "You are a resume analysis expert. Return only valid JSON, no markdown formatting." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      setAnalysis(parsed);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ResumeIQ</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Resume Analysis & ATS Scoring</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Input Section */}
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Analyze Your Resume
                </h2>
                <p className="text-muted-foreground">
                  Paste your resume and target job description for a comprehensive AI analysis
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Resume Text
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here..."
                    className="h-72 w-full resize-none rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description here..."
                    className="h-72 w-full resize-none rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Optional fields */}
              <div className="mt-4">
                <button
                  onClick={() => setShowOptional(!showOptional)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Optional fields
                  <ChevronDown className={`h-4 w-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
                </button>
                {showOptional && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 grid gap-4 md:grid-cols-2"
                  >
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Target Role</label>
                      <input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="Fresher">Fresher</option>
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !resumeText.trim() || !jobDescription.trim()}
                  className="gradient-primary text-primary-foreground px-8 py-6 text-base font-semibold rounded-xl glow-shadow hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
                <Button
                  variant="outline"
                  onClick={() => setAnalysis(null)}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  New Analysis
                </Button>
              </div>
              <AnalysisResults data={analysis} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
