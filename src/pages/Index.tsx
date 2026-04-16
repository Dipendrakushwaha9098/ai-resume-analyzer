import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { History, Sparkles } from "lucide-react";
import ParticlesBg from "@/components/ParticlesBg";
import SimpleAnalysisResults from "@/components/SimpleAnalysisResults";
 
export interface AnalysisData {
  candidateSummary: string;
  technicalSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  improvements: string[];
  recommendedJobs: string[];
  recommendedCompanies: string[];
  atsScore: number;
}
 
const borderStyles = `
  @property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }
 
  @keyframes border-spin {
    to { --angle: 360deg; }
  }
 
  .glow-border {
    position: relative;
    z-index: 0;
  }
 
  .glow-border::before {
    content: '';
    position: absolute;
    inset: -1.5px;
    border-radius: 18px;
    background: conic-gradient(
      from var(--angle),
      transparent 55%,
      #67e8f9 75%,
      #a5b4fc 85%,
      transparent
    );
    z-index: -1;
    animation: border-spin 6s linear infinite;
  }
 
  .glow-border::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: rgba(10, 10, 28, 0.82);
    z-index: -1;
  }
`;
 
const Index = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
 
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
 
  const saveAnalysis = async (analysisData: AnalysisData) => {
    if (!user) return;
 
    await supabase.from("analyses").insert([
      {
        user_id: user.id,
        resume_text: resumeText,
        job_description: jobDescription,
        analysis_data: JSON.parse(JSON.stringify(analysisData)),
        ats_score: analysisData.atsScore,
      },
    ] as any);
  };
 
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
 
    setLoading(true);
    setAnalysis(null);
 
    try {
      const prompt = `
Analyze resume and return JSON:
 
{
  "candidateSummary": "",
  "technicalSkills": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "improvements": [],
  "recommendedJobs": [],
  "recommendedCompanies": [],
  "atsScore": 0
}
 
Resume:
${resumeText}
 
Job:
${jobDescription}
`;
 
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
 
      const data = await response.json();
 
      if (data.error) throw new Error(data.error.message);
 
      let content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
 
      if (!content) throw new Error("No response");
 
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
 
      const parsed = JSON.parse(content);
 
      setAnalysis(parsed);
      await saveAnalysis(parsed);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <>
      {/* Inject border styles */}
      <style>{borderStyles}</style>
 
      <div className="relative min-h-screen flex items-center justify-center p-6">
        {/* 🌌 PARTICLE BACKGROUND */}
        <ParticlesBg />
 
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6 w-full max-w-7xl"
        >
          {/* LEFT PANEL */}
          <motion.div
            whileHover={{ rotateY: 5, scale: 1.02 }}
            className="glow-border backdrop-blur-xl p-6 rounded-2xl shadow-2xl transition duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-400" /> Resume Analyzer
              </h1>
              <button 
                onClick={() => navigate('/history')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm transition-colors border border-white/20"
              >
                <History className="h-4 w-4" /> History
              </button>
            </div>
 
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume..."
              className="w-full h-40 border rounded-lg p-3 mb-4 bg-white/80"
            />
 
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description..."
              className="w-full h-40 border rounded-lg p-3 mb-4 bg-white/80"
            />
 
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700"
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </motion.button>
          </motion.div>
 
          {/* RIGHT PANEL */}
          <motion.div
            whileHover={{ rotateY: -5, scale: 1.02 }}
            className="glow-border backdrop-blur-xl p-6 rounded-2xl shadow-2xl transition duration-300 overflow-y-auto max-h-[90vh]"
          >
            {!analysis ? (
              <div className="flex items-center justify-center h-full text-gray-300">
                Results will appear here
              </div>
            ) : (
              <SimpleAnalysisResults 
                analysis={analysis} 
                onReset={() => setAnalysis(null)} 
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};
 
export default Index;
 