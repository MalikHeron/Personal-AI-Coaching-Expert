import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NavLink, useNavigate } from "react-router-dom"
import { AuthService } from "@/services/AuthService"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"
import { Spinner } from "@/components/ui/spinner"

export default function SignUp() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/oauth/callback', { replace: true });
    }
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector<HTMLInputElement>("#email");
    const passwordInput = form.querySelector<HTMLInputElement>("#password");
    const confirmPasswordInput = form.querySelector<HTMLInputElement>("#confirm-password");
    const firstNameInput = form.querySelector<HTMLInputElement>("#first-name");
    const lastNameInput = form.querySelector<HTMLInputElement>("#last-name");

    const email = emailInput?.value?.trim() || "";
    const password1 = passwordInput?.value || "";
    const password2 = confirmPasswordInput?.value || "";
    const username = email.split("@")[0] || undefined;
    const firstName = firstNameInput?.value?.trim() || undefined;
    const lastName = lastNameInput?.value?.trim() || undefined;

    try {
      setIsSubmitting(true);
      const success = await new AuthService().createAccount({ email, password1, password2, username, first_name: firstName, last_name: lastName });
      if (success) {
        toast.success("Account created successfully! Please log in.");
        navigate('/login');
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col grow items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Sign up to unlock workouts, track progress, and high-five your future self.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup}>
                <FieldGroup>
                  <Field className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                      <Input id="first-name" type="text" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                      <Input id="last-name" type="text" />
                    </Field>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                    <FieldDescription>
                      We&apos;ll use this to send workout recaps and epic progress updates.
                      Your email stays with us — no spam, just gains.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Field className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" type="password" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input id="confirm-password" type="password" required />
                      </Field>
                    </Field>
                    <FieldDescription>
                      Must be at least 8 characters — strong like your willpower.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner /> <span>Signing up...</span>
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or
                  </FieldSeparator>
                  <Field className="grid grid-cols-1 gap-4">
                    <Button variant="outline" type="button" disabled={isSubmitting} onClick={() => new AuthService().loginWithGoogle()}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                    {/* <Button variant="outline" type="button" onClick={() => new AuthService().loginWithMicrosoft()}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="9" height="9" fill="currentColor" />
                        <rect x="13" y="2" width="9" height="9" fill="currentColor" />
                        <rect x="2" y="13" width="9" height="9" fill="currentColor" />
                        <rect x="13" y="13" width="9" height="9" fill="currentColor" />
                      </svg>
                      Continue with Microsoft
                    </Button> */}
                  </Field>
                  <FieldDescription className="text-center">
                    Already have an account? <NavLink to="/login">Sign in</NavLink>
                  </FieldDescription>
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
    </div>
  )
}