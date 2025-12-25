import { SavedBrandName } from "@/lib/validators/schemas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, X, Minus, Star, Globe, AtSign, 
  Shield, TrendingUp, ArrowRight
} from "lucide-react";

interface ComparisonViewProps {
  searches: SavedBrandName[];
  onSelect: (search: SavedBrandName) => void;
  onClose: () => void;
}

const ComparisonView = ({ searches, onSelect, onClose }: ComparisonViewProps) => {
  if (searches.length < 2) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Save at least 2 brand names to compare them side-by-side.
        </p>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
      case "clear":
        return <Check className="h-4 w-4 text-green-500" />;
      case "taken":
      case "conflict":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get top domains to compare
  const topDomains = [".com", ".io", ".co", ".ai", ".dev"];
  // Get top social platforms
  const topSocial = ["twitter", "instagram", "tiktok", "youtube"];

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Compare Brand Names</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>

      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium text-muted-foreground">Criteria</th>
            {searches.slice(0, 4).map(s => (
              <th key={s.id} className="text-center p-2 min-w-[140px]">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">{s.name}</span>
                  {s.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Overall Score */}
          <tr className="border-b bg-muted/30">
            <td className="p-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Overall Score
            </td>
            {searches.slice(0, 4).map(s => (
              <td key={s.id} className="text-center p-2">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${getScoreColor(s.overallScore)} flex items-center justify-center text-white text-sm font-bold`}>
                    {s.overallScore}
                  </div>
                </div>
              </td>
            ))}
          </tr>

          {/* Domains */}
          <tr className="border-b">
            <td className="p-2 flex items-center gap-2 font-medium">
              <Globe className="h-4 w-4" /> Domains
            </td>
            <td colSpan={searches.length} />
          </tr>
          {topDomains.map(tld => (
            <tr key={tld} className="border-b">
              <td className="p-2 pl-8 text-sm text-muted-foreground">{tld}</td>
              {searches.slice(0, 4).map(s => {
                const domain = s.domains.find(d => d.tld === tld);
                return (
                  <td key={s.id} className="text-center p-2">
                    {domain ? getStatusIcon(domain.status) : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Social Media */}
          <tr className="border-b">
            <td className="p-2 flex items-center gap-2 font-medium">
              <AtSign className="h-4 w-4" /> Social Media
            </td>
            <td colSpan={searches.length} />
          </tr>
          {topSocial.map(platform => (
            <tr key={platform} className="border-b">
              <td className="p-2 pl-8 text-sm text-muted-foreground capitalize">{platform}</td>
              {searches.slice(0, 4).map(s => {
                const social = s.socialMedia.find(sm => sm.platform.toLowerCase() === platform);
                return (
                  <td key={s.id} className="text-center p-2">
                    {social ? getStatusIcon(social.status) : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Trademarks */}
          <tr className="border-b">
            <td className="p-2 flex items-center gap-2 font-medium">
              <Shield className="h-4 w-4" /> Trademarks
            </td>
            {searches.slice(0, 4).map(s => {
              const clear = s.trademarks.filter(t => t.status === "clear").length;
              const conflict = s.trademarks.filter(t => t.status === "conflict").length;
              return (
                <td key={s.id} className="text-center p-2">
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <span className="text-green-600">{clear} clear</span>
                    {conflict > 0 && <span className="text-red-600">{conflict} conflict</span>}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Action Row */}
          <tr>
            <td className="p-2" />
            {searches.slice(0, 4).map(s => (
              <td key={s.id} className="text-center p-2">
                <Button size="sm" variant="outline" onClick={() => onSelect(s)}>
                  Select <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default ComparisonView;

