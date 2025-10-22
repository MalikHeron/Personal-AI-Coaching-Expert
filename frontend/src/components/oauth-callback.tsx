import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DelayedComponent } from "./ui/delayed-component";
import { Spinner } from "./ui/spinner";
import { Label } from "./ui/label";
import Footer from "./footer";
import { AuthService } from "@/services/AuthService";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

/**
 * Handles the OAuth callback flow after authentication.
 *
 * This component:
 * - Sends a request to the backend to retrieve user information after OAuth login.
 * - Stores the user info in `sessionStorage` if present.
 * - Redirects the user to the `/home` route upon successful authentication.
 * - Displays a loading spinner and message while processing.
 *
 * Uses a ref (`hasRun`) to prevent duplicate effect execution in React Strict Mode.
 *
 * @returns {JSX.Element} The OAuth callback UI with loading indicator.
 */
export default function OAuthCallback() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const hasRun = useRef(false); // 💡 Ref to track if effect already ran

  useEffect(() => {
    if (hasRun.current) return; // 🚫 Prevent second call in Strict Mode
    hasRun.current = true;

    const handleOAuthCallback = async () => {
      try {
        // Prefer `user` from context (social login like Google). If not present,
        // fetch the user from the API (local login path) and persist it.
        let currentUser = user;
        if (!currentUser) {
          // Try to fetch server-validated user (ensures session/cookie is valid)
          currentUser = await new AuthService().fetchUserFromServer();
          // If server fetch fails, fall back to stored user
          if (!currentUser) currentUser = await new AuthService().fetchUser();
          if (!currentUser) {
            toast.error("Login failed", {
              description: "Failed to retrieve user information. Please try logging in again."
            });
            navigate("/login", { replace: true });
            return;
          }

          // persist fetched user for page reloads (sessionStorage preferred)
          try { sessionStorage.setItem('user', JSON.stringify(currentUser)); } catch { /* ignore storage errors */ }

          // update context so the rest of the app sees the logged-in user
          try { setUser(currentUser); } catch { /* ignore if unavailable */ }
        }

        // Unified onboarding redirect logic
        const onboardingIncomplete = (u: unknown) => {
          if (!u || typeof u !== 'object') return true;
          // runtime check for onboarding_completed
          const val = (u as { onboarding_completed?: unknown }).onboarding_completed;
          return val === false || val === null || val === undefined;
        };

        if (onboardingIncomplete(currentUser)) {
          navigate('/onboarding', { replace: true });
          return;
        }

        navigate('/home', { replace: true });
      } catch (error) {
        // Log any errors that occur during the OAuth callback
        console.error("OAuth callback error:", error);
      }
    };

    handleOAuthCallback();
  }, [navigate, user, setUser]);

  return (
    <DelayedComponent
      children={
        <div className="flex flex-col grow justify-center items-center gap-2">
          <main className='flex flex-col grow items-center justify-center w-full'>
            <Spinner className="size-6" />
            <Label className="text-md">Signing in...</Label>
          </main>
          <Footer />
        </div>
      }
      componentName={"OAuthCallback"}
      delay={150}
    />
  );
}
