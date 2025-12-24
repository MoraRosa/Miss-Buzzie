import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Globe, ExternalLink, Check, X, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import type { DomainCheck } from "@/lib/validators/schemas";

interface DomainCheckerProps {
  brandName: string;
  domains: DomainCheck[];
  defaultTlds: string[];
  onUpdate: (domains: DomainCheck[]) => void;
}

// TLD configurations with registrar links
const TLD_CONFIG: { tld: string; name: string; registrar: string }[] = [
  { tld: ".com", name: "Commercial", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".ca", name: "Canada", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".uk", name: "United Kingdom", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".io", name: "Tech/Startup", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".co", name: "Company", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".net", name: "Network", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".org", name: "Organization", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".app", name: "Application", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".dev", name: "Developer", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
  { tld: ".ai", name: "AI/Tech", registrar: "https://www.namecheap.com/domains/registration/results/?domain=" },
];

// Domain name variations
const getVariations = (name: string): string[] => {
  return [
    name,
    `get${name}`,
    `${name}app`,
    `${name}hq`,
    `try${name}`,
    `use${name}`,
    `my${name}`,
    `${name}io`,
  ];
};

const StatusBadge = ({ status }: { status: DomainCheck["status"] }) => {
  switch (status) {
    case "available":
      return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Available</Badge>;
    case "taken":
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Taken</Badge>;
    case "checking":
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Checking</Badge>;
    default:
      return <Badge variant="outline"><HelpCircle className="h-3 w-3 mr-1" />Click to Check</Badge>;
  }
};

const DomainChecker = ({ brandName, domains, defaultTlds, onUpdate }: DomainCheckerProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const variations = getVariations(brandName);

  // Initialize domains on mount or when brandName changes
  useEffect(() => {
    if (domains.length === 0 && brandName) {
      const initialDomains: DomainCheck[] = defaultTlds.map(tld => ({
        domain: brandName,
        tld,
        status: "unknown" as const,
        registrarLink: TLD_CONFIG.find(t => t.tld === tld)?.registrar + brandName + tld,
      }));
      onUpdate(initialDomains);
    }
  }, [brandName, domains.length, defaultTlds, onUpdate]);

  const checkDomain = (domain: string, tld: string) => {
    // Since most WHOIS APIs require a backend, we'll use a hybrid approach:
    // Generate a link to check manually but also provide visual tracking
    const whoisUrl = `https://www.whois.com/whois/${domain}${tld}`;
    window.open(whoisUrl, "_blank");
    
    // Update status to show user needs to verify
    onUpdate(domains.map(d => 
      d.domain === domain && d.tld === tld 
        ? { ...d, status: "unknown" as const, checkedAt: new Date().toISOString() }
        : d
    ));
  };

  const markStatus = (domain: string, tld: string, status: "available" | "taken") => {
    onUpdate(domains.map(d => 
      d.domain === domain && d.tld === tld 
        ? { ...d, status, checkedAt: new Date().toISOString() }
        : d
    ));
  };

  const addVariation = (variation: string) => {
    const newDomains: DomainCheck[] = defaultTlds.map(tld => ({
      domain: variation,
      tld,
      status: "unknown" as const,
      registrarLink: TLD_CONFIG.find(t => t.tld === tld)?.registrar + variation + tld,
    }));
    onUpdate([...domains, ...newDomains.filter(nd => 
      !domains.some(d => d.domain === nd.domain && d.tld === nd.tld)
    )]);
  };

  // Group domains by base name
  const groupedDomains = domains.reduce((acc, d) => {
    if (!acc[d.domain]) acc[d.domain] = [];
    acc[d.domain].push(d);
    return acc;
  }, {} as Record<string, DomainCheck[]>);

  return (
    <AccordionItem value="domains" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-blue-500" />
          <div className="text-left">
            <div className="font-semibold">Domain Availability</div>
            <div className="text-sm text-muted-foreground font-normal">
              Check {defaultTlds.length} TLDs • {domains.filter(d => d.status === "available").length} available
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {/* Main domain checks */}
        <div className="space-y-4">
          {Object.entries(groupedDomains).map(([domainName, domainChecks]) => (
            <Card key={domainName} className="overflow-hidden">
              <CardHeader className="py-3 bg-muted/50">
                <CardTitle className="text-base">{domainName}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {domainChecks.map((d) => (
                    <div key={`${d.domain}${d.tld}`} className="flex items-center justify-between p-3 hover:bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{d.domain}{d.tld}</span>
                        <StatusBadge status={d.status} />
                      </div>
                      <div className="flex items-center gap-1">
                        {d.status === "unknown" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => markStatus(d.domain, d.tld, "available")} className="h-7 text-green-600">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => markStatus(d.domain, d.tld, "taken")} className="h-7 text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => checkDomain(d.domain, d.tld)} className="h-7">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          WHOIS
                        </Button>
                        <Button size="sm" variant="default" asChild className="h-7">
                          <a href={d.registrarLink} target="_blank" rel="noopener noreferrer">
                            Register
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Variations section */}
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVariations(!showVariations)}
            className="mb-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {showVariations ? "Hide" : "Show"} Name Variations
          </Button>

          {showVariations && (
            <div className="flex flex-wrap gap-2">
              {variations.filter(v => v !== brandName && !groupedDomains[v]).map(variation => (
                <Button
                  key={variation}
                  variant="secondary"
                  size="sm"
                  onClick={() => addVariation(variation)}
                  className="font-mono text-sm"
                >
                  + {variation}
                </Button>
              ))}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DomainChecker;

