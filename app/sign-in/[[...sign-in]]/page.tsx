import { SignIn } from "@clerk/nextjs"

import { AuthShell } from "@/components/auth/auth-shell"
import { clerkSignInPath, clerkSignUpPath } from "@/lib/clerk-routes"

export default function SignInPage() {
  return (
    <AuthShell
      title="Design systems with your team."
      description="Sign in to open your workspace, collaborate on architecture, and keep project specs in one place."
      features={[
        "Real-time canvas collaboration",
        "AI-assisted architecture generation",
        "Project-based workspace access",
      ]}
    >
      <SignIn path={clerkSignInPath} routing="path" signUpUrl={clerkSignUpPath} />
    </AuthShell>
  )
}
