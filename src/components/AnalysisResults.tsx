import {
  User, Code, Target, Search, BarChart3, ThumbsUp,
  AlertTriangle, Lightbulb, Edit3, Gavel
} from "lucide-react";
import type { AnalysisData } from "@/pages/Index";
import ScoreRing from "./ScoreRing";
import AnalysisSection from "./AnalysisSection";
import SkillBadge from "./SkillBadge";

const AnalysisResults = ({ data }: { data: AnalysisData }) => {
  return (
    <div className="space-y-6">
      {/* Scores Overview */}
      <div className="gradient-card rounded-xl border border-border p-6">
        <div className="flex flex-wrap items-center justify-center gap-10">
          <ScoreRing score={data.atsScore} label="ATS Score" />
          <ScoreRing score={data.keywordScore} label="Keyword Match" />
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              data.selectionProbability === "High" ? "text-success" :
              data.selectionProbability === "Medium" ? "text-warning" : "text-destructive"
            }`}>
              {data.selectionProbability}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Selection Chance</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Candidate Summary */}
        <AnalysisSection title="Candidate Profile" icon={<User className="h-4 w-4" />} delay={0.1}>
          <p>{data.candidateSummary}</p>
        </AnalysisSection>

        {/* 2. Key Info */}
        <AnalysisSection title="Skills & Tools" icon={<Code className="h-4 w-4" />} delay={0.15}>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Technical</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.technicalSkills.map((s) => <SkillBadge key={s} label={s} />)}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Soft Skills</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.softSkills.map((s) => <SkillBadge key={s} label={s} />)}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tools</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.tools.map((t) => <SkillBadge key={t} label={t} />)}
              </div>
            </div>
          </div>
        </AnalysisSection>

        {/* 3. ATS Analysis */}
        <AnalysisSection title="ATS Compatibility" icon={<Target className="h-4 w-4" />} delay={0.2}>
          <ul className="space-y-2">
            <li><span className="text-muted-foreground">Formatting:</span> {data.formattingScore}</li>
            <li><span className="text-muted-foreground">Sections:</span> {data.sectionCompleteness}</li>
          </ul>
        </AnalysisSection>

        {/* 4. Skill Match */}
        <AnalysisSection title="Skill Match Analysis" icon={<Target className="h-4 w-4" />} delay={0.25}>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-success uppercase tracking-wider">Matching</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.matchingSkills.map((s) => <SkillBadge key={s} label={s} variant="match" />)}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-destructive uppercase tracking-wider">Missing</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.missingSkills.map((s) => <SkillBadge key={s} label={s} variant="missing" />)}
              </div>
            </div>
            {data.partialSkills.length > 0 && (
              <div>
                <span className="text-xs font-medium text-warning uppercase tracking-wider">Partial</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {data.partialSkills.map((s) => <SkillBadge key={s} label={s} variant="partial" />)}
                </div>
              </div>
            )}
          </div>
        </AnalysisSection>

        {/* 5. Keywords */}
        <AnalysisSection title="Keyword Analysis" icon={<Search className="h-4 w-4" />} delay={0.3}>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Missing Keywords</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.missingKeywords.map((k) => <SkillBadge key={k} label={k} variant="missing" />)}
              </div>
            </div>
            <p className="text-muted-foreground">{data.keywordDensity}</p>
          </div>
        </AnalysisSection>

        {/* 6. Experience */}
        <AnalysisSection title="Experience Evaluation" icon={<BarChart3 className="h-4 w-4" />} delay={0.35}>
          <ul className="space-y-2">
            <li><span className="text-muted-foreground">Relevance:</span> {data.experienceRelevance}</li>
            <li><span className="text-muted-foreground">Projects:</span> {data.projectQuality}</li>
            <li><span className="text-muted-foreground">Metrics:</span> {data.metricsUsage}</li>
          </ul>
        </AnalysisSection>

        {/* 7. Strengths */}
        <AnalysisSection title="Strengths" icon={<ThumbsUp className="h-4 w-4" />} delay={0.4}>
          <ul className="space-y-1.5">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </AnalysisSection>

        {/* 8. Weaknesses */}
        <AnalysisSection title="Weaknesses & Gaps" icon={<AlertTriangle className="h-4 w-4" />} delay={0.45}>
          <ul className="space-y-1.5">
            {data.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </AnalysisSection>

        {/* 9. Recommendations */}
        <AnalysisSection title="Recommendations" icon={<Lightbulb className="h-4 w-4" />} delay={0.5}>
          <ul className="space-y-1.5">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </AnalysisSection>

        {/* 10. Bullet Improvements */}
        <AnalysisSection title="Bullet Point Enhancements" icon={<Edit3 className="h-4 w-4" />} delay={0.55}>
          <div className="space-y-4">
            {data.bulletImprovements.map((b, i) => (
              <div key={i} className="space-y-2">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <span className="text-xs text-destructive font-medium">Before</span>
                  <p className="mt-1">{b.original}</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <span className="text-xs text-success font-medium">After</span>
                  <p className="mt-1">{b.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </AnalysisSection>
      </div>

      {/* 11. Final Verdict */}
      <div className="gradient-card rounded-xl border border-border p-6 glow-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
            <Gavel className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Final Verdict</h3>
        </div>
        <p className="text-secondary-foreground mb-4">{data.verdictReasoning}</p>
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Actions</span>
          <ol className="mt-2 space-y-1.5">
            {data.topActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
                <span className="font-bold text-primary">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
