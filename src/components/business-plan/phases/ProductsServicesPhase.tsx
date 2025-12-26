/**
 * Phase 3: Products & Services
 * 
 * Captures what the business offers and how it delivers to customers.
 */

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PhaseProps } from "../types";

const ProductsServicesPhase = ({ data, updateData }: PhaseProps) => {
  return (
    <div className="space-y-6">
      {/* Products/Services Description */}
      <div className="space-y-2">
        <Label htmlFor="products" className="text-base font-semibold">
          What products or services do you offer?
        </Label>
        <p className="text-sm text-muted-foreground">
          Describe your main offerings in detail. Include features, benefits, and any variations.
        </p>
        <Textarea
          id="products"
          value={data.productsServices}
          onChange={(e) => updateData({ productsServices: e.target.value })}
          placeholder="Describe your products and/or services..."
          className="min-h-[150px]"
        />
      </div>

      {/* How You Sell */}
      <div className="space-y-2">
        <Label htmlFor="how-sell" className="text-base font-semibold">
          How do you sell and deliver your products/services?
        </Label>
        <p className="text-sm text-muted-foreground">
          Online, in-person, through distributors, subscription model, etc.
        </p>
        <Textarea
          id="how-sell"
          value={data.howYouSell}
          onChange={(e) => updateData({ howYouSell: e.target.value })}
          placeholder="Describe your sales and delivery methods..."
          className="min-h-[120px]"
        />
      </div>

      {/* Import/Export */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="import-export" className="text-base font-semibold">
              Does your business involve importing or exporting?
            </Label>
            <p className="text-sm text-muted-foreground">
              International trade, cross-border transactions, etc.
            </p>
          </div>
          <Switch
            id="import-export"
            checked={data.hasImportExport}
            onCheckedChange={(checked) => updateData({ hasImportExport: checked })}
          />
        </div>
        {data.hasImportExport && (
          <Textarea
            value={data.importExportDetails}
            onChange={(e) => updateData({ importExportDetails: e.target.value })}
            placeholder="Describe your import/export activities, countries involved, and any regulations you need to comply with..."
            className="min-h-[100px]"
          />
        )}
      </div>
    </div>
  );
};

export default ProductsServicesPhase;

