
import { cn } from "@/lib/utils"
import { IconLoader } from "@tabler/icons-react"

function Spinner({ className }: React.ComponentProps<"svg">) {
  return (
    <IconLoader
      className={cn("size-4 animate-spin", className)}
    />
  )
}

export { Spinner }
