/**
 * Phase 9: Operations
 * 
 * Captures distribution, regulatory, and procurement information.
 */

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhaseProps } from "../types";

const OperationsPhase = ({ data, updateData }: PhaseProps) => {
  return (
    <div className="space-y-6">
      {/* Distribution Channels */}
      <div className="space-y-2">
        <Label htmlFor="distribution" className="text-base font-semibold">
          Distribution & Delivery
        </Label>
        <p className="text-sm text-muted-foreground">
          How will you get your product/service to customers?
        </p>
        <Textarea
          id="distribution"
          value={data.distributionChannels}
          onChange={(e) => updateData({ distributionChannels: e.target.value })}
          placeholder="Describe your distribution channels, delivery methods, logistics..."
          className="min-h-[120px]"
        />
      </div>

      {/* Regulatory & Compliance */}
      <div className="space-y-2">
        <Label htmlFor="regulatory" className="text-base font-semibold">
          Regulatory & Compliance Requirements
        </Label>
        <p className="text-sm text-muted-foreground">
          What regulations, permits, or compliance requirements apply to your business?
        </p>
        <Textarea
          id="regulatory"
          value={data.regulatoryInfo}
          onChange={(e) => updateData({ regulatoryInfo: e.target.value })}
          placeholder="List any licenses, permits, certifications, or regulations you need to comply with..."
          className="min-h-[120px]"
        />
      </div>

      {/* Procurement & Suppliers */}
      <div className="space-y-2">
        <Label htmlFor="procurement" className="text-base font-semibold">
          Procurement & Suppliers
        </Label>
        <p className="text-sm text-muted-foreground">
          How will you source materials, inventory, or services needed for your business?
        </p>
        <Textarea
          id="procurement"
          value={data.procurementInfo}
          onChange={(e) => updateData({ procurementInfo: e.target.value })}
          placeholder="Describe your key suppliers, sourcing strategy, and any supply chain considerations..."
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default OperationsPhase;

