/**
 * Revenue vs Expense Chart
 * 
 * Bar chart showing revenue and expenses by year with profit line overlay.
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, ComposedChart, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { YearlyProjection } from "@/lib/validators/schemas";
import { formatCompact } from "../types";

interface RevenueExpenseChartProps {
  projections: YearlyProjection[];
  className?: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const RevenueExpenseChart = ({ projections, className }: RevenueExpenseChartProps) => {
  // Transform data for chart
  const chartData = projections.map(p => ({
    year: `Year ${p.year}`,
    revenue: p.revenue,
    expenses: p.expenses,
    profit: p.revenue - p.expenses,
  }));

  const hasData = projections.some(p => p.revenue > 0 || p.expenses > 0);

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue vs Expenses
          </CardTitle>
          <CardDescription>
            Add projections to see your financial trajectory
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No projection data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue vs Expenses
        </CardTitle>
        <CardDescription>
          Financial projections by year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart data={chartData} accessibilityLayer>
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
              tickFormatter={(value) => formatCompact(value)}
              width={60}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => (
                    <span>
                      {chartConfig[name as keyof typeof chartConfig]?.label}: {formatCompact(value as number)}
                    </span>
                  )}
                />
              } 
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="var(--color-revenue)" 
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
            <Bar 
              dataKey="expenses" 
              fill="var(--color-expenses)" 
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="var(--color-profit)" 
              strokeWidth={3}
              dot={{ fill: "var(--color-profit)", strokeWidth: 2 }}
              name="Profit"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueExpenseChart;

