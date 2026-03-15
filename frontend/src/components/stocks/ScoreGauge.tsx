interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 140 }: ScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = radius * Math.PI; // semi-circle
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#3b82f6';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Bon';
    if (s >= 40) return 'Moyen';
    return 'Faible';
  };

  const color = getColor(score);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M ${8} ${center} A ${radius} ${radius} 0 0 1 ${size - 8} ${center}`}
          fill="none"
          stroke="#2d3148"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${8} ${center} A ${radius} ${radius} 0 0 1 ${size - 8} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          fill={color}
          fontSize="28"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {score}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="12"
        >
          {getLabel(score)}
        </text>
      </svg>
      <p className="text-xs text-text-secondary mt-1">Score IA / 100</p>
    </div>
  );
}
