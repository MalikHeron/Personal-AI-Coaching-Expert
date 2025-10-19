import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Footer component that conditionally renders a footer element based on the current route.
 *
 * - The footer is hidden on specific internal routes (e.g., `/home`).
 * - Uses React Router's `useLocation` to determine the current path.
 * - Ensures the footer is not rendered until the initial logic has executed.
 *
 * @returns {JSX.Element | null} The footer element if visible, otherwise `null`.
 */
export default function Footer() {
  const [showFooter, setShowFooter] = useState(false); // start hidden
  const location = useLocation();

  useEffect(() => {
    const hideOnPaths = ['/home'];
    const isInternal = hideOnPaths.some(path => location.pathname.startsWith(path));

    // Only show footer if not internal route
    setShowFooter(!isInternal);
  }, [location]);

  // Optional: prevent rendering until logic runs once
  const [hasRendered, setHasRendered] = useState(false);
  useEffect(() => {
    setHasRendered(true);
  }, []);

  if (!hasRendered) return null;

  return (
    showFooter && (
      <footer className="flex py-8 justify-center">
        <p className="text-secondary-foreground text-sm">
          &copy; {new Date().getFullYear()}{' '}
          <a
            href="http://localhost"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            P.A.C.E
          </a>
        </p>
      </footer>
    )
  );
}