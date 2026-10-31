import "./AnalyticsCard.css";

const CHART_W = 500;
const CHART_H = 220;
const PAD_L = 42;
const PAD_R = 25;
const PAD_T = 28;
const PAD_B = 34;

const DONUT_PALETTE = ["#2e7d32", "#43a047", "#66bb6a", "#81c784", "#26a69a", "#ffa726", "#42a5f5"];

function LineChart({ data = [], unit = "" }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="analytics-chart--empty">
        <p>No trend points recorded in this period.</p>
        <span>Data will populate automatically as activity occurs.</span>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const plotW = CHART_W - PAD_L - PAD_R;
  const plotH = CHART_H - PAD_T - PAD_B;

  const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW / 2;
  const points = data.map((d, i) => {
    const val = Number(d.value) || 0;
    const x = data.length > 1 ? PAD_L + i * stepX : PAD_L + plotW / 2;
    const y = PAD_T + plotH - (val / maxVal) * plotH;
    return { x, y, label: d.label || `Day ${i + 1}`, val };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${PAD_T + plotH} L ${points[0].x.toFixed(1)} ${PAD_T + plotH} Z`;

  const yTicks = [
    { label: maxVal.toString(), y: PAD_T },
    { label: Math.round(maxVal / 2).toString(), y: PAD_T + plotH / 2 },
    { label: "0", y: PAD_T + plotH },
  ];

  return (
    <div className="analytics-chart-container">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="analytics-chart" role="img" aria-label="Line chart">
        <defs>
          <linearGradient id="chartEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={tick.y} x2={CHART_W - PAD_R} y2={tick.y} stroke="rgba(46, 125, 50, 0.12)" strokeDasharray="3 3" />
            <text x={PAD_L - 8} y={tick.y + 4} fontSize="11" fill="#7d8c7e" textAnchor="end" fontFamily="inherit" fontWeight="500">
              {tick.label}
            </text>
          </g>
        ))}

        {/* Shaded Area */}
        <path d={areaD} fill="url(#chartEmeraldGrad)" />

        {/* Trend Line */}
        <path d={pathD} fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points & Value Badges */}
        {points.map((p, i) => (
          <g key={i} className="analytics-point-group">
            <circle cx={p.x} cy={p.y} r="5" fill="#2e7d32" stroke="#ffffff" strokeWidth="2.5" />
            <text x={p.x} y={Math.max(p.y - 9, PAD_T - 6)} fontSize="11" fontWeight="700" fill="#1b3a1d" textAnchor="middle" fontFamily="inherit">
              {p.val}{unit ? ` ${unit}` : ""}
            </text>
            <text x={p.x} y={CHART_H - 10} fontSize="11" fill="#5b6b5c" textAnchor="middle" fontFamily="inherit" fontWeight="500">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BarChart({ data = [], unit = "" }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="analytics-chart--empty">
        <p>No distribution metrics recorded in this period.</p>
        <span>Data will populate automatically as activity occurs.</span>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const plotW = CHART_W - PAD_L - PAD_R;
  const plotH = CHART_H - PAD_T - PAD_B;

  const barSlotW = plotW / data.length;
  const barW = Math.min(Math.max(barSlotW - 16, 16), 46);

  const yTicks = [
    { label: maxVal.toString(), y: PAD_T },
    { label: Math.round(maxVal / 2).toString(), y: PAD_T + plotH / 2 },
    { label: "0", y: PAD_T + plotH },
  ];

  return (
    <div className="analytics-chart-container">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="analytics-chart" role="img" aria-label="Bar chart">
        <defs>
          <linearGradient id="chartBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e7d32" stopOpacity="1" />
            <stop offset="100%" stopColor="#66bb6a" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={tick.y} x2={CHART_W - PAD_R} y2={tick.y} stroke="rgba(46, 125, 50, 0.12)" strokeDasharray="3 3" />
            <text x={PAD_L - 8} y={tick.y + 4} fontSize="11" fill="#7d8c7e" textAnchor="end" fontFamily="inherit" fontWeight="500">
              {tick.label}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const val = Number(d.value) || 0;
          const h = Math.max((val / maxVal) * plotH, val > 0 ? 5 : 0);
          const x = PAD_L + i * barSlotW + (barSlotW - barW) / 2;
          const y = PAD_T + plotH - h;

          return (
            <g key={d.label || i} className="analytics-bar-group">
              <rect x={x} y={y} width={barW} height={h} rx="5" fill="url(#chartBarGrad)" className="analytics-bar" />
              <text x={x + barW / 2} y={Math.max(y - 6, PAD_T - 6)} fontSize="11" fontWeight="700" fill="#1b3a1d" textAnchor="middle" fontFamily="inherit">
                {val}{unit ? ` ${unit}` : ""}
              </text>
              <text x={x + barW / 2} y={CHART_H - 10} fontSize="11" fill="#5b6b5c" textAnchor="middle" fontFamily="inherit" fontWeight="500">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DonutChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="analytics-chart--empty">
        <p>No category breakdown recorded yet.</p>
        <span>Data will populate dynamically from live donations.</span>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 1;
  const radius = 58;
  const strokeW = 16;
  const cx = 85;
  const cy = 85;

  let cumulativeAngle = 0;
  const segments = data.map((d, i) => {
    const val = Number(d.value) || 0;
    const fraction = val / total;
    const startAngle = cumulativeAngle * 2 * Math.PI;
    cumulativeAngle += fraction;
    const endAngle = cumulativeAngle * 2 * Math.PI;

    const rOuter = radius;
    const rInner = radius - strokeW;

    const x1 = cx + rOuter * Math.sin(startAngle);
    const y1 = cy - rOuter * Math.cos(startAngle);
    const x2 = cx + rOuter * Math.sin(endAngle);
    const y2 = cy - rOuter * Math.cos(endAngle);

    const x3 = cx + rInner * Math.sin(endAngle);
    const y3 = cy - rInner * Math.cos(endAngle);
    const x4 = cx + rInner * Math.sin(startAngle);
    const y4 = cy - rInner * Math.cos(startAngle);

    const largeArc = fraction > 0.5 ? 1 : 0;
    const pathD =
      fraction >= 0.999
        ? `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 1 1 ${cx - 0.01} ${cy - rOuter} M ${cx} ${cy - rInner} A ${rInner} ${rInner} 0 1 0 ${cx - 0.01} ${cy - rInner} Z`
        : `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    const pct = Math.round(fraction * 100);
    const color = DONUT_PALETTE[i % DONUT_PALETTE.length];

    return { pathD, color, label: d.label, val, pct };
  });

  return (
    <div className="analytics-donut-wrap">
      <div className="analytics-donut-chart-box">
        <svg viewBox="0 0 170 170" className="analytics-chart analytics-chart--donut" role="img" aria-label="Donut chart">
          {segments.map((seg, i) => (
            <path key={i} d={seg.pathD} fill={seg.color} stroke="#ffffff" strokeWidth="1.5" />
          ))}
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="19" fontWeight="700" fill="#1b3a1d" fontFamily="inherit">
            {total}
          </text>
          <text x={cx} y={cy + 15} textAnchor="middle" fontSize="10" fontWeight="600" fill="#7d8c7e" fontFamily="inherit" letterSpacing="0.04em">
            DONATIONS
          </text>
        </svg>
      </div>

      <div className="analytics-donut__legend-wrap">
        <ul className="analytics-donut__legend">
          {segments.map((seg, i) => (
            <li key={i} className="analytics-donut__item">
              <span className="analytics-donut__swatch" style={{ background: seg.color }} />
              <span className="analytics-donut__item-name">{seg.label}</span>
              <span className="analytics-donut__item-pct">{seg.pct}%</span>
              <span className="analytics-donut__item-val">({seg.val})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProgressMeter({ rate = 0, completed = 0, scheduled = 0 }) {
  const cleanRate = Math.min(Math.max(Number(rate) || 0, 0), 100);
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c - (cleanRate / 100) * c;

  return (
    <div className="analytics-progress-card">
      <div className="analytics-progress-gauge">
        <svg viewBox="0 0 120 120" className="analytics-progress-svg">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#eef6ee" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#2e7d32"
            strokeWidth="12"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          <text x="60" y="65" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1b3a1d" fontFamily="inherit">
            {cleanRate}%
          </text>
        </svg>
      </div>
      <div className="analytics-progress-meta">
        <div className="analytics-progress-stat">
          <span className="analytics-progress-stat__val">{completed}</span>
          <span className="analytics-progress-stat__label">Pickups Completed</span>
        </div>
        <div className="analytics-progress-stat">
          <span className="analytics-progress-stat__val">{scheduled}</span>
          <span className="analytics-progress-stat__label">Pickups Scheduled</span>
        </div>
        <div className="analytics-progress-badge">
          {cleanRate >= 80 ? "High Fulfillment" : cleanRate >= 50 ? "Healthy Operations" : "In Progress"}
        </div>
      </div>
    </div>
  );
}

/**
 * AnalyticsCard
 * Card used across the Analytics view with enhanced legible SVGs and clear metrics.
 */
const AnalyticsCard = ({ title, description, trend, value, chart, unit, progress }) => {
  return (
    <div className="analytics-card">
      <div className="analytics-card__header">
        <div>
          <h3>{title}</h3>
          {description && <p className="analytics-card__description">{description}</p>}
        </div>
        {trend && <span className="analytics-card__trend">{trend}</span>}
      </div>

      {value && <div className="analytics-card__value">{value}</div>}

      {chart?.type === "line" && <LineChart data={chart.data} unit={unit} />}
      {chart?.type === "bar" && <BarChart data={chart.data} unit={unit} />}
      {chart?.type === "donut" && <DonutChart data={chart.data} />}
      {progress && <ProgressMeter rate={progress.rate} completed={progress.completed} scheduled={progress.scheduled} />}
    </div>
  );
};

export default AnalyticsCard;
