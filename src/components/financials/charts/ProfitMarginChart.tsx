/**
 * Profit Margin Chart
 * 
 * Area chart showing profit margin trajectory over time.
 */

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TrendingUp, TrendingDown } from "lucide-react";
import { YearlyProjection } from "@/lib/validators/schemas";
import { calculateProfitMargin, formatCompact } from "../types";

interface ProfitMarginChartProps {
  projections: YearlyProjection[];
  className?: string;
}

const chartConfig = {
  margin: {
    label: "Profit Margin",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const ProfitMarginChart = ({ projections, className }: ProfitMarginChartProps) => {
  // Transform data for chart
  const chartData = projections.map(p => ({
    year: `Year ${p.year}`,
    margin: calculateProfitMargin(p.revenue, p.expenses),
    profit: p.revenue - p.expenses,
    revenue: p.revenue,
  }));

  const hasData = projections.some(p => p.revenue > 0);
  const latestMargin = chartData[chartData.length - 1]?.margin || 0;
  const isProfitable = latestMargin > 0;

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit Margin
          </CardTitle>
          <CardDescription>
            Add revenue projections to see margin trajectory
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No projection data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isProfitable ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              Profit Margin
            </CardTitle>
            <CardDescription>
              Margin trajectory over projection period
            </CardDescription>
          </div>
          <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {latestMargin.toFixed(1)}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData} accessibilityLayer>
            <defs>
              <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              width={50}
              domain={['auto', 'auto']}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name, item) => (
                    <div className="space-y-1">
                      <div>Margin: {(value as number).toFixed(1)}%</div>
                      <div className="text-muted-foreground text-xs">
                        Profit: {formatCompact(item.payload.profit)}
                      </div>
                    </div>
                  )}
                />
              } 
            />
            <Area 
              type="monotone" 
              dataKey="margin" 
              stroke="var(--color-margin)" 
              strokeWidth={2}
              fill="url(#marginGradient)"
              dot={{ fill: "var(--color-margin)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProfitMarginChart;

