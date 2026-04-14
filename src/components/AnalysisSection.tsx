import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnalysisSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}

const AnalysisSection = ({ title, icon, children, delay = 0 }: AnalysisSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="gradient-card rounded-xl border border-border p-6"
  >
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
    <div className="text-sm leading-relaxed text-secondary-foreground">{children}</div>
  </motion.div>
);

export default AnalysisSection;
