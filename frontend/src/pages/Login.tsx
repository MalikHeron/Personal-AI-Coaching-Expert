import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useUser } from "@/hooks/use-user"
import { AuthService } from "@/services/AuthService"
import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function Login() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/oauth/callback', { replace: true });
    }
  }, [user, navigate]);

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      const [response, success] = await new AuthService().login({ email, password });
      if (success) {
        navigate('/oauth/callback', { replace: true })
      } else {
        throw new Error(response);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Login failed", {
          description: error.message
        });
      } else {
        toast.error("An unknown error occurred during login.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector<HTMLInputElement>("#email");
    const passwordInput = form.querySelector<HTMLInputElement>("#password");

    const email = emailInput?.value?.trim() || "";
    const password = passwordInput?.value || "";

    if (!email || !password) return;
    console.log("Submitting login for:", email);
    await loginWithEmailPassword(email, password);
  };

  return (
    <div className="flex flex-col grow items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back, champ</CardTitle>
              <CardDescription>
                Your next workout awaits. Log in to pick up where you left off
                and smash today's goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <Button variant="outline" type="button" disabled={isSubmitting} onClick={() => new AuthService().loginWithGoogle()}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Login with Google
                    </Button>
                    {/* <Button variant="outline" type="button" onClick={() => new AuthService().loginWithMicrosoft()}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="9" height="9" fill="currentColor" />
                        <rect x="13" y="2" width="9" height="9" fill="currentColor" />
                        <rect x="2" y="13" width="9" height="9" fill="currentColor" />
                        <rect x="13" y="13" width="9" height="9" fill="currentColor" />
                      </svg>
                      Login with Microsoft
                    </Button> */}
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or continue with
                  </FieldSeparator>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" required />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner /> <span>Signing in...</span>
                        </div>
                      ) : (
                        "Login"
                      )}
                    </Button>
                    <FieldDescription className="text-center">
                      Don&apos;t have an account? <NavLink to="/signup">Sign up</NavLink>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div >
  )
}