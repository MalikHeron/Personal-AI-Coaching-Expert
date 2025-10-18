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
import { NavLink } from "react-router-dom"
import { AuthService } from "@/services/AuthService"

export default function SignUp() {
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
  };

  return (
    <div className="flex flex-col grow items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Enter your email below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                    <FieldDescription>
                      We&apos;ll use this to contact you. We will not share your
                      email with anyone else.
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
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button type="submit">Create Account</Button>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or
                  </FieldSeparator>
                  <Field className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" type="button" onClick={() => new AuthService().loginWithGoogle()}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                    <Button variant="outline" type="button" onClick={() => new AuthService().loginWithMicrosoft()}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="9" height="9" fill="currentColor" />
                        <rect x="13" y="2" width="9" height="9" fill="currentColor" />
                        <rect x="2" y="13" width="9" height="9" fill="currentColor" />
                        <rect x="13" y="13" width="9" height="9" fill="currentColor" />
                      </svg>
                      Continue with Microsoft
                    </Button>
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