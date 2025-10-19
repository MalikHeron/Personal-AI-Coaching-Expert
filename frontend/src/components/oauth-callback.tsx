import { useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DelayedComponent } from "./ui/delayed-component";
import { Spinner } from "./ui/spinner";
import { Label } from "./ui/label";
import Footer from "./footer";
import { User } from "@/types/user";


// Set API_URL based on environment (development or production)
const API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_SERVER_DEV
  : import.meta.env.VITE_API_SERVER;


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
  const navigate = useNavigate();
  const hasRun = useRef(false); // 💡 Ref to track if effect already ran

  useEffect(() => {
    if (hasRun.current) return; // 🚫 Prevent second call in Strict Mode
    hasRun.current = true;

    const handleOAuthCallback = async () => {
      try {
        // Send the code to the backend to exchange for token/user info
        const response = await axios.get(`${API_URL}/accounts/user-info/`, {
          withCredentials: true, // Send cookies with the request
        });

        // console.log("OAuth callback response:", response.data);

        // Store user info in sessionStorage if present
        if (response.data) {
          sessionStorage.setItem("user", JSON.stringify(response.data));
        }

        const user = response.data as User;
        if (user && user.onboarding_complete === false) {
          // Redirect to /onboarding if onboarding is not complete
          navigate("/onboarding", { replace: true });
          return;
        } else {
          // Proceed to home if onboarding is complete
          navigate("/home", { replace: true });
          return;
        }
      } catch (error) {
        // Log any errors that occur during the OAuth callback
        console.error("OAuth callback error:", error);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

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
