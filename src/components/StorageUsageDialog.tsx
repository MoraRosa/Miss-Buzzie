/**
 * Dialog showing localStorage usage with visual breakdown
 */
import { HardDrive, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useStorageMonitor, type StorageBreakdown } from "@/hooks/useStorageMonitor";
import { cn } from "@/lib/utils";

interface StorageUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Friendly names for storage keys
const KEY_LABELS: Record<string, string> = {
  businessModelCanvas: "Business Model Canvas",
  businessPlan: "Business Plan",
  pitchDeck: "Pitch Deck",
  roadmap: "Roadmap",
  orgChart: "Team & Org Chart",
  checklist: "Checklist",
  forecasting: "Financial Forecasting",
  financials: "Financials",
  brandAssets: "Brand Assets (Images)",
  brandColors: "Brand Colors",
  companyLogo: "Company Logo",
  swotAnalysis: "SWOT Analysis",
  portersFiveForces: "Porter's Five Forces",
  nameChecker: "Name Checker",
  marketResearch: "Market Research",
  aiSettings: "AI Settings",
};

function StorageBreakdownItem({ item }: { item: StorageBreakdown }) {
  const label = KEY_LABELS[item.key] || item.key;
  
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{item.formatted}</span>
        <span className="text-xs text-muted-foreground w-12 text-right">
          {item.percent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function StorageUsageDialog({ open, onOpenChange }: StorageUsageDialogProps) {
  const storage = useStorageMonitor();

  // Determine progress bar color
  const progressColor = storage.isCritical
    ? "bg-red-500"
    : storage.isWarning
    ? "bg-yellow-500"
    : "bg-green-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
            {(storage.isWarning || storage.isCritical) && (
              <AlertTriangle 
                className={cn(
                  "h-4 w-4 ml-1",
                  storage.isCritical ? "text-red-500" : "text-yellow-500"
                )} 
              />
            )}
          </DialogTitle>
          <DialogDescription>
            Your business data is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Main Usage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {storage.usedFormatted} of {storage.limitFormatted}
              </span>
              <span className={cn(
                "font-bold",
                storage.isCritical ? "text-red-500" : 
                storage.isWarning ? "text-yellow-500" : "text-green-500"
              )}>
                {storage.usagePercent.toFixed(1)}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(storage.usagePercent, 100)} 
                className="h-3"
              />
              <div 
                className={cn(
                  "absolute inset-0 h-3 rounded-full transition-all",
                  progressColor
                )}
                style={{ width: `${Math.min(storage.usagePercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Warning Messages */}
          {storage.isCritical && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⚠️ Critical: Storage almost full! Consider exporting your data and clearing unused items.
              </p>
            </div>
          )}
          {storage.isWarning && !storage.isCritical && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Storage is getting full. Large images in Brand Assets typically use the most space.
              </p>
            </div>
          )}

          {/* Breakdown by Feature */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Breakdown by Feature
            </h4>
            <div className="max-h-48 overflow-y-auto bg-muted/30 rounded-lg p-2">
              {storage.breakdown.length > 0 ? (
                storage.breakdown.map((item) => (
                  <StorageBreakdownItem key={item.key} item={item} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No data stored yet
                </p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Tip:</strong> Brand Assets (images) typically use the most storage.</p>
            <p>💾 Use <strong>Export All</strong> to backup your data regularly.</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={() => storage.refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

