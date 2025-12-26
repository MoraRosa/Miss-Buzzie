/**
 * Use of Funds Pie Chart
 * 
 * Visual breakdown of how funding will be allocated.
 */

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart as PieChartIcon } from "lucide-react";
import { UseOfFundsItem } from "@/lib/validators/schemas";
import { formatCurrency, formatCompact } from "../types";

interface UseOfFundsPieChartProps {
  useOfFunds: UseOfFundsItem[];
  fundingAsk?: number;
  className?: string;
}

// Color palette for pie slices
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(30, 70%, 50%)",
  "hsl(180, 70%, 50%)",
  "hsl(330, 70%, 50%)",
];

const UseOfFundsPieChart = ({ useOfFunds, fundingAsk, className }: UseOfFundsPieChartProps) => {
  // Filter out items with no amount
  const validItems = useOfFunds.filter(item => item.amount > 0);
  
  if (validItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Use of Funds
          </CardTitle>
          <CardDescription>
            Add fund allocations to see the breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No allocation data yet
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = validItems.map((item, index) => ({
    name: item.category || "Unspecified",
    value: item.amount,
    fill: COLORS[index % COLORS.length],
  }));

  // Create chart config dynamically
  const chartConfig: ChartConfig = validItems.reduce((acc, item, index) => {
    acc[item.category || `item-${index}`] = {
      label: item.category || "Unspecified",
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const totalAllocated = validItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Use of Funds
        </CardTitle>
        <CardDescription>
          {fundingAsk ? (
            <>Allocating {formatCompact(totalAllocated)} of {formatCompact(fundingAsk)}</>
          ) : (
            <>Total: {formatCompact(totalAllocated)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => (
                    <span>
                      {name}: {formatCurrency(value as number)} 
                      ({((value as number / totalAllocated) * 100).toFixed(1)}%)
                    </span>
                  )}
                />
              } 
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default UseOfFundsPieChart;

