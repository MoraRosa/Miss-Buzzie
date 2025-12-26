/**
 * Exports Tab - Full Business Plan Generator
 *
 * Generates a complete, investor-ready business plan PDF by pulling data from:
 * - Plan tab (BusinessPlanData)
 * - Org tab (Roles)
 * - Financials tab (ForecastData)
 * - Pitch tab (Slides - for Exit Strategy)
 * - SWOT tab (SWOTData)
 * - Canvas tab (CanvasData)
 * - Roadmap tab (Milestones)
 * - Brand (Colors, Logo, Strategy)
 */

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Download, FileText, Loader2, RefreshCw, Edit, Eye, FileCheck,
  Building2, Users, Target, TrendingUp, DollarSign, Shield, Rocket,
  BookOpen, Briefcase, BarChart3, PieChart, ArrowRight, ChevronRight
} from "lucide-react";
import { getBrandColors, getCompanyLogo, type BrandColors } from "@/lib/assetManager";
import {
  BusinessPlanData, Role, ForecastData, Slide, SWOTData,
  CanvasData, Milestone, PortersData, DEFAULT_BUSINESS_PLAN_DATA
} from "@/lib/validators/schemas";
import { getBrandStrategy, type BrandStrategy } from "@/lib/brandStrategy";
import BrandHeader from "./BrandHeader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ============ Helper Functions ============

const parseCurrency = (val: string | number | undefined): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[^0-9.-]/g, "")) || 0;
};

const formatCurrency = (amount: number): string => {
  if (!amount) return "$0";
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
};

