import { IconTreadmill, IconArrowLeft } from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";

export default function PageNotFound() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const location = useLocation();
  const isInternalPath = location.pathname.startsWith("/home") || location.pathname === "/";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4 text-center">
      <Card className={`max-w-md w-full bg-gradient-to-b ${isDark ? 'from-muted/40' : 'from-muted'} to-background border-none shadow-none p-8 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="rounded-full bg-primary/10 p-6">
            <IconTreadmill className="h-20 w-20 text-primary" stroke={1.5} />
          </div>

          <div>
            <h2 className="text-6xl font-bold text-foreground">404</h2>
            <h3 className="text-2xl font-semibold text-muted-foreground mt-2">
              Page Not Found
            </h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Looks like you took a wrong turn on your fitness journey. <br />
            Let&apos;s get you back on track.
          </p>

          <NavLink to={isInternalPath ? "/home" : "/"}>
            <Button variant="default" className="flex items-center gap-2">
              <IconArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </NavLink>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-muted-foreground">
        P.A.C.E — Personal AI Coaching Expert
      </p>
    </div>
  );
}