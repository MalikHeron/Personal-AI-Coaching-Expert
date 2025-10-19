import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const chartData = [
  { date: "2024-06-01", calories: 220, accuracy: 82 },
  { date: "2024-06-02", calories: 340, accuracy: 85 },
  { date: "2024-06-03", calories: 280, accuracy: 80 },
  { date: "2024-06-04", calories: 390, accuracy: 88 },
  { date: "2024-06-05", calories: 410, accuracy: 90 },
  { date: "2024-06-06", calories: 360, accuracy: 86 },
  { date: "2024-06-07", calories: 430, accuracy: 89 },
  { date: "2024-06-08", calories: 470, accuracy: 91 },
  { date: "2024-06-09", calories: 310, accuracy: 84 },
  { date: "2024-06-10", calories: 450, accuracy: 90 },
  { date: "2024-06-11", calories: 375, accuracy: 87 },
  { date: "2024-06-12", calories: 400, accuracy: 88 },
  { date: "2024-06-13", calories: 440, accuracy: 90 },
  { date: "2024-06-14", calories: 500, accuracy: 92 },
  { date: "2024-06-15", calories: 480, accuracy: 91 },
  { date: "2024-06-16", calories: 360, accuracy: 86 },
  { date: "2024-06-17", calories: 420, accuracy: 88 },
  { date: "2024-06-18", calories: 390, accuracy: 87 },
  { date: "2024-06-19", calories: 460, accuracy: 90 },
  { date: "2024-06-20", calories: 520, accuracy: 93 },
  { date: "2024-06-21", calories: 410, accuracy: 88 },
  { date: "2024-06-22", calories: 385, accuracy: 86 },
  { date: "2024-06-23", calories: 450, accuracy: 90 },
  { date: "2024-06-24", calories: 480, accuracy: 92 },
  { date: "2024-06-25", calories: 390, accuracy: 89 },
  { date: "2024-06-26", calories: 420, accuracy: 90 },
  { date: "2024-06-27", calories: 460, accuracy: 91 },
  { date: "2024-06-28", calories: 500, accuracy: 93 },
  { date: "2024-06-29", calories: 340, accuracy: 84 },
  { date: "2024-06-30", calories: 430, accuracy: 89 },
]

const chartConfig = {
  calories: {
    label: "Calories Burned",
    color: "var(--chart-1)",
  },
  accuracy: {
    label: "Form Accuracy",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return chartData.filter((item) => new Date(item.date) >= startDate)
  }, [timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Workout Progress</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Calories and Form Accuracy Over Time
          </span>
          <span className="@[540px]/card:hidden">Progress Summary</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCalories" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-calories)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-calories)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accuracy)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-accuracy)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="accuracy"
              type="natural"
              fill="url(#fillAccuracy)"
              stroke="var(--color-accuracy)"
              stackId="a"
            />
            <Area
              dataKey="calories"
              type="natural"
              fill="url(#fillCalories)"
              stroke="var(--color-calories)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