const formatFullCurrency = (amount: number): string => {
  if (!amount) return "$0";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

// ============ Data Types ============

// Extended Role with optional fields that OrgChart may add
interface ExtendedRole extends Role {
  bio?: string;
  linkedinUrl?: string;
}

interface AllBusinessData {
  plan: BusinessPlanData;
  roles: ExtendedRole[];
  forecast: ForecastData;
  slides: Slide[];
  swot: SWOTData | null;
  canvas: CanvasData | null;
  milestones: Milestone[];
  porters: PortersData | null;
  brandStrategy: BrandStrategy | null;
  brandColors: BrandColors;
  logo: string | null;
}

// ============ Executive Summary Generator ============

const generateExecutiveSummary = (data: AllBusinessData): string => {
  const { plan, roles, forecast } = data;
  const businessName = plan.businessName || "[Business Name]";
  const ownerName = plan.ownerName || "[Founder Name]";
  const businessType = plan.businessType || plan.businessClassification || "business";
  const problemStatement = plan.problemStatement || "[problem statement not defined]";
  const solution = plan.businessIdea || "[solution not defined]";

  const tam = parseCurrency(plan.tam);
  const sam = parseCurrency(plan.sam);
  const som = parseCurrency(plan.som);
  const fundingAsk = parseCurrency(forecast?.fundingAsk) || parseCurrency(plan.cashRequired);
  const yearOneSales = parseCurrency(plan.yearOneSalesTarget) || parseCurrency(forecast?.year1Revenue);

  const keyTeam = roles.filter(r => r.title && r.name).slice(0, 3);
  const teamText = keyTeam.length > 0 ? keyTeam.map(r => `${r.name} (${r.title})`).join(", ") : "[team not defined]";

  const customers = plan.customerSegments?.filter(s => s.name).slice(0, 2) || [];
  const customersText = customers.length > 0 ? customers.map(s => s.name).join(" and ") : "target customers";

  let summary = `${businessName} is a ${businessType} founded by ${ownerName}`;
  if (plan.businessAddress) summary += ` based in ${plan.businessAddress}`;
  summary += ".\n\n";

  summary += `THE PROBLEM: ${problemStatement}\n\n`;
  summary += `OUR SOLUTION: ${solution}\n\n`;

  if (tam > 0 || sam > 0 || som > 0) {
    summary += `MARKET OPPORTUNITY: `;
    if (tam > 0) summary += `Total Addressable Market (TAM) of ${formatCurrency(tam)}`;
    if (sam > 0) summary += `, Serviceable Market (SAM) of ${formatCurrency(sam)}`;
    if (som > 0) summary += `, Initial Target (SOM) of ${formatCurrency(som)}`;
    summary += ".\n\n";
  }

  summary += `TARGET CUSTOMERS: We serve ${customersText}`;
  if (customers[0]?.painPoints) summary += ` who struggle with ${customers[0].painPoints}`;
  summary += ".\n\n";

  summary += `TEAM: ${teamText}.\n\n`;

  if (yearOneSales > 0 || fundingAsk > 0) {
    summary += `FINANCIAL HIGHLIGHTS: `;
    if (yearOneSales > 0) summary += `Year 1 revenue target of ${formatCurrency(yearOneSales)}. `;
    if (fundingAsk > 0) summary += `Seeking ${formatCurrency(fundingAsk)} in funding.`;
    summary += "\n\n";
  }

  if (fundingAsk > 0) {
    summary += `INVESTMENT OPPORTUNITY: We are raising ${formatCurrency(fundingAsk)}`;
    const sources = [];
    if (plan.fundingSources?.personalInvestment) sources.push("personal investment");
    if (plan.fundingSources?.bankLoans) sources.push("bank financing");
    if (plan.fundingSources?.investors) sources.push("investor capital");
    if (plan.fundingSources?.grants) sources.push("grants");
    if (sources.length > 0) summary += ` through ${sources.join(", ")}`;
    summary += ". Funds will be used to scale operations and expand market reach.";
  }

  return summary.trim();
};

// ============ Default Data Loader ============

const loadAllData = (): AllBusinessData => {
  let plan = DEFAULT_BUSINESS_PLAN_DATA;
  let roles: ExtendedRole[] = [];
  let forecast: ForecastData = { year1Revenue: "", year1Expenses: "", year2Revenue: "", year2Expenses: "", year3Revenue: "", year3Expenses: "", year5Revenue: "", year5Expenses: "", year10Revenue: "", year10Expenses: "", year15Revenue: "", year15Expenses: "", year25Revenue: "", year25Expenses: "", assumptions: "" };
  let slides: Slide[] = [];
  let swot: SWOTData | null = null;
  let canvas: CanvasData | null = null;
  let milestones: Milestone[] = [];
  let porters: PortersData | null = null;
  let brandStrategy: BrandStrategy | null = null;

  try { plan = JSON.parse(localStorage.getItem("businessPlan") || "{}"); } catch {}
  try {
    const orgData = JSON.parse(localStorage.getItem("orgChart") || "[]");
    // OrgChart stores roles array directly, not wrapped in an object
    roles = Array.isArray(orgData) ? orgData : (orgData.roles || []);
  } catch {}
  try { forecast = JSON.parse(localStorage.getItem("forecasting") || "{}"); } catch {}
  try { const pitch = JSON.parse(localStorage.getItem("pitchDeck") || "{}"); slides = pitch.slides || []; } catch {}
  try { swot = JSON.parse(localStorage.getItem("swotAnalysis") || "null"); } catch {}
  try { canvas = JSON.parse(localStorage.getItem("businessModelCanvas") || "null"); } catch {}
  try { milestones = JSON.parse(localStorage.getItem("roadmap") || "[]"); } catch {}
  try { porters = JSON.parse(localStorage.getItem("portersFiveForces") || "null"); } catch {}
  try { brandStrategy = getBrandStrategy(); } catch {}

  return {
    plan: { ...DEFAULT_BUSINESS_PLAN_DATA, ...plan },
    roles,
    forecast,
    slides,
    swot,
    canvas,
    milestones,
    porters,
    brandStrategy,
    brandColors: getBrandColors(),
    logo: getCompanyLogo(),
  };
};

// ============ Section Components for PDF ============

interface SectionProps {
  data: AllBusinessData;
  primaryColor: string;
}

// Cover Page
const CoverPage = ({ data, primaryColor }: SectionProps) => {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-12 page-break-after">
      {data.logo && (
        <img src={data.logo} alt="Logo" className="h-24 w-24 object-contain mb-8 rounded-lg shadow-lg" />
      )}
      <h1 className="text-4xl font-bold mb-4" style={{ color: primaryColor }}>
        {data.plan.businessName || "Business Plan"}
      </h1>
      {data.brandStrategy?.tagline && (
        <p className="text-xl text-muted-foreground italic mb-8">"{data.brandStrategy.tagline}"</p>
      )}
      <div className="w-24 h-1 rounded mb-8" style={{ backgroundColor: primaryColor }} />
      <p className="text-lg font-medium">Business Plan</p>
      <p className="text-muted-foreground mb-8">{today}</p>
      <div className="mt-8 text-sm text-muted-foreground space-y-1">
        {data.plan.ownerName && <p>Prepared by: {data.plan.ownerName}</p>}
        {data.plan.businessEmail && <p>{data.plan.businessEmail}</p>}
        {data.plan.businessAddress && <p>{data.plan.businessAddress}</p>}
      </div>
      <p className="mt-12 text-xs text-muted-foreground">CONFIDENTIAL</p>
    </div>
  );
};

