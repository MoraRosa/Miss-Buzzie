/**
 * Station 4: Trademark Verification
 *
 * Check trademark availability across jurisdictions.
 * Now with regional grouping and search.
 */

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check, X, ExternalLink, AlertTriangle,
  Plus, HelpCircle, ChevronDown, ChevronRight, Search, MapPin, Globe2, Info
} from "lucide-react";
import type { StationProps } from "../types";
import type { TrademarkCheck } from "@/lib/validators/schemas";
import {
  TRADEMARK_REGIONS,
  getAllOffices,
  searchOffices,
  getTotalCountries,
  type TrademarkOffice
} from "@/lib/trademarkConfig";

// Get list of countries for the dropdown (excluding international/regional offices)
const getCountryList = () => {
  const internationalCodes = ["WIPO", "EU", "OAPI", "ARIPO"];
  return getAllOffices().filter(o => !internationalCodes.includes(o.countryCode));
};

const TrademarkStation = ({ brandName, currentSearch, updateSearch, markStationComplete }: StationProps) => {
  const [expandedOffice, setExpandedOffice] = useState<string | null>(null);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(["international"]));
  const [searchQuery, setSearchQuery] = useState("");
  // Auto-open the add panel when no trademarks exist yet
  const [showAddPanel, setShowAddPanel] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [hasSelectedCountry, setHasSelectedCountry] = useState(false);

  // Get all offices as flat array for lookups
  const allOffices = useMemo(() => getAllOffices(), []);
  const countryList = useMemo(() => getCountryList(), []);

  // When user selects their country, add their local office + WIPO
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setHasSelectedCountry(true);

    const selectedOffice = allOffices.find(o => o.countryCode === countryCode);
    const wipoOffice = allOffices.find(o => o.countryCode === "WIPO");

    // If office not found, can't add
    if (!selectedOffice) return;

    // Use brand name or fallback
    const nameForSearch = brandName || "brand";
    const newChecks: TrademarkCheck[] = [];

    // Add their local office if not already added
    if (!currentSearch.trademarks.some(t => t.countryCode === countryCode)) {
      newChecks.push({
        country: selectedOffice.country,
        countryCode: selectedOffice.countryCode,
        office: selectedOffice.office,
        searchUrl: selectedOffice.searchUrl(nameForSearch),
        status: "unknown" as const,
        notes: "",
      });
    }

    // Add WIPO for international protection if not already added
    if (wipoOffice && !currentSearch.trademarks.some(t => t.countryCode === "WIPO")) {
      newChecks.push({
        country: wipoOffice.country,
        countryCode: wipoOffice.countryCode,
        office: wipoOffice.office,
        searchUrl: wipoOffice.searchUrl(nameForSearch),
        status: "unknown" as const,
        notes: "",
      });
    }

    if (newChecks.length > 0) {
      updateSearch({ trademarks: [...currentSearch.trademarks, ...newChecks] });
    }
  };

  // Check if user already has trademarks (returning user) - mount only
  // currentSearch.trademarks is intentionally excluded as this is a one-time initialization
  useEffect(() => {
    if (currentSearch.trademarks.length > 0) {
      setHasSelectedCountry(true);
      // Try to detect their country from existing trademarks (exclude international/regional)
      const internationalCodes = ["WIPO", "EU", "OAPI", "ARIPO"];
      const localOffice = currentSearch.trademarks.find(t => !internationalCodes.includes(t.countryCode));
      if (localOffice) {
        setSelectedCountry(localOffice.countryCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const addJurisdiction = (office: TrademarkOffice) => {
    if (currentSearch.trademarks.some(t => t.countryCode === office.countryCode)) return;

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

  const removeJurisdiction = (countryCode: string) => {
    updateSearch({
      trademarks: currentSearch.trademarks.filter(t => t.countryCode !== countryCode),
    });
  };

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(regionId)) {
        next.delete(regionId);
      } else {
        next.add(regionId);
      }
      return next;
    });
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchOffices(searchQuery).filter(
      o => !currentSearch.trademarks.some(t => t.countryCode === o.countryCode)
    );
  }, [searchQuery, currentSearch.trademarks]);

  const checkedCount = currentSearch.trademarks.filter(t => t.status !== "unknown").length;
  const clearCount = currentSearch.trademarks.filter(t => t.status === "clear").length;
  const conflictCount = currentSearch.trademarks.filter(t => t.status === "conflict").length;
  const progress = currentSearch.trademarks.length > 0
    ? (checkedCount / currentSearch.trademarks.length) * 100
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clear": return "ring-2 ring-green-500 bg-green-500/5";
      case "conflict": return "ring-2 ring-red-500 bg-red-500/5";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Beginner-Friendly Country Selector */}
      {!hasSelectedCountry && (
        <Card className="p-6 border-2 border-dashed border-primary/30 bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Where will your business operate?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll check if someone already owns "{brandName}" in your country's trademark database.
                </p>
              </div>
            </div>

            <Select value={selectedCountry} onValueChange={handleCountrySelect}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select your country..." />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {countryList.map(office => (
                  <SelectItem key={office.countryCode} value={office.countryCode}>
                    <span className="flex items-center gap-2">
                      <span>{office.flag}</span>
                      <span>{office.country}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <strong>What's a trademark?</strong> It's legal protection for your brand name.
                Checking helps you avoid accidentally using a name that's already owned by someone else.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Header - Show after country is selected */}
      {hasSelectedCountry && currentSearch.trademarks.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {countryList.find(c => c.countryCode === selectedCountry)?.country || "Your country"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span>{currentSearch.trademarks.length} checks</span>
            <span className="text-muted-foreground">•</span>
            <span>{checkedCount} verified</span>
            {clearCount > 0 && <><span className="text-muted-foreground">•</span><span className="text-green-600">{clearCount} clear</span></>}
            {conflictCount > 0 && <><span className="text-muted-foreground">•</span><span className="text-red-600">{conflictCount} conflicts</span></>}
          </div>
          <Progress value={progress} className="h-2 w-48" />
        </div>
      )}

      {/* Your Trademark Checks - Only show when country is selected */}
      {hasSelectedCountry && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              Your Trademark Checks
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddPanel(!showAddPanel)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add More Countries
            </Button>
          </div>

          {currentSearch.trademarks.length === 0 && (
            <Card className="p-4 text-center text-muted-foreground">
              <p>Select your country above to start checking trademarks.</p>
            </Card>
          )}

          {currentSearch.trademarks.map((t) => {
            const office = allOffices.find(o => o.countryCode === t.countryCode);
            if (!office) return null;
            const isExpanded = expandedOffice === t.countryCode;
            const internationalCodes = ["WIPO", "EU", "OAPI", "ARIPO"];
            const isInternational = internationalCodes.includes(t.countryCode);

            return (
              <Card key={t.countryCode} className={`p-4 transition-all ${getStatusColor(t.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{office.flag}</span>
                    <div>
                      {/* Show country name prominently, acronym as subtitle */}
                      <h4 className="font-medium">
                        {isInternational ? office.office : office.country}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {isInternational ? office.fullName : `${office.office} • ${office.fullName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.status === "clear" && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="h-4 w-4" /> Available</span>}
                    {t.status === "conflict" && <span className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Conflict Found</span>}
                    {t.status === "unknown" && <span className="text-sm text-muted-foreground flex items-center gap-1"><HelpCircle className="h-4 w-4" /> Not Checked</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(t.searchUrl, "_blank")}>
                    <ExternalLink className="h-3 w-3" /> Search Database
                  </Button>
                  {t.status === "unknown" && (
                    <>
                      <Button size="sm" variant="ghost" className="text-green-600" onClick={() => markStatus(t.countryCode, "clear")}><Check className="h-4 w-4 mr-1" /> Mark Available</Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => markStatus(t.countryCode, "conflict")}><X className="h-4 w-4 mr-1" /> Mark Conflict</Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => setExpandedOffice(isExpanded ? null : t.countryCode)}>{isExpanded ? "Hide Notes" : "Notes"}</Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => removeJurisdiction(t.countryCode)}><X className="h-3 w-3" /></Button>
              </div>
              {isExpanded && (
                <Textarea className="mt-3 text-sm" placeholder="Add notes..." value={t.notes} onChange={(e) => updateNotes(t.countryCode, e.target.value)} rows={2} />
              )}
            </Card>
          );
        })}
        </div>
      )}

      {/* Add Countries Panel */}
      {showAddPanel && (
        <Card className="p-4 border-dashed">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {searchResults.slice(0, 8).map(o => (
                  <Button key={o.countryCode} size="sm" variant="outline" onClick={() => { addJurisdiction(o); setSearchQuery(""); }}>
                    <Plus className="h-3 w-3 mr-1" /> {o.flag} {o.country}
                  </Button>
                ))}
              </div>
            )}

            {/* Regional Browsers */}
            {!searchQuery && (
              <div className="space-y-2">
                {TRADEMARK_REGIONS.map(region => (
                  <div key={region.id} className="border rounded-lg">
                    <button
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      onClick={() => toggleRegion(region.id)}
                    >
                      <span className="font-medium">{region.icon} {region.name} ({region.offices.length})</span>
                      {expandedRegions.has(region.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {expandedRegions.has(region.id) && (
                      <div className="p-3 pt-0 flex flex-wrap gap-2">
                        {region.offices.map(o => {
                          const isAdded = currentSearch.trademarks.some(t => t.countryCode === o.countryCode);
                          return (
                            <Button
                              key={o.countryCode}
                              size="sm"
                              variant={isAdded ? "secondary" : "outline"}
                              disabled={isAdded}
                              onClick={() => addJurisdiction(o)}
                              className="gap-1"
                            >
                              {isAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                              {o.flag} {o.country}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
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

