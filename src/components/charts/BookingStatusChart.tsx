
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
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

interface BookingStatusChartProps {
  data: { status: string; count: number; fill: string }[];
  isLoading?: boolean;
}

const chartConfig = {
  count: {
    label: "Número de Reservas",
  },
  active: { // Added for better tooltip display if needed
    label: "Ativas",
    color: "hsl(var(--chart-1))",
  },
  past: {
    label: "Anteriores",
    color: "hsl(var(--chart-2))",
  },
  cancelled: {
    label: "Canceladas",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;


export function BookingStatusChart({ data, isLoading = false }: BookingStatusChartProps) {
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
      </Card>
    )
  }
  
  const chartData = data.map(item => ({
    ...item,
    // Dynamically assign color from chartConfig or use item.fill
    fill: chartConfig[item.status.toLowerCase() as keyof typeof chartConfig]?.color || item.fill,
  }));


  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg">Status das Reservas</CardTitle>
        <CardDescription>Distribuição de reservas por status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart 
            accessibilityLayer 
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="status"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              width={80}
            />
             <RechartsTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                itemStyle={{color: 'hsl(var(--foreground))'}}
                labelStyle={{color: 'hsl(var(--foreground))', fontWeight: 'bold'}}
                formatter={(value: number, name: string, props: any) => [`${value} reservas`, chartConfig.count.label ]}
            />
            <Bar dataKey="count" radius={5} barSize={30} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
