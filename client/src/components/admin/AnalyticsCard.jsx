import "./AnalyticsCard.css";

const CHART_W = 280;
const CHART_H = 140;
const PADDING = 8;
const DONUT_COLORS = ["#2e7d32", "#66bb6a", "#a5d6a7", "#ffb74d", "#4fc3f7", "#ce93d8"];

function LineChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="analytics-chart--empty" style={{ padding: "32px 0", textAlign: "center", color: "#8a978a", fontSize: "0.85rem" }}>
        No trend data recorded yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const stepX = (CHART_W - PADDING * 2) / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = PADDING + i * stepX;
    const y = CHART_H - PADDING - ((d.value || 0) / max) * (CHART_H - PADDING * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="analytics-chart" role="img" aria-label="Line chart">
      <polyline points={points.join(" ")} fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const [x, y] = p.split(",");
        return <circle key={i} cx={x} cy={y} r="3" fill="#2e7d32" />;
      })}
      {data.map((d, i) => (
        <text key={d.label || i} x={PADDING + i * stepX} y={CHART_H - 2} fontSize="8" fill="#8a978a" textAnchor="middle">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

function BarChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="analytics-chart--empty" style={{ padding: "32px 0", textAlign: "center", color: "#8a978a", fontSize: "0.85rem" }}>
        No bar distribution data recorded yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const barW = Math.max((CHART_W - PADDING * 2) / data.length - 8, 4);

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="analytics-chart" role="img" aria-label="Bar chart">
      {data.map((d, i) => {
        const h = Math.max(((d.value || 0) / max) * (CHART_H - PADDING * 2 - 12), 2);
        const x = PADDING + i * ((CHART_W - PADDING * 2) / data.length) + 4;
        const y = CHART_H - PADDING - 12 - h;
        return (
          <g key={d.label || i}>
            <rect x={x} y={y} width={barW} height={h} rx="3" fill="#66bb6a" />
            <text x={x + barW / 2} y={CHART_H - 2} fontSize="8" fill="#8a978a" textAnchor="middle">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="analytics-chart--empty" style={{ padding: "32px 0", textAlign: "center", color: "#8a978a", fontSize: "0.85rem" }}>
        No category data recorded yet.
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
  const radius = 42;
  const cx = 60;
  const cy = 60;
  let cumulative = 0;

  const segments = data.map((d, i) => {
    const fraction = (d.value || 0) / total;
    const startAngle = cumulative * 2 * Math.PI;
    cumulative += fraction;
    const endAngle = cumulative * 2 * Math.PI;
    const x1 = cx + radius * Math.sin(startAngle);
    const y1 = cy - radius * Math.cos(startAngle);
    const x2 = cx + radius * Math.sin(endAngle);
    const y2 = cy - radius * Math.cos(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={d.label || i} d={path} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />;
  });

  return (
    <div className="analytics-donut">
      <svg viewBox="0 0 120 120" className="analytics-chart analytics-chart--donut" role="img" aria-label="Donut chart">
        {segments}
        <circle cx={cx} cy={cy} r="24" fill="#ffffff" />
      </svg>
      <ul className="analytics-donut__legend">
        {data.map((d, i) => (
          <li key={d.label || i}>
            <span className="analytics-donut__swatch" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            {d.label} — {d.value}%
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Card used on the Analytics page. Renders a lightweight, dependency-free
 * SVG chart (line / bar / donut) plus optional trend badge and value.
 * No charting library is installed in this project, so charts are hand
 * drawn rather than pulling in a new dependency for a mock-data page.
 *
 * @param {{ title: string, description?: string, trend?: string, value?: string, chart?: { type: "line"|"bar"|"donut", data: Array<{label:string,value:number}> } }} props
 */
const AnalyticsCard = ({ title, description, trend, value, chart }) => {
  return (
    <div className="analytics-card">
      <div className="analytics-card__header">
        <h3>{title}</h3>
        {trend && <span className="analytics-card__trend">{trend}</span>}
      </div>
      {description && <p className="analytics-card__description">{description}</p>}
      {value && <div className="analytics-card__value">{value}</div>}

      {chart?.type === "line" && <LineChart data={chart.data} />}
      {chart?.type === "bar" && <BarChart data={chart.data} />}
      {chart?.type === "donut" && <DonutChart data={chart.data} />}
    </div>
  );
};

export default AnalyticsCard;
