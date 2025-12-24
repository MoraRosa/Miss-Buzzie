/**
 * Station 5: Brand Score Dashboard
 * 
 * Visual score breakdown with animated progress and category scores.
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Globe, Users, Scale, CheckCircle, XCircle,
  AlertCircle, TrendingUp, Star
} from "lucide-react";
import type { StationProps } from "../types";

// Calculate individual category scores
const calculateDomainScore = (domains: StationProps["currentSearch"]["domains"]) => {
  if (domains.length === 0) return { score: 0, available: 0, total: 0 };
  const available = domains.filter(d => d.status === "available").length;
  const comAvailable = domains.find(d => d.tld === ".com")?.status === "available";
  // .com is worth more
  const score = ((available / domains.length) * 70) + (comAvailable ? 30 : 0);
  return { score: Math.round(Math.min(score, 100)), available, total: domains.length };
};

const calculateSocialScore = (social: StationProps["currentSearch"]["socialMedia"]) => {
  if (social.length === 0) return { score: 0, available: 0, total: 0 };
  const available = social.filter(s => s.status === "available").length;
  const majorPlatforms = ["twitter", "instagram", "tiktok"];
  const majorAvailable = social.filter(s => majorPlatforms.includes(s.platform) && s.status === "available").length;
  // Major platforms worth more
  const score = ((available / social.length) * 60) + ((majorAvailable / 3) * 40);
  return { score: Math.round(Math.min(score, 100)), available, total: social.length };
};

const calculateTrademarkScore = (trademarks: StationProps["currentSearch"]["trademarks"]) => {
  if (trademarks.length === 0) return { score: 0, clear: 0, conflict: 0, total: 0 };
  const clear = trademarks.filter(t => t.status === "clear").length;
  const conflict = trademarks.filter(t => t.status === "conflict").length;
  // Conflicts are heavily penalized
  const score = ((clear / trademarks.length) * 100) - (conflict * 30);
  return { score: Math.round(Math.max(0, Math.min(score, 100))), clear, conflict, total: trademarks.length };
};

const getScoreGrade = (score: number): { grade: string; color: string; emoji: string } => {
  if (score >= 90) return { grade: "A+", color: "text-green-500", emoji: "🏆" };
  if (score >= 80) return { grade: "A", color: "text-green-500", emoji: "⭐" };
  if (score >= 70) return { grade: "B+", color: "text-lime-500", emoji: "👍" };
  if (score >= 60) return { grade: "B", color: "text-yellow-500", emoji: "👌" };
  if (score >= 50) return { grade: "C", color: "text-orange-500", emoji: "⚠️" };
  if (score >= 40) return { grade: "D", color: "text-orange-600", emoji: "🔶" };
  return { grade: "F", color: "text-red-500", emoji: "❌" };
};

const ScoreStation = ({ brandName, currentSearch, updateSearch, markStationComplete }: StationProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  const domainStats = calculateDomainScore(currentSearch.domains);
  const socialStats = calculateSocialScore(currentSearch.socialMedia);
  const trademarkStats = calculateTrademarkScore(currentSearch.trademarks);

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (domainStats.score * 0.35) + 
    (socialStats.score * 0.30) + 
    (trademarkStats.score * 0.35)
  );

  const { grade, color, emoji } = getScoreGrade(overallScore);

  // Animate the score
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = overallScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= overallScore) {
        setAnimatedScore(overallScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [overallScore]);

  // Save score and mark complete
  useEffect(() => {
    if (overallScore > 0) {
      updateSearch({ overallScore });
      markStationComplete();
    }
  }, [overallScore, updateSearch, markStationComplete]);

  const CategoryCard = ({ 
    icon: Icon, 
    title, 
    score, 
    stats, 
    color: cardColor 
  }: {
    icon: typeof Globe;
    title: string;
    score: number;
    stats: string;
    color: string;
  }) => (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${cardColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-medium">{title}</span>
        </div>
        <span className="text-2xl font-bold">{score}%</span>
      </div>
      <Progress value={score} className="h-2" />
      <p className="text-sm text-muted-foreground">{stats}</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Main Score Circle */}
      <div className="flex flex-col items-center py-8">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-48 h-48 rounded-full border-8 border-muted flex items-center justify-center">
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(animatedScore / 100) * 553} 553`}
                className={`${color} transition-all duration-1000`}
              />
            </svg>
            {/* Score display */}
            <div className="text-center">
              <div className="text-5xl font-bold">{animatedScore}</div>
              <div className={`text-2xl font-bold ${color}`}>{grade}</div>
            </div>
          </div>
          {/* Emoji badge */}
          <div className="absolute -top-2 -right-2 text-4xl">{emoji}</div>
        </div>
        
        <h3 className="text-xl font-semibold mt-4">{brandName}</h3>
        <p className="text-muted-foreground">Brand Strength Score</p>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CategoryCard
          icon={Globe}
          title="Domains"
          score={domainStats.score}
          stats={`${domainStats.available}/${domainStats.total} available`}
          color="bg-blue-500/10 text-blue-500"
        />
        <CategoryCard
          icon={Users}
          title="Social Media"
          score={socialStats.score}
          stats={`${socialStats.available}/${socialStats.total} available`}
          color="bg-purple-500/10 text-purple-500"
        />
        <CategoryCard
          icon={Scale}
          title="Trademarks"
          score={trademarkStats.score}
          stats={`${trademarkStats.clear} clear, ${trademarkStats.conflict} conflicts`}
          color="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Score Interpretation */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium">Score Interpretation</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {overallScore >= 80 ? (
                "Excellent! Your brand name has strong availability across all categories. You're in a great position to secure your brand identity."
              ) : overallScore >= 60 ? (
                "Good potential! Some areas need attention, but overall your brand name is viable. Check the Action Plan for specific recommendations."
              ) : overallScore >= 40 ? (
                "Moderate availability. Consider alternative names or be prepared to negotiate for some assets. Review conflicts carefully."
              ) : (
                "Limited availability. This name may face significant challenges. Consider exploring alternative names or variations."
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
          <div className="text-lg font-bold">
            {domainStats.available + socialStats.available + trademarkStats.clear}
          </div>
          <div className="text-xs text-muted-foreground">Available</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
          <div className="text-lg font-bold">
            {(domainStats.total - domainStats.available) +
             (socialStats.total - socialStats.available) +
             trademarkStats.conflict}
          </div>
          <div className="text-xs text-muted-foreground">Unavailable</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <div className="text-lg font-bold">{trademarkStats.conflict}</div>
          <div className="text-xs text-muted-foreground">TM Conflicts</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Star className="h-5 w-5 text-primary mx-auto mb-1" />
          <div className="text-lg font-bold">{grade}</div>
          <div className="text-xs text-muted-foreground">Grade</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreStation;

