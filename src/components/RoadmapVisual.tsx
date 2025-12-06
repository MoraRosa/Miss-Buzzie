import { useState, useEffect } from "react";
import { type Milestone } from "@/lib/validators/schemas";
import { getBrandColors, type BrandColors } from "@/lib/assetManager";

interface RoadmapVisualProps {
  milestones: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
}

// Helper to lighten/darken a hex color
const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// Helper to get contrasting text color
const getContrastColor = (hex: string): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1e293b" : "#ffffff";
};

// Icon mapping based on keywords in milestone title
const getMilestoneIcon = (title: string, category: string): string => {
  const t = title.toLowerCase();

  // Product/Development
  if (t.includes("launch") || t.includes("release")) return "🚀";
  if (t.includes("mvp") || t.includes("prototype")) return "🔧";
  if (t.includes("beta")) return "🧪";
  if (t.includes("product")) return "📦";

  // Growth/Revenue
  if (t.includes("revenue") || t.includes("profit") || t.includes("$") || t.includes("million")) return "💰";
  if (t.includes("customer") || t.includes("user") || t.includes("client")) return "👥";
  if (t.includes("growth") || t.includes("scale")) return "📈";
  if (t.includes("market")) return "🎯";

  // Team/Hiring
  if (t.includes("hire") || t.includes("team") || t.includes("employee")) return "👔";
  if (t.includes("office") || t.includes("headquarters")) return "🏢";

  // Funding
  if (t.includes("funding") || t.includes("investment") || t.includes("seed") || t.includes("series")) return "💎";
  if (t.includes("ipo") || t.includes("public")) return "🏆";

  // Partnerships
  if (t.includes("partner") || t.includes("collaboration")) return "🤝";
  if (t.includes("acquisition") || t.includes("acquire")) return "🔗";

  // International
  if (t.includes("international") || t.includes("global") || t.includes("expand")) return "🌍";

  // Default by category
  if (category === "1-year") return "⭐";
  if (category === "5-year") return "🌟";
  return "✨";
};

