import { useState, useEffect } from "react";
import { type ForecastData } from "@/lib/validators/schemas";
import { getBrandColors, type BrandColors } from "@/lib/assetManager";

interface FinancialRiverVisualProps {
  data: ForecastData;
}

const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// Helper to format large numbers properly
const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
};

const FinancialRiverVisual = ({ data }: FinancialRiverVisualProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: "#f97316",
    secondary: "#6366f1",
    accent: "#ec4899",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const colors = getBrandColors();
    setBrandColors(colors);
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    
    const handleBrandColorsChanged = () => {
      setBrandColors(getBrandColors());
    };
    
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    window.addEventListener("brandColorsChanged", handleBrandColorsChanged);
    setTimeout(() => setIsLoaded(true), 100);
    
    return () => {
      window.removeEventListener("brandColorsChanged", handleBrandColorsChanged);
      observer.disconnect();
    };
  }, []);

  const years = [
    { year: 1, revenue: parseFloat(data.year1Revenue) || 0, expenses: parseFloat(data.year1Expenses) || 0 },
    { year: 2, revenue: parseFloat(data.year2Revenue) || 0, expenses: parseFloat(data.year2Expenses) || 0 },
    { year: 3, revenue: parseFloat(data.year3Revenue) || 0, expenses: parseFloat(data.year3Expenses) || 0 },
    { year: 5, revenue: parseFloat(data.year5Revenue) || 0, expenses: parseFloat(data.year5Expenses) || 0 },
    { year: 10, revenue: parseFloat(data.year10Revenue) || 0, expenses: parseFloat(data.year10Expenses) || 0 },
    { year: 15, revenue: parseFloat(data.year15Revenue) || 0, expenses: parseFloat(data.year15Expenses) || 0 },
    { year: 25, revenue: parseFloat(data.year25Revenue) || 0, expenses: parseFloat(data.year25Expenses) || 0 },
  ];

  const maxRevenue = Math.max(...years.map(y => y.revenue), 1);
  const maxExpenses = Math.max(...years.map(y => y.expenses), 1);

  // River segments (flowing left to right, then down)
  const segments = years.map((year, index) => {
    const x = 100 + (index * 120);
    const y = 300;
    const width = Math.max(20, (year.revenue / maxRevenue) * 100);
    const profit = year.revenue - year.expenses;
    
    return {
      ...year,
      x,
      y,
      width,
      profit,
      obstacleSize: (year.expenses / maxExpenses) * 40,
    };
  });

  // Create flowing river path
  const createRiverPath = () => {
    if (segments.length === 0) return "";
    
    let topPath = `M ${segments[0].x},${segments[0].y - segments[0].width / 2}`;
    let bottomPath = `M ${segments[0].x},${segments[0].y + segments[0].width / 2}`;
    
    for (let i = 1; i < segments.length; i++) {
      const curr = segments[i];
      const prev = segments[i - 1];
      
      // Smooth curves for river banks
      const cpX = (prev.x + curr.x) / 2;
      topPath += ` Q ${cpX},${prev.y - prev.width / 2} ${curr.x},${curr.y - curr.width / 2}`;
      bottomPath += ` Q ${cpX},${prev.y + prev.width / 2} ${curr.x},${curr.y + curr.width / 2}`;
    }
    
    // Close the path
    const lastSeg = segments[segments.length - 1];
    bottomPath += ` L ${lastSeg.x},${lastSeg.y + lastSeg.width / 2}`;
    
    // Reverse bottom path to close shape
    const bottomPoints = bottomPath.split(" ").reverse();
    return topPath + " " + bottomPoints.join(" ") + " Z";
  };

  const riverPath = createRiverPath();

  const colors = {
    bgDark: isDarkMode ? "#0a0a0a" : "#ffffff",
    text: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    water: isDarkMode ? brandColors.secondary : adjustColor(brandColors.secondary, 60),
  };

  const bgGradient = isDarkMode
    ? `linear-gradient(to right, ${colors.bgDark}, ${adjustColor(brandColors.secondary, -100)}30, ${colors.bgDark})`
    : `linear-gradient(to right, #f0f9ff, ${adjustColor(brandColors.secondary, 80)}30, #f0f9ff)`;

  return (
    <div
      className="relative w-full rounded-xl p-4 overflow-hidden transition-colors duration-300"
      style={{ background: bgGradient }}
    >
      <style>{`
        @keyframes waterFlow {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-20px); }
        }
        @keyframes dropletFall {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        @keyframes rockSway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes ripple {
          0% { r: 5; opacity: 0.8; }
          100% { r: 20; opacity: 0; }
        }
        .water-flow {
          animation: waterFlow 3s linear infinite;
        }
        .droplet-fall {
          animation: dropletFall 2s ease-in infinite;
        }
        .rock-sway {
          animation: rockSway 4s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 950 600"
        className="w-full h-auto"
        style={{ minHeight: "400px", maxHeight: "600px" }}
      >
        <defs>
          <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={brandColors.primary} stopOpacity="0.6" />
            <stop offset="50%" stopColor={brandColors.secondary} stopOpacity="0.7" />
            <stop offset="100%" stopColor={brandColors.accent} stopOpacity="0.6" />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Water flow pattern */}
          <pattern id="waterPattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 0,10 Q 10,5 20,10 T 40,10"
              fill="none"
              stroke={adjustColor(colors.water, 40)}
              strokeWidth="1"
              opacity="0.3"
            />
          </pattern>
        </defs>

        {/* River flow */}
        <path
          d={riverPath}
          fill="url(#riverGradient)"
          opacity="0.7"
        />

        {/* Water flow pattern overlay */}
        <path
          d={riverPath}
          fill="url(#waterPattern)"
          className="water-flow"
        />

        {/* Year segments with obstacles and markers */}
        {segments.map((seg, index) => {
          const animationDelay = index * 0.15;
          const isProfit = seg.profit >= 0;
          const hasWaterfall = index > 0 && seg.revenue < segments[index - 1].revenue;

          return (
            <g
              key={seg.year}
              style={{
                opacity: isLoaded ? 1 : 0,
                transition: `opacity 0.5s ease-out ${animationDelay}s`,
              }}
            >
              {/* Expense obstacles (rocks) */}
              {seg.expenses > 0 && (
                <g className="rock-sway" style={{ animationDelay: `${animationDelay}s` }}>
                  <ellipse
                    cx={seg.x}
                    cy={seg.y}
                    rx={seg.obstacleSize}
                    ry={seg.obstacleSize * 0.7}
                    fill="#78716c"
                    opacity="0.8"
                    filter="url(#glow)"
                  />
                  <text
                    x={seg.x}
                    y={seg.y + 5}
                    textAnchor="middle"
                    fontSize={Math.max(12, seg.obstacleSize * 0.6)}
                  >
                    🪨
                  </text>
                </g>
              )}

              {/* Waterfall effect for revenue drops */}
              {hasWaterfall && (
                <g>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <g
                      key={`droplet-${i}`}
                      className="droplet-fall"
                      style={{ animationDelay: `${animationDelay + i * 0.2}s` }}
                    >
                      <circle
                        cx={seg.x - 20 + i * 8}
                        cy={seg.y - seg.width / 2 - 20}
                        r="3"
                        fill={brandColors.secondary}
                        opacity="0.6"
                      />
                    </g>
                  ))}
                  <text
                    x={seg.x}
                    y={seg.y - seg.width / 2 - 35}
                    textAnchor="middle"
                    fontSize="20"
                  >
                    💧
                  </text>
                </g>
              )}

              {/* Year marker */}
              <g>
                <circle
                  cx={seg.x}
                  cy={seg.y - seg.width / 2 - 50}
                  r="20"
                  fill={brandColors.accent}
                  filter="url(#glow)"
                  opacity="0.9"
                />
                <text
                  x={seg.x}
                  y={seg.y - seg.width / 2 - 45}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="700"
                >
                  Y{seg.year}
                </text>
              </g>

              {/* Revenue label */}
              <text
                x={seg.x}
                y={seg.y - seg.width / 2 - 70}
                textAnchor="middle"
                fill={colors.text}
                fontSize="11"
                fontWeight="600"
              >
                {formatCurrency(seg.revenue)}
              </text>

              {/* Profit/Loss indicator */}
              <text
                x={seg.x}
                y={seg.y + seg.width / 2 + 25}
                textAnchor="middle"
                fill={isProfit ? "#10b981" : "#ef4444"}
                fontSize="10"
                fontWeight="600"
              >
                {isProfit ? "💚" : "💔"} {formatCurrency(Math.abs(seg.profit))}
              </text>

              {/* River width indicator (subtle) */}
              <text
                x={seg.x}
                y={seg.y + seg.width / 2 + 40}
                textAnchor="middle"
                fill={colors.textSecondary}
                fontSize="9"
              >
                Flow: {((seg.revenue / maxRevenue) * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* Money boat at the end */}
        {segments.length > 0 && (
          <g
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 1s ease-out 1.2s",
            }}
          >
            <text
              x={segments[segments.length - 1].x + 40}
              y={segments[segments.length - 1].y}
              textAnchor="middle"
              fontSize="35"
            >
              ⛵
            </text>
          </g>
        )}

        {/* Title */}
        <text
          x="475"
          y="40"
          textAnchor="middle"
          fill={colors.text}
          fontSize="24"
          fontWeight="800"
        >
          💧 Financial River
        </text>
        <text
          x="475"
          y="65"
          textAnchor="middle"
          fill={colors.textSecondary}
          fontSize="14"
        >
          Flow of Revenue Over Time
        </text>

        {/* Legend */}
        <g transform="translate(50, 550)">
          <text x="0" y="0" fill={colors.textSecondary} fontSize="10">
            River Width = Revenue  |  🪨 Rocks = Expenses  |  💧 Waterfalls = Revenue Drops
          </text>
        </g>
      </svg>
    </div>
  );
};

export default FinancialRiverVisual;

