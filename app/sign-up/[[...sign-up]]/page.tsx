import { SignUp } from "@clerk/nextjs"

import { AuthShell } from "@/components/auth/auth-shell"
import { clerkSignInPath, clerkSignUpPath } from "@/lib/clerk-routes"

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your Ghost AI workspace."
      description="Start building architecture documents with AI and collaborate with your team in a shared editor."
      features={[
        "Secure account and workspace access",
        "Shared project ownership and collaboration",
        "Continuous design-to-spec workflow",
      ]}
    >
      <SignUp path={clerkSignUpPath} routing="path" signInUrl={clerkSignInPath} />
    </AuthShell>
  )
}
