import Dashboard from "@/pages/Dashboard";

/**
 * An array of route configuration objects for the application's router.
 * Each object specifies a `path` and the corresponding React element to render.
 *
 * @example
 * // Usage with React Router
 * routeConfig.map(({ path, element }) => (
 *   <Route path={path} element={element} />
 * ));
 *
 * @property {string} path - The URL path for the route.
 * @property {React.ReactElement} element - The React component to render for the route.
 */
export const routeConfig = [
  { path: '/dashboard', element: <Dashboard /> },
];