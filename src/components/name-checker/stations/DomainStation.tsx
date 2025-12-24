/**
 * Station 2: Domain Availability Check
 * 
 * Checks domain availability using DNS lookup.
 * Shows visual cards for each TLD with availability status.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, Check, X, Loader2, ExternalLink, RefreshCw, 
  Plus, ShoppingCart, AlertCircle 
} from "lucide-react";
import type { StationProps } from "../types";
import type { DomainCheck } from "@/lib/validators/schemas";

// TLD configurations with registrar links
const TLD_CONFIG = [
  { tld: ".com", price: "$12/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".io", price: "$40/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".co", price: "$25/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".app", price: "$15/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".dev", price: "$15/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".net", price: "$12/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".org", price: "$12/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".ca", price: "$15/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".ai", price: "$80/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".tech", price: "$10/yr", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
];

// Check domain availability using DNS lookup (free method)
const checkDomainAvailability = async (domain: string, tld: string): Promise<boolean | null> => {
  try {
    // Use DNS-over-HTTPS to check if domain resolves
    const response = await fetch(
      `https://dns.google/resolve?name=${domain}${tld}&type=A`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await response.json();
    
    // If Status is 3 (NXDOMAIN), domain likely doesn't exist = available
    // If Status is 0 and has Answer, domain exists = taken
    if (data.Status === 3) return true; // Available
    if (data.Status === 0 && data.Answer) return false; // Taken
    return null; // Unknown
  } catch {
    return null; // Network error, unknown
  }
};

const DomainStation = ({ brandName, currentSearch, data, updateSearch, markStationComplete }: StationProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkingDomain, setCheckingDomain] = useState<string | null>(null);

  // Initialize domains on mount
  useEffect(() => {
    if (currentSearch.domains.length === 0 && brandName) {
      const initialDomains: DomainCheck[] = data.settings.defaultTlds.map(tld => ({
        domain: brandName,
        tld,
        status: "unknown" as const,
        registrarLink: TLD_CONFIG.find(t => t.tld === tld)?.registrar + brandName + tld,
      }));
      updateSearch({ domains: initialDomains });
    }
  }, [brandName, currentSearch.domains.length, data.settings.defaultTlds, updateSearch]);

  // Auto-complete when some domains are checked
  useEffect(() => {
    const checked = currentSearch.domains.filter(d => d.status !== "unknown");
    if (checked.length > 0) {
      markStationComplete();
    }
  }, [currentSearch.domains, markStationComplete]);

  // Check a single domain - uses callback to get fresh state
  const checkSingleDomain = async (domain: string, tld: string, domainsRef?: typeof currentSearch.domains) => {
    setCheckingDomain(`${domain}${tld}`);

    const isAvailable = await checkDomainAvailability(domain, tld);
    const newStatus = isAvailable === true ? "available" : isAvailable === false ? "taken" : "unknown";

    setCheckingDomain(null);
    return { domain, tld, status: newStatus, checkedAt: new Date().toISOString() };
  };

  // Check all domains - collects results then updates state once
  const checkAllDomains = async () => {
    setIsChecking(true);

    // Create a copy of domains to track results
    const results = [...currentSearch.domains];

    for (let i = 0; i < results.length; i++) {
      const d = results[i];
      setCheckingDomain(`${d.domain}${d.tld}`);

      const isAvailable = await checkDomainAvailability(d.domain, d.tld);

      // Update the result in our local array
      results[i] = {
        ...d,
        status: isAvailable === true ? "available" : isAvailable === false ? "taken" : "unknown",
        checkedAt: new Date().toISOString(),
      };

      // Update state after each check so UI shows progress
      updateSearch({ domains: [...results] });

      // Small delay between checks
      await new Promise(r => setTimeout(r, 300));
    }

    setCheckingDomain(null);
    setIsChecking(false);
  };

  // Individual check button handler
  const handleSingleCheck = async (domain: string, tld: string) => {
    setCheckingDomain(`${domain}${tld}`);

    const isAvailable = await checkDomainAvailability(domain, tld);

    updateSearch({
      domains: currentSearch.domains.map(d =>
        d.domain === domain && d.tld === tld
          ? {
              ...d,
              status: isAvailable === true ? "available" : isAvailable === false ? "taken" : "unknown",
              checkedAt: new Date().toISOString(),
            }
          : d
      ),
    });

    setCheckingDomain(null);
  };

  const markStatus = (domain: string, tld: string, status: "available" | "taken") => {
    updateSearch({
      domains: currentSearch.domains.map(d =>
        d.domain === domain && d.tld === tld
          ? { ...d, status, checkedAt: new Date().toISOString() }
          : d
      ),
    });
  };

  const checkedCount = currentSearch.domains.filter(d => d.status !== "unknown" && d.status !== "checking").length;
  const availableCount = currentSearch.domains.filter(d => d.status === "available").length;
  const progress = currentSearch.domains.length > 0 
    ? (checkedCount / currentSearch.domains.length) * 100 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400";
      case "taken": return "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";
      case "checking": return "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400";
      default: return "bg-muted border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{checkedCount}/{currentSearch.domains.length} checked</span>
            <span>•</span>
            <span className="text-green-600">{availableCount} available</span>
          </div>
          <Progress value={progress} className="h-2 mt-2 w-48" />
        </div>
        <Button
          onClick={checkAllDomains}
          disabled={isChecking}
          className="gap-2"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Check All Domains
            </>
          )}
        </Button>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentSearch.domains.map((d) => {
          const config = TLD_CONFIG.find(t => t.tld === d.tld);
          const isCurrentlyChecking = checkingDomain === `${d.domain}${d.tld}`;

          return (
            <Card
              key={`${d.domain}${d.tld}`}
              className={`p-4 transition-all ${getStatusColor(d.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono font-medium text-lg">
                  {d.domain}<span className="text-primary">{d.tld}</span>
                </div>
                {d.status === "checking" || isCurrentlyChecking ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : d.status === "available" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : d.status === "taken" ? (
                  <X className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {config?.price || "~$12/yr"}
                </span>

                <div className="flex gap-1">
                  {d.status === "unknown" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleSingleCheck(d.domain, d.tld)}
                        disabled={isChecking || isCurrentlyChecking}
                      >
                        Check
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-green-600"
                        onClick={() => markStatus(d.domain, d.tld, "available")}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-red-600"
                        onClick={() => markStatus(d.domain, d.tld, "taken")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}

                  {d.status === "available" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => window.open(d.registrarLink, "_blank")}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Buy
                    </Button>
                  )}

                  {d.status !== "unknown" && d.status !== "checking" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => updateSearch({
                        domains: currentSearch.domains.map(dom =>
                          dom.domain === d.domain && dom.tld === d.tld
                            ? { ...dom, status: "unknown" as const }
                            : dom
                        ),
                      })}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Note about DNS checking */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Domain availability is checked via DNS lookup. For 100% accuracy, verify with a registrar before purchasing.
      </p>
    </div>
  );
};

export default DomainStation;

