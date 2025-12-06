import { useState, useEffect, useRef } from "react";
import { type ForecastData } from "@/lib/validators/schemas";
import { getBrandColors, type BrandColors } from "@/lib/assetManager";

interface FinancialChartVisualProps {
  data: ForecastData;
}

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

const FinancialChartVisual = ({ data }: FinancialChartVisualProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: "#f97316",
    secondary: "#6366f1",
    accent: "#ec4899",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);

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
    
    // Trigger animation after mount
    setTimeout(() => setIsAnimated(true), 100);
    
    return () => {
      window.removeEventListener("brandColorsChanged", handleBrandColorsChanged);
      observer.disconnect();
    };
  }, []);

  // Parse financial data
  const years = [
    { year: 1, revenue: parseFloat(data.year1Revenue) || 0, expenses: parseFloat(data.year1Expenses) || 0 },
    { year: 2, revenue: parseFloat(data.year2Revenue) || 0, expenses: parseFloat(data.year2Expenses) || 0 },
    { year: 3, revenue: parseFloat(data.year3Revenue) || 0, expenses: parseFloat(data.year3Expenses) || 0 },
    { year: 5, revenue: parseFloat(data.year5Revenue) || 0, expenses: parseFloat(data.year5Expenses) || 0 },
    { year: 10, revenue: parseFloat(data.year10Revenue) || 0, expenses: parseFloat(data.year10Expenses) || 0 },
    { year: 15, revenue: parseFloat(data.year15Revenue) || 0, expenses: parseFloat(data.year15Expenses) || 0 },
    { year: 25, revenue: parseFloat(data.year25Revenue) || 0, expenses: parseFloat(data.year25Expenses) || 0 },
  ];

  const maxValue = Math.max(...years.map(y => Math.max(y.revenue, y.expenses)), 1);
  const hasData = years.some(y => y.revenue > 0 || y.expenses > 0);

  // Chart dimensions
  const width = 900;
  const height = 500;
  const padding = { top: 60, right: 80, bottom: 80, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate positions
  const getX = (index: number) => padding.left + (index / (years.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - (value / maxValue) * chartHeight;

  // Create smooth curved paths
  const createSmoothPath = (values: number[], type: 'line' | 'area' = 'line') => {
    if (values.length === 0) return "";
    
    let path = `M ${getX(0)},${getY(values[0])}`;
    
    for (let i = 1; i < values.length; i++) {
      const x0 = getX(i - 1);
      const y0 = getY(values[i - 1]);
      const x1 = getX(i);
      const y1 = getY(values[i]);
      
      const cpX = (x0 + x1) / 2;
      path += ` Q ${cpX},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2} Q ${cpX},${y1} ${x1},${y1}`;
    }
    
    if (type === 'area') {
      path += ` L ${getX(values.length - 1)},${padding.top + chartHeight}`;
      path += ` L ${getX(0)},${padding.top + chartHeight}`;
      path += ` Z`;
    }
    
    return path;
  };

  const revenuePath = createSmoothPath(years.map(y => y.revenue), 'line');
  const revenueAreaPath = createSmoothPath(years.map(y => y.revenue), 'area');
  const expensesPath = createSmoothPath(years.map(y => y.expenses), 'line');
  const expensesAreaPath = createSmoothPath(years.map(y => y.expenses), 'area');

  // Calculate profit area (between revenue and expenses)
  const profitAreaPath = (() => {
    if (years.length === 0) return "";
    
    let path = `M ${getX(0)},${getY(years[0].revenue)}`;
    
    for (let i = 1; i < years.length; i++) {
      const x0 = getX(i - 1);
      const y0 = getY(years[i - 1].revenue);
      const x1 = getX(i);
      const y1 = getY(years[i].revenue);
      const cpX = (x0 + x1) / 2;
      path += ` Q ${cpX},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2} Q ${cpX},${y1} ${x1},${y1}`;
    }
    
    // Go back along expenses line
    for (let i = years.length - 1; i >= 0; i--) {
      const x = getX(i);
      const y = getY(years[i].expenses);
      if (i === years.length - 1) {
        path += ` L ${x},${y}`;
      } else {
        const x0 = getX(i + 1);
        const y0 = getY(years[i + 1].expenses);
        const cpX = (x0 + x) / 2;
        path += ` Q ${cpX},${y0} ${(x0 + x) / 2},${(y0 + y) / 2} Q ${cpX},${y} ${x},${y}`;
      }
    }
    
    path += ` Z`;
    return path;
  })();

  const colors = {
    bg: isDarkMode ? "#0a0a0a" : "#ffffff",
    text: isDarkMode ? "#e2e8f0" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    gridLine: isDarkMode ? "#1e293b" : "#e2e8f0",
  };

  // Y-axis labels (5 levels)
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
    const value = (maxValue / 5) * i;
    return { value, y: getY(value) };
  });

  if (!hasData) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 rounded-lg border-2 border-dashed border-muted">
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground mb-2">📊 No Data Yet</p>
          <p className="text-sm text-muted-foreground">Enter your financial forecast data to see the chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-background to-muted/20 rounded-xl p-6 shadow-lg">
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .line-animate {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: drawLine 2s ease-out forwards;
        }
        .fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      <svg
        ref={chartRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ minHeight: "400px", maxHeight: "500px" }}
      >
        <defs>
          {/* Gradients for revenue */}
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={brandColors.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={brandColors.primary} stopOpacity="0.1" />
          </linearGradient>

          {/* Gradients for expenses */}
          <linearGradient id="expensesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={brandColors.secondary} stopOpacity="0.6" />
            <stop offset="100%" stopColor={brandColors.secondary} stopOpacity="0.05" />
          </linearGradient>

          {/* Gradient for profit area */}
          <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow filter */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {yAxisLabels.map((label, i) => (
          <g key={`grid-${i}`} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <line
              x1={padding.left}
              y1={label.y}
              x2={width - padding.right}
              y2={label.y}
              stroke={colors.gridLine}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
          </g>
        ))}

        {/* Y-axis labels */}
        {yAxisLabels.map((label, i) => (
          <text
            key={`y-label-${i}`}
            x={padding.left - 15}
            y={label.y + 5}
            textAnchor="end"
            fill={colors.textSecondary}
            fontSize="11"
            fontWeight="500"
            className="fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {formatCurrency(label.value)}
          </text>
        ))}

        {/* Profit area (between revenue and expenses) */}
        <path
          d={profitAreaPath}
          fill="url(#profitGradient)"
          className="fade-in"
          style={{ animationDelay: "0.5s" }}
        />

        {/* Expenses area */}
        <path
          d={expensesAreaPath}
          fill="url(#expensesGradient)"
          className="fade-in"
          style={{ animationDelay: "0.8s" }}
        />

        {/* Revenue area */}
        <path
          d={revenueAreaPath}
          fill="url(#revenueGradient)"
          className="fade-in"
          style={{ animationDelay: "1s" }}
        />

        {/* Expenses line */}
        <path
          d={expensesPath}
          fill="none"
          stroke={brandColors.secondary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isAnimated ? "line-animate" : ""}
          style={{ animationDelay: "0.3s" }}
          filter="url(#glow)"
        />

        {/* Revenue line */}
        <path
          d={revenuePath}
          fill="none"
          stroke={brandColors.primary}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isAnimated ? "line-animate" : ""}
          style={{ animationDelay: "0.5s" }}
          filter="url(#glow)"
        />

        {/* Data points */}
        {years.map((year, index) => {
          const x = getX(index);
          const revenueY = getY(year.revenue);
          const expensesY = getY(year.expenses);
          const profit = year.revenue - year.expenses;
          const isHovered = hoveredPoint === index;

          return (
            <g key={`point-${index}`}>
              {/* Expenses point */}
              <circle
                cx={x}
                cy={expensesY}
                r={isHovered ? 8 : 5}
                fill={brandColors.secondary}
                stroke={colors.bg}
                strokeWidth="2"
                className="scale-in"
                style={{
                  animationDelay: `${1.5 + index * 0.1}s`,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                filter="url(#shadow)"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Revenue point */}
              <circle
                cx={x}
                cy={revenueY}
                r={isHovered ? 10 : 6}
                fill={brandColors.primary}
                stroke={colors.bg}
                strokeWidth="2"
                className="scale-in"
                style={{
                  animationDelay: `${1.5 + index * 0.1}s`,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                filter="url(#shadow)"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Hover tooltip */}
              {isHovered && (
                <g className="fade-in">
                  <rect
                    x={x - 70}
                    y={revenueY - 80}
                    width="140"
                    height="70"
                    fill={isDarkMode ? "#1e293b" : "#ffffff"}
                    stroke={brandColors.primary}
                    strokeWidth="2"
                    rx="8"
                    filter="url(#shadow)"
                  />
                  <text
                    x={x}
                    y={revenueY - 60}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="12"
                    fontWeight="700"
                  >
                    Year {year.year}
                  </text>
                  <text
                    x={x}
                    y={revenueY - 45}
                    textAnchor="middle"
                    fill={brandColors.primary}
                    fontSize="10"
                    fontWeight="600"
                  >
                    Revenue: {formatCurrency(year.revenue)}
                  </text>
                  <text
                    x={x}
                    y={revenueY - 30}
                    textAnchor="middle"
                    fill={brandColors.secondary}
                    fontSize="10"
                    fontWeight="600"
                  >
                    Expenses: {formatCurrency(year.expenses)}
                  </text>
                  <text
                    x={x}
                    y={revenueY - 15}
                    textAnchor="middle"
                    fill={profit >= 0 ? "#10b981" : "#ef4444"}
                    fontSize="11"
                    fontWeight="700"
                  >
                    Profit: {formatCurrency(profit)}
                  </text>
                </g>
              )}

              {/* X-axis label */}
              <text
                x={x}
                y={height - padding.bottom + 25}
                textAnchor="middle"
                fill={colors.text}
                fontSize="12"
                fontWeight="600"
                className="fade-in"
                style={{ animationDelay: `${1.5 + index * 0.1}s` }}
              >
                Year {year.year}
              </text>
            </g>
          );
        })}

        {/* Chart title */}
        <text
          x={width / 2}
          y={30}
          textAnchor="middle"
          fill={colors.text}
          fontSize="20"
          fontWeight="800"
          className="fade-in"
        >
          📊 Financial Forecast Overview
        </text>

        {/* Legend */}
        <g transform={`translate(${width - padding.right - 150}, ${padding.top - 20})`} className="fade-in" style={{ animationDelay: "1.8s" }}>
          <circle cx="0" cy="0" r="5" fill={brandColors.primary} />
          <text x="12" y="4" fill={colors.text} fontSize="11" fontWeight="600">Revenue</text>

          <circle cx="80" cy="0" r="5" fill={brandColors.secondary} />
          <text x="92" y="4" fill={colors.text} fontSize="11" fontWeight="600">Expenses</text>
        </g>
      </svg>
    </div>
  );
};

export default FinancialChartVisual;

