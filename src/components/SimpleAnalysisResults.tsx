import { motion } from "framer-motion";
import type { AnalysisData } from "@/pages/Index";

interface SimpleAnalysisResultsProps {
  analysis: AnalysisData;
  onReset?: () => void;
}

const SimpleAnalysisResults = ({ analysis, onReset }: SimpleAnalysisResultsProps) => {
  return (
    <>
      {/* ATS SCORE */}
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <h2 className="text-xl font-bold text-white mb-2">ATS Score</h2>
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className="bg-green-400 h-4 rounded-full transition-all duration-700"
            style={{ width: `${analysis.atsScore}%` }}
          />
        </div>
        <p className="mt-2 text-white">{analysis.atsScore}% Match</p>
      </motion.div>

      {/* SUMMARY */}
      <div className="bg-indigo-200/30 p-4 rounded-lg mt-4">
        <h3 className="font-bold text-white">Summary</h3>
        <p className="text-white mt-1">{analysis.candidateSummary}</p>
      </div>

      {/* SKILLS */}
      <div className="mt-4">
        <h3 className="font-bold text-white">Skills</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {analysis.technicalSkills?.map((s, i) => (
            <span
              key={i}
              className="bg-white/30 px-3 py-1 rounded-full text-sm text-white"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* STRENGTHS & WEAKNESSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-green-200/30 p-4 rounded-lg">
          <h3 className="font-bold text-white">Strengths</h3>
          <div className="mt-2 space-y-1">
            {analysis.strengths?.map((s, i) => (
              <p key={i} className="text-white text-sm">
                ✔ {s}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-red-200/30 p-4 rounded-lg">
          <h3 className="font-bold text-white">Weaknesses</h3>
          <div className="mt-2 space-y-1">
            {analysis.weaknesses?.map((w, i) => (
              <p key={i} className="text-white text-sm">
                ✖ {w}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* IMPROVEMENTS */}
      {analysis.improvements && analysis.improvements.length > 0 && (
        <div className="bg-blue-200/30 p-4 rounded-lg mt-4">
          <h3 className="font-bold text-white">Areas to Improve</h3>
          <div className="mt-2 space-y-1">
            {analysis.improvements.map((imp, i) => (
              <p key={i} className="text-white text-sm">
                📈 {imp}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-yellow-200/30 p-4 rounded-lg mt-4">
          <h3 className="font-bold text-white">Recommendations</h3>
          <div className="mt-2 space-y-1">
            {analysis.recommendations.map((r, i) => (
              <p key={i} className="text-white text-sm">
                👉 {r}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDED JOBS & COMPANIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {analysis.recommendedJobs && analysis.recommendedJobs.length > 0 && (
          <div className="bg-purple-200/30 p-4 rounded-lg">
            <h3 className="font-bold text-white">Recommended Roles</h3>
            <div className="mt-2 space-y-1">
              {analysis.recommendedJobs.map((job, i) => (
                <p key={i} className="text-white text-sm">
                  💼 {job}
                </p>
              ))}
            </div>
          </div>
        )}

        {analysis.recommendedCompanies && analysis.recommendedCompanies.length > 0 && (
          <div className="bg-pink-200/30 p-4 rounded-lg">
            <h3 className="font-bold text-white">Target Companies</h3>
            <div className="mt-2 space-y-1">
              {analysis.recommendedCompanies.map((comp, i) => (
                <p key={i} className="text-white text-sm">
                  🏢 {comp}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {onReset && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onReset}
          className="w-full bg-gray-800 text-white py-3 rounded-lg mt-6 hover:bg-gray-700 font-semibold shadow-lg"
        >
          New Analysis
        </motion.button>
      )}
    </>
  );
};

export default SimpleAnalysisResults;
