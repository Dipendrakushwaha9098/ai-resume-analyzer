import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Trash2, Eye, ArrowLeft, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AnalysisData } from "@/pages/Index";
import SimpleAnalysisResults from "@/components/SimpleAnalysisResults";

interface AnalysisRecord {
  id: string;
  resume_text: string;
  job_description: string;
  target_role: string | null;
  experience_level: string | null;
  industry: string | null;
  analysis_data: AnalysisData;
  ats_score: number | null;
  created_at: string;
}

const History = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAnalyses(data as unknown as AnalysisRecord[]);
    }
    setLoading(false);
  };

  const deleteAnalysis = async (id: string) => {
    await supabase.from("analyses").delete().eq("id", id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
  };

  if (selectedAnalysis) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedAnalysis(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to History
            </Button>
            <span className="text-sm text-muted-foreground">
              {new Date(selectedAnalysis.created_at).toLocaleDateString()}
              {selectedAnalysis.target_role && ` • ${selectedAnalysis.target_role}`}
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-[#111827] backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10">
            <SimpleAnalysisResults analysis={selectedAnalysis.analysis_data} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Resume History</h1>
              <p className="text-xs text-muted-foreground">Your past analyses</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <FileText className="h-4 w-4 mr-1" /> New Analysis
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No analyses yet</h3>
            <p className="text-muted-foreground mb-6">Run your first resume analysis to see it here.</p>
            <Button onClick={() => navigate("/")} className="gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4 mr-2" /> Analyze Resume
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis, i) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {analysis.target_role || "Resume Analysis"}
                      </h3>
                      {analysis.ats_score && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          analysis.ats_score >= 75 ? "bg-success/10 text-success" :
                          analysis.ats_score >= 50 ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          ATS: {analysis.ats_score}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                      {analysis.industry && ` • ${analysis.industry}`}
                      {analysis.experience_level && ` • ${analysis.experience_level}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedAnalysis(analysis)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAnalysis(analysis.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
