/**
 * Business Plan Preview Component
 * 
 * Renders the complete business plan as a styled document.
 * Supports brand colors, logo, light/dark mode.
 * Used for both preview mode and Phase 12 (Summary).
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { getBrandColors, getCompanyLogo, type BrandColors } from "@/lib/assetManager";
import { BusinessPlanData } from "@/lib/validators/schemas";
import { PHASE_CONFIGS } from "./phaseRegistry";
import {
  User,
  Building2,
  Users,
  Target,
  TrendingUp,
  Package,
  DollarSign,
  PiggyBank,
  Truck,
  AlertTriangle,
  Wallet,
} from "lucide-react";

interface BusinessPlanPreviewProps {
  data: BusinessPlanData;
  compact?: boolean; // For inline preview vs full document
}

// Phase icons mapping
const PHASE_ICONS = {
  1: User,
  2: Building2,
  3: Users,
  4: Target,
  5: TrendingUp,
  6: Package,
  7: DollarSign,
  8: PiggyBank,
  9: Truck,
  10: AlertTriangle,
  11: Wallet,
};

const BusinessPlanPreview = ({ data, compact = false }: BusinessPlanPreviewProps) => {
  const [brandColors, setBrandColors] = useState<BrandColors>(getBrandColors());
  const [logo, setLogo] = useState<string | null>(getCompanyLogo());
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setBrandColors(getBrandColors());
    setLogo(getCompanyLogo());
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const handleColorsChange = (e: CustomEvent<BrandColors>) => {
      setBrandColors(e.detail);
    };
    const handleLogoChange = (e: CustomEvent<string>) => {
      setLogo(e.detail);
    };

    // Observe dark mode changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("brandColorsChanged", handleColorsChange as EventListener);
    window.addEventListener("companyLogoChanged", handleLogoChange as EventListener);

    return () => {
      window.removeEventListener("brandColorsChanged", handleColorsChange as EventListener);
      window.removeEventListener("companyLogoChanged", handleLogoChange as EventListener);
      observer.disconnect();
    };
  }, []);

  const formatCurrency = (value: string) => {
    if (!value) return "—";
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
    if (isNaN(num)) return value;
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayName = data.businessName || data.ownerName || "Business Plan";

  return (
    <div
      className={`bg-background ${compact ? "p-4" : "p-8"} min-w-[800px]`}
      data-mizzie-business-plan
    >
      {/* Document Header */}
      <div
        className="flex items-center justify-between mb-8 pb-6 border-b-2"
        style={{ borderColor: brandColors.primary }}
      >
        <div className="flex items-center gap-4">
          {logo && (
            <img
              src={logo}
              alt="Company Logo"
              className="h-16 w-16 object-contain rounded-lg"
            />
          )}
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: brandColors.primary }}
            >
              {displayName}
            </h1>
            <p className="text-lg text-muted-foreground">
              {data.isExistingBusiness ? "Business Growth Plan" : "Business Plan"}
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Prepared: {formatDate(data.lastUpdated || new Date().toISOString())}</p>
          {data.ownerName && <p>By: {data.ownerName}</p>}
        </div>
      </div>

      {/* Executive Summary Card */}
      <Card
        className="p-6 mb-8"
        style={{
          background: isDarkMode
            ? `linear-gradient(135deg, ${brandColors.primary}15 0%, ${brandColors.secondary}10 100%)`
            : `linear-gradient(135deg, ${brandColors.primary}10 0%, ${brandColors.secondary}05 100%)`,
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: brandColors.primary }}>
          Executive Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Business Name</p>
            <p className="font-medium">{data.businessName || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Business Type</p>
            <p className="font-medium">{data.businessType || data.businessClassification || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cash Required</p>
            <p className="font-medium">{formatCurrency(data.cashRequired)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Year 1 Sales Target</p>
            <p className="font-medium">{formatCurrency(data.yearOneSalesTarget)}</p>
          </div>
        </div>
        {data.businessIdea && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm">{data.businessIdea}</p>
          </div>
        )}
      </Card>

      {/* Section: About the Founder */}
      <SectionCard
        title="About the Founder"
        icon={User}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <Field label="Language Proficiency" value={data.languageProficiency} />
        <Field label="Self-Employment Experience" value={data.selfEmploymentDetails} />
        <Field label="Entrepreneurship Programs" value={data.entrepreneurshipProgramDetails} />
        <Field label="Relevant Skills" value={data.relevantSkills} />
        <Field label="License Requirements" value={data.licenseDetails} />
        <Field label="Personal Constraints" value={data.personalConstraints} />
      </SectionCard>

      {/* Section: Business Profile */}
      <SectionCard
        title="Business Profile"
        icon={Building2}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business Name" value={data.businessName} />
          <Field label="Business Type" value={data.businessType} />
          <Field label="Classification" value={data.businessClassification} />
          <Field label="Address" value={data.businessAddress} />
        </div>
        <Field label="Email" value={data.businessEmail} />
        <Field label="Website" value={data.businessWebsite} />
        <Field label="Business Idea" value={data.businessIdea} />
      </SectionCard>

      {/* Section: Target Customers */}
      <SectionCard
        title="Target Customers"
        icon={Users}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <Field label="Customer Description" value={data.customerDescription} />
        {(data.customerSegments?.length ?? 0) > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-muted-foreground mb-2">Customer Segments</p>
            <div className="flex flex-wrap gap-2">
              {(data.customerSegments ?? []).map((seg) => (
                <span
                  key={seg.id}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: `${brandColors.primary}20`, color: brandColors.primary }}
                >
                  {seg.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Section: Competition */}
      <SectionCard
        title="Competitive Landscape"
        icon={Target}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <Field label="Why Customers Prefer You" value={data.whyCustomersPreferYou} />
        <Field label="How You're Different" value={data.howYouAreDifferent} />
        <Field label="Why Customers Buy From You" value={data.whyCustomersBuyFromYou} />
        <Field label="Pricing Info" value={data.pricingInfo} />
        {(data.competitors?.length ?? 0) > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-muted-foreground mb-2">Key Competitors</p>
            <div className="grid grid-cols-2 gap-2">
              {(data.competitors ?? []).map((comp) => (
                <div key={comp.id} className="p-2 bg-muted/30 rounded text-sm">
                  <p className="font-medium">{comp.name || "Unnamed"}</p>
                  {comp.coreOffer && <p className="text-xs text-muted-foreground">Offer: {comp.coreOffer}</p>}
                  {comp.differentiators && <p className="text-xs text-muted-foreground">Differentiators: {comp.differentiators}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Section: Market Analysis */}
      <SectionCard
        title="Market Analysis"
        icon={TrendingUp}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <Field label="Market Definition" value={data.marketDefinition} />
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">TAM Current</p>
            <p className="font-semibold" style={{ color: brandColors.primary }}>{formatCurrency(data.tamCurrent)}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">SAM Current</p>
            <p className="font-semibold" style={{ color: brandColors.primary }}>{formatCurrency(data.samCurrent)}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">SOM Current</p>
            <p className="font-semibold" style={{ color: brandColors.primary }}>{formatCurrency(data.somCurrent)}</p>
          </div>
        </div>
        <Field label="TAM Assumptions" value={data.tamAssumptions} />
        <Field label="Evidence of Viability" value={data.evidenceOfViability} />
        <Field label="Market Trends" value={data.marketTrends} />
      </SectionCard>

      {/* Section: Products & Services */}
      <SectionCard
        title="Products & Services"
        icon={Package}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <Field label="Products/Services" value={data.productsServices} />
        <Field label="How You Sell" value={data.howYouSell} />
        {data.hasImportExport && (
          <Field label="Import/Export Details" value={data.importExportDetails} />
        )}
      </SectionCard>

      {/* Section: Sales & Revenue */}
      <SectionCard
        title="Sales & Revenue"
        icon={DollarSign}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Year 1 Sales Target" value={formatCurrency(data.yearOneSalesTarget)} />
          <Field label="First Year Sales" value={formatCurrency(data.firstYearSales)} />
        </div>
        <Field label="How You Calculated Sales" value={data.howYouCalculatedSales} />
        <Field label="Units/Customers Needed" value={data.unitsOrCustomersNeeded} />
        <Field label="First Sale Target" value={data.firstSaleTarget} />
      </SectionCard>

      {/* Section: Financing */}
      <SectionCard
        title="Financing"
        icon={PiggyBank}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cash Required" value={formatCurrency(data.cashRequired)} />
          <Field label="Use of Funds" value={data.useOfFunds} />
        </div>
        {/* Funding Sources - object with multiple fields */}
        {data.fundingSources && typeof data.fundingSources === 'object' && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Funding Sources</p>
            <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
              {data.fundingSources.personalInvestment && (
                <div>Personal Investment: {formatCurrency(data.fundingSources.personalInvestment)}</div>
              )}
              {data.fundingSources.bankLoans && (
                <div>Bank Loans: {formatCurrency(data.fundingSources.bankLoans)}</div>
              )}
              {data.fundingSources.lineOfCredit && (
                <div>Line of Credit: {formatCurrency(data.fundingSources.lineOfCredit)}</div>
              )}
              {data.fundingSources.familySupport && (
                <div>Family Support: {formatCurrency(data.fundingSources.familySupport)}</div>
              )}
              {data.fundingSources.grants && (
                <div>Grants: {formatCurrency(data.fundingSources.grants)}</div>
              )}
              {data.fundingSources.investors && (
                <div>Investors: {formatCurrency(data.fundingSources.investors)}</div>
              )}
              {data.fundingSources.other && (
                <div>Other: {formatCurrency(data.fundingSources.other)}</div>
              )}
            </div>
          </div>
        )}
        <Field label="Why Start This Business" value={data.whyStartBusiness} />
      </SectionCard>

      {/* Section: Operations */}
      <SectionCard
        title="Operations"
        icon={Truck}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <Field label="Distribution Channels" value={data.distributionChannels} />
        <Field label="Regulatory & Compliance" value={data.regulatoryInfo} />
        <Field label="Procurement & Suppliers" value={data.procurementInfo} />
      </SectionCard>

      {/* Section: Risks & Action Plan */}
      <SectionCard
        title="Risks & Action Plan"
        icon={AlertTriangle}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        {(data.risks?.length ?? 0) > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Identified Risks</p>
            <div className="space-y-2">
              {(data.risks ?? []).map((risk) => (
                <div key={risk.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    risk.impact === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    risk.impact === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}>
                    {risk.impact}
                  </span>
                  <span>{risk.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <Field label="Action Plan & Milestones" value={data.entryPlan} />
      </SectionCard>

      {/* Section: Personal Financial Position */}
      <SectionCard
        title="Personal Financial Position"
        icon={Wallet}
        color={brandColors.primary}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Total Assets</p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency((data.assets ?? []).reduce((sum, a) => sum + parseFloat(a.value?.replace(/[^0-9.-]/g, "") || "0"), 0).toString())}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Total Liabilities</p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency((data.liabilities ?? []).reduce((sum, l) => sum + parseFloat(l.value?.replace(/[^0-9.-]/g, "") || "0"), 0).toString())}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Net Worth</p>
            <p className="font-semibold" style={{ color: brandColors.primary }}>
              {formatCurrency((
                (data.assets ?? []).reduce((sum, a) => sum + parseFloat(a.value?.replace(/[^0-9.-]/g, "") || "0"), 0) -
                (data.liabilities ?? []).reduce((sum, l) => sum + parseFloat(l.value?.replace(/[^0-9.-]/g, "") || "0"), 0)
              ).toString())}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
        <p>Generated by Mizzie • {formatDate(new Date().toISOString())}</p>
        <p className="mt-1">This business plan is for planning purposes. Consult professionals for legal and financial advice.</p>
      </div>
    </div>
  );
};

// Helper Components
const SectionCard = ({
  title,
  icon: Icon,
  color,
  isDarkMode,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isDarkMode: boolean;
  children: React.ReactNode;
}) => (
  <Card
    className="p-5 mb-4 overflow-hidden"
    style={{ borderLeftWidth: "4px", borderLeftColor: color }}
  >
    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
      <Icon className="h-5 w-5" style={{ color }} />
      <h3 className="font-semibold text-lg" style={{ color }}>
        {title}
      </h3>
    </div>
    <div className="space-y-3">{children}</div>
  </Card>
);

const Field = ({ label, value }: { label: string; value?: string }) => {
  if (!value || value === "—") return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
};

export default BusinessPlanPreview;

