import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import type { StockHistory } from '../../api/stocks';

interface StockChartProps {
  data: StockHistory[];
  height?: number;
}

export default function StockChart({ data, height = 400 }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#2d314820' },
        horzLines: { color: '#2d314820' },
      },
      crosshair: {
        vertLine: { color: '#3b82f680', width: 1, style: 2 },
        horzLine: { color: '#3b82f680', width: 1, style: 2 },
      },
      timeScale: {
        borderColor: '#2d3148',
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2d3148',
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    const chartData = data.map((d) => ({
      time: d.date as string,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(chartData as any);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3b82f640',
      priceFormat: { type: 'volume' as const },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const volumeData = data.map((d) => ({
      time: d.date as string,
      value: d.volume,
      color: d.close >= d.open ? '#10b98140' : '#ef444440',
    }));

    volumeSeries.setData(volumeData as any);

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, height]);

  return <div ref={containerRef} className="w-full" />;
}
