interface CircularProgressProps {
  percentage: number;
  colorClass?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export default function CircularProgress({
  percentage,
  colorClass = "text-tertiary",
  size = 56,
  strokeWidth = 3,
  children,
}: CircularProgressProps) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox="0 0 36 36">
        {/* Background Circle */}
        <path
          className="text-surface-container-highest stroke-current"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <path
          className={`${colorClass} stroke-current progress-ring__circle`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeDasharray={`${percentage}, 100`}
          strokeWidth={strokeWidth}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
