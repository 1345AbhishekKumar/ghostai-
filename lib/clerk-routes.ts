const DEFAULT_SIGN_IN_PATH = "/sign-in"
const DEFAULT_SIGN_UP_PATH = "/sign-up"

function getAuthPath(envValue: string | undefined, fallbackPath: string) {
  if (!envValue) {
    return fallbackPath
  }

  if (envValue.startsWith("/")) {
    return envValue
  }

  if (URL.canParse(envValue)) {
    const pathname = new URL(envValue).pathname
    return pathname.length > 0 ? pathname : fallbackPath
  }

  return fallbackPath
}

export const clerkSignInPath = getAuthPath(
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  DEFAULT_SIGN_IN_PATH,
)

export const clerkSignUpPath = getAuthPath(
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  DEFAULT_SIGN_UP_PATH,
)