// Table of Contents
const TableOfContents = ({ primaryColor }: { primaryColor: string }) => {
  const sections = [
    { num: "1", title: "Executive Summary", page: "3" },
    { num: "2", title: "Company Description", page: "4" },
    { num: "3", title: "Problem & Solution", page: "5" },
    { num: "4", title: "Products & Services", page: "6" },
    { num: "5", title: "Market Analysis", page: "7" },
    { num: "6", title: "Competitive Analysis", page: "8" },
    { num: "7", title: "Marketing & Sales Strategy", page: "9" },
    { num: "8", title: "Operations Plan", page: "10" },
    { num: "9", title: "Management Team", page: "11" },
    { num: "10", title: "Financial Projections", page: "12" },
    { num: "11", title: "Funding Request", page: "13" },
    { num: "12", title: "Exit Strategy", page: "14" },
    { num: "13", title: "Milestones & Roadmap", page: "15" },
  ];
  return (
    <div className="p-8 page-break-after">
      <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>Table of Contents</h2>
      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.num} className="flex items-center justify-between border-b border-dotted py-2">
            <span className="font-medium">{s.num}. {s.title}</span>
            <span className="text-muted-foreground">{s.page}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle, primaryColor }: {
  icon: React.ElementType; title: string; subtitle?: string; primaryColor: string
}) => (
  <div className="mb-6 pb-4 border-b-2" style={{ borderColor: primaryColor }}>
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
        <Icon className="h-5 w-5" style={{ color: primaryColor }} />
      </div>
      <div>
        <h2 className="text-xl font-bold" style={{ color: primaryColor }}>{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const Exports = () => {
  const { toast } = useToast();
  const documentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [data, setData] = useState<AllBusinessData>(loadAllData);

  // Editable executive summary
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [summaryEdited, setSummaryEdited] = useState(false);

  // Reload data
  useEffect(() => {
    const newData = loadAllData();
    setData(newData);
    if (!summaryEdited) {
      setExecutiveSummary(generateExecutiveSummary(newData));
    }
  }, []);

  // Listen for brand changes
  useEffect(() => {
    const handleChange = () => setData(loadAllData());
    window.addEventListener('brandColorsChanged', handleChange);
    window.addEventListener('companyLogoChanged', handleChange);
    return () => {
      window.removeEventListener('brandColorsChanged', handleChange);
      window.removeEventListener('companyLogoChanged', handleChange);
    };
  }, []);

  const regenerateSummary = () => {
    setExecutiveSummary(generateExecutiveSummary(data));
    setSummaryEdited(false);
    toast({ title: "Regenerated", description: "Executive summary refreshed from your data" });
  };

  // Export full business plan as multi-page PDF
  const handleExportPDF = async () => {
    const element = documentRef.current;
    if (!element) return;

    setIsExporting(true);

    try {
      toast({ title: "Generating PDF...", description: "This may take a moment" });

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 297; // A4 height in mm

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${data.plan.businessName || "Business"}-Plan-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: "✅ Business Plan Exported!",
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const primaryColor = data.brandColors.primary;
  const { plan, roles, forecast, slides, swot, canvas, milestones } = data;

  // Get exit strategy from pitch slides (slide 12, index 11)
  const exitStrategySlide = slides[11];
  const exitStrategy = exitStrategySlide?.content || "";

  return (
    <div className="space-y-6">
      <BrandHeader />

      {/* Header Card */}
      <Card className="border-2" style={{ borderColor: primaryColor }}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6" style={{ color: primaryColor }} />
                Full Business Plan Export
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Professional, investor-ready business plan generated from all your Mizzie data
              </CardDescription>
            </div>
            <Button
              size="lg"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {isExporting ? "Generating..." : "Download Business Plan PDF"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Section Navigation */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs py-2">Overview</TabsTrigger>
          <TabsTrigger value="company" className="text-xs py-2">Company</TabsTrigger>
          <TabsTrigger value="market" className="text-xs py-2">Market</TabsTrigger>
          <TabsTrigger value="team" className="text-xs py-2">Team</TabsTrigger>
          <TabsTrigger value="financials" className="text-xs py-2">Financials</TabsTrigger>
          <TabsTrigger value="strategy" className="text-xs py-2">Strategy</TabsTrigger>
          <TabsTrigger value="full" className="text-xs py-2">Full Doc</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" style={{ color: primaryColor }} />
                Executive Summary
              </CardTitle>
              <CardDescription>
                1-page narrative overview •
                <Button variant="link" size="sm" className="px-1" onClick={regenerateSummary}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={executiveSummary}
                onChange={(e) => { setExecutiveSummary(e.target.value); setSummaryEdited(true); }}
                className="min-h-[300px] text-sm"
                placeholder="Executive summary will appear here..."
              />
              {summaryEdited && (
                <p className="text-xs text-amber-600 mt-2">✎ Edited. Click Regenerate to restore.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <SectionHeader icon={Building2} title="Company Description" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Business Name</p><p className="font-medium">{plan.businessName || "—"}</p></div>
                <div><p className="text-sm text-muted-foreground">Owner/Founder</p><p className="font-medium">{plan.ownerName || "—"}</p></div>
                <div><p className="text-sm text-muted-foreground">Business Type</p><p className="font-medium">{plan.businessType || plan.businessClassification || "—"}</p></div>
                <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{plan.businessAddress || "—"}</p></div>
              </div>
              {plan.businessIdea && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Business Concept</p>
                  <p>{plan.businessIdea}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <SectionHeader icon={Target} title="Problem & Solution" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">The Problem</p>
                <p>{plan.problemStatement || "Not defined"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Our Solution</p>
                <p>{plan.businessIdea || "Not defined"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <SectionHeader icon={PieChart} title="Market Analysis" subtitle="TAM / SAM / SOM" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold" style={{ color: primaryColor }}>{formatCurrency(parseCurrency(plan.tam))}</p>
                  <p className="text-sm text-muted-foreground">Total Addressable Market</p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold" style={{ color: primaryColor }}>{formatCurrency(parseCurrency(plan.sam))}</p>
                  <p className="text-sm text-muted-foreground">Serviceable Market</p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold" style={{ color: primaryColor }}>{formatCurrency(parseCurrency(plan.som))}</p>
                  <p className="text-sm text-muted-foreground">Initial Target</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <SectionHeader icon={Users} title="Target Customers" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent>
              {plan.customerSegments && plan.customerSegments.length > 0 ? (
                <div className="space-y-3">
                  {plan.customerSegments.filter(s => s.name).map((seg, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <p className="font-medium">{seg.name}</p>
                      {seg.painPoints && <p className="text-sm text-muted-foreground mt-1">Pain: {seg.painPoints}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No customer segments defined yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader>
              <SectionHeader icon={Users} title="Management Team" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent>
              {roles.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {roles.filter(r => r.name || r.title).map((role, i) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <p className="font-bold">{role.name || "TBD"}</p>
                      <p className="text-sm" style={{ color: primaryColor }}>{role.title}</p>
                      {role.bio && <p className="text-sm text-muted-foreground mt-2">{role.bio}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No team members defined yet. Add them in the Org tab.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Financials Tab */}
        <TabsContent value="financials" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <SectionHeader icon={TrendingUp} title="Financial Projections" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Year 1", rev: forecast?.year1Revenue, exp: forecast?.year1Expenses },
                  { label: "Year 2", rev: forecast?.year2Revenue, exp: forecast?.year2Expenses },
                  { label: "Year 3", rev: forecast?.year3Revenue, exp: forecast?.year3Expenses },
                ].map((yr, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <p className="font-medium mb-2">{yr.label}</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(parseCurrency(yr.rev))} <span className="text-xs font-normal">revenue</span></p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(parseCurrency(yr.exp))} expenses</p>
                  </div>
                ))}
              </div>
              {plan.yearOneSalesTarget && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Year 1 Sales Target (from Plan)</p>
                  <p className="text-xl font-bold">{formatFullCurrency(parseCurrency(plan.yearOneSalesTarget))}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <SectionHeader icon={DollarSign} title="Funding Request" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2" style={{ borderColor: primaryColor }}>
                  <p className="text-sm text-muted-foreground">Total Funding Required</p>
                  <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                    {formatCurrency(parseCurrency(forecast?.fundingAsk) || parseCurrency(plan.cashRequired))}
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Funding Sources</p>
                  <div className="space-y-1 text-sm">
                    {plan.fundingSources?.personalInvestment && <p>Personal: {plan.fundingSources.personalInvestment}</p>}
                    {plan.fundingSources?.bankLoans && <p>Bank Loans: {plan.fundingSources.bankLoans}</p>}
                    {plan.fundingSources?.investors && <p>Investors: {plan.fundingSources.investors}</p>}
                    {plan.fundingSources?.grants && <p>Grants: {plan.fundingSources.grants}</p>}
                  </div>
                </div>
              </div>
              {plan.useOfFunds && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Use of Funds</p>
                  <p>{plan.useOfFunds}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <SectionHeader icon={Rocket} title="Exit Strategy" subtitle="From Pitch Deck" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent>
              {exitStrategy ? (
                <div className="whitespace-pre-wrap">{exitStrategy}</div>
              ) : (
                <p className="text-muted-foreground">No exit strategy defined. Add it in the Pitch tab (slide 12).</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <SectionHeader icon={Target} title="Milestones & Roadmap" primaryColor={primaryColor} />
            </CardHeader>
            <CardContent>
              {milestones.length > 0 ? (
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="p-1 rounded" style={{ backgroundColor: `${primaryColor}20` }}>
                        <ChevronRight className="h-4 w-4" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-sm text-muted-foreground">{m.timeframe} • {m.category}</p>
                        {m.description && <p className="text-sm mt-1">{m.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No milestones defined. Add them in the Roadmap tab.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Document Tab - This is what gets exported */}
        <TabsContent value="full" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Full Document Preview</CardTitle>
                  <CardDescription>This is what will be exported as PDF</CardDescription>
                </div>
                <Button onClick={handleExportPDF} disabled={isExporting}>
                  {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Full Document for Export */}
              <div
                ref={documentRef}
                className="bg-white text-black p-8 rounded-lg shadow-inner max-h-[600px] overflow-y-auto"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {/* Cover Page */}
                <CoverPage data={data} primaryColor={primaryColor} />

                {/* Table of Contents */}
                <TableOfContents primaryColor={primaryColor} />

                {/* 1. Executive Summary */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>1. Executive Summary</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{executiveSummary}</div>
                </div>

                {/* 2. Company Description */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>2. Company Description</h2>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr><td className="py-1 text-gray-600 w-1/3">Business Name:</td><td className="py-1 font-medium">{plan.businessName}</td></tr>
                      <tr><td className="py-1 text-gray-600">Owner:</td><td className="py-1">{plan.ownerName}</td></tr>
                      <tr><td className="py-1 text-gray-600">Type:</td><td className="py-1">{plan.businessType || plan.businessClassification}</td></tr>
                      <tr><td className="py-1 text-gray-600">Location:</td><td className="py-1">{plan.businessAddress}</td></tr>
                      <tr><td className="py-1 text-gray-600">Email:</td><td className="py-1">{plan.businessEmail}</td></tr>
                      <tr><td className="py-1 text-gray-600">Website:</td><td className="py-1">{plan.businessWebsite}</td></tr>
                    </tbody>
                  </table>
                  <h3 className="font-bold mt-6 mb-2">Business Concept</h3>
                  <p className="text-sm">{plan.businessIdea}</p>
                </div>

                {/* 3. Problem & Solution */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>3. Problem & Solution</h2>
                  <h3 className="font-bold mb-2">The Problem</h3>
                  <p className="text-sm mb-4">{plan.problemStatement}</p>
                  <h3 className="font-bold mb-2">Our Solution</h3>
                  <p className="text-sm">{plan.businessIdea}</p>
                </div>

                {/* 4. Products & Services */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>4. Products & Services</h2>
                  {plan.productsServices && plan.productsServices.length > 0 ? (
                    <div className="space-y-3">
                      {plan.productsServices.map((ps, i) => (
                        <div key={i} className="border-b pb-2">
                          <p className="font-medium">{ps.name}</p>
                          <p className="text-sm text-gray-600">{ps.description}</p>
                          {ps.price && <p className="text-sm">Price: {ps.price}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Products and services to be defined.</p>
                  )}
                </div>

                {/* 5. Market Analysis */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>5. Market Analysis</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 border rounded">
                      <p className="text-2xl font-bold" style={{ color: primaryColor }}>{formatCurrency(parseCurrency(plan.tam))}</p>
                      <p className="text-xs text-gray-600">TAM</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <p className="text-2xl font-bold" style={{ color: primaryColor }}>{formatCurrency(parseCurrency(plan.sam))}</p>
                      <p className="text-xs text-gray-600">SAM</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <p className="text-2xl font-bold" style={{ color: primaryColor }}>{formatCurrency(parseCurrency(plan.som))}</p>
                      <p className="text-xs text-gray-600">SOM</p>
                    </div>
                  </div>
                  <h3 className="font-bold mb-2">Target Customers</h3>
                  {plan.customerSegments?.filter(s => s.name).map((seg, i) => (
                    <div key={i} className="mb-2">
                      <p className="font-medium">{seg.name}</p>
                      {seg.painPoints && <p className="text-sm text-gray-600">Pain Points: {seg.painPoints}</p>}
                    </div>
                  ))}
                </div>

                {/* 6. Competitive Analysis */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>6. Competitive Analysis</h2>
                  {plan.competitors && plan.competitors.length > 0 ? (
                    <div className="space-y-3">
                      {plan.competitors.filter(c => c.name).map((comp, i) => (
                        <div key={i} className="border-b pb-2">
                          <p className="font-medium">{comp.name}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                            <div><span className="text-gray-600">Strengths:</span> {comp.strengths || "—"}</div>
                            <div><span className="text-gray-600">Weaknesses:</span> {comp.weaknesses || "—"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Competitive analysis to be completed.</p>
                  )}
                  {plan.competitiveAdvantage && (
                    <div className="mt-4 p-3 rounded bg-gray-50">
                      <p className="font-medium text-sm">Our Competitive Advantage</p>
                      <p className="text-sm">{plan.competitiveAdvantage}</p>
                    </div>
                  )}
                </div>

                {/* 7. Marketing & Sales Strategy */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>7. Marketing & Sales Strategy</h2>
                  <h3 className="font-bold mb-2">Marketing Channels</h3>
                  <p className="text-sm mb-4">{plan.marketingChannels || "Marketing strategy to be defined."}</p>
                  <h3 className="font-bold mb-2">Sales Strategy</h3>
                  <p className="text-sm mb-4">{plan.salesStrategy || "Sales approach to be defined."}</p>
                  {plan.pricingStrategy && (
                    <>
                      <h3 className="font-bold mb-2">Pricing Strategy</h3>
                      <p className="text-sm">{plan.pricingStrategy}</p>
                    </>
                  )}
                </div>

                {/* 8. Operations Plan */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>8. Operations Plan</h2>
                  <h3 className="font-bold mb-2">Key Activities</h3>
                  <p className="text-sm mb-4">{plan.keyActivities || canvas?.keyActivities || "Operations to be defined."}</p>
                  <h3 className="font-bold mb-2">Key Resources</h3>
                  <p className="text-sm mb-4">{plan.keyResources || canvas?.keyResources || "Resources to be defined."}</p>
                  <h3 className="font-bold mb-2">Key Partners</h3>
                  <p className="text-sm">{plan.keyPartners || canvas?.keyPartners || "Partnerships to be defined."}</p>
                </div>

                {/* 9. Management Team */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>9. Management Team</h2>
                  {roles.length > 0 ? (
                    <div className="space-y-4">
                      {roles.filter(r => r.name || r.title).map((role, i) => (
                        <div key={i} className="border-b pb-3">
                          <p className="font-bold">{role.name || "TBD"}</p>
                          <p className="text-sm" style={{ color: primaryColor }}>{role.title}</p>
                          {role.bio && <p className="text-sm text-gray-600 mt-1">{role.bio}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Team structure to be defined.</p>
                  )}
                </div>

                {/* 10. Financial Projections */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>10. Financial Projections</h2>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">Expenses</th>
                        <th className="text-right py-2">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { yr: "Year 1", rev: forecast?.year1Revenue, exp: forecast?.year1Expenses },
                        { yr: "Year 2", rev: forecast?.year2Revenue, exp: forecast?.year2Expenses },
                        { yr: "Year 3", rev: forecast?.year3Revenue, exp: forecast?.year3Expenses },
                        { yr: "Year 5", rev: forecast?.year5Revenue, exp: forecast?.year5Expenses },
                      ].map((row, i) => {
                        const rev = parseCurrency(row.rev);
                        const exp = parseCurrency(row.exp);
                        const net = rev - exp;
                        return (
                          <tr key={i} className="border-b">
                            <td className="py-2">{row.yr}</td>
                            <td className="text-right">{formatCurrency(rev)}</td>
                            <td className="text-right">{formatCurrency(exp)}</td>
                            <td className={`text-right font-medium ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(net)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {forecast?.assumptions && (
                    <div className="mt-4">
                      <p className="font-medium text-sm">Key Assumptions</p>
                      <p className="text-sm text-gray-600">{forecast.assumptions}</p>
                    </div>
                  )}
                </div>

                {/* 11. Funding Request */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>11. Funding Request</h2>
                  <div className="p-4 border-2 rounded mb-4" style={{ borderColor: primaryColor }}>
                    <p className="text-sm text-gray-600">Total Funding Required</p>
                    <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                      {formatFullCurrency(parseCurrency(forecast?.fundingAsk) || parseCurrency(plan.cashRequired))}
                    </p>
                  </div>
                  <h3 className="font-bold mb-2">Use of Funds</h3>
                  <p className="text-sm mb-4">{plan.useOfFunds || "Funds allocation to be detailed."}</p>
                  <h3 className="font-bold mb-2">Funding Sources</h3>
                  <div className="text-sm space-y-1">
                    {plan.fundingSources?.personalInvestment && <p>• Personal Investment: {plan.fundingSources.personalInvestment}</p>}
                    {plan.fundingSources?.bankLoans && <p>• Bank Loans: {plan.fundingSources.bankLoans}</p>}
                    {plan.fundingSources?.investors && <p>• Investors: {plan.fundingSources.investors}</p>}
                    {plan.fundingSources?.grants && <p>• Grants: {plan.fundingSources.grants}</p>}
                  </div>
                </div>

                {/* 12. Exit Strategy */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>12. Exit Strategy</h2>
                  {exitStrategy ? (
                    <div className="whitespace-pre-wrap text-sm">{exitStrategy}</div>
                  ) : (
                    <p className="text-sm text-gray-500">Exit strategy to be defined in Pitch Deck.</p>
                  )}
                </div>

                {/* 13. Milestones & Roadmap */}
                <div className="p-8 page-break-after">
                  <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>13. Milestones & Roadmap</h2>
                  {milestones.length > 0 ? (
                    <div className="space-y-3">
                      {milestones.map((m, i) => (
                        <div key={i} className="border-l-4 pl-3 py-1" style={{ borderColor: primaryColor }}>
                          <p className="font-medium">{m.title}</p>
                          <p className="text-sm text-gray-600">{m.timeframe} • {m.category}</p>
                          {m.description && <p className="text-sm mt-1">{m.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Milestones to be defined in Roadmap tab.</p>
                  )}
                </div>

                {/* Footer */}
                <div className="p-8 text-center border-t mt-8">
                  <div className="w-16 h-1 mx-auto rounded mb-4" style={{ backgroundColor: primaryColor }} />
                  <p className="text-sm text-gray-600">
                    {plan.businessName || "Business Plan"}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Generated with Mizzie Business Planner • {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">CONFIDENTIAL</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Exports;

