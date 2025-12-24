/**
 * Station 4: Trademark Verification
 * 
 * Check trademark availability across jurisdictions.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Scale, Check, X, Loader2, ExternalLink, AlertTriangle,
  Plus, HelpCircle, Globe
} from "lucide-react";
import type { StationProps } from "../types";
import type { TrademarkCheck } from "@/lib/validators/schemas";

// Trademark office configurations
const TRADEMARK_OFFICES = [
  { countryCode: "US", country: "United States", flag: "🇺🇸", office: "USPTO", fullName: "United States Patent and Trademark Office", searchUrl: (n: string) => `https://tmsearch.uspto.gov/bin/gate.exe?f=searchss&state=4809:1gzq8e.1.1` },
  { countryCode: "CA", country: "Canada", flag: "🇨🇦", office: "CIPO", fullName: "Canadian Intellectual Property Office", searchUrl: (n: string) => `https://www.ic.gc.ca/app/opic-cipo/trdmrks/srch/home?lang=eng` },
  { countryCode: "NG", country: "Nigeria", flag: "🇳🇬", office: "NIPO", fullName: "Nigeria Trademarks Registry", searchUrl: (n: string) => `https://iponigeria.com/tm-search/` },
  { countryCode: "GB", country: "United Kingdom", flag: "🇬🇧", office: "UKIPO", fullName: "UK Intellectual Property Office", searchUrl: (n: string) => `https://www.gov.uk/search-for-trademark` },
  { countryCode: "EU", country: "European Union", flag: "🇪🇺", office: "EUIPO", fullName: "European Union Intellectual Property Office", searchUrl: (n: string) => `https://euipo.europa.eu/eSearch/` },
  { countryCode: "AU", country: "Australia", flag: "🇦🇺", office: "IP Australia", fullName: "IP Australia", searchUrl: (n: string) => `https://search.ipaustralia.gov.au/trademarks/search/quick` },
  { countryCode: "INTL", country: "International", flag: "🌐", office: "WIPO", fullName: "World Intellectual Property Organization", searchUrl: (n: string) => `https://branddb.wipo.int/en/` },
  { countryCode: "IN", country: "India", flag: "🇮🇳", office: "IPO India", fullName: "Intellectual Property India", searchUrl: (n: string) => `https://ipindiaservices.gov.in/tmrpublicsearch/` },
  { countryCode: "JP", country: "Japan", flag: "🇯🇵", office: "JPO", fullName: "Japan Patent Office", searchUrl: (n: string) => `https://www.j-platpat.inpit.go.jp/` },
  { countryCode: "ZA", country: "South Africa", flag: "🇿🇦", office: "CIPC", fullName: "Companies and Intellectual Property Commission", searchUrl: (n: string) => `https://iponline.cipc.co.za/` },
  { countryCode: "KE", country: "Kenya", flag: "🇰🇪", office: "KIPI", fullName: "Kenya Industrial Property Institute", searchUrl: (n: string) => `https://www.kipi.go.ke/` },
  { countryCode: "GH", country: "Ghana", flag: "🇬🇭", office: "RGD", fullName: "Registrar-General's Department", searchUrl: (n: string) => `https://rgd.gov.gh/` },
];

const TrademarkStation = ({ brandName, currentSearch, data, updateSearch, updateData, markStationComplete }: StationProps) => {
  const [expandedOffice, setExpandedOffice] = useState<string | null>(null);

  // Initialize trademark checks based on selected country
  useEffect(() => {
    if (currentSearch.trademarks.length === 0 && brandName) {
      const primaryOffices = TRADEMARK_OFFICES.filter(o =>
        o.countryCode === data.selectedCountry || o.countryCode === "INTL"
      );
      const initialChecks: TrademarkCheck[] = primaryOffices.map(office => ({
        country: office.country,
        countryCode: office.countryCode,
        office: office.office,
        searchUrl: office.searchUrl(brandName),
        status: "unknown" as const,
        notes: "",
      }));
      updateSearch({ trademarks: initialChecks });
    }
  }, [brandName, data.selectedCountry]);

  // Reset when country changes
  useEffect(() => {
    if (!brandName) return;
    const primaryOffices = TRADEMARK_OFFICES.filter(o =>
      o.countryCode === data.selectedCountry || o.countryCode === "INTL"
    );
    const newChecks: TrademarkCheck[] = primaryOffices.map(office => ({
      country: office.country,
      countryCode: office.countryCode,
      office: office.office,
      searchUrl: office.searchUrl(brandName),
      status: "unknown" as const,
      notes: "",
    }));
    updateSearch({ trademarks: newChecks });
  }, [data.selectedCountry]);

  // Auto-complete when some trademarks are checked
  useEffect(() => {
    const checked = currentSearch.trademarks.filter(t => t.status !== "unknown");
    if (checked.length > 0) {
      markStationComplete();
    }
  }, [currentSearch.trademarks, markStationComplete]);

  const markStatus = (countryCode: string, status: "clear" | "conflict") => {
    updateSearch({
      trademarks: currentSearch.trademarks.map(t =>
        t.countryCode === countryCode
          ? { ...t, status, checkedAt: new Date().toISOString() }
          : t
      ),
    });
  };

  const updateNotes = (countryCode: string, notes: string) => {
    updateSearch({
      trademarks: currentSearch.trademarks.map(t =>
        t.countryCode === countryCode ? { ...t, notes } : t
      ),
    });
  };

  const addJurisdiction = (countryCode: string) => {
    const office = TRADEMARK_OFFICES.find(o => o.countryCode === countryCode);
    if (!office || currentSearch.trademarks.some(t => t.countryCode === countryCode)) return;
    
    updateSearch({
      trademarks: [...currentSearch.trademarks, {
        country: office.country,
        countryCode: office.countryCode,
        office: office.office,
        searchUrl: office.searchUrl(brandName),
        status: "unknown" as const,
        notes: "",
      }],
    });
  };

  const checkedCount = currentSearch.trademarks.filter(t => t.status !== "unknown").length;
  const clearCount = currentSearch.trademarks.filter(t => t.status === "clear").length;
  const conflictCount = currentSearch.trademarks.filter(t => t.status === "conflict").length;
  const progress = currentSearch.trademarks.length > 0 
    ? (checkedCount / currentSearch.trademarks.length) * 100 
    : 0;

  const availableOffices = TRADEMARK_OFFICES.filter(
    o => !currentSearch.trademarks.some(t => t.countryCode === o.countryCode)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clear": return "ring-2 ring-green-500 bg-green-500/5";
      case "conflict": return "ring-2 ring-red-500 bg-red-500/5";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Country Selector & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <label className="text-sm font-medium mb-2 block">Primary Jurisdiction</label>
          <Select 
            value={data.selectedCountry} 
            onValueChange={(v) => updateData({ selectedCountry: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRADEMARK_OFFICES.filter(o => o.countryCode !== "INTL").map(o => (
                <SelectItem key={o.countryCode} value={o.countryCode}>
                  {o.flag} {o.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{checkedCount}/{currentSearch.trademarks.length} verified</span>
            <span>•</span>
            <span className="text-green-600">{clearCount} clear</span>
            {conflictCount > 0 && (
              <>
                <span>•</span>
                <span className="text-red-600">{conflictCount} conflicts</span>
              </>
            )}
          </div>
          <Progress value={progress} className="h-2 mt-2 w-48" />
        </div>
      </div>

      {/* Trademark Cards */}
      <div className="space-y-3">
        {currentSearch.trademarks.map((t) => {
          const office = TRADEMARK_OFFICES.find(o => o.countryCode === t.countryCode);
          if (!office) return null;
          const isExpanded = expandedOffice === t.countryCode;

          return (
            <Card
              key={t.countryCode}
              className={`p-4 transition-all ${getStatusColor(t.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{office.flag}</span>
                  <div>
                    <h4 className="font-medium">{office.office}</h4>
                    <p className="text-xs text-muted-foreground">{office.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {t.status === "clear" ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Clear
                    </span>
                  ) : t.status === "conflict" ? (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Conflict
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <HelpCircle className="h-4 w-4" /> Verify
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => window.open(t.searchUrl, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                  Search Database
                </Button>

                {t.status === "unknown" && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600"
                      onClick={() => markStatus(t.countryCode, "clear")}
                    >
                      <Check className="h-4 w-4 mr-1" /> Clear
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => markStatus(t.countryCode, "conflict")}
                    >
                      <X className="h-4 w-4 mr-1" /> Conflict
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedOffice(isExpanded ? null : t.countryCode)}
                >
                  {isExpanded ? "Hide Notes" : "Add Notes"}
                </Button>
              </div>

              {/* Notes */}
              {isExpanded && (
                <div className="mt-3">
                  <Textarea
                    placeholder="Add notes about your search results..."
                    value={t.notes}
                    onChange={(e) => updateNotes(t.countryCode, e.target.value)}
                    className="text-sm"
                    rows={2}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add More Jurisdictions */}
      {availableOffices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center">Add:</span>
          {availableOffices.map(o => (
            <Button
              key={o.countryCode}
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => addJurisdiction(o.countryCode)}
            >
              <Plus className="h-3 w-3" />
              {o.flag} {o.office}
            </Button>
          ))}
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <strong>Important:</strong> Always consult a trademark attorney before registering.
          This tool provides search links but cannot guarantee trademark availability.
        </p>
      </div>
    </div>
  );
};

export default TrademarkStation;

