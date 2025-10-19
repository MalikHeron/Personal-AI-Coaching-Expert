import { Routes, Route, useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect } from 'react';
import PageNotFound from '@/components/page-not-found';
import { routeConfig } from './routeConfig';
import { DelayedComponent } from '@/components/ui/delayed-component';
import { useUser } from '@/hooks/use-user';
import { Spinner } from '@/components/ui/spinner';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

const Home = () => {
  const location = useLocation(); // Get current route
  const { user, isLoading, refreshUser } = useUser();
  const navigate = useNavigate();

  // Mapping of specific route paths to custom breadcrumb labels.
  // This allows overriding the default breadcrumb label for certain routes.
  const breadcrumbMappings = [
    { url: '/dashboard', label: "Dashboard" },
    { url: '/workouts', label: "Workouts" },
    { url: '/ai-coach', label: "AI Coach" },
  ]

  useEffect(() => {
    // Refresh user info on navigation or when refreshUser changes
    refreshUser()
  }, [navigate, refreshUser]);

  // Format a breadcrumb segment (decode and capitalize)
  const formatSegment = (segment: string) => {
    try {
      const decoded = decodeURIComponent(segment);
      return decoded
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch {
      return segment; // fallback if decoding fails
    }
  };

  // Current path without "/home"
  const currentPath = location.pathname.replace(/^\/home/, '') || '/';
  // Generate breadcrumb items dynamically
  const pathSegments = currentPath.split('/').filter(Boolean); // Remove empty segments
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/home/${pathSegments.slice(0, index + 1).join('/')}`;
    // Check if this segment has a custom label mapping
    const mapping = breadcrumbMappings.find(m => m.url === path.replace(/^\/home/, ''));
    const label = mapping?.label || formatSegment(segment);
    return {
      label,
      path,
      isLast: index === pathSegments.length - 1
    };
  });

  return (
    <>
      {isLoading ? (
        // Show loading spinner while checking user access
        <DelayedComponent
          children={
            <div className='flex flex-col h-screen w-full items-center justify-center gap-2'>
              <Spinner className='size-8' />
              <p className='text-md'>Checking access...</p>
            </div>
          }
          componentName={"Home"}
          delay={300}
        />
      ) : (
        <>
          {/* Main layout with sidebar, header, and content */}
          <SidebarProvider className='max-w-screen max-h-screen'>
            <AppSidebar />
            <SidebarInset className='max-w-screen max-h-screen overflow-hidden'>
              <header className="flex rounded-xl sticky top-0 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                  <Breadcrumb id='home-breadcrumb'>
                    <BreadcrumbList>
                      {/* Dynamic Breadcrumbs */}
                      {breadcrumbs.map(({ label, path, isLast }, index) => (
                        <BreadcrumbItem key={path}>
                          {isLast ? (
                            <BreadcrumbPage>{label}</BreadcrumbPage>
                          ) : (
                            <>
                              <BreadcrumbLink asChild>
                                <Link to={path}>{label}</Link>
                              </BreadcrumbLink>
                              {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </>
                          )}
                        </BreadcrumbItem>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                  {/* Theme Toggle Buttons */}
                  <div className='flex items-center gap-2 ml-auto'>
                    <AnimatedThemeToggler />
                  </div>
                </div>
              </header>
              {/* Main content area with routes */}
              <div className="flex flex-1 flex-col gap-4 px-4 pt-0 overflow-y-auto">
                <Routes>
                  {/* Redirect /home to /home/dashboard */}
                  <Route path="" element={<Navigate to="/home/dashboard" replace />} />
                  {routeConfig.map(({ path, element }) => (
                    !user && (
                      <Route
                        key={path}
                        path={path}
                        element={element}
                      />
                    )
                  ))}
                  {/* Fallback route for 404 */}
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </>
      )}
    </>
  );
};

export default Home;