const RoadmapVisual = ({ milestones, onMilestoneClick }: RoadmapVisualProps) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // Listen for brand color changes
  useEffect(() => {
    const handleColorChange = (e: CustomEvent<BrandColors>) => {
      setBrandColors(e.detail);
    };
    window.addEventListener("brandColorsChanged", handleColorChange as EventListener);
    return () => window.removeEventListener("brandColorsChanged", handleColorChange as EventListener);
  }, []);

  // Trigger entrance animations
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic colors based on brand and theme
  const colors = {
    // Use brand colors for the journey phases
    year1: brandColors.primary,
    year5: brandColors.secondary,
    year10: brandColors.accent,
    // Theme-aware backgrounds
    bgDark: isDarkMode ? "#0f172a" : "#1e293b",
    bgMedium: isDarkMode ? "#1e293b" : "#334155",
    bgLight: isDarkMode ? "#334155" : "#475569",
    // Text colors
    textPrimary: isDarkMode ? "#f1f5f9" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    textMuted: isDarkMode ? "#64748b" : "#94a3b8",
    // Road colors
    roadBg: isDarkMode ? "#1e293b" : "#e2e8f0",
    roadEdge: isDarkMode ? "#0f172a" : "#cbd5e1",
  };

  // Group milestones by category
  const year1 = milestones.filter((m) => m.category === "1-year");
  const year5 = milestones.filter((m) => m.category === "5-year");
  const year10 = milestones.filter((m) => m.category === "10-year");

  // Calculate milestone positions along the path
  const getMilestonePositions = (
    items: Milestone[],
    startPercent: number,
    endPercent: number
  ) => {
    if (items.length === 0) return [];
    const step = (endPercent - startPercent) / (items.length + 1);
    return items.map((m, i) => ({
      milestone: m,
      percent: startPercent + step * (i + 1),
    }));
  };

  const year1Positions = getMilestonePositions(year1, 0, 0.33);
  const year5Positions = getMilestonePositions(year5, 0.33, 0.66);
  const year10Positions = getMilestonePositions(year10, 0.66, 1);
  const allPositions = [...year1Positions, ...year5Positions, ...year10Positions];

  // SVG path for winding road (bottom to top)
  const pathD = `
    M 200 580
    C 200 520, 350 480, 350 420
    C 350 360, 150 320, 150 260
    C 150 200, 350 160, 350 100
    C 350 60, 250 40, 250 20
  `;

  // Get point on path at percentage (0-1)
  const getPointOnPath = (percent: number): { x: number; y: number } => {
    // Approximate positions along the path
    const points = [
      { x: 200, y: 580 }, // 0% - Start
      { x: 275, y: 500 }, // 15%
      { x: 350, y: 420 }, // 33% - Year 1 marker
      { x: 250, y: 340 }, // 45%
      { x: 150, y: 260 }, // 55%
      { x: 250, y: 180 }, // 66% - Year 5 marker
      { x: 350, y: 100 }, // 80%
      { x: 300, y: 60 },  // 90%
      { x: 250, y: 20 },  // 100% - Year 10 / Vision
    ];

    const totalPoints = points.length - 1;
    const index = percent * totalPoints;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.min(lowerIndex + 1, totalPoints);
    const t = index - lowerIndex;

    return {
      x: points[lowerIndex].x + (points[upperIndex].x - points[lowerIndex].x) * t,
      y: points[lowerIndex].y + (points[upperIndex].y - points[lowerIndex].y) * t,
    };
  };

  // Get color based on position - now uses brand colors!
  const getNodeColor = (percent: number) => {
    if (percent < 0.33) return colors.year1; // Primary - Year 1
    if (percent < 0.66) return colors.year5; // Secondary - Year 5
    return colors.year10; // Accent - Year 10
  };

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 50 + Math.random() * 400,
    y: 50 + Math.random() * 500,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }));

  // Dynamic background based on theme and brand
  const bgGradient = isDarkMode
    ? `linear-gradient(to top, ${colors.bgDark}, ${adjustColor(brandColors.secondary, -100)}40, ${adjustColor(brandColors.primary, -80)}30)`
    : `linear-gradient(to top, #f8fafc, ${adjustColor(brandColors.secondary, 80)}40, ${adjustColor(brandColors.primary, 60)}20)`;

  return (
    <div
      className="relative w-full rounded-xl p-4 overflow-hidden transition-colors duration-300"
      style={{ background: bgGradient }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes dashMove {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes softGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rocketBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes trophyShine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
        }
        .dash-animate {
          animation: dashMove 1s linear infinite;
        }
        .pulse-node {
          animation: pulse 2s ease-in-out infinite;
        }
        .float-particle {
          animation: float 3s ease-in-out infinite;
        }
        .twinkle-star {
          animation: twinkle 2s ease-in-out infinite;
        }
        .glow-pulse {
          animation: glowPulse 3s ease-in-out infinite;
        }
        .soft-glow-ring {
          animation: softGlow 6s ease-in-out infinite;
        }
        .rotate-ring {
          animation: rotateRing 20s linear infinite;
          transform-origin: center;
        }
        .rocket-bounce {
          animation: rocketBounce 1.5s ease-in-out infinite;
        }
        .trophy-shine {
          animation: trophyShine 2s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 500 620"
        className="w-full h-auto max-h-[600px]"
        style={{ minHeight: "400px" }}
      >
        <defs>
          {/* Road gradient - uses brand colors */}
          <linearGradient id="roadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={colors.roadBg} />
            <stop offset="35%" stopColor={adjustColor(colors.year1, isDarkMode ? -30 : 30)} />
            <stop offset="65%" stopColor={adjustColor(colors.year5, isDarkMode ? -20 : 20)} />
            <stop offset="100%" stopColor={colors.year10} />
          </linearGradient>

          {/* Glowing road gradient - brand colors */}
          <linearGradient id="glowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={colors.year1} stopOpacity="0" />
            <stop offset="33%" stopColor={colors.year1} stopOpacity="0.5" />
            <stop offset="66%" stopColor={colors.year5} stopOpacity="0.7" />
            <stop offset="100%" stopColor={colors.year10} stopOpacity="1" />
          </linearGradient>

          {/* Multiple glow filters */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="bigGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Star gradient */}
          <radialGradient id="starGradient">
            <stop offset="0%" stopColor={isDarkMode ? "#ffffff" : colors.year10} />
            <stop offset="100%" stopColor={isDarkMode ? "#ffffff" : colors.year10} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background stars/particles - only show in dark mode */}
        {isDarkMode && particles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill="white"
            opacity="0.5"
            className="twinkle-star"
            style={{ animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
          />
        ))}

        {/* Outer glow layer */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#glowGradient)"
          strokeWidth="60"
          strokeLinecap="round"
          opacity={isDarkMode ? "0.15" : "0.25"}
          filter="url(#bigGlow)"
          className="glow-pulse"
        />

        {/* The winding road - background shadow */}
        <path
          d={pathD}
          fill="none"
          stroke={colors.roadEdge}
          strokeWidth="44"
          strokeLinecap="round"
        />

        {/* The winding road - main */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#roadGradient)"
          strokeWidth="32"
          strokeLinecap="round"
        />

        {/* Road edge highlights */}
        <path
          d={pathD}
          fill="none"
          stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)"}
          strokeWidth="34"
          strokeLinecap="round"
          style={{ clipPath: "inset(0 0 50% 0)" }}
        />

        {/* Animated dashed center line - uses accent color */}
        <path
          d={pathD}
          fill="none"
          stroke={adjustColor(colors.year10, isDarkMode ? 20 : -20)}
          strokeWidth="3"
          strokeDasharray="15 20"
          strokeLinecap="round"
          className="dash-animate"
          filter="url(#glow)"
        />

        {/* Year markers with enhanced styling - using brand colors */}
        <g className="text-xs font-semibold">
          {/* Start marker - glowing rocket */}
          <g transform="translate(200, 580)">
            <circle r="28" fill={colors.year1} opacity="0.2" filter="url(#bigGlow)" className="glow-pulse" />
            <circle r="24" fill={colors.bgDark} stroke={colors.year1} strokeWidth="3" />
            <text y="7" textAnchor="middle" fontSize="20" className="rocket-bounce">🚀</text>
          </g>
          <text x="255" y="595" fill={colors.year1} fontSize="14" fontWeight="700" filter="url(#glow)">
            START YOUR JOURNEY
          </text>

          {/* 1-Year marker with glow */}
          <g transform="translate(390, 420)">
            <circle r="6" fill={colors.year1} filter="url(#glow)" className="pulse-node" />
          </g>
          <text x="405" y="410" fill={colors.year1} fontSize="14" fontWeight="700" filter="url(#glow)">
            YEAR 1
          </text>
          <text x="405" y="428" fill={adjustColor(colors.year1, 40)} fontSize="10" opacity="0.8">
            Foundation
          </text>

          {/* 5-Year marker with glow */}
          <g transform="translate(100, 260)">
            <circle r="6" fill={colors.year5} filter="url(#glow)" className="pulse-node" />
          </g>
          <text x="40" y="250" fill={colors.year5} fontSize="14" fontWeight="700" filter="url(#glow)">
            YEAR 5
          </text>
          <text x="40" y="268" fill={adjustColor(colors.year5, 40)} fontSize="10" opacity="0.8">
            Growth Phase
          </text>

          {/* 10-Year / Vision marker - trophy with shine */}
          <g transform="translate(250, 30)">
            <circle r="35" fill={colors.year10} opacity="0.15" filter="url(#bigGlow)" className="glow-pulse" />
            <circle r="28" fill={colors.bgDark} stroke={colors.year10} strokeWidth="3" />
            <text y="8" textAnchor="middle" fontSize="24" className="trophy-shine">🏆</text>
          </g>
          <text x="250" y="-5" textAnchor="middle" fill={colors.year10} fontSize="16" fontWeight="800" filter="url(#glow)">
            🌟 VISION ACHIEVED 🌟
          </text>
          <text x="320" y="45" fill={adjustColor(colors.year10, 30)} fontSize="12" fontWeight="600">
            YEAR 10
          </text>
        </g>

        {/* Milestone nodes with icons and animations */}
        {allPositions.map(({ milestone, percent }, index) => {
          const pos = getPointOnPath(percent);
          const color = getNodeColor(percent);
          const isHovered = hoveredMilestone === milestone.id;
          const icon = getMilestoneIcon(milestone.title, milestone.category);
          const animationDelay = index * 0.1;

          return (
            <g
              key={milestone.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredMilestone(milestone.id)}
              onMouseLeave={() => setHoveredMilestone(null)}
              onClick={() => onMilestoneClick?.(milestone)}
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "scale(1)" : "scale(0)",
                transition: `all 0.5s ease-out ${animationDelay}s`,
              }}
            >
              {/* Rotating dashed ring with soft glow - always visible */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="22"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.5"
                className="rotate-ring soft-glow-ring"
                style={{ animationDelay: `${animationDelay}s` }}
              />

              {/* Outer glow when hovered */}
              {isHovered && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="30"
                  fill={color}
                  opacity="0.4"
                  filter="url(#bigGlow)"
                />
              )}

              {/* Node background */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="18"
                fill={colors.bgDark}
                stroke={color}
                strokeWidth={isHovered ? 4 : 3}
                filter="url(#glow)"
                style={{
                  transform: isHovered ? `scale(1.15)` : "scale(1)",
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  transition: "transform 0.2s ease-out",
                }}
              />

              {/* Icon */}
              <text
                x={pos.x}
                y={pos.y + 6}
                textAnchor="middle"
                fontSize="16"
                style={{
                  transform: isHovered ? `scale(1.2)` : "scale(1)",
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  transition: "transform 0.2s ease-out",
                }}
              >
                {icon}
              </text>

              {/* Enhanced tooltip on hover */}
              {isHovered && (
                <g style={{ pointerEvents: "none" }}>
                  {/* Tooltip background with gradient */}
                  <rect
                    x={pos.x - 90}
                    y={pos.y - 75}
                    width="180"
                    height="55"
                    rx="10"
                    fill={isDarkMode ? colors.bgDark : "#ffffff"}
                    stroke={color}
                    strokeWidth="2"
                    filter="url(#glow)"
                  />

                  {/* Category badge */}
                  <rect
                    x={pos.x - 30}
                    y={pos.y - 70}
                    width="60"
                    height="16"
                    rx="8"
                    fill={color}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 58}
                    textAnchor="middle"
                    fill={getContrastColor(color)}
                    fontSize="9"
                    fontWeight="700"
                  >
                    {milestone.category.toUpperCase()}
                  </text>

                  {/* Title */}
                  <text
                    x={pos.x}
                    y={pos.y - 42}
                    textAnchor="middle"
                    fill={isDarkMode ? "#f1f5f9" : "#1e293b"}
                    fontSize="12"
                    fontWeight="600"
                  >
                    {milestone.title.length > 22
                      ? milestone.title.substring(0, 22) + "..."
                      : milestone.title}
                  </text>

                  {/* Timeframe */}
                  {milestone.timeframe && (
                    <text
                      x={pos.x}
                      y={pos.y - 27}
                      textAnchor="middle"
                      fill={colors.textSecondary}
                      fontSize="10"
                    >
                      📅 {milestone.timeframe}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Enhanced empty state */}
        {allPositions.length === 0 && (
          <g className="float-particle" style={{ animationDuration: "4s" }}>
            <text
              x="250"
              y="290"
              textAnchor="middle"
              fill={colors.year10}
              fontSize="32"
            >
              ✨
            </text>
            <text
              x="250"
              y="320"
              textAnchor="middle"
              fill={isDarkMode ? "#e2e8f0" : "#1e293b"}
              fontSize="15"
              fontWeight="600"
            >
              Your journey awaits!
            </text>
            <text
              x="250"
              y="345"
              textAnchor="middle"
              fill={colors.textSecondary}
              fontSize="12"
            >
              Add milestones to map your path to success
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default RoadmapVisual;

