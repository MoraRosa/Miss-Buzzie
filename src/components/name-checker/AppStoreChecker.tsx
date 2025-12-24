import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, HelpCircle, ExternalLink, Smartphone } from "lucide-react";
import type { AppStoreCheck } from "@/lib/validators/schemas";

interface AppStoreCheckerProps {
  brandName: string;
  checks: AppStoreCheck[];
  onUpdate: (checks: AppStoreCheck[]) => void;
}

// App Store configurations
const APP_STORE_CONFIG = [
  {
    id: "apple" as const,
    name: "Apple App Store",
    icon: "🍎",
    color: "bg-gray-900 text-white",
    searchUrl: (name: string) => `https://www.apple.com/search/${encodeURIComponent(name)}?src=globalnav`,
    developerUrl: "https://developer.apple.com/app-store/",
  },
  {
    id: "google" as const,
    name: "Google Play Store",
    icon: "🤖",
    color: "bg-green-600 text-white",
    searchUrl: (name: string) => `https://play.google.com/store/search?q=${encodeURIComponent(name)}&c=apps`,
    developerUrl: "https://play.google.com/console/",
  },
];

const StatusBadge = ({ status }: { status: AppStoreCheck["status"] }) => {
  switch (status) {
    case "available":
      return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Available</Badge>;
    case "taken":
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Name in Use</Badge>;
    default:
      return <Badge variant="outline"><HelpCircle className="h-3 w-3 mr-1" />Verify</Badge>;
  }
};

const AppStoreChecker = ({ brandName, checks, onUpdate }: AppStoreCheckerProps) => {
  // Initialize checks on mount
  useEffect(() => {
    if (checks.length === 0 && brandName) {
      const initialChecks: AppStoreCheck[] = APP_STORE_CONFIG.map(store => ({
        store: store.id,
        name: brandName,
        status: "unknown" as const,
        searchUrl: store.searchUrl(brandName),
      }));
      onUpdate(initialChecks);
    }
  }, [brandName, checks.length, onUpdate]);

  const markStatus = (store: "apple" | "google", status: "available" | "taken") => {
    onUpdate(checks.map(c => 
      c.store === store 
        ? { ...c, status, checkedAt: new Date().toISOString() }
        : c
    ));
  };

  const availableCount = checks.filter(c => c.status === "available").length;

  return (
    <AccordionItem value="appstore" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-purple-500" />
          <div className="text-left">
            <div className="font-semibold">App Store Availability</div>
            <div className="text-sm text-muted-foreground font-normal">
              Check name availability on Apple & Google Play • {availableCount}/{checks.length} available
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {APP_STORE_CONFIG.map((store) => {
            const check = checks.find(c => c.store === store.id);
            
            return (
              <Card key={store.id} className="overflow-hidden">
                <CardHeader className={`py-3 ${store.color}`}>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xl">{store.icon}</span>
                    {store.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">App Name:</p>
                      <p className="font-semibold">{brandName}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <StatusBadge status={check?.status || "unknown"} />
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => markStatus(store.id, "available")} 
                          className="h-7 text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => markStatus(store.id, "taken")} 
                          className="h-7 text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <a href={store.searchUrl(brandName)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Search Store
                        </a>
                      </Button>
                      <Button size="sm" variant="default" asChild className="flex-1">
                        <a href={store.developerUrl} target="_blank" rel="noopener noreferrer">
                          Developer Console
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> App names don't need to be unique, but similar names may cause confusion. 
            Check if existing apps with similar names could impact your brand visibility.
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default AppStoreChecker;

