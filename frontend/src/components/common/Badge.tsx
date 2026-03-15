interface BadgeProps {
  label: 'Acheter' | 'Conserver' | 'Vendre';
}

const badgeColors = {
  Acheter: 'bg-positive/15 text-positive border-positive/30',
  Conserver: 'bg-warning/15 text-warning border-warning/30',
  Vendre: 'bg-negative/15 text-negative border-negative/30',
};

export default function Badge({ label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColors[label]}`}>
      {label}
    </span>
  );
}
