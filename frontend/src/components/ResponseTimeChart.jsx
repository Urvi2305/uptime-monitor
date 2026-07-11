import { useState } from 'react';
import { formatRelativeTime } from '../utils/formatRelativeTime';

const WIDTH = 600;
const HEIGHT = 200;
const PAD = { left: 44, right: 12, top: 16, bottom: 28 };
const PLOT_WIDTH = WIDTH - PAD.left - PAD.right;
const PLOT_HEIGHT = HEIGHT - PAD.top - PAD.bottom;
const MIN_RANGE_MS = 50;

function computeDomain(values) {
  if (values.length === 0) return { min: 0, max: 1 };

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (max - min < MIN_RANGE_MS) {
    const mid = (max + min) / 2;
    min = Math.max(0, mid - MIN_RANGE_MS / 2);
    max = mid + MIN_RANGE_MS / 2;
  }

  const span = max - min || 1;
  return { min: Math.max(0, min - span * 0.1), max: max + span * 0.1 };
}

function buildLineSegments(data, xFor, yFor) {
  const segments = [];
  let current = [];

  data.forEach((check, index) => {
    if (check.response_time_ms == null) {
      if (current.length) segments.push(current);
      current = [];
      return;
    }
    const command = current.length === 0 ? 'M' : 'L';
    current.push(`${command}${xFor(index).toFixed(1)},${yFor(check.response_time_ms).toFixed(1)}`);
  });

  if (current.length) segments.push(current);
  return segments.map((segment) => segment.join(' '));
}

function ResponseTimeChart({ checks }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (checks.length === 0) return null;

  const data = checks.slice().reverse();
  const n = data.length;
  const values = data.map((c) => c.response_time_ms).filter((v) => v != null);
  const { min: domainMin, max: domainMax } = computeDomain(values);

  const xFor = (index) => PAD.left + (n <= 1 ? PLOT_WIDTH / 2 : (index / (n - 1)) * PLOT_WIDTH);
  const yFor = (value) =>
    PAD.top + PLOT_HEIGHT - ((value - domainMin) / (domainMax - domainMin)) * PLOT_HEIGHT;

  const linePaths = buildLineSegments(data, xFor, yFor);
  const active = activeIndex != null ? data[activeIndex] : null;

  return (
    <div className="response-time-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Response time for the last ${n} checks`}
      >
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={WIDTH - PAD.right}
          y2={PAD.top}
          stroke="var(--border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={PAD.left}
          y1={PAD.top + PLOT_HEIGHT}
          x2={WIDTH - PAD.right}
          y2={PAD.top + PLOT_HEIGHT}
          stroke="var(--border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <text x={4} y={PAD.top + 4} fill="var(--text-tertiary)" fontSize="10">
          {Math.round(domainMax)}ms
        </text>
        <text x={4} y={PAD.top + PLOT_HEIGHT + 4} fill="var(--text-tertiary)" fontSize="10">
          {Math.round(domainMin)}ms
        </text>

        {linePaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {data.map((check, index) => {
          if (check.response_time_ms == null) {
            return (
              <circle
                key={check.id}
                cx={xFor(index)}
                cy={PAD.top + PLOT_HEIGHT}
                r="3"
                fill="var(--pending)"
              >
                <title>No timing data</title>
              </circle>
            );
          }

          const isDown = check.is_up === false;
          const isEndpoint = index === 0 || index === n - 1;
          if (!isDown && !isEndpoint) return null;

          const cx = xFor(index);
          const cy = yFor(check.response_time_ms);
          const label = `${check.is_up ? 'UP' : 'DOWN'} — ${
            check.error_message || check.status_code || ''
          } — ${formatRelativeTime(check.checked_at)}`;

          return (
            <g key={check.id}>
              <circle
                cx={cx}
                cy={cy}
                r={isDown ? 5 : 3}
                fill={isDown ? 'var(--danger)' : 'var(--accent)'}
                stroke={isDown ? 'var(--bg-elevated)' : 'none'}
                strokeWidth={isDown ? 2 : 0}
              >
                <title>{label}</title>
              </circle>
              <circle
                cx={cx}
                cy={cy}
                r="12"
                fill="transparent"
                tabIndex={0}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex((prev) => (prev === index ? null : prev))}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex((prev) => (prev === index ? null : prev))}
              />
            </g>
          );
        })}

        {active && (
          <g>
            <rect
              x={Math.min(Math.max(xFor(activeIndex) - 55, PAD.left), WIDTH - PAD.right - 110)}
              y={Math.max(yFor(active.response_time_ms ?? domainMin) - 40, 2)}
              width="110"
              height="34"
              rx="4"
              fill="var(--bg-elevated-hover)"
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={Math.min(Math.max(xFor(activeIndex) - 55, PAD.left), WIDTH - PAD.right - 110) + 6}
              y={Math.max(yFor(active.response_time_ms ?? domainMin) - 40, 2) + 14}
              fill="var(--text-primary)"
              fontSize="10"
            >
              {active.response_time_ms != null ? `${active.response_time_ms} ms` : 'no timing'} ·{' '}
              {active.is_up ? 'UP' : 'DOWN'}
            </text>
            <text
              x={Math.min(Math.max(xFor(activeIndex) - 55, PAD.left), WIDTH - PAD.right - 110) + 6}
              y={Math.max(yFor(active.response_time_ms ?? domainMin) - 40, 2) + 27}
              fill="var(--text-tertiary)"
              fontSize="9"
            >
              {formatRelativeTime(active.checked_at)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default ResponseTimeChart;
