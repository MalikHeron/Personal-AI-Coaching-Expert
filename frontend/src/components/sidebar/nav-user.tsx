import {
  ChevronsUpDown,
  LogOut,
  UserIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { AuthService } from "@/services/AuthService"
import { getInitials } from "@/helpers/get_initials"
import { User } from "@/types/user";
import { useUser } from "@/hooks/use-user"

export function NavUser() {
  const { user } = useUser();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => { new AuthService().logout() };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className='h-8 w-8'>
                <AvatarImage src={user?.picture || ""} alt="photo" />
                <AvatarFallback>{getInitials(user ?? {} as User)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{`${user?.first_name && user?.last_name ? user.first_name + " " + user?.last_name : "John Doe"}`}</span>
                <span className="truncate text-xs">{user ? user?.email : "johndoe@example.com"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={user?.picture || ""} alt="photo" />
                  <AvatarFallback>{getInitials(user ?? {} as User)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{`${user?.first_name && user?.last_name ? user.first_name + " " + user?.last_name : "John Doe"}`}</span>
                  <span className="truncate text-xs">{user ? user?.email : "johndoe@example.com"}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => { navigate('/home/profile') }}>
                <UserIcon />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
