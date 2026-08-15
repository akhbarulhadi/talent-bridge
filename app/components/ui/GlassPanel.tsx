interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hr";
}

export default function GlassPanel({
  children,
  className = "",
  variant = "default",
}: GlassPanelProps) {
  const baseClass = variant === "hr" ? "glass-panel-hr" : "glass-panel";
  return <div className={`${baseClass} ${className}`}>{children}</div>;
}
