import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  label: string;
  variant?: "match" | "missing" | "partial";
}

const SkillBadge = ({ label, variant = "match" }: SkillBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      variant === "match" && "bg-success/15 text-success",
      variant === "missing" && "bg-destructive/15 text-destructive",
      variant === "partial" && "bg-warning/15 text-warning"
    )}
  >
    {label}
  </span>
);

export default SkillBadge;
