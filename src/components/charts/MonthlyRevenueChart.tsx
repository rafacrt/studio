
"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface MonthlyRevenueChartProps {
  data: { month: string; revenue: number }[];
  isLoading?: boolean;
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function MonthlyRevenueChart({ data, isLoading = false }: MonthlyRevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-full" />
        </CardFooter>
      </Card>
    )
  }

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg">Receita Mensal</CardTitle>
        <CardDescription>Receita gerada nos últimos 6 meses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted"/>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `R$${value / 1000}k`}
              className="text-xs"
            />
            <RechartsTooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                itemStyle={{color: 'hsl(var(--foreground))'}}
                labelStyle={{color: 'hsl(var(--foreground))', fontWeight: 'bold'}}
                formatter={(value: number, name: string, props: any) => [`R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, chartConfig.revenue.label]}
            />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2.5}
              dot={true}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none text-foreground">
          Receita total nos últimos 6 meses: R${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="leading-none text-muted-foreground">
          Média de R${averageRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por mês.
        </div>
      </CardFooter>
    </Card>
  )
}

