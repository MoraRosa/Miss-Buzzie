import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bookmark, 
  Star, 
  Trash2, 
  ExternalLink, 
  ChevronDown,
  ChevronUp,
  Calendar,
  Globe,
  Users,
  Scale
} from "lucide-react";
import type { SavedBrandName } from "@/lib/validators/schemas";

interface SavedSearchesProps {
  savedNames: SavedBrandName[];
  onLoad: (saved: SavedBrandName) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const SavedSearches = ({ savedNames, onLoad, onDelete, onToggleFavorite }: SavedSearchesProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Sort by favorite first, then by date
  const sortedNames = [...savedNames].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayNames = showAll ? sortedNames : sortedNames.slice(0, 5);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-lime-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getAvailabilitySummary = (saved: SavedBrandName) => {
    const domainAvail = saved.domains.filter(d => d.status === "available").length;
    const socialAvail = saved.socialMedia.filter(s => s.status === "available").length;
    const tmClear = saved.trademarks.filter(t => t.status === "clear").length;
    const tmConflict = saved.trademarks.filter(t => t.status === "conflict").length;
    
    return { domainAvail, socialAvail, tmClear, tmConflict };
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          Saved Searches
        </CardTitle>
        <CardDescription>
          Compare and manage your brand name research
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayNames.map((saved) => {
            const summary = getAvailabilitySummary(saved);
            const isExpanded = expanded === saved.id;
            
            return (
              <Card 
                key={saved.id} 
                className={`transition-all ${saved.isFavorite ? "border-amber-300 dark:border-amber-700" : ""}`}
              >
                <CardContent className="p-3">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite(saved.id)}
                        className={`h-8 w-8 p-0 ${saved.isFavorite ? "text-amber-500" : "text-muted-foreground"}`}
                      >
                        <Star className={`h-4 w-4 ${saved.isFavorite ? "fill-current" : ""}`} />
                      </Button>
                      <div>
                        <h4 className="font-semibold text-lg">{saved.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(saved.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {saved.overallScore !== undefined && (
                        <Badge variant="outline" className={getScoreColor(saved.overallScore)}>
                          {saved.overallScore}%
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(isExpanded ? null : saved.id)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-blue-500" />
                      <span>{summary.domainAvail} domains</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-purple-500" />
                      <span>{summary.socialAvail} handles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Scale className={`h-3 w-3 ${summary.tmConflict > 0 ? "text-red-500" : "text-green-500"}`} />
                      <span>{summary.tmClear} clear{summary.tmConflict > 0 && `, ${summary.tmConflict} conflicts`}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid gap-2 text-sm">
                        {saved.domains.length > 0 && (
                          <div>
                            <strong>Domains:</strong> {saved.domains.map(d => 
                              `${d.domain}${d.tld} (${d.status})`
                            ).join(", ")}
                          </div>
                        )}
                        {saved.socialMedia.length > 0 && (
                          <div>
                            <strong>Social:</strong> {saved.socialMedia.map(s => 
                              `${s.platform} (${s.status})`
                            ).join(", ")}
                          </div>
                        )}
                        {saved.notes && (
                          <div>
                            <strong>Notes:</strong> {saved.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => onLoad(saved)} className="flex-1">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Load
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDelete(saved.id)}
                      className="px-3"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {savedNames.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full mt-3"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : `Show All (${savedNames.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedSearches;

