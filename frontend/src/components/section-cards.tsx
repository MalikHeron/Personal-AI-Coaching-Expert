import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { SessionService, Session } from "@/services/SessionService";

function parseDurationToSeconds(d?: string | null): number {
  if (!d) return 0;
  const parts = d.split(":");
  if (parts.length !== 3) return 0;
  const [hh, mm, ss] = parts.map((p) => parseInt(p, 10) || 0);
  return hh * 3600 + mm * 60 + ss;
}

function formatHhMm(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export function SectionCards() {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await SessionService.listSessions();
        if (mounted) setSessions(data);
      } catch (e) {
        console.error("Failed to load sessions for dashboard", e);
        if (mounted) setSessions([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const now = useMemo(() => new Date(), []);
  const last30Start = useMemo(() => new Date(now.getTime() - 30 * 24 * 3600 * 1000), [now]);
  const prev30Start = useMemo(() => new Date(now.getTime() - 60 * 24 * 3600 * 1000), [now]);

  const metrics = useMemo(() => {
    const s = sessions ?? [];
    const isInRange = (d: string | Date, start: Date, end: Date) => {
      const dt = typeof d === 'string' ? new Date(d) : d;
      return dt >= start && dt <= end;
    };

    const end = now;
    const currentRange = s.filter(x => x.completed && isInRange(x.date, last30Start, end));
    const previousRange = s.filter(x => x.completed && isInRange(x.date, prev30Start, last30Start));

    const totalWorkouts = currentRange.length;
    const prevWorkouts = previousRange.length;

    const totalSeconds = currentRange.reduce((acc, cur) => acc + parseDurationToSeconds(cur.duration), 0);
    const prevSeconds = previousRange.reduce((acc, cur) => acc + parseDurationToSeconds(cur.duration), 0);

    const formScores = currentRange.map(x => (typeof x.score === 'number' ? x.score : null)).filter((v): v is number => v !== null);
    const prevFormScores = previousRange.map(x => (typeof x.score === 'number' ? x.score : null)).filter((v): v is number => v !== null);
    const avgForm = formScores.length ? Math.round(formScores.reduce((a, b) => a + b, 0) / formScores.length) : 0;
    const prevAvgForm = prevFormScores.length ? Math.round(prevFormScores.reduce((a, b) => a + b, 0) / prevFormScores.length) : 0;

    // Simple calorie estimate: 5 kcal/min
    const calories = Math.round((totalSeconds / 60) * 5);
    const prevCalories = Math.round((prevSeconds / 60) * 5);

    return {
      totalWorkouts,
      totalTime: totalSeconds,
      avgForm,
      calories,
      deltas: {
        workouts: pctChange(totalWorkouts, prevWorkouts),
        time: pctChange(totalSeconds, prevSeconds),
        form: pctChange(avgForm, prevAvgForm),
        calories: pctChange(calories, prevCalories),
      }
    };
  }, [sessions, now, last30Start, prev30Start]);

  const loading = sessions === null;
  const deltaBadge = (val: number | null) => (
    <Badge variant="outline">
      {val !== null && val >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
      {val === null ? '—' : `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`}
    </Badge>
  );

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Workouts */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Workouts (30d)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : metrics.totalWorkouts}
          </CardTitle>
          <CardAction>
            {deltaBadge(metrics.deltas.workouts)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {loading ? 'Loading…' : (metrics.totalWorkouts > 0 ? 'Nice consistency' : 'No sessions yet')}
          </div>
          <div className="text-muted-foreground">Compared to previous 30 days</div>
        </CardFooter>
      </Card>

      {/* Total Time Trained */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Time Trained (30d)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : formatHhMm(metrics.totalTime)}
          </CardTitle>
          <CardAction>
            {deltaBadge(metrics.deltas.time)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {loading ? 'Loading…' : 'Keep building endurance'}
          </div>
          <div className="text-muted-foreground">Compared to previous 30 days</div>
        </CardFooter>
      </Card>

      {/* Form Accuracy */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Form Accuracy (30d)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : `${metrics.avgForm}%`}
          </CardTitle>
          <CardAction>
            {deltaBadge(metrics.deltas.form)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {loading ? 'Loading…' : (metrics.avgForm >= 80 ? 'Great control' : 'Focus on technique')}
          </div>
          <div className="text-muted-foreground">Compared to previous 30 days</div>
        </CardFooter>
      </Card>

      {/* Calories Burned */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Calories Burned (30d est.)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : metrics.calories.toLocaleString()}
          </CardTitle>
          <CardAction>
            {deltaBadge(metrics.deltas.calories)}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {loading ? 'Loading…' : 'Estimate based on time trained'}
          </div>
          <div className="text-muted-foreground">Compared to previous 30 days</div>
        </CardFooter>
      </Card>
    </div>
  );
}
