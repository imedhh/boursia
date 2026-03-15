import { useParams } from 'react-router-dom';
import StockDetail from '../components/stocks/StockDetail';

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();

  if (!ticker) return <p className="text-text-secondary">Action introuvable</p>;

  return <StockDetail ticker={ticker} />;
}
