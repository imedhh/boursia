import { Newspaper, Clock } from 'lucide-react';

const mockNews = [
  {
    id: 1,
    title: 'LVMH dépasse les attentes au T4, le luxe résiste',
    source: 'Les Echos',
    time: 'Il y a 2h',
    tag: 'Luxe',
  },
  {
    id: 2,
    title: 'TotalEnergies annonce un programme de rachat d\'actions de 2 Mds EUR',
    source: 'BFM Bourse',
    time: 'Il y a 3h',
    tag: 'Énergie',
  },
  {
    id: 3,
    title: 'La BCE maintient ses taux : impact sur les valeurs bancaires',
    source: 'Reuters',
    time: 'Il y a 5h',
    tag: 'Macro',
  },
  {
    id: 4,
    title: 'Safran relève ses prévisions annuelles grâce à la maintenance aéronautique',
    source: 'Boursorama',
    time: 'Il y a 6h',
    tag: 'Aéronautique',
  },
];

export default function NewsWidget() {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-secondary text-sm font-medium">Actualités financières</h3>
        <Newspaper size={18} className="text-accent" />
      </div>
      <div className="space-y-3">
        {mockNews.map((news) => (
          <div
            key={news.id}
            className="p-3 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <p className="text-sm text-text-primary font-medium leading-snug mb-1.5">{news.title}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-accent font-medium">{news.tag}</span>
              <span className="text-xs text-text-secondary">{news.source}</span>
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock size={10} />
                {news.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
