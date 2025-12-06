import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ForecastData } from "@/lib/validators/schemas";
import FinancialChartVisual from "./visuals/FinancialChartVisual";
import GrowthMountainVisual from "./visuals/GrowthMountainVisual";
import MoneyTreeVisual from "./visuals/MoneyTreeVisual";
import RocketLaunchVisual from "./visuals/RocketLaunchVisual";
import FinancialRiverVisual from "./visuals/FinancialRiverVisual";

interface FinancialForecastVisualProps {
  data: ForecastData;
}

const FinancialForecastVisual = ({ data }: FinancialForecastVisualProps) => {
  const [activeTab, setActiveTab] = useState("chart");

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="chart" className="text-xs sm:text-sm">
            📊 Chart
          </TabsTrigger>
          <TabsTrigger value="mountain" className="text-xs sm:text-sm">
            🏔️ Mountain
          </TabsTrigger>
          <TabsTrigger value="tree" className="text-xs sm:text-sm">
            🌳 Tree
          </TabsTrigger>
          <TabsTrigger value="rocket" className="text-xs sm:text-sm">
            🚀 Rocket
          </TabsTrigger>
          <TabsTrigger value="river" className="text-xs sm:text-sm">
            💧 River
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-0">
          <FinancialChartVisual data={data} />
        </TabsContent>

        <TabsContent value="mountain" className="mt-0">
          <GrowthMountainVisual data={data} />
        </TabsContent>

        <TabsContent value="tree" className="mt-0">
          <MoneyTreeVisual data={data} />
        </TabsContent>

        <TabsContent value="rocket" className="mt-0">
          <RocketLaunchVisual data={data} />
        </TabsContent>

        <TabsContent value="river" className="mt-0">
          <FinancialRiverVisual data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialForecastVisual;

