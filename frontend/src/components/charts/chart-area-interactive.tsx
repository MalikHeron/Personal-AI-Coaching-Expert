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
import { SessionService, Session } from "@/services/SessionService"

type ChartPoint = { date: string; calories: number; accuracy: number }

function parseDurationToSeconds(d?: string | null): number {
  if (!d) return 0;
  const parts = d.split(":");
  if (parts.length !== 3) return 0;
  const [hh, mm, ss] = parts.map((p) => parseInt(p, 10) || 0);
  return hh * 3600 + mm * 60 + ss;
}

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
  const [sessions, setSessions] = React.useState<Session[] | null>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await SessionService.listSessions()
        if (mounted) setSessions(data)
      } catch (e) {
        console.error('Failed to load chart sessions', e)
        if (mounted) setSessions([])
      }
    })()
    return () => { mounted = false }
  }, [])

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  const filteredData = React.useMemo<ChartPoint[]>(() => {
    const s = sessions ?? []
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === '30d') daysToSubtract = 30
    else if (timeRange === '7d') daysToSubtract = 7

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    // Aggregate sessions per date (ISO date string), sum calories, avg accuracy
    const dayMap = new Map<string, { calories: number; accSum: number; accCount: number }>()
    for (const sess of s) {
      if (!sess.completed) continue
      const d = new Date(sess.date)
      if (d < startDate || d > now) continue
      const key = d.toISOString().slice(0, 10)
      const secs = parseDurationToSeconds(sess.duration)
      const calories = Math.round((secs / 60) * 5)
      const score = typeof sess.score === 'number' ? sess.score : null
      const cur = dayMap.get(key) || { calories: 0, accSum: 0, accCount: 0 }
      cur.calories += calories
      if (score !== null) { cur.accSum += score; cur.accCount += 1 }
      dayMap.set(key, cur)
    }
    // Build array and fill gaps with zero for smoother chart
    const result: ChartPoint[] = []
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10)
      const cur = dayMap.get(key)
      const accuracy = cur && cur.accCount > 0 ? Math.round(cur.accSum / cur.accCount) : 0
      const calories = cur ? cur.calories : 0
      result.push({ date: key, calories, accuracy })
    }
    return result
  }, [sessions, timeRange])

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
