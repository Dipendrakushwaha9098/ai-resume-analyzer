import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { History, Sparkles, Plus, Upload, Loader2 } from "lucide-react";
import ParticlesBg from "@/components/ParticlesBg";
import SimpleAnalysisResults from "@/components/SimpleAnalysisResults";
import { extractTextFromPDF } from "@/lib/pdfUtils";
import { useRef } from "react";
 
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);

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
 
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setExtracting(true);
    try {
      const text = await extractTextFromPDF(file);
      setResumeText(text);
      toast({
        title: "Success",
        description: "Resume text extracted successfully!",
      });
    } catch (err: any) {
      toast({
        title: "Extraction Error",
        description: "Failed to extract text from PDF. Please try pasting manually.",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Input required",
        description: "Please provide both resume text and job description.",
        variant: "destructive",
      });
      return;
    }

    // Guard: missing or placeholder API key
    if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE" || API_KEY.trim() === "") {
      toast({
        title: "API Key Missing",
        description: "Add your Gemini API key to the .env file as VITE_GEMINI_API_KEY, then restart the dev server.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const prompt = `
You are an expert resume analyst. Analyze the resume below against the provided job description and return ONLY valid JSON — no extra text, no markdown code fences.

JSON structure to return:
{
  "candidateSummary": "string — 2-3 sentence professional summary of the candidate",
  "technicalSkills": ["list of identified technical skills"],
  "strengths": ["list of resume strengths relevant to the job"],
  "weaknesses": ["list of gaps or weaknesses relative to the job"],
  "recommendations": ["actionable recommendations to improve candidacy"],
  "improvements": ["specific resume writing improvements"],
  "recommendedJobs": ["list of job titles this candidate is suited for"],
  "recommendedCompanies": ["list of company types or names that would be a good fit"],
  "atsScore": number between 0 and 100 representing ATS compatibility
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

      let response: Response;
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, topP: 0.9 },
            }),
          }
        );
      } catch (networkErr: any) {
        throw new Error("Network error — check your internet connection and try again.");
      }

      // Handle HTTP-level errors with specific messages
      if (!response.ok) {
        if (response.status === 400) throw new Error("Bad request — the API key may be malformed. Please check your .env file.");
        if (response.status === 401 || response.status === 403) throw new Error("Invalid or unauthorized API key. Go to https://aistudio.google.com/app/apikey to get a valid key.");
        if (response.status === 429) throw new Error("Gemini API quota exceeded. Wait a moment and try again, or check your usage limits.");
        if (response.status >= 500) throw new Error(`Gemini server error (${response.status}). Please try again in a few seconds.`);
        throw new Error(`Unexpected API error: HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        const code = data.error.code;
        if (code === 400) throw new Error("API key is invalid or malformed. Please check VITE_GEMINI_API_KEY in .env.");
        if (code === 403) throw new Error("API key doesn't have access to Gemini. Ensure the Generative Language API is enabled.");
        throw new Error(data.error.message || "Unknown API error");
      }

      let content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        const finishReason = data?.candidates?.[0]?.finishReason;
        if (finishReason === "SAFETY") throw new Error("Response blocked by Gemini safety filters. Try rephrasing your input.");
        throw new Error("Gemini returned an empty response. Please try again.");
      }

      // Strip any markdown fences the model may add
      content = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

      let parsed: AnalysisData;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("Could not parse the AI response as JSON. The model may have returned unexpected text. Please try again.");
      }

      // Ensure required fields exist
      const required: (keyof AnalysisData)[] = ["candidateSummary", "technicalSkills", "strengths", "weaknesses", "recommendations", "improvements", "recommendedJobs", "recommendedCompanies", "atsScore"];
      for (const field of required) {
        if (!(field in parsed)) {
          (parsed as any)[field] = field === "atsScore" ? 0 : Array.isArray((parsed as any)[field]) ? [] : "";
        }
      }

      setAnalysis(parsed);
      await saveAnalysis(parsed);

      toast({
        title: "Analysis Complete ✨",
        description: `ATS Score: ${parsed.atsScore}/100`,
      });
    } catch (err: any) {
      toast({
        title: "Analysis Failed",
        description: err.message || "An unexpected error occurred. Please try again.",
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
 
            <div className="relative mb-4">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste resume or upload PDF..."
                className="w-full h-40 border rounded-lg p-3 bg-white/80 pr-12"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={extracting}
                className="absolute top-3 right-3 p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors shadow-sm disabled:opacity-50"
                title="Upload PDF"
              >
                {extracting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
 
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
 