import { useState, useEffect } from "react";
import { type ForecastData } from "@/lib/validators/schemas";
import { getBrandColors, type BrandColors } from "@/lib/assetManager";

interface GrowthMountainVisualProps {
  data: ForecastData;
}

const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

// Helper to convert hex to HSL components for color manipulation
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 259, s: 40, l: 39 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const GrowthMountainVisual = ({ data }: GrowthMountainVisualProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: "#f97316",
    secondary: "#6366f1",
    accent: "#ec4899",
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const colors = getBrandColors();
    setBrandColors(colors);
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const handleBrandColorsChanged = () => setBrandColors(getBrandColors());
    window.addEventListener("brandColorsChanged", handleBrandColorsChanged);

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("brandColorsChanged", handleBrandColorsChanged);
      observer.disconnect();
    };
  }, []);

  // Parse financial data for display
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

  // Calculate marker positions along the mountain path
  const getMarkerPosition = (index: number, revenue: number) => {
    const xPositions = [180, 320, 460, 600, 740, 880, 1020];
    const x = xPositions[index] || 180 + index * 140;
    const baseY = 550;
    const minY = 180;
    const elevationRatio = revenue / maxRevenue;
    const y = baseY - (elevationRatio * (baseY - minY));
    return { x, y };
  };

  // Convert brand colors to HSL for mountain theming
  const primaryHSL = hexToHSL(brandColors.primary);
  const secondaryHSL = hexToHSL(brandColors.secondary);
  const accentHSL = hexToHSL(brandColors.accent);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🏔️ Growth Mountain
          <span className="text-sm font-normal text-muted-foreground">Your financial journey to the summit</span>
        </h3>

        <div className="relative w-full bg-card rounded-lg border shadow-lg overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1270 775" className="w-full h-auto">
            {/* Styles - Brand color aware + dark/light mode */}
            <style>{`
              /* Sky uses secondary brand color */
              .sky { fill: hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '15' : '35'}%); }

              /* Sun uses accent */
              .sun { fill: hsl(${accentHSL.h}, ${accentHSL.s}%, 53%); }

              /* Moon */
              .moon { fill: ${isDarkMode ? `hsl(${secondaryHSL.h}, 37%, 80%)` : 'hsla(246, 10%, 90%, 0)'}; }

              /* Mountains use brand colors - adjusted for dark mode */
              .mountain-bottom {
                fill: hsl(${secondaryHSL.h}, ${Math.min(secondaryHSL.s + 20, 100)}%, ${isDarkMode ? '35' : '75'}%);
              }
              .mountain-middle {
                fill: hsl(${primaryHSL.h}, ${primaryHSL.s}%, ${isDarkMode ? '45' : '70'}%);
              }
              .mountain-top {
                fill: hsl(${accentHSL.h}, ${Math.min(accentHSL.s - 20, 100)}%, ${isDarkMode ? '55' : '85'}%);
              }

              /* Terrain - darker version of secondary */
              .terrain { fill: hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '8' : '15'}%); }

              /* Birds - match the theme */
              .bird-body, .bird-wing {
                fill: hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '70' : '20'}%);
              }

              /* Data labels - high contrast for readability */
              .data-label-bg {
                fill: ${isDarkMode ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)'};
              }
              .data-text {
                fill: ${isDarkMode ? '#ffffff' : '#1a1a2e'};
                font-family: system-ui, -apple-system, sans-serif;
                font-weight: 600;
              }
              .data-text-small {
                fill: ${isDarkMode ? '#e0e0e0' : '#374151'};
                font-family: system-ui, -apple-system, sans-serif;
              }

              /* Animations */
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
              }

              /* Bird flying - slow drift across screen like in reference */
              @keyframes birdFly {
                0% { transform: translate(250px, -80px); }
                100% { transform: translate(-1000px, -80px); }
              }
              @keyframes birdFly2 {
                0% { transform: translate(400px, -40px); }
                100% { transform: translate(-850px, -40px); }
              }

              /* Wing flap - Reference: animates from scaleY(1) to scaleY(-1.2) with yoyo */
              /* Using alternate to create the yoyo effect */
              @keyframes wingFlap {
                0% { transform: scaleY(1); }
                100% { transform: scaleY(-1.2); }
              }

              .bird-container {
                animation: birdFly 100s linear infinite;
              }
              .bird-container-2 {
                animation: birdFly2 120s linear infinite;
                animation-delay: 15s;
              }

              /* Body slightly stretched vertically like reference: scaleY(1.2) */
              .bird-body {
                fill: ${isDarkMode ? 'hsl(' + secondaryHSL.h + ', 30%, 70%)' : '#2d113f'};
              }
              .bird-body path {
                transform: scaleY(1.2);
                transform-box: fill-box;
                transform-origin: center center;
              }

              /* Wing animation - transform-box: fill-box is crucial for SVG transform-origin to work */
              .bird-wing {
                fill: ${isDarkMode ? 'hsl(' + secondaryHSL.h + ', 30%, 70%)' : '#2d113f'};
                transform-box: fill-box;
                transform-origin: center bottom;
              }
              /* Each wing has slightly different timing (1s + 0.1s * index) per reference */
              /* Using alternate for yoyo effect */
              #wing-1 { animation: wingFlap 1.0s ease-in-out infinite alternate; }
              #wing-2 { animation: wingFlap 1.1s ease-in-out infinite alternate; }
              #wing-3 { animation: wingFlap 1.2s ease-in-out infinite alternate; }
              #wing-4 { animation: wingFlap 1.3s ease-in-out infinite alternate; }
              #wing-5 { animation: wingFlap 1.4s ease-in-out infinite alternate; }
              #wing-6 { animation: wingFlap 1.5s ease-in-out infinite alternate; }

              .flag-animate { animation: float 3s ease-in-out infinite; }
            `}</style>

            {/* Filters & Gradients - Brand color aware */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="mountainBlur">
                <feGaussianBlur stdDeviation="2"/>
              </filter>
              <filter id="labelShadow">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.5"/>
              </filter>
              {/* Sky gradient using brand secondary color */}
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: `hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '8' : '30'}%)`, stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: `hsl(${secondaryHSL.h}, ${secondaryHSL.s - 10}%, ${isDarkMode ? '12' : '35'}%)`, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: `hsl(${primaryHSL.h}, ${primaryHSL.s}%, ${isDarkMode ? '18' : '55'}%)`, stopOpacity: 1 }} />
              </linearGradient>
              {/* Horizon glow using accent */}
              <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: `hsl(${accentHSL.h}, ${accentHSL.s}%, ${isDarkMode ? '30' : '65'}%)`, stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: `hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '12' : '35'}%)`, stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {/* Sky with brand gradient */}
            <rect x="0" y="0" width="1270" height="775" fill="url(#skyGradient)" />

            {/* Sun (visible in light mode) - uses accent color */}
            <g style={{ opacity: isDarkMode ? 0 : 1, transition: 'opacity 0.5s' }}>
              <circle cx="980" cy="180" r="100" fill={`hsl(${accentHSL.h}, ${accentHSL.s}%, 70%)`} opacity="0.15" />
              <circle cx="980" cy="180" r="85" fill={`hsl(${accentHSL.h}, ${accentHSL.s}%, 60%)`} opacity="0.3" />
              <circle cx="980" cy="180" r="70" fill={`hsl(${accentHSL.h}, ${accentHSL.s}%, 55%)`} filter="url(#glow)" />
            </g>

            {/* Moon (visible in dark mode) */}
            <g style={{ opacity: isDarkMode ? 1 : 0, transition: 'opacity 0.5s' }}>
              <path fill={`hsl(${secondaryHSL.h}, 30%, 85%)`} d="M291 83l-7 1a33 33 0 1 1-29 56c6 14 20 24 36 24a40 40 0 0 0 0-81z" filter="url(#glow)" />
              {/* Stars */}
              <circle cx="150" cy="100" r="2" fill="white" opacity="0.8" />
              <circle cx="400" cy="60" r="1.5" fill="white" opacity="0.6" />
              <circle cx="600" cy="90" r="2" fill="white" opacity="0.7" />
              <circle cx="800" cy="50" r="1.5" fill="white" opacity="0.5" />
              <circle cx="1100" cy="80" r="2" fill="white" opacity="0.6" />
              <circle cx="1000" cy="120" r="1" fill="white" opacity="0.4" />
              <circle cx="200" cy="150" r="1.5" fill="white" opacity="0.5" />
              <circle cx="500" cy="130" r="1" fill="white" opacity="0.6" />
              <circle cx="700" cy="70" r="1" fill="white" opacity="0.7" />
              <circle cx="850" cy="110" r="1.5" fill="white" opacity="0.5" />
            </g>

            {/* Horizon glow */}
            <rect x="0" y="320" width="1270" height="180" fill="url(#horizonGradient)" />

            {/* Birds - Exact CodePen reference structure with proper IDs for wing animations */}
            <g id="bird-container" className="bird-container">
              {/* Bird 1 */}
              <g id="bird-1">
                <g id="bird-body-1" className="bird-body">
                  <path d="M688 173l-6 1c2-1 6-4 11-4h13l2 1h-3l-3 2h-14z"/>
                </g>
                <path id="wing-1" className="bird-wing" d="M695 171c0-1 0-2-2-3-1-2-6-3-9-3h10l3 1 2 5"/>
              </g>
              {/* Bird 2 */}
              <g id="bird-2">
                <g id="bird-body-2" className="bird-body">
                  <path d="M728 190h-6l11-4h13l2 1-3 1-3 1-14 1z"/>
                </g>
                <path id="wing-2" className="bird-wing" d="M735 187l-2-3c-2-2-7-3-9-3h10l2 2 3 4"/>
              </g>
              {/* Bird 3 */}
              <g id="bird-3">
                <g id="bird-body-3" className="bird-body">
                  <path d="M771 204h-6l12-4h12l2 2h-3l-3 1-14 1z"/>
                </g>
                <path id="wing-3" className="bird-wing" d="M778 201l-1-3c-2-2-7-3-9-3h9l3 2 2 4"/>
              </g>
              {/* Bird 4 */}
              <g id="bird-4">
                <g id="bird-body-4" className="bird-body">
                  <path d="M735 222l-7 1 12-5h12l2 2h-2l-3 1c-5 2-14 1-14 1z"/>
                </g>
                <path id="wing-4" className="bird-wing" d="M742 220l-2-4c-2-2-7-3-9-3h10l2 2 2 4"/>
              </g>
              {/* Bird 5 */}
              <g id="bird-5">
                <g id="bird-body-5" className="bird-body">
                  <path d="M693 240l-6 1 12-5h12l2 2h-3l-3 1-14 1z"/>
                </g>
                <path id="wing-5" className="bird-wing" d="M701 238l-2-4c-2-2-7-3-9-3h10l2 2 2 4"/>
              </g>
              {/* Bird 6 */}
              <g id="bird-6">
                <g id="bird-body-6" className="bird-body">
                  <path d="M655 255l-6 1 12-4h12l2 1-3 1-3 1h-14z"/>
                </g>
                <path id="wing-6" className="bird-wing" d="M662 253l-1-3c-2-2-7-3-9-3h9l3 1 2 5"/>
              </g>
            </g>

            {/* Second bird flock - same structure, offset position */}
            <g id="bird-container-2" className="bird-container-2">
              {/* Bird 7 */}
              <g id="bird-7">
                <g className="bird-body">
                  <path d="M650 195l-6 1c2-1 6-4 11-4h13l2 1h-3l-3 2h-14z"/>
                </g>
                <path id="wing-1" className="bird-wing" d="M657 193c0-1 0-2-2-3-1-2-6-3-9-3h10l3 1 2 5"/>
              </g>
              {/* Bird 8 */}
              <g id="bird-8">
                <g className="bird-body">
                  <path d="M690 210h-6l11-4h13l2 1-3 1-3 1-14 1z"/>
                </g>
                <path id="wing-2" className="bird-wing" d="M697 207l-2-3c-2-2-7-3-9-3h10l2 2 3 4"/>
              </g>
              {/* Bird 9 */}
              <g id="bird-9">
                <g className="bird-body">
                  <path d="M620 225l-7 1 12-5h12l2 2h-2l-3 1c-5 2-14 1-14 1z"/>
                </g>
                <path id="wing-3" className="bird-wing" d="M627 223l-2-4c-2-2-7-3-9-3h10l2 2 2 4"/>
              </g>
            </g>

            {/* ===== MOUNTAIN GROUP 1 - Far Background ===== */}
            {/* Bottom Layer (furthest, most transparent) - with texture details */}
            <g opacity="0.4" filter="url(#mountainBlur)">
              <path
                fill={`hsl(${secondaryHSL.h}, ${Math.min(secondaryHSL.s + 20, 100)}%, ${isDarkMode ? '55' : '88'}%)`}
                d="M-50 580 Q50 520 100 480 L120 470 Q140 460 180 430 L220 400 Q260 380 300 350 L320 340 Q360 320 400 360 L440 400 Q480 440 520 420 L560 380 Q600 340 640 360 L680 390 Q720 420 760 380 L800 320 Q840 280 880 260 L920 250 Q960 240 1000 280 L1040 330 Q1080 380 1120 360 L1160 320 Q1200 280 1240 320 L1280 380 Q1300 420 1320 480 L1320 580 Z"
              />
            </g>

            {/* ===== MOUNTAIN GROUP 2 - Mid Background ===== */}
            {/* Bottom Layer */}
            <g opacity="0.55">
              <path
                fill={`hsl(${primaryHSL.h}, ${primaryHSL.s}%, ${isDarkMode ? '50' : '78'}%)`}
                d="M-50 620 Q20 580 80 520 L100 500 Q130 470 170 440 L200 420 Q240 390 280 420 L320 460 Q360 500 400 470 L440 420 Q480 370 520 390 L560 420 Q600 450 640 410 L680 360 Q720 310 760 330 L800 360 Q840 400 880 370 L920 320 Q960 280 1000 310 L1040 350 Q1080 390 1120 370 L1160 340 Q1200 310 1240 350 L1280 400 Q1300 440 1320 500 L1320 620 Z"
              />
            </g>
            {/* Middle Layer with EXTENSIVE texture details like reference st3 */}
            <g opacity="0.65">
              <path
                fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 15, 30)}%, ${isDarkMode ? '58' : '85'}%)`}
                d="M-50 620 Q30 570 90 510 L110 490 Q145 455 190 420 L215 400 Q255 365 300 395 L335 430 Q375 465 420 435 L455 395 Q495 355 540 375 L580 405 Q620 435 660 395 L700 345 Q740 295 780 315 L820 350 Q860 390 900 360 L940 310 Q980 260 1020 290 L1055 325 Q1095 365 1135 340 L1175 305 Q1215 270 1255 305 L1290 350 Q1310 385 1320 450 L1320 620 Z"
              />
              {/* Texture detail paths - pixel-like rock formations mimicking reference st3 */}
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M100 500h-2v2l2-2z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M120 485l1-2 1 1-2 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M150 460h1l-1 1v-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M180 435l2-1-1 2-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M210 415c1 0 1 0 0 0h1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M250 390l-1 2 2-1-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M290 405h2l-1 1-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M330 430l1-2 1 1-2 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M370 445l-1 1 2-1h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M420 420l2-2-1 2h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M460 390c0 1 1 1 0 0l1 1-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M500 375l-1 1 2-1h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M540 385h1l-1 2v-2z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M580 405l2-1-1 2-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M620 420l-1 1 2-1h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M660 385h2l-1-1-1 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M700 355l1-2 1 1-2 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M740 320c1 0 1 0 0 0z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M780 330l-1 2 2-1-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M820 355h2l-1 1-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M860 380l1-2 1 1-2 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M900 355l-1 1 2-1h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M940 325l2-2-1 2h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M980 295c0 1 1 1 0 0l1 1-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1020 305l-1 1 2-1h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1060 335h1l-1 2v-2z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1100 355l2-1-1 2-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1140 335l-1 1 2-1h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1180 310h2l-1-1-1 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1220 320l1-2 1 1-2 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1260 345c1 0 1 0 0 0z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 10, 35)}%, ${isDarkMode ? '62' : '88'}%)`} d="M1300 380l-1 2 2-1-1-1z"/>
              {/* Slightly larger texture patches */}
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M140 470l-2-3 3-1 1 3-2 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M280 410l3-2-2 3-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M400 430l-2-2 3 1-1 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M520 380l2-3-1 3h-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M640 400l-3-2 3-1v3z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M760 340l2-2-1 3-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M880 365l-2-3 3 1-1 2z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M1000 310l3-2-2 3-1-1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M1120 345l-2-2 3 1-1 1z"/>
              <path fill={`hsl(${primaryHSL.h}, ${Math.max(primaryHSL.s - 8, 38)}%, ${isDarkMode ? '64' : '90'}%)`} d="M1240 330l2-3-1 3h-1z"/>
            </g>

            {/* ===== MOUNTAIN GROUP 3 - Main Foreground Mountains (3 layers each with texture) ===== */}

            {/* LEFT MOUNTAIN - Bottom Layer */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 25, 25)}%, ${isDarkMode ? '42' : '72'}%)`}
                d="M-50 700 Q0 650 40 580 L60 550 Q80 520 110 480 L140 440 Q170 400 200 380 L230 360 Q260 340 280 360 L300 390 Q320 420 350 450 L380 490 Q410 540 440 600 L460 650 Q480 700 500 750 L-50 750 Z"
              />
            </g>
            {/* LEFT MOUNTAIN - Middle Layer with texture */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 18, 32)}%, ${isDarkMode ? '52' : '82'}%)`}
                d="M-30 700 Q10 660 50 600 L70 570 Q95 530 130 485 L160 445 Q190 405 225 380 L255 355 Q275 340 290 355 L305 380 Q320 410 345 435 L370 470 Q400 520 425 580 L445 640 Q470 700 490 750 L-30 750 Z"
              />
              {/* Rock texture details */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 12, 38)}%, ${isDarkMode ? '58' : '86'}%)`} d="M100 520l-3-5 4-1 2 4-3 2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 12, 38)}%, ${isDarkMode ? '58' : '86'}%)`} d="M150 470l2-4 3 2-2 3-3-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 12, 38)}%, ${isDarkMode ? '58' : '86'}%)`} d="M200 420l-2-3 4-2 1 4-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 12, 38)}%, ${isDarkMode ? '58' : '86'}%)`} d="M250 390l3-4 2 3-3 2-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 12, 38)}%, ${isDarkMode ? '58' : '86'}%)`} d="M310 410l-1-4 4-1 0 4-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 12, 38)}%, ${isDarkMode ? '58' : '86'}%)`} d="M360 460l2-3 3 1-2 3-3-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 12, 38)}%, ${isDarkMode ? '58' : '86'}%)`} d="M400 530l-2-4 4 0 1 3-3 1z"/>
            </g>
            {/* LEFT MOUNTAIN - Top Layer (brightest/snow) with detailed texture */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '65' : '94'}%)`}
                d="M200 420 Q220 400 240 375 L260 355 Q275 340 285 355 L300 380 Q310 400 325 430 L340 465 Q360 520 375 580 L-10 750 L-10 700 Q40 660 90 600 L120 560 Q150 510 180 460 Z"
              />
              {/* Snow/highlight texture details */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M240 380l-2-3 3-1 1 3-2 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M260 365l2-4 2 2-2 3-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M280 370l-1-3 3-1 1 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M295 390l2-3 2 2-2 2-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M310 420l-2-4 4 0 0 3-2 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M120 580l3-3 1 3-4 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M80 620l-2-3 4-1 0 4-2 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '72' : '97'}%)`} d="M50 660l2-4 2 2-2 3-2-1z"/>
            </g>

            {/* CENTER MOUNTAIN - Bottom Layer */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 22, 28)}%, ${isDarkMode ? '45' : '75'}%)`}
                d="M350 750 Q380 700 420 620 L450 560 Q490 490 540 420 L580 370 Q620 320 660 300 L700 290 Q740 285 780 310 L820 350 Q860 400 900 470 L930 530 Q960 600 990 680 L1010 750 Z"
              />
            </g>
            {/* CENTER MOUNTAIN - Middle Layer with texture */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '85'}%)`}
                d="M380 750 Q410 695 455 610 L490 545 Q535 470 585 395 L625 340 Q665 290 710 270 L750 260 Q790 255 830 280 L870 320 Q910 375 950 450 L980 520 Q1010 600 1030 750 Z"
              />
              {/* Rock texture details */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M500 500l-3-4 4-1 1 4-2 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M550 440l2-5 3 2-2 4-3-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M600 380l-2-4 4-1 1 4-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M660 320l3-4 2 3-3 2-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M720 290l-1-3 4-1 0 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M780 300l2-4 3 2-2 3-3-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M840 340l-2-4 4 0 1 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M900 420l3-3 1 4-4-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 10, 40)}%, ${isDarkMode ? '60' : '88'}%)`} d="M950 500l-2-4 4-1 1 4-3 1z"/>
            </g>
            {/* CENTER MOUNTAIN - Top Layer (brightest/snow) with EXTENSIVE detailed texture like reference */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 45)}%, ${isDarkMode ? '70' : '96'}%)`}
                d="M580 450 Q610 400 650 350 L680 315 Q710 285 745 270 L780 265 Q810 265 840 285 L870 315 Q900 360 925 420 L950 490 Q510 700 420 750 L420 700 Q470 620 530 520 Z"
              />
              {/* Snow/highlight texture - MANY small pixel-like paths mimicking reference st4 style */}
              {/* Peak area - dense texture */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M745 272h-2v2l2-2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M750 268c1 0 1 0 0 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M755 271l-1 2h2l-1-2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M760 269h1v1l-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M765 273l2-1-1 2-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M770 270h-1l1 1v-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M775 272l1-2 1 1-2 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M780 268c0 1 1 1 0 0h1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M785 271l-2 1 1 1 1-2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M790 273h2l-1-2-1 2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M795 269l1 2-2-1 1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M800 274h-1v1l1-1z"/>
              {/* Left slope texture */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M680 318l-1-2 2 1-1 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M690 310h1l-1 1v-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M700 302l2-1-1 2-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M710 295c1 0 2 1 1 1h-1v-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M720 288l-1 2 2-1-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M730 282h2v1l-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M740 276l1 1-2 1 1-2z"/>
              {/* Right slope texture */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M810 280l-1 1 2-1h-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M820 288h1l-1 2v-2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M830 298l2-1-1 2-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M840 308c0 1 1 1 0 0l1 1-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M850 320l-1 2 2-1-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M860 332h2l-1 1-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M870 345l1-2 1 1-2 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M880 360h-1v2l1-2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M890 378l2-1-1 2-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M900 398c1 0 1 1 0 0l1 1h-1v-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M910 420l-1 1 2-1h-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s, 50)}%, ${isDarkMode ? '78' : '99'}%)`} d="M920 445h1l-1 2v-2z"/>
              {/* Mid-section rock texture - varied sizes */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 48)}%, ${isDarkMode ? '75' : '98'}%)`} d="M660 340l-3-2 2-2 2 3-1 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 48)}%, ${isDarkMode ? '75' : '98'}%)`} d="M700 315l2-3-1 3-1 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 48)}%, ${isDarkMode ? '75' : '98'}%)`} d="M735 285c-2 0-2-2 0-2s2 2 0 2z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 48)}%, ${isDarkMode ? '75' : '98'}%)`} d="M805 282l-2 2 3-1-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 48)}%, ${isDarkMode ? '75' : '98'}%)`} d="M845 315l3-2-2 3-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 5, 48)}%, ${isDarkMode ? '75' : '98'}%)`} d="M875 355c2-1 3 1 1 2s-3-1-1-2z"/>
              {/* Lower slope larger patches */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 8, 45)}%, ${isDarkMode ? '73' : '97'}%)`} d="M600 420l-4-3 3-2 2 4-1 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 8, 45)}%, ${isDarkMode ? '73' : '97'}%)`} d="M640 380l3-4-2 4h-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 8, 45)}%, ${isDarkMode ? '73' : '97'}%)`} d="M550 480l-2-3 4-1-1 4h-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 8, 45)}%, ${isDarkMode ? '73' : '97'}%)`} d="M500 540l3-2-2 3-1-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 8, 45)}%, ${isDarkMode ? '73' : '97'}%)`} d="M460 600l-3-2 2-2 2 3-1 1z"/>
            </g>

            {/* RIGHT MOUNTAIN - Bottom Layer */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 28, 22)}%, ${isDarkMode ? '40' : '70'}%)`}
                d="M900 750 Q940 680 990 590 L1030 520 Q1070 450 1120 390 L1160 350 Q1200 320 1240 340 L1280 380 Q1310 420 1320 500 L1320 750 Z"
              />
            </g>
            {/* RIGHT MOUNTAIN - Middle Layer with texture */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 20, 30)}%, ${isDarkMode ? '50' : '80'}%)`}
                d="M930 750 Q970 675 1020 580 L1060 505 Q1100 435 1150 375 L1190 340 Q1230 315 1260 335 L1295 375 Q1315 420 1320 490 L1320 750 Z"
              />
              {/* Rock texture details */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '84'}%)`} d="M1000 600l-2-4 4-1 0 4-2 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '84'}%)`} d="M1050 530l3-4 1 4-4 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '84'}%)`} d="M1100 460l-1-4 4 0 0 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '84'}%)`} d="M1150 400l2-3 2 2-2 2-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '84'}%)`} d="M1200 360l-2-4 4 0 1 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '84'}%)`} d="M1250 360l3-3 1 3-4 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 15, 35)}%, ${isDarkMode ? '55' : '84'}%)`} d="M1290 400l-1-3 3-1 1 3-3 1z"/>
            </g>
            {/* RIGHT MOUNTAIN - Top Layer (brightest/snow) with detailed texture */}
            <g>
              <path
                fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 8, 42)}%, ${isDarkMode ? '65' : '94'}%)`}
                d="M1080 500 Q1110 450 1150 400 L1180 365 Q1210 335 1245 345 L1275 375 Q1300 420 1320 480 L1320 750 L970 750 Q1020 650 1060 550 Z"
              />
              {/* Snow/highlight texture details */}
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1120 470l-2-4 4-1 0 4-2 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1150 420l3-3 1 3-4 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1180 380l-1-4 4 0 0 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1210 355l2-3 2 2-2 2-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1245 355l-2-3 4-1 1 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1275 385l3-4 1 4-4 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1300 430l-1-3 3-1 1 3-3 1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1230 365l2-3 2 2-2 2-2-1z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1260 375l-2-4 4 0 0 4-2 0z"/>
              <path fill={`hsl(${accentHSL.h}, ${Math.max(accentHSL.s - 3, 47)}%, ${isDarkMode ? '72' : '97'}%)`} d="M1290 410l3-3 1 3-4 0z"/>
            </g>

            {/* Snow caps on peaks - detailed with multiple layers */}
            <g opacity={isDarkMode ? 0.75 : 0.95}>
              {/* Left peak snow - multiple overlapping patches */}
              <path fill="white" d="M268 355 Q275 340 282 355 L290 370 Q280 365 270 370 Z" />
              <path fill="white" opacity="0.85" d="M260 365 Q270 350 280 365 L288 378 Q275 373 262 378 Z" />
              <path fill="white" opacity="0.7" d="M255 380 Q268 360 280 380 L290 395 Q275 390 260 395 Z" />
              <path fill="white" opacity="0.5" d="M248 400 Q268 375 288 400 L298 420 Q275 410 252 420 Z" />

              {/* Center peak snow (main summit) - most detailed */}
              <path fill="white" d="M730 260 Q745 245 760 260 L780 275 Q760 270 740 275 Z" />
              <path fill="white" opacity="0.9" d="M720 275 Q745 255 770 275 L785 290 Q755 283 725 290 Z" />
              <path fill="white" opacity="0.8" d="M710 290 Q740 265 770 290 L790 310 Q755 300 720 310 Z" />
              <path fill="white" opacity="0.65" d="M695 315 Q740 280 785 315 L805 340 Q755 325 705 340 Z" />
              <path fill="white" opacity="0.5" d="M680 345 Q740 300 800 345 L820 375 Q755 355 690 375 Z" />
              {/* Snow texture details */}
              <path fill="white" opacity="0.9" d="M735 270l-2-3 4 0 0 3-2 0z"/>
              <path fill="white" opacity="0.9" d="M755 268l2-3 2 2-2 2-2-1z"/>
              <path fill="white" opacity="0.85" d="M745 280l-1-3 3 0 0 3-2 0z"/>
              <path fill="white" opacity="0.8" d="M725 295l2-3 2 2-2 2-2-1z"/>
              <path fill="white" opacity="0.8" d="M765 290l-2-3 4 0 0 3-2 0z"/>

              {/* Right peak snow - multiple patches */}
              <path fill="white" d="M1230 335 Q1245 320 1260 335 L1275 355 Q1250 345 1235 355 Z" />
              <path fill="white" opacity="0.85" d="M1220 350 Q1245 330 1270 350 L1285 370 Q1250 360 1225 370 Z" />
              <path fill="white" opacity="0.7" d="M1210 365 Q1245 340 1280 365 L1295 385 Q1250 375 1215 385 Z" />
              <path fill="white" opacity="0.5" d="M1200 390 Q1245 360 1290 390 L1305 415 Q1250 400 1205 415 Z" />
            </g>

            {/* Tree silhouettes - back layer (st5 style) - organic forest silhouette */}
            <g fill="hsl(232, 73%, 78%)" opacity="0.85">
              <path d="M-50 720c-2 0-3 2-4 0l-1-5-2 2c4 0 0 3-1 4l4 1c-7 2-6-5-10-7 2 1-16 3-16 3l3-1c-2-2-2-4-2-5 1-1-4 3-3 4-6-2-10-9-11-12-3 3 1 2 0 4-2 3-5-4-6-5-1 1-4 2-4-1l3-1c-1 0-3 0-3-2 0 0 3 2 4 1l-5-5c-1 3-3 3-4 3l4 2-3 1 3 2c0 3-4 0-5 0 2 0-3 3-3 3l4 1-10 1c1 3 3 1 4 3l-6 2c2 2 7 0 9 2-3 2-11 2-14 2l-4-2h5c0-3-4-2-5-5h6c-3-2-6-2-9-1l2 3c-5 1-3-1-5-4-5 4-5 11-3 15-2 1-2 0-3-2l2 4c-1 1-2 0-3-1 0-2-13-3-20-6 3-3 2 1 3-2 1-4 4 2 4 3 4-2 1-5-2-7-1 2-5 0-5-1l5 1-4-2c1-3 5-1 7-3-2-1-5-2-3-5-6 2-10 1-15 2l4 8c0 2-6-3-6-4-2 3-1 9-1 8-5 10-12-13-13-13l-7 6 3 3c-4 0 0 7-8 5 2 0 2-14-1-15-10-6-19 12-5 11 0 5-11-1-13-3l3-1c-4-6-9-16-7-3-1-4-5 11-5 13l-4 5 4 2c1 1-2 1-3 1 3 1 0 1-1 2 2 1 0 1-1 2h5c-1 0 2 17-6 15l2-2-6-3h3l-2-1s3 0 3-2c0-1-4-1-3-3l4-2-4-4c0-2 4-2-2-6 4-3 0-4 0-10l-3 1c-9-7 4-6-10-4-3 0-2 5-6 5-2 0-5-10-6-11-3 2-8 10-5 13-3 1-5-3-6 1l-1-4 1 4c-5 1-5 4-7-3 0 3-3 2-3 0l6-2c0-3-2-2-3-3s3-2 3-2c-5-1-4-9-6-13l-7 6c5 7-3 8 0 16-2 0-2 1-3 2l-1-1c-2 2-8 5-3 8l-3 3c2 0-9-12-10-13l2-2-8-10 3 1c-2-5-11-5-9-1h2l-8 14c4-4-9-7-11-7 2 0-7 8-8 9l2-4c-1 0-3 0-4-2l4-1c2-2-2-1-3 0v-6l-7 15-4-8h4c1-2-4 0-2-4l2-1c-7-7-11-7-9 4l-3 1c1 3 0 20-6 8 7-1 1-11-1-14 0 0-2 3-3 2l-1-3-10 4c-6 5-1 6-7 8l5 3s-3 7-4 6c-7-2-14-13-17-20l-4 8c-4 5-7 2-5-3h-3c-1-1 2-3 3-3-5 0-17 1-14 9-1 1-10 3-7 5-3-2-3-9-7-10l2-2c-2-1-7-2-4-6l-2 1c-2-2-1-2-1-5h-3l2 4c-6 0-2 1-5-1 1 1-4 6-5 7s3 2 3 3c-5 3-11-2-15 2-2 1-4 13-6 13-5 0-4-9-2-9l-5-3 2-2c-4 0 2-2-4-1l3-3c-5 0-5-5-8-6-2-1-6 6-7 7l-4-3 3-1c0-2-6-2-7-2 1 0 1-8-4-8-4 1-8 6-11 11-5 8 0 18-9 22 1-2 5-6 1-6 2-8-6-3-7-7 2-1 3 1 5-1-2 0-1-4-1-6l-3 1 1-7c-3-2-8-1-5 1-3 0-3 2-1 4l-4 1c0-4-2 1-4-4 0-1 3 2 3 0 0 0-19-8-22-11 0 0-6 7-6 5l2 6c-1 4-5-1-5 1-1 3 4 1 3 3l-6 8c-3-2-4-2-4-1-1 1-3 2-4 1v-6c-1-1-2 2-2 3 4 0 0 3-1 4 1 0 3-1 4 1-8 1-7-6-10-8 2 1-16 4-16 4l3-2c-2-2-3-3-2-5l-4 4c-5-1-9-8-10-11-3 3 0 2 0 3-2 3-5-4-6-4-1 1-4 2-4-1l3-1-3-2 4 1-5-5-4 3 3 2h-2l3 2c0 3-4 1-5 0 1 1-3 4-3 3l4 1c-2 2-10 3-10 2 1 2 3 0 4 2l-6 3c2 2 6-1 9 2l-14 1-4-2 4 1c0-3-3-2-4-5h6c-3-3-6-2-9-1 0 0 1 3 2 2-5 2-4 0-5-3-5 3-5 11-3 15-2 0-2-1-3-2l2 4c-1 1-2 0-4-1 0-2-13-3-19-6 3-3 2 1 3-3s4 2 4 4c4-3 1-5-2-7-1 2-5-1-5-1h5l-4-2c1-2 5 0 6-3-2-1-4-1-3-5-5 3-9 2-14 3l4 8c0 2-6-3-6-4-2 2-1 9-1 8-5 9-12-13-14-13-1-1-5 5-6 6l3 2c-4 0 0 8-8 5 1 1 2-13-1-15-10-5-20 13-5 11 0 6-11 0-13-2l3-1c-4-6-9-16-8-3 0-4-4 10-4 12l-4 6 4 2-3 1c3 1 0 1-1 1 2 2 0 1-1 3 1 1 3-2 4 0 0 0 3 17-5 15l2-3c-1 1-6-2-6-2h3s-3 0-2-1l3-2c0-2-4-2-3-3l3-2-3-4c0-2 4-2-2-7 4-3 0-4 0-9 0 0-4 0-3 1-9-7 4-6-10-4-3 0-2 4-6 4-2 0-5-9-6-11-3 3-8 11-6 13-2 1-4-2-5 1l-1-4c-1 2 0 3 1 5-5 1-5 3-7-3 0 3-3 1-3-1l6-1c0-3-3-2-3-4l3-1c-5-1-4-9-6-14l-7 7c5 6-3 8 0 15l-3 3-1-2c-2 3-8 6-3 9l-3 3-10-14 2-1-8-10h3c-2-4-11-4-10-1h3c-4 5-5 11-8 15 4-4-9-7-11-8 2 1-7 9-8 9l2-3-4-2 4-1c1-3-2-2-3-1v-5l-7 15-4-8 4-1c1-2-4 0-2-3l2-1c-7-8-11-7-9 4h-3c1 4 0 21-6 9 6-2 1-11-1-15l-3 3-1-4-10 5c-6 4-1 6-7 8 2 2 3 2 5 2l-4 7c-7-3-14-14-17-20l-4 8c-4 4-7 2-5-4l-3 1c-1-1 2-3 2-3-5-1-16 1-13 9-1 0-10 3-7 5-3-3-3-9-7-10l2-2c-2-1-7-2-5-7 0 0-1 3-2 2v-5h-3l2 4c-6-1-2 1-5-1l-5 6c-1 2 3 3 3 4-5 2-11-2-15 1-2 2-4 14-7 14-4-1-3-10-1-10l-5-2 2-2c-4 0 2-2-4-2l3-2c-5 0-5-6-8-7-2-1-6 7-7 8l-4-3 3-1c0-2-6-2-7-2 0 0 1-9-4-8-4 0-8 5-11 11-5 7 0 18-9 22 1-3 5-6 1-6 2-8-6-3-7-8 2 0 3 2 5 0-2 0-1-4-1-6h-3c1-2 2-6 1-7-3-1-8 0-5 1-3 1-3 3-1 5l-4 1c0-4-2 1-4-4 0-1 3 2 3 0l-22-11-6 5 2 6c-1 4-5-1-5 0-1 3 4 1 3 4l-7 7h-3c-1 0-3 2-4 0v-5c-1-1-2 2-2 2 4 0 0 4-1 4 1 1 3 0 4 2-8 1-7-6-10-8 2 1-16 4-16 4 0-2 2-2 3-2-2-2-3-3-2-5l-4 4c-5-2-9-8-11-12-2 3 1 3 1 4-2 3-5-4-6-5-1 2-4 3-4 0 0-2 2-1 3-2-1 0-4 0-3-1l4 1c-1-2-4-5-6-5 0 2-2 2-4 3l4 1-2 1 3 2c0 3-4 0-5 0 1 1-3 3-3 3l4 1c-2 2-10 3-10 2 1 2 3 0 4 2l-7 2c3 3 7 0 10 2-3 2-11 2-14 2l-4-2c1-1 4 1 4 1 0-4-3-3-4-6l6 1c-3-3-6-3-9-2l1 3c-4 2-3 0-4-3-5 3-5 11-3 14-2 1-3 0-3-2l2 5-4-2c0-2-13-3-19-6 2-3 2 1 3-2 1-4 4 2 4 3 4-2 1-5-2-7-1 2-6 0-5-1l4 1-3-2c0-2 5-1 6-3-2-1-4-2-3-5-5 3-9 2-14 2l4 8c0 3-6-2-7-3v7c-5 10-12-12-14-13l-6 7 3 2c-5 0 0 7-8 5 1 0 2-13-1-15-10-5-20 13-5 11-1 6-11-1-14-3l3-1c-3-6-8-15-7-3 0-4-4 11-4 13l-4 5 4 2c0 2-2 1-3 1 3 1 0 2-1 2 2 2 0 1-2 2 2 1 4-1 5 1 0-1 3 17-5 14l1-2-5-2h3l-2-1c0-1 3-1 3-3 0-1-4-1-3-2l3-3c-1-1-3-2-3-4-1-1 4-2-2-6 4-3 0-4 0-10l-3 1c-9-7 4-6-10-4-3 1-2 5-6 5-2 0-5-10-6-11-3 3-8 11-6 13-2 1-4-2-5 1l-1-4v5c-4 0-4 3-6-4 0 4-3 2-3 0l6-2c0-3-3-2-4-3l4-2c-5 0-4-9-6-13l-7 7c5 6-3 7 0 15l-3 2-1-1c-2 3-8 6-3 8l-3 4-10-14 2-1-8-11 3 1c-2-5-11-4-10-1h3c-4 4-5 11-8 15 3-5-9-8-11-8 2 1-8 9-8 9l2-3-4-2 4-1c1-3-3-2-3-1v-5l-8 14-3-8h4c1-2-4 0-3-3l3-1c-7-8-11-8-9 4h-3c1 4 0 21-6 9 6-2 1-11-1-15 0 0-2 3-3 2l-1-3-10 4c-6 5-1 6-7 9l5 2c0 1-3 7-5 7-6-3-13-14-16-20l-4 7c-4 5-7 3-5-3h-3c-1-1 2-2 2-3-5 0-16 1-13 10-1 0-10 2-7 5-3-3-3-10-7-11l2-1c-3-1-7-2-5-7 0 0-1 3-2 2v-5h-3l1 3c-5 0-1 2-4-1 1 1-5 6-5 7-1 1 2 3 3 3-5 3-11-2-16 2-1 1-3 13-6 13-4 0-3-9-1-9l-5-2 2-2c-4 0 2-2-4-2l3-2c-5 0-5-6-8-7-2-1-6 7-7 8l-4-3 3-1c0-2-6-2-7-2 0 0 1-9-4-8-4 0-9 5-11 10-5 8 0 19-10 22 1-2 6-6 2-6 2-8-6-2-7-7h5c-2-1-2-5-1-6h-3c1-2 2-6 1-7-3-2-9-1-5 1-3 0-3 2-1 4l-4 2c0-4-2 0-4-4 0-1 3 2 3-1l-22-10c-1 0-6 6-7 4 1 2 3 5 2 7 0 3-4-1-4 0-1 3 4 1 3 4-1 2-7 5-7 8v55h1400V720z"/>
            </g>

            {/* Tree silhouettes - front layer (like reference st6) - organic continuous silhouette */}
            <g fill={`hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '12' : '28'}%)`}>
              {/* Continuous organic tree line - mimics reference's complex st6 path */}
              <path d="M-50 775v-30l5-8 2 4 3-12 2 6 4-15 3 8 3-10 2 5 4-18 3 10 5-20 4 12 3-8 2 4 5-15 4 10 3-12 2 6 4-16 3 9 4-12 3 7 3-10 2 5 5-18 4 12 3-8 2 4 5-15 4 10 3-12 2 6 4-16 3 9 4-12 3 7 5-18 4 12 3-8 2 4 5-15 4 10 3-12 2 6 4-16 3 9 4-12 3 7 3-10 2 5 5-18 4 12 3-8 2 4 5-15 4 10 3-12 2 6 4-16 3 9 4-12 3 7 5-18 4 12 3-8 2 4 5-15 4 10 3-12 2 6 4-16 3 9 4-12 3 7 3-10 2 5 5-18 4 12 3-8 2 4 5-15 4 10 3-12 2 6 4-16 3 9 4-12 3 7 5-18 4 12 3-8 2 4 5-15 4 10 3-12 2 6 4-16 3 9 4-12 3 7v45z"/>
              {/* Individual prominent trees with more detail */}
              <path d="M-30 750l12-40 4 12 7-25 4 15 5-18 3 12 4-12 12 56h-51z"/>
              <path d="M80 745l10-35 3 10 6-22 3 13 4-16 3 10 3-10 10 50h-42z"/>
              <path d="M180 755l11-38 4 11 6-24 4 14 5-17 3 11 4-11 11 54h-48z"/>
              <path d="M300 748l9-32 3 9 5-20 3 12 4-14 2 9 3-9 9 45h-38z"/>
              <path d="M430 752l10-35 3 10 6-22 3 13 4-16 3 10 3-10 10 50h-42z"/>
              <path d="M560 745l11-38 4 11 6-24 4 14 5-17 3 11 4-11 11 54h-48z"/>
              <path d="M700 750l9-32 3 9 5-20 3 12 4-14 2 9 3-9 9 45h-38z"/>
              <path d="M840 755l10-35 3 10 6-22 3 13 4-16 3 10 3-10 10 50h-42z"/>
              <path d="M980 748l11-38 4 11 6-24 4 14 5-17 3 11 4-11 11 54h-48z"/>
              <path d="M1120 752l9-32 3 9 5-20 3 12 4-14 2 9 3-9 9 45h-38z"/>
              <path d="M1250 745l10-35 3 10 6-22 3 13 4-16 3 10 3-10 10 50h-42z"/>
              {/* Additional small texture trees for density */}
              <path d="M40 755l5-15 2 5 3-10 2 6 3-8 5 22h-20z"/>
              <path d="M140 752l4-12 2 4 3-8 2 5 2-6 4 17h-17z"/>
              <path d="M260 758l5-14 2 5 3-9 2 5 3-7 5 20h-20z"/>
              <path d="M380 754l4-11 2 4 3-7 2 4 2-5 4 15h-17z"/>
              <path d="M500 756l5-14 2 5 3-9 2 5 3-7 5 20h-20z"/>
              <path d="M620 753l4-12 2 4 3-8 2 5 2-6 4 17h-17z"/>
              <path d="M760 757l5-14 2 5 3-9 2 5 3-7 5 20h-20z"/>
              <path d="M900 754l4-11 2 4 3-7 2 4 2-5 4 15h-17z"/>
              <path d="M1050 756l5-14 2 5 3-9 2 5 3-7 5 20h-20z"/>
              <path d="M1180 753l4-12 2 4 3-8 2 5 2-6 4 17h-17z"/>
              <path d="M1300 755l5-14 2 5 3-9 2 5 3-7 5 20h-20z"/>
            </g>

            {/* Foreground terrain/hills - dark silhouette */}
            <path
              fill={`hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '6' : '15'}%)`}
              d="M-50 775 Q100 730 250 745 Q400 760 550 735 Q700 710 850 730 Q1000 750 1150 725 Q1250 710 1320 740 L1320 775 Z"
            />
            <path
              fill={`hsl(${secondaryHSL.h}, ${secondaryHSL.s}%, ${isDarkMode ? '4' : '10'}%)`}
              d="M-50 775 Q150 755 350 765 Q550 775 750 760 Q950 745 1150 765 L1320 775 Z"
            />

            {/* Financial Data Markers - Flags planted on mountain with readable labels */}
            {years.map((year, index) => {
              const pos = getMarkerPosition(index, year.revenue);
              const profit = year.revenue - year.expenses;
              const isProfitable = profit > 0;
              const labelBg = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)';
              const labelText = isDarkMode ? '#ffffff' : '#1a1a2e';

              return (
                <g key={index} className="flag-animate" style={{ animationDelay: `${index * 0.2}s` }}>
                  {/* Glow effect under marker */}
                  <circle cx={pos.x} cy={pos.y} r="20" fill={brandColors.accent} opacity="0.25" />

                  {/* Flag pole */}
                  <line
                    x1={pos.x} y1={pos.y} x2={pos.x} y2={pos.y - 55}
                    stroke={brandColors.primary}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Flag */}
                  <path
                    d={`M${pos.x} ${pos.y - 55} L${pos.x + 30} ${pos.y - 47} L${pos.x} ${pos.y - 39} Z`}
                    fill={isProfitable ? brandColors.accent : '#ef4444'}
                    stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                    strokeWidth="1"
                  />

                  {/* Base marker */}
                  <circle cx={pos.x} cy={pos.y} r="7" fill={brandColors.primary} stroke="white" strokeWidth="2" />

                  {/* Label background for readability */}
                  <rect
                    x={pos.x - 45}
                    y={pos.y - 78}
                    width="90"
                    height="22"
                    rx="4"
                    fill={labelBg}
                    filter="url(#labelShadow)"
                  />

                  {/* Year label */}
                  <text
                    x={pos.x}
                    y={pos.y - 62}
                    textAnchor="middle"
                    fill={labelText}
                    fontSize="14"
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    Year {year.year}
                  </text>

                  {/* Data background */}
                  <rect
                    x={pos.x - 50}
                    y={pos.y + 12}
                    width="100"
                    height="42"
                    rx="4"
                    fill={labelBg}
                    filter="url(#labelShadow)"
                  />

                  {/* Revenue */}
                  <text
                    x={pos.x}
                    y={pos.y + 30}
                    textAnchor="middle"
                    fill={labelText}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {formatCurrency(year.revenue)}
                  </text>

                  {/* Profit indicator */}
                  <text
                    x={pos.x}
                    y={pos.y + 48}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill={isProfitable ? '#22c55e' : '#ef4444'}
                  >
                    {isProfitable ? '▲' : '▼'} {formatCurrency(Math.abs(profit))}
                  </text>
                </g>
              );
            })}

            {/* Journey path connecting markers */}
            <path
              d={`M${years.map((year, i) => {
                const pos = getMarkerPosition(i, year.revenue);
                return `${i === 0 ? 'M' : 'L'}${pos.x} ${pos.y}`;
              }).join(' ')}`}
              fill="none"
              stroke={brandColors.primary}
              strokeWidth="3"
              strokeDasharray="12 6"
              opacity="0.7"
              strokeLinecap="round"
            />

            {/* Summit indicator for highest revenue year */}
            {(() => {
              const maxYear = years.reduce((max, y) => y.revenue > max.revenue ? y : max, years[0]);
              const maxIndex = years.indexOf(maxYear);
              const pos = getMarkerPosition(maxIndex, maxYear.revenue);
              const labelBg = isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
              const labelText = isDarkMode ? '#ffffff' : '#1a1a2e';
              return (
                <g>
                  <rect
                    x={pos.x - 65}
                    y={pos.y - 105}
                    width="130"
                    height="26"
                    rx="6"
                    fill={labelBg}
                    filter="url(#labelShadow)"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 87}
                    textAnchor="middle"
                    fill={labelText}
                    fontSize="15"
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    🏆 Peak Growth
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brandColors.accent }}></div>
            <span>Profitable Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Loss Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: brandColors.primary }}></div>
            <span>Growth Path</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthMountainVisual;
