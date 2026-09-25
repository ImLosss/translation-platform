'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getUsageStatsAction,
  UsagePoint,
} from '@/app/actions/profile/getUsageStatsAction';
import { useLanguage } from '../client/LanguageProvider';
import { interpolate } from '@/app/lib/i18n/format';

type Metric = 'translations' | 'cost' | 'tokens';

interface MetricConfig {
  key: Metric;
  labelKey: 'metricTranslations' | 'metricCost' | 'metricTokens';
  shortKey: 'shortTranslations' | 'shortCost' | 'shortTokens';
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const METRICS: Record<Metric, MetricConfig> = {
  translations: {
    key: 'translations',
    labelKey: 'metricTranslations',
    shortKey: 'shortTranslations',
    color: '#6c5ce7',
    gradientFrom: 'rgba(108, 92, 231, 0.85)',
    gradientTo: 'rgba(108, 92, 231, 0.15)',
  },
  cost: {
    key: 'cost',
    labelKey: 'metricCost',
    shortKey: 'shortCost',
    color: '#00b894',
    gradientFrom: 'rgba(0, 184, 148, 0.85)',
    gradientTo: 'rgba(0, 184, 148, 0.15)',
  },
  tokens: {
    key: 'tokens',
    labelKey: 'metricTokens',
    shortKey: 'shortTokens',
    color: '#4a9eff',
    gradientFrom: 'rgba(74, 158, 255, 0.85)',
    gradientTo: 'rgba(74, 158, 255, 0.15)',
  },
};

const RANGES = [7, 30, 90];

/** Membulatkan nilai maksimum ke angka "cantik" untuk skala sumbu Y. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = Math.pow(10, exponent);
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function formatCompact(value: number, locale: string): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString(locale);
}

export default function UsageChart() {
  const { t, intlLocale } = useLanguage();
  const [range, setRange] = useState<number>(30);
  const [metric, setMetric] = useState<Metric>('translations');
  const [points, setPoints] = useState<UsagePoint[]>([]);
  const [summary, setSummary] = useState({ translations: 0, cost: 0, tokens: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  // Pantau lebar container agar chart tetap responsif
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });

    observer.observe(el);
    setWidth(el.clientWidth);

    return () => observer.disconnect();
  }, []);

  const load = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);

    const result = await getUsageStatsAction(days);

    if (result.success && result.response) {
      setPoints(result.response.data);
      setSummary(result.response.summary);
    } else {
      setError(result.message || t.dashboard.errorLoad);
      setPoints([]);
    }

    setLoading(false);
  }, [t]);

  useEffect(() => {
    load(range);
  }, [range, load]);

  const config = METRICS[metric];

  const formatValue = useCallback(
    (value: number) => {
      if (metric === 'cost') {
        return `IDR ${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
      return value.toLocaleString(intlLocale);
    },
    [metric, intlLocale]
  );

  const chart = useMemo(() => {
    const height = width < 520 ? 220 : 280;
    const padding = {
      top: 18,
      right: 14,
      bottom: 34,
      left: width < 520 ? 40 : 52,
    };

    const plotWidth = Math.max(width - padding.left - padding.right, 10);
    const plotHeight = Math.max(height - padding.top - padding.bottom, 10);

    const values = points.map((p) => p[metric] as number);
    const rawMax = Math.max(...values, 0);
    const max = niceMax(rawMax);

    const slot = plotWidth / Math.max(points.length, 1);
    const barWidth = Math.max(Math.min(slot * 0.62, 34), 2);

    const bars = points.map((point, index) => {
      const value = point[metric] as number;
      const barHeight = max > 0 ? (value / max) * plotHeight : 0;
      const x = padding.left + slot * index + (slot - barWidth) / 2;
      const y = padding.top + plotHeight - barHeight;

      return {
        point,
        value,
        x,
        y,
        width: barWidth,
        height: Math.max(barHeight, value > 0 ? 2 : 0),
        centerX: padding.left + slot * index + slot / 2,
      };
    });

    // Sumbu Y: 4 garis grid
    const gridLines = Array.from({ length: 5 }, (_, i) => {
      const ratio = i / 4;
      return {
        value: max * (1 - ratio),
        y: padding.top + plotHeight * ratio,
      };
    });

    // Label sumbu X: batasi jumlah label agar tidak bertumpuk
    const maxLabels = width < 520 ? 4 : width < 820 ? 6 : 10;
    const labelStep = Math.max(Math.ceil(points.length / maxLabels), 1);

    return {
      height,
      padding,
      plotWidth,
      plotHeight,
      max,
      bars,
      gridLines,
      labelStep,
    };
  }, [points, metric, width]);

  const activeBar = hoverIndex !== null ? chart.bars[hoverIndex] : null;

  return (
    <section className="card usage-card">
      <div className="card-header usage-header">
        <div>
          <h2>{t.dashboard.usageOverview}</h2>
          <p className="usage-subtitle">
            {interpolate(t.dashboard.usageSubtitle, { days: range })}
          </p>
        </div>

        <div className="usage-controls">
          <div className="usage-metrics" role="tablist" aria-label={t.dashboard.selectMetric}>
            {(Object.keys(METRICS) as Metric[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={metric === key}
                className={`usage-metric-btn${metric === key ? ' active' : ''}`}
                onClick={() => setMetric(key)}
              >
                <span
                  className="usage-dot"
                  style={{ background: METRICS[key].color }}
                />
                {t.dashboard[METRICS[key].labelKey]}
              </button>
            ))}
          </div>

          <div className="usage-ranges" role="group" aria-label={t.dashboard.selectRange}>
            {RANGES.map((days) => (
              <button
                key={days}
                type="button"
                className={`usage-range-btn${range === days ? ' active' : ''}`}
                onClick={() => setRange(days)}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="usage-summary">
        <div className="usage-summary-item">
          <span className="usage-summary-label">{t.dashboard.totalTranslations}</span>
          <span className="usage-summary-value">
            {summary.translations.toLocaleString(intlLocale)}
          </span>
        </div>
        <div className="usage-summary-item">
          <span className="usage-summary-label">{t.dashboard.totalCost}</span>
          <span className="usage-summary-value">
            IDR {summary.cost.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="usage-summary-item">
          <span className="usage-summary-label">{t.dashboard.totalTokens}</span>
          <span className="usage-summary-value">
            {formatCompact(summary.tokens, intlLocale)}
          </span>
        </div>
      </div>

      <div className="usage-chart-wrapper" ref={containerRef}>
        {loading && (
          <div className="usage-state">
            <div className="spinner" />
            <p className="loading-text">{t.dashboard.loading}</p>
          </div>
        )}

        {!loading && error && (
          <div className="usage-state">
            <i className="fas fa-exclamation-triangle" />
            <p className="loading-text">{error}</p>
          </div>
        )}

        {!loading && !error && points.length === 0 && (
          <div className="usage-state">
            <i className="fas fa-chart-bar" />
            <p className="loading-text">{t.dashboard.empty}</p>
          </div>
        )}

        {!loading && !error && points.length > 0 && (
          <>
            <svg
              width={width}
              height={chart.height}
              role="img"
              aria-label={interpolate(t.dashboard.chartAria, { metric: t.dashboard[config.labelKey], days: range })}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient
                  id={`usage-grad-${metric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={config.gradientFrom} />
                  <stop offset="100%" stopColor={config.gradientTo} />
                </linearGradient>
              </defs>

              {/* Grid + label sumbu Y */}
              {chart.gridLines.map((line, i) => (
                <g key={i}>
                  <line
                    x1={chart.padding.left}
                    y1={line.y}
                    x2={chart.padding.left + chart.plotWidth}
                    y2={line.y}
                    stroke="var(--border-color)"
                    strokeWidth={1}
                    strokeDasharray={i === 4 ? '0' : '4 6'}
                  />
                  <text
                    x={chart.padding.left - 10}
                    y={line.y + 4}
                    textAnchor="end"
                    className="usage-axis-text"
                  >
                    {metric === 'cost'
                      ? `${line.value.toFixed(line.value >= 10 ? 0 : 2)}`
                      : formatCompact(line.value, intlLocale)}
                  </text>
                </g>
              ))}

              {/* Bar */}
              {chart.bars.map((bar, index) => (
                <g key={bar.point.date}>
                  {/* Area hover transparan agar mudah di-hover */}
                  <rect
                    x={bar.centerX - (chart.plotWidth / points.length) / 2}
                    y={chart.padding.top}
                    width={chart.plotWidth / points.length}
                    height={chart.plotHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(index)}
                  />
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx={Math.min(bar.width / 2, 5)}
                    fill={`url(#usage-grad-${metric})`}
                    stroke={config.color}
                    strokeWidth={hoverIndex === index ? 1.5 : 0}
                    className="usage-bar"
                    style={{
                      opacity:
                        hoverIndex === null || hoverIndex === index ? 1 : 0.45,
                    }}
                  />
                </g>
              ))}

              {/* Label sumbu X */}
              {chart.bars.map((bar, index) =>
                index % chart.labelStep === 0 ? (
                  <text
                    key={`label-${bar.point.date}`}
                    x={bar.centerX}
                    y={chart.height - 12}
                    textAnchor="middle"
                    className="usage-axis-text"
                  >
                    {bar.point.label}
                  </text>
                ) : null
              )}
            </svg>

            {activeBar && (
              <div
                className="usage-tooltip"
                style={{
                  left: `${Math.min(
                    Math.max(activeBar.centerX, 70),
                    Math.max(width - 70, 70)
                  )}px`,
                  top: `${Math.max(activeBar.y - 12, 8)}px`,
                }}
              >
                <span className="usage-tooltip-date">
                  {activeBar.point.fullLabel}
                </span>
                <span className="usage-tooltip-value">
                  <span
                    className="usage-dot"
                    style={{ background: config.color }}
                  />
                  {formatValue(activeBar.value)}
                </span>
                {metric !== 'translations' && (
                  <span className="usage-tooltip-meta">
                    {interpolate(t.dashboard.translationsCount, { count: activeBar.point.translations })}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
