import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { clerkSignInPath } from "@/lib/clerk-routes"

export default async function Home() {
  const { isAuthenticated } = await auth()

  if (isAuthenticated) {
    redirect("/editor")
  }

  redirect(clerkSignInPath)
}
