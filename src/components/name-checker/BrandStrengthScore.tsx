import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trophy, AlertCircle, CheckCircle2, XCircle, Minus } from "lucide-react";
import type { DomainCheck, SocialMediaCheck, AppStoreCheck, TrademarkCheck } from "@/lib/validators/schemas";

interface BrandStrengthScoreProps {
  brandName: string;
  domains: DomainCheck[];
  socialMedia: SocialMediaCheck[];
  appStores: AppStoreCheck[];
  trademarks: TrademarkCheck[];
  onScoreCalculated: (score: number) => void;
}

interface ScoreFactor {
  name: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "bad" | "neutral";
  details: string;
}

const StatusIcon = ({ status }: { status: ScoreFactor["status"] }) => {
  switch (status) {
    case "good": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "warning": return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case "bad": return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

const BrandStrengthScore = ({ brandName, domains, socialMedia, appStores, trademarks, onScoreCalculated }: BrandStrengthScoreProps) => {
  // Calculate score factors
  const scoreFactors = useMemo((): ScoreFactor[] => {
    const factors: ScoreFactor[] = [];
    
    // 1. Domain .com availability (25 points)
    const comDomain = domains.find(d => d.tld === ".com" && d.domain === brandName);
    if (comDomain) {
      if (comDomain.status === "available") {
        factors.push({ name: ".com Domain", score: 25, maxScore: 25, status: "good", details: `${brandName}.com is available!` });
      } else if (comDomain.status === "taken") {
        factors.push({ name: ".com Domain", score: 0, maxScore: 25, status: "bad", details: `${brandName}.com is taken` });
      } else {
        factors.push({ name: ".com Domain", score: 0, maxScore: 25, status: "neutral", details: "Not yet verified" });
      }
    }
    
    // 2. Alternative domains (15 points)
    const altDomains = domains.filter(d => d.domain === brandName && d.tld !== ".com");
    const availableAlt = altDomains.filter(d => d.status === "available").length;
    const altScore = Math.min(15, (availableAlt / Math.max(1, altDomains.length)) * 15);
    if (altDomains.length > 0) {
      factors.push({
        name: "Alternative Domains",
        score: Math.round(altScore),
        maxScore: 15,
        status: altScore > 10 ? "good" : altScore > 5 ? "warning" : "bad",
        details: `${availableAlt}/${altDomains.length} alternative TLDs available`,
      });
    }
    
    // 3. Social media handles (25 points)
    const checkedSocial = socialMedia.filter(s => s.status !== "unknown");
    const availableSocial = socialMedia.filter(s => s.status === "available").length;
    if (socialMedia.length > 0) {
      const socialScore = (availableSocial / socialMedia.length) * 25;
      factors.push({
        name: "Social Media",
        score: Math.round(socialScore),
        maxScore: 25,
        status: socialScore > 18 ? "good" : socialScore > 10 ? "warning" : "bad",
        details: `${availableSocial}/${socialMedia.length} handles available`,
      });
    }
    
    // 4. Trademark clearance (25 points)
    const clearTM = trademarks.filter(t => t.status === "clear").length;
    const conflictTM = trademarks.filter(t => t.status === "conflict").length;
    if (trademarks.length > 0) {
      let tmScore = 0;
      let tmStatus: ScoreFactor["status"] = "neutral";
      if (conflictTM > 0) {
        tmScore = 0;
        tmStatus = "bad";
      } else if (clearTM === trademarks.length) {
        tmScore = 25;
        tmStatus = "good";
      } else if (clearTM > 0) {
        tmScore = (clearTM / trademarks.length) * 25;
        tmStatus = "warning";
      }
      factors.push({
        name: "Trademark Search",
        score: Math.round(tmScore),
        maxScore: 25,
        status: tmStatus,
        details: conflictTM > 0 ? `${conflictTM} conflict(s) found!` : `${clearTM}/${trademarks.length} clear`,
      });
    }
    
    // 5. Brand name characteristics (10 points)
    let nameScore = 10;
    let nameDetails: string[] = [];
    
    if (brandName.length <= 6) {
      nameDetails.push("Short & memorable");
    } else if (brandName.length > 15) {
      nameScore -= 3;
      nameDetails.push("Quite long");
    }
    
    if (!/[0-9]/.test(brandName) && !/[-_]/.test(brandName)) {
      nameDetails.push("Clean (no numbers/hyphens)");
    } else {
      nameScore -= 2;
      nameDetails.push("Contains numbers or special chars");
    }
    
    if (/^[a-z]+$/.test(brandName)) {
      nameDetails.push("Easy to spell");
    }
    
    factors.push({
      name: "Name Quality",
      score: Math.max(0, nameScore),
      maxScore: 10,
      status: nameScore >= 8 ? "good" : nameScore >= 5 ? "warning" : "bad",
      details: nameDetails.join(", ") || "Standard",
    });
    
    return factors;
  }, [brandName, domains, socialMedia, appStores, trademarks]);

  // Calculate total score
  const totalScore = useMemo(() => {
    const total = scoreFactors.reduce((sum, f) => sum + f.score, 0);
    const max = scoreFactors.reduce((sum, f) => sum + f.maxScore, 0);
    return max > 0 ? Math.round((total / max) * 100) : 0;
  }, [scoreFactors]);

  // Report score to parent
  useEffect(() => {
    onScoreCalculated(totalScore);
  }, [totalScore, onScoreCalculated]);

  // Get score color and label
  const getScoreInfo = (score: number) => {
    if (score >= 80) return { color: "text-green-500", bg: "bg-green-500", label: "Excellent" };
    if (score >= 60) return { color: "text-lime-500", bg: "bg-lime-500", label: "Good" };
    if (score >= 40) return { color: "text-amber-500", bg: "bg-amber-500", label: "Fair" };
    if (score >= 20) return { color: "text-orange-500", bg: "bg-orange-500", label: "Poor" };
    return { color: "text-red-500", bg: "bg-red-500", label: "Critical" };
  };

  const scoreInfo = getScoreInfo(totalScore);

  return (
    <AccordionItem value="score" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <Trophy className={`h-5 w-5 ${scoreInfo.color}`} />
          <div className="text-left">
            <div className="font-semibold">Brand Strength Score</div>
            <div className="text-sm text-muted-foreground font-normal">
              <span className={`font-bold ${scoreInfo.color}`}>{totalScore}/100</span> - {scoreInfo.label}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {/* Score Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={`text-2xl font-bold ${scoreInfo.color}`}>{totalScore}%</span>
          </div>
          <Progress value={totalScore} className={`h-3 ${scoreInfo.bg}`} />
          <p className="text-sm text-muted-foreground mt-2">
            {totalScore >= 80 && "🎉 Great choice! This brand name has strong availability across most platforms."}
            {totalScore >= 60 && totalScore < 80 && "👍 Good potential, but some platforms may require alternatives."}
            {totalScore >= 40 && totalScore < 60 && "⚠️ Mixed results. Consider variations or alternatives."}
            {totalScore < 40 && "🚨 Significant availability issues. Consider a different name."}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Score Breakdown</h4>
          {scoreFactors.map((factor, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={factor.status} />
                    <span className="font-medium">{factor.name}</span>
                  </div>
                  <span className={`font-bold ${
                    factor.status === "good" ? "text-green-500" :
                    factor.status === "warning" ? "text-amber-500" :
                    factor.status === "bad" ? "text-red-500" : "text-gray-400"
                  }`}>
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
                <div className="mt-2">
                  <Progress
                    value={(factor.score / factor.maxScore) * 100}
                    className="h-1.5"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{factor.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendations based on score */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">💡 Quick Recommendations</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {scoreFactors.find(f => f.name === ".com Domain" && f.status === "good") && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Register the .com domain immediately
              </li>
            )}
            {scoreFactors.find(f => f.name === ".com Domain" && f.status === "bad") && (
              <li className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                Consider domain variations (get-, -app, -hq)
              </li>
            )}
            {scoreFactors.find(f => f.name === "Social Media" && f.status !== "good") && (
              <li className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                Secure available social handles now
              </li>
            )}
            {scoreFactors.find(f => f.name === "Trademark Search" && f.status === "bad") && (
              <li className="flex items-center gap-2">
                <XCircle className="h-3 w-3 text-red-500" />
                Consult a trademark attorney before proceeding
              </li>
            )}
            {scoreFactors.find(f => f.name === "Trademark Search" && f.status === "neutral") && (
              <li className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                Complete trademark searches in your target markets
              </li>
            )}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BrandStrengthScore;

