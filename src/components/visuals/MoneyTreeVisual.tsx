import { useState, useEffect } from "react";
import { type ForecastData } from "@/lib/validators/schemas";
import { getBrandColors, type BrandColors } from "@/lib/assetManager";

interface MoneyTreeVisualProps {
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

const MoneyTreeVisual = ({ data }: MoneyTreeVisualProps) => {
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

  // Calculate cumulative growth for each year
  const yearGrowth = years.map((year, index) => {
    const profit = year.revenue - year.expenses;
    const cumulativeProfit = years.slice(0, index + 1).reduce((sum, y) => sum + (y.revenue - y.expenses), 0);
    const growthProgress = (index + 1) / years.length; // 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1.0

    return {
      ...year,
      profit,
      cumulativeProfit,
      growthProgress,
      treeHeight: 100 + (growthProgress * 350), // Tree grows from 100px to 450px
      canopySize: Math.max(20, (profit / maxRevenue) * 80), // Canopy size based on profit
    };
  });

  // Final year profit determines total leaf count
  const finalProfit = yearGrowth[yearGrowth.length - 1]?.profit || 0;
  const totalLeafCount = Math.max(5, Math.min(50, Math.floor((finalProfit / maxRevenue) * 50)));

  // Tree grows vertically, each year adds height
  const treeBaseY = 520;
  const trunkX = 475;

  const colors = {
    bgDark: isDarkMode ? "#0a0a0a" : "#ffffff",
    text: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    trunk: isDarkMode ? "#78350f" : "#92400e",
    roots: isDarkMode ? "#57534e" : "#78716c",
  };

  const bgGradient = isDarkMode
    ? `linear-gradient(to top, ${colors.bgDark}, ${adjustColor(brandColors.primary, -100)}30)`
    : `linear-gradient(to top, #fef3c7, ${adjustColor(brandColors.primary, 80)}30)`;

  return (
    <div
      className="relative w-full rounded-xl p-4 overflow-hidden transition-colors duration-300"
      style={{ background: bgGradient }}
    >
      <style>{`
        @keyframes leafSway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes fruitBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes rootPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
        .leaf-sway {
          animation: leafSway 4s ease-in-out infinite;
          transform-origin: center;
        }
        .fruit-bounce {
          animation: fruitBounce 3s ease-in-out infinite;
        }
        .root-pulse {
          animation: rootPulse 4s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 950 650"
        className="w-full h-auto"
        style={{ minHeight: "400px", maxHeight: "650px" }}
      >
        <defs>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={adjustColor(colors.trunk, -20)} />
            <stop offset="50%" stopColor={colors.trunk} />
            <stop offset="100%" stopColor={adjustColor(colors.trunk, -20)} />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="leafGradient">
            <stop offset="0%" stopColor={brandColors.secondary} />
            <stop offset="100%" stopColor={adjustColor(brandColors.secondary, -40)} />
          </radialGradient>
        </defs>

        {/* Ground line */}
        <line x1="0" y1={treeBaseY} x2="950" y2={treeBaseY} stroke={colors.roots} strokeWidth="2" opacity="0.3" />

        {/* Roots (representing expenses) - grow deeper with more expenses */}
        {yearGrowth.map((year, index) => {
          const rootDepth = (year.expenses / maxExpenses) * 60;
          const rootX = trunkX + (index - 3) * 50;
          const animationDelay = index * 0.15;

          return (
            <g
              key={`root-${year.year}`}
              className="root-pulse"
              style={{
                animationDelay: `${animationDelay}s`,
                opacity: isLoaded ? 1 : 0,
                transition: `opacity 0.5s ease-out ${animationDelay}s`,
              }}
            >
              <path
                d={`M ${trunkX},${treeBaseY} Q ${rootX},${treeBaseY + rootDepth / 2} ${rootX},${treeBaseY + rootDepth}`}
                fill="none"
                stroke={colors.roots}
                strokeWidth={2 + year.growthProgress * 2}
                opacity="0.5"
              />
              <circle cx={rootX} cy={treeBaseY + rootDepth} r="3" fill={colors.roots} />
            </g>
          );
        })}

        {/* Growing tree trunk - gets taller each year */}
        {yearGrowth.map((year, index) => {
          const segmentHeight = year.treeHeight - (index > 0 ? yearGrowth[index - 1].treeHeight : 0);
          const segmentY = treeBaseY - year.treeHeight;
          const animationDelay = index * 0.2;

          return (
            <g
              key={`trunk-segment-${year.year}`}
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "scaleY(1)" : "scaleY(0)",
                transition: `all 0.6s ease-out ${animationDelay}s`,
                transformOrigin: `${trunkX}px ${treeBaseY}px`,
              }}
            >
              <rect
                x={trunkX - 15}
                y={segmentY}
                width={30}
                height={segmentHeight + 2}
                fill="url(#trunkGradient)"
                rx="3"
              />
            </g>
          );
        })}

        {/* Tree canopy layers - grow with each year */}
        {yearGrowth.map((year, index) => {
          const canopyY = treeBaseY - year.treeHeight - 20;
          const canopySize = year.canopySize;
          const animationDelay = index * 0.2 + 0.3;

          return (
            <g
              key={`canopy-${year.year}`}
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "scale(1)" : "scale(0)",
                transition: `all 0.6s ease-out ${animationDelay}s`,
                transformOrigin: `${trunkX}px ${canopyY}px`,
              }}
            >
              <ellipse
                cx={trunkX}
                cy={canopyY}
                rx={canopySize}
                ry={canopySize * 0.8}
                fill={brandColors.secondary}
                opacity="0.2"
              />

              {/* Year marker on canopy */}
              <circle
                cx={trunkX + canopySize - 15}
                cy={canopyY}
                r="12"
                fill={brandColors.accent}
                filter="url(#glow)"
              />
              <text
                x={trunkX + canopySize - 15}
                y={canopyY + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="700"
              >
                {year.year}
              </text>

              {/* Revenue label */}
              <text
                x={trunkX + canopySize + 10}
                y={canopyY - 5}
                textAnchor="start"
                fill={colors.text}
                fontSize="10"
                fontWeight="600"
              >
                {formatCurrency(year.revenue)}
              </text>

              {/* Profit indicator */}
              <text
                x={trunkX + canopySize + 10}
                y={canopyY + 8}
                textAnchor="start"
                fill={year.profit >= 0 ? "#10b981" : "#ef4444"}
                fontSize="9"
              >
                {year.profit >= 0 ? "+" : ""}{formatCurrency(year.profit)}
              </text>
            </g>
          );
        })}

        {/* Final canopy - bushy leaves based on final profit */}
        {yearGrowth.length > 0 && (
          <g>
            {Array.from({ length: totalLeafCount }).map((_, i) => {
              const finalYear = yearGrowth[yearGrowth.length - 1];
              const canopyY = treeBaseY - finalYear.treeHeight - 20;
              const angle = (i / totalLeafCount) * Math.PI * 2;
              const radiusVariation = 0.5 + (i % 5) * 0.15;
              const radius = finalYear.canopySize * radiusVariation;
              const x = trunkX + Math.cos(angle) * radius;
              const y = canopyY + Math.sin(angle) * (radius * 0.7);
              const size = 12 + (i % 3) * 4;
              const animationDelay = 1.5 + (i * 0.02);

              return (
                <g
                  key={`leaf-${i}`}
                  className="leaf-sway"
                  style={{
                    animationDelay: `${animationDelay}s`,
                    opacity: isLoaded ? 1 : 0,
                    transition: `opacity 0.4s ease-out ${animationDelay}s`,
                  }}
                >
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize={size}
                  >
                    {i % 6 === 0 ? "🌿" : i % 6 === 1 ? "🍃" : i % 6 === 2 ? "🌱" : i % 6 === 3 ? "☘️" : i % 6 === 4 ? "🍀" : "💰"}
                  </text>
                </g>
              );
            })}
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
          🌳 Money Tree
        </text>
        <text
          x="475"
          y="65"
          textAnchor="middle"
          fill={colors.textSecondary}
          fontSize="14"
        >
          Growing Your Financial Future
        </text>

        {/* Legend */}
        <g transform="translate(50, 580)">
          <text x="0" y="0" fill={colors.textSecondary} fontSize="10">
            Tree grows taller each year  |  Canopy size = Profit  |  Leaf count = Final year profit  |  Roots = Expenses
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MoneyTreeVisual;

