import { useState, useEffect } from "react";
import { type ForecastData } from "@/lib/validators/schemas";
import { getBrandColors, type BrandColors } from "@/lib/assetManager";

interface RocketLaunchVisualProps {
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

const RocketLaunchVisual = ({ data }: RocketLaunchVisualProps) => {
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

  // Calculate rocket trajectory positions (curved path going up)
  const getPosition = (index: number, revenue: number) => {
    const baseX = 150;
    const xSpacing = 115;
    const baseY = 550;
    const heightScale = 450 / maxRevenue;
    
    const x = baseX + (index * xSpacing);
    const y = baseY - (revenue * heightScale);
    
    return { x, y: Math.max(80, y) };
  };

  const positions = years.map((year, index) => ({
    ...year,
    ...getPosition(index, year.revenue),
    profit: year.revenue - year.expenses,
  }));

  // Create curved trajectory path
  const createCurvedPath = () => {
    if (positions.length === 0) return "";
    
    let path = `M ${positions[0].x},${positions[0].y}`;
    
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const cpX = (prev.x + curr.x) / 2;
      const cpY = (prev.y + curr.y) / 2 - 20;
      path += ` Q ${cpX},${cpY} ${curr.x},${curr.y}`;
    }
    
    return path;
  };

  const trajectoryPath = createCurvedPath();

  const colors = {
    bgDark: isDarkMode ? "#0a0a0a" : "#ffffff",
    text: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    stars: isDarkMode ? "#fbbf24" : "#f59e0b",
  };

  const bgGradient = isDarkMode
    ? `linear-gradient(to top, #1e1b4b, #0f172a, #020617)`
    : `linear-gradient(to top, #dbeafe, #bfdbfe, #93c5fd)`;

  // Generate random stars for background
  const backgroundStars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: 50 + Math.random() * 850,
    y: 50 + Math.random() * 500,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 3,
  }));

  return (
    <div
      className="relative w-full rounded-xl p-4 overflow-hidden transition-colors duration-300"
      style={{ background: bgGradient }}
    >
      <style>{`
        @keyframes rocketFly {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
        }
        @keyframes trailGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .rocket-fly {
          animation: rocketFly 3s ease-in-out infinite;
        }
        .star-twinkle {
          animation: starTwinkle 2s ease-in-out infinite;
        }
        .cloud-drift {
          animation: cloudDrift 6s ease-in-out infinite;
        }
        .trail-glow {
          animation: trailGlow 2s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 950 600"
        className="w-full h-auto"
        style={{ minHeight: "400px", maxHeight: "600px" }}
      >
        <defs>
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={brandColors.primary} stopOpacity="0" />
            <stop offset="50%" stopColor={brandColors.accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={brandColors.secondary} stopOpacity="0.8" />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="planetGradient">
            <stop offset="0%" stopColor={brandColors.accent} />
            <stop offset="100%" stopColor={adjustColor(brandColors.accent, -60)} />
          </radialGradient>
        </defs>

        {/* Background stars */}
        {backgroundStars.map((star) => (
          <circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={colors.stars}
            className="star-twinkle"
            style={{ animationDelay: `${star.delay}s` }}
          />
        ))}

        {/* Rocket trajectory trail */}
        <path
          d={trajectoryPath}
          fill="none"
          stroke="url(#trailGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="15 10"
          className="trail-glow"
          filter="url(#glow)"
        />

        {/* Year markers as planets/stars */}
        {positions.map((pos, index) => {
          const isProfit = pos.profit >= 0;
          const animationDelay = index * 0.15;
          const planetSize = 15 + (pos.revenue / maxRevenue) * 20;

          return (
            <g
              key={pos.year}
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "scale(1)" : "scale(0)",
                transition: `all 0.5s ease-out ${animationDelay}s`,
              }}
            >
              {/* Planet/Star marker */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={planetSize}
                fill="url(#planetGradient)"
                filter="url(#glow)"
                opacity="0.9"
              />

              {/* Planet emoji */}
              <text
                x={pos.x}
                y={pos.y + 6}
                textAnchor="middle"
                fontSize="20"
              >
                {index === 6 ? "🌟" : index >= 4 ? "🪐" : "⭐"}
              </text>

              {/* Expense clouds */}
              {pos.expenses > 0 && (
                <g className="cloud-drift" style={{ animationDelay: `${animationDelay}s` }}>
                  <text
                    x={pos.x + 35}
                    y={pos.y - 10}
                    textAnchor="middle"
                    fontSize="24"
                    opacity="0.7"
                  >
                    ☁️
                  </text>
                  <text
                    x={pos.x + 35}
                    y={pos.y + 10}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="9"
                    fontWeight="600"
                  >
                    -{formatCurrency(pos.expenses)}
                  </text>
                </g>
              )}

              {/* Year label */}
              <text
                x={pos.x}
                y={pos.y + planetSize + 18}
                textAnchor="middle"
                fill={colors.text}
                fontSize="13"
                fontWeight="700"
              >
                Year {pos.year}
              </text>

              {/* Revenue amount */}
              <text
                x={pos.x}
                y={pos.y + planetSize + 33}
                textAnchor="middle"
                fill={brandColors.primary}
                fontSize="11"
                fontWeight="600"
              >
                {formatCurrency(pos.revenue)}
              </text>

              {/* Profit indicator */}
              <text
                x={pos.x}
                y={pos.y + planetSize + 47}
                textAnchor="middle"
                fill={isProfit ? "#10b981" : "#ef4444"}
                fontSize="10"
                fontWeight="500"
              >
                {isProfit ? "📈" : "📉"} {formatCurrency(Math.abs(pos.profit))}
              </text>
            </g>
          );
        })}

        {/* Rocket at the end */}
        {positions.length > 0 && (
          <g
            className="rocket-fly"
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 1s ease-out 1s",
            }}
          >
            <text
              x={positions[positions.length - 1].x}
              y={positions[positions.length - 1].y - 40}
              textAnchor="middle"
              fontSize="40"
            >
              🚀
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
          🚀 Rocket Launch
        </text>
        <text
          x="475"
          y="65"
          textAnchor="middle"
          fill={colors.textSecondary}
          fontSize="14"
        >
          Your Journey to the Stars
        </text>
      </svg>
    </div>
  );
};

export default RocketLaunchVisual;

