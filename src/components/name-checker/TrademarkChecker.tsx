import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, HelpCircle, ExternalLink, Scale, AlertTriangle } from "lucide-react";
import type { TrademarkCheck } from "@/lib/validators/schemas";

interface TrademarkCheckerProps {
  brandName: string;
  selectedCountry: string;
  checks: TrademarkCheck[];
  onCountryChange: (country: string) => void;
  onUpdate: (checks: TrademarkCheck[]) => void;
}

// Trademark office configurations by country
const TRADEMARK_OFFICES = [
  {
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    office: "USPTO",
    fullName: "United States Patent and Trademark Office",
    searchUrl: (name: string) => `https://tmsearch.uspto.gov/bin/gate.exe?f=searchss&state=4810:1ircfk.1.1&p_s_All=${encodeURIComponent(name)}&p_s_ALL=&a_default=search&a_search=Submit+Query`,
    directUrl: "https://www.uspto.gov/trademarks",
  },
  {
    country: "Canada",
    countryCode: "CA",
    flag: "🇨🇦",
    office: "CIPO",
    fullName: "Canadian Intellectual Property Office",
    searchUrl: (name: string) => `https://ised-isde.canada.ca/cipo/trademark-search/srch?searchField=${encodeURIComponent(name)}&category=&type=&status=&dateType=&fromDate=&toDate=&search=Search`,
    directUrl: "https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home",
  },
  {
    country: "United Kingdom",
    countryCode: "UK",
    flag: "🇬🇧",
    office: "UKIPO",
    fullName: "UK Intellectual Property Office",
    searchUrl: (name: string) => `https://trademarks.ipo.gov.uk/ipo-tmtext?searchquery=${encodeURIComponent(name)}`,
    directUrl: "https://www.gov.uk/government/organisations/intellectual-property-office",
  },
  {
    country: "European Union",
    countryCode: "EU",
    flag: "🇪🇺",
    office: "EUIPO",
    fullName: "European Union Intellectual Property Office",
    searchUrl: (name: string) => `https://euipo.europa.eu/eSearch/#basic/${encodeURIComponent(name)}`,
    directUrl: "https://euipo.europa.eu/",
  },
  {
    country: "International",
    countryCode: "INTL",
    flag: "🌍",
    office: "WIPO",
    fullName: "World Intellectual Property Organization",
    searchUrl: (name: string) => `https://branddb.wipo.int/en/quicksearch/brand?by=brandName&v=${encodeURIComponent(name)}`,
    directUrl: "https://www.wipo.int/madrid/en/",
  },
  {
    country: "Australia",
    countryCode: "AU",
    flag: "🇦🇺",
    office: "IP Australia",
    fullName: "IP Australia",
    searchUrl: (name: string) => `https://search.ipaustralia.gov.au/trademarks/search/quick?q=${encodeURIComponent(name)}`,
    directUrl: "https://www.ipaustralia.gov.au/",
  },
  {
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    office: "IPO India",
    fullName: "Indian Patent Office",
    searchUrl: (name: string) => `https://ipindiaservices.gov.in/tmrpublicsearch/tmsearch.aspx?WT_query=${encodeURIComponent(name)}`,
    directUrl: "https://ipindia.gov.in/",
  },
  {
    country: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    office: "CNIPA",
    fullName: "China National Intellectual Property Administration",
    searchUrl: () => `https://wcjs.sbj.cnipa.gov.cn/txnT01.do`,
    directUrl: "https://english.cnipa.gov.cn/",
  },
  {
    country: "Nigeria",
    countryCode: "NG",
    flag: "🇳🇬",
    office: "TRADEMARKS REGISTRY",
    fullName: "Trademarks, Patents and Designs Registry Nigeria",
    searchUrl: (name: string) => `https://iponigeria.com/search?q=${encodeURIComponent(name)}`,
    directUrl: "https://iponigeria.com/",
  },
];

const StatusBadge = ({ status }: { status: TrademarkCheck["status"] }) => {
  switch (status) {
    case "clear":
      return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Clear</Badge>;
    case "conflict":
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Conflict Found</Badge>;
    default:
      return <Badge variant="outline"><HelpCircle className="h-3 w-3 mr-1" />Verify</Badge>;
  }
};

