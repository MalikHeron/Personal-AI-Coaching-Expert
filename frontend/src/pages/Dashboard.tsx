import { ChartAreaInteractive } from "@/components/charts/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";

export default function Dashboard() {
  return (
    <div className="p-2">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your fitness journey at a glance — powered by your performance</p>
      </div>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}