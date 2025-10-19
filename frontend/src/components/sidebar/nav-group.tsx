import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavLink, useLocation } from "react-router-dom"
import { TablerIcon } from "@tabler/icons-react"

export function NavGroup({
  items,
  label,
  ...props
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon | TablerIcon
    iconFilled?: LucideIcon | TablerIcon
    items?: {
      title: string
      url: string
      icon?: LucideIcon | TablerIcon
      iconFilled?: LucideIcon | TablerIcon
    }[]
  }[],
  label?: string,
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const location = useLocation();

  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          // Determine if any of the subitems match the current path
          const shouldBeOpen = item.items?.some((subItem) =>
            location.pathname.startsWith(subItem.url)
          );

          return item.items && item.items.length > 1 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldBeOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          isActive={location.pathname.startsWith(subItem.url)}
                          asChild
                        >
                          <NavLink to={subItem.url}>
                            {subItem.icon && (
                              location.pathname.startsWith(subItem.url) && subItem.iconFilled
                                ? <subItem.iconFilled />
                                : <subItem.icon />
                            )}
                            <span>{subItem.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={location.pathname.startsWith(item.url)}
                asChild
              >
                <NavLink to={item.url}>
                  {item.icon && (
                    location.pathname.startsWith(item.url) && item.iconFilled
                      ? <item.iconFilled />
                      : <item.icon />
                  )}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