const TrademarkChecker = ({ brandName, selectedCountry, checks, onCountryChange, onUpdate }: TrademarkCheckerProps) => {
  // Initialize checks when brandName or selectedCountry changes
  // This ensures the list updates when user picks a different country from dropdown
  useEffect(() => {
    if (!brandName) return;

    // Always reset to show selected country + INTL when country changes
    const primaryOffices = TRADEMARK_OFFICES.filter(o =>
      o.countryCode === selectedCountry || o.countryCode === "INTL"
    );
    const newChecks: TrademarkCheck[] = primaryOffices.map(office => ({
      country: office.country,
      countryCode: office.countryCode,
      office: office.office,
      searchUrl: office.searchUrl(brandName),
      status: "unknown" as const,
      notes: "",
    }));
    onUpdate(newChecks);
    // onUpdate is stable from parent, excluding to avoid unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandName, selectedCountry]);

  const markStatus = (countryCode: string, status: "clear" | "conflict") => {
    onUpdate(checks.map(c => 
      c.countryCode === countryCode 
        ? { ...c, status, checkedAt: new Date().toISOString() }
        : c
    ));
  };

  const updateNotes = (countryCode: string, notes: string) => {
    onUpdate(checks.map(c => 
      c.countryCode === countryCode ? { ...c, notes } : c
    ));
  };

  const addCountry = (countryCode: string) => {
    const office = TRADEMARK_OFFICES.find(o => o.countryCode === countryCode);
    if (!office || checks.some(c => c.countryCode === countryCode)) return;
    
    onUpdate([...checks, {
      country: office.country,
      countryCode: office.countryCode,
      office: office.office,
      searchUrl: office.searchUrl(brandName),
      status: "unknown" as const,
      notes: "",
    }]);
  };

  const clearCount = checks.filter(c => c.status === "clear").length;
  const conflictCount = checks.filter(c => c.status === "conflict").length;
  const availableOffices = TRADEMARK_OFFICES.filter(o => !checks.some(c => c.countryCode === o.countryCode));

  return (
    <AccordionItem value="trademark" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <Scale className="h-5 w-5 text-amber-600" />
          <div className="text-left">
            <div className="font-semibold">Trademark Search</div>
            <div className="text-sm text-muted-foreground font-normal">
              {checks.length} jurisdictions • {clearCount} clear • {conflictCount} conflicts
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {/* Country Selector */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Primary Jurisdiction</p>
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {TRADEMARK_OFFICES.filter(o => o.countryCode !== "INTL").map(office => (
                    <SelectItem key={office.countryCode} value={office.countryCode}>
                      {office.flag} {office.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 inline mr-1 text-amber-500" />
              Always consult a trademark attorney before registering.
            </div>
          </div>
        </div>

        {/* Trademark Checks */}
        <div className="space-y-4">
          {checks.map((check) => {
            const office = TRADEMARK_OFFICES.find(o => o.countryCode === check.countryCode);
            if (!office) return null;

            return (
              <Card key={check.countryCode}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{office.flag}</span>
                      {office.office}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({office.fullName})
                      </span>
                    </span>
                    <StatusBadge status={check.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add notes about your search results..."
                        value={check.notes}
                        onChange={(e) => updateNotes(check.countryCode, e.target.value)}
                        className="text-sm min-h-[60px]"
                      />
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <a href={check.searchUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Search
                        </a>
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markStatus(check.countryCode, "clear")}
                          className="flex-1 text-green-600"
                          title="Mark as clear"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markStatus(check.countryCode, "conflict")}
                          className="flex-1 text-red-600"
                          title="Mark conflict found"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add more jurisdictions */}
        {availableOffices.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Add more jurisdictions:</p>
            <div className="flex flex-wrap gap-2">
              {availableOffices.map(office => (
                <Button
                  key={office.countryCode}
                  variant="secondary"
                  size="sm"
                  onClick={() => addCountry(office.countryCode)}
                  className="text-xs"
                >
                  {office.flag} {office.office}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>⚠️ Important:</strong> Trademark searches are complex. A clear search result does not guarantee
            registration success. Common law rights, pending applications, and similar marks may still pose issues.
            We strongly recommend working with a qualified trademark attorney.
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TrademarkChecker;

