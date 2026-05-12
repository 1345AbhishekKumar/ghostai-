"use client"

import * as React from "react"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"

export function CustomAuthUI({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const router = useRouter()
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn()
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp()
  
  const [mode, setMode] = React.useState<"signin" | "signup">(initialMode)
  const [step, setStep] = React.useState<"credentials" | "verify">("credentials")
  
  // Form State
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)

  const isLoading = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching"

  const switchMode = (newMode: "signin" | "signup") => {
    if (newMode === mode) return
    setMode(newMode)
    setError("")
    setStep("credentials")
    // Sync the URL for clarity and Clerk redirects
    router.push(newMode === "signin" ? "/sign-in" : "/sign-up", { scroll: false })
  }

  // --- Auth Handlers ---

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }
      try {
        const result = await signUp?.password({
          emailAddress: email,
          password,
          firstName,
          lastName,
        })
        if (result?.error) throw result.error

        await signUp?.verifications.sendEmailCode()
        setStep("verify")
      } catch (err: any) {
        if (isClerkAPIResponseError(err)) {
          setError(err.errors[0]?.message || "Sign up failed")
        } else {
          setError(err.message || "An error occurred")
        }
      }
    } else {
      try {
        const result = await signIn?.password({
          identifier: email,
          password,
        })
        if (result?.error) throw result.error

        if (signIn?.status === "needs_second_factor" || signIn?.status === "needs_client_trust") {
          await signIn?.mfa.sendEmailCode()
          setStep("verify")
        } else if (signIn?.status === "complete") {
          await signIn?.finalize({
            navigate: ({ decorateUrl }) => router.push(decorateUrl("/")),
          })
        }
      } catch (err: any) {
        if (isClerkAPIResponseError(err)) {
          setError(err.errors[0]?.message || "Sign in failed")
        } else {
          setError(err.message || "An error occurred")
        }
      }
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      if (mode === "signup") {
        const result = await signUp?.verifications.verifyEmailCode({ code })
        if (result?.error) throw result.error

        if (signUp?.status === "complete") {
          await signUp?.finalize({
            navigate: ({ decorateUrl }) => router.push(decorateUrl("/")),
          })
        }
      } else {
        const result = await signIn?.mfa.verifyEmailCode({ code })
        if (result?.error) throw result.error

        if (signIn?.status === "complete") {
          await signIn?.finalize({
            navigate: ({ decorateUrl }) => router.push(decorateUrl("/")),
          })
        }
      }
    } catch (err: any) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message || "Verification failed")
      } else {
        setError(err.message || "An error occurred")
      }
    }
  }

  const handleSSO = async (strategy: "oauth_google" | "oauth_facebook" | "oauth_apple") => {
    if (mode === "signin") {
      await signIn?.sso({
        strategy,
        redirectUrl: "/",
        redirectCallbackUrl: "/sso-callback",
      })
    } else {
      await signUp?.sso({
        strategy,
        redirectUrl: "/",
        redirectCallbackUrl: "/sso-callback",
      })
    }
  }

  const isSignUp = mode === "signup"

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 box-border flex items-center justify-center">
      <main className="w-full max-w-[1400px] h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] min-h-[750px] bg-brand-black rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row overflow-hidden shadow-2xl relative group">
        
        {/* Spotlight cursor effect element (Simulated hover spotlight with CSS) */}
        <div className="pointer-events-none absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
             style={{ background: 'radial-gradient(600px circle at 50% 50%, rgba(255, 184, 0, 0.04), transparent 40%)' }}>
        </div>

        {/* ================= LEFT PANEL: Image Branding ================= */}
        <div className="hidden lg:flex w-1/2 relative p-12 flex-col justify-between overflow-hidden">
            <img src="https://img.freepik.com/premium-vector/portrait-beautiful-girl-vector-cartoon-illustration_1196-945.jpg" 
                 alt="Abstract Vision Art" 
                 className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-brand-black/10 z-10 pointer-events-none"></div>

            <div className="relative z-20 flex items-center gap-3">
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 10C24 10 20 4 14 4C8 4 6 12 6 12C6 12 12 14 16 18C13 22 10 28 10 28L18 26C18 26 21 34 24 38C27 34 30 26 30 26L38 28C38 28 35 22 32 18C36 14 42 12 42 12C42 12 40 4 34 4C28 4 24 10 24 10Z" fill="url(#paint0_linear)"/>
                    <path d="M24 38C24 38 18 44 12 44C6 44 4 38 4 38C4 38 12 36 16 32L24 38Z" fill="#F58500"/>
                    <path d="M24 38C24 38 30 44 36 44C42 44 44 38 44 38C44 38 36 36 32 32L24 38Z" fill="#F58500"/>
                    <defs>
                        <linearGradient id="paint0_linear" x1="24" y1="4" x2="24" y2="38" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFB800"/>
                            <stop offset="1" stopColor="#F58500"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span className="text-xl font-bold tracking-wide text-white drop-shadow-md">NeuroFox</span>
            </div>

            <div className="relative z-20">
                <div className="flex gap-2 mb-6 items-center">
                    <div className="w-8 h-1 bg-brand-accent rounded-full shadow-[0_0_8px_rgba(255,184,0,0.5)]"></div>
                    <div className="w-2 h-1 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-1 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-1 bg-white/40 rounded-full"></div>
                </div>
                <h1 className="text-5xl xl:text-6xl font-bold mb-4 leading-tight tracking-tight text-white drop-shadow-lg">
                    Create Your<br/>Vision
                </h1>
                <p className="text-lg text-white/80 max-w-md font-light leading-relaxed drop-shadow-md">
                    AI-assisted workspace to craft and elevate your ideas. Step into the future of creative intelligence.
                </p>
            </div>
        </div>

        {/* ================= RIGHT PANEL: Form Interface ================= */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20">
            <div className="w-full max-w-[420px] flex flex-col">
                
                {/* Custom Toggle Pill */}
                {step === "credentials" && (
                <div className="relative flex p-1.5 bg-[#141414] rounded-full w-max mx-auto mb-10 border border-white/5 shadow-inner">
                    <div className={`absolute inset-y-1.5 left-1.5 w-[100px] bg-gradient-to-r from-brand-accent to-brand-accent-dark rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_15px_rgba(255,184,0,0.3)] ${isSignUp ? 'translate-x-0' : 'translate-x-full'}`}></div>
                    <button type="button" onClick={() => switchMode('signup')} className={`relative z-10 w-[100px] py-2 text-sm font-semibold transition-colors duration-300 ${isSignUp ? 'text-brand-black' : 'text-white/50 hover:text-white'}`}>Sign Up</button>
                    <button type="button" onClick={() => switchMode('signin')} className={`relative z-10 w-[100px] py-2 text-sm font-semibold transition-colors duration-300 ${!isSignUp ? 'text-brand-black' : 'text-white/50 hover:text-white'}`}>Log In</button>
                </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2 transition-opacity duration-300">
                        {step === "verify" ? "Check Your Email" : (isSignUp ? "Create An Account" : "Welcome Back")}
                    </h2>
                    <p className="text-white/40 text-sm">
                        {step === "verify" ? "We've sent a verification code." : (isSignUp ? "Join the platform and start creating." : "Enter your credentials to access your workspace.")}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={step === "credentials" ? handleCredentialsSubmit : handleVerifySubmit} className="space-y-4">
                    
                    {step === "credentials" && (
                        <>
                            {/* Expanding Name Fields (Sign Up Only) */}
                            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSignUp ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                                <div className="overflow-hidden pb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="glass-input rounded-xl relative group">
                                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required={isSignUp} placeholder="First Name" className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none" />
                                        </div>
                                        <div className="glass-input rounded-xl relative group">
                                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required={isSignUp} placeholder="Last Name" className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="glass-input rounded-xl relative group flex items-center">
                                <div className="pl-4 text-white/30 group-focus-within:text-brand-accent transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter Your Email" className="w-full bg-transparent pl-3 pr-4 py-3.5 text-sm text-white placeholder-white/30 outline-none" />
                            </div>

                            {/* Password Field */}
                            <div className="glass-input rounded-xl relative group flex items-center">
                                <div className="pl-4 text-white/30 group-focus-within:text-brand-accent transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="w-full bg-transparent pl-3 pr-10 py-3.5 text-sm text-white placeholder-white/30 outline-none" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-white/30 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        {showPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        )}
                                    </svg>
                                </button>
                            </div>

                            {/* Expanding Confirm Password Field (Sign Up Only) */}
                            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSignUp ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                                <div className="overflow-hidden pt-4">
                                    <div className="glass-input rounded-xl relative group flex items-center">
                                        <div className="pl-4 text-white/30 group-focus-within:text-brand-accent transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={isSignUp} placeholder="Confirm Password" className="w-full bg-transparent pl-3 pr-10 py-3.5 text-sm text-white placeholder-white/30 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Forgot Password Link (Login Only) */}
                            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${!isSignUp ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                                <div className="overflow-hidden pt-2 text-right">
                                    <a href="#" className="text-xs text-brand-accent hover:text-brand-accent-dark transition-colors">Forgot your password?</a>
                                </div>
                            </div>
                        </>
                    )}

                    {step === "verify" && (
                        <div className="glass-input rounded-xl relative group flex items-center">
                            <div className="pl-4 text-white/30 group-focus-within:text-brand-accent transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                            <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="Verification Code" className="w-full bg-transparent pl-3 pr-4 py-3.5 text-sm text-white placeholder-white/30 outline-none tracking-widest font-mono" />
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
                    )}

                    {/* Container for Clerk Smart CAPTCHA */}
                    <div id="clerk-captcha"></div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading} className="cta-button w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-wide text-center group disabled:opacity-50">
                        <span className="relative z-10 text-white transition-opacity duration-200 inline-block pointer-events-none">
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : step === "verify" ? "Verify Code" : (isSignUp ? "Create an Account" : "Log In")}
                        </span>
                    </button>
                </form>

                {step === "credentials" && (
                    <>
                        {/* Divider */}
                        <div className="mt-8 mb-6 relative flex items-center">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink-0 mx-4 text-white/20 text-xs uppercase tracking-wider">Or</span>
                            <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        {/* Social Logins */}
                        <div className="grid grid-cols-3 gap-4">
                            <button type="button" onClick={() => handleSSO("oauth_google")} className="social-btn py-3 rounded-xl flex justify-center items-center group">
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            </button>
                            <button type="button" onClick={() => handleSSO("oauth_facebook")} className="social-btn py-3 rounded-xl flex justify-center items-center group">
                                <svg className="w-5 h-5 text-[#1877F2] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </button>
                            <button type="button" onClick={() => handleSSO("oauth_apple")} className="social-btn py-3 rounded-xl flex justify-center items-center group">
                                <svg className="w-5 h-5 text-white transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16.365 21.436c-1.398.986-2.822 1.002-4.225.02-1.282-.897-2.671-1.026-4.041.02-1.574 1.196-3.025 1.135-4.21-.194-2.856-3.21-4.542-8.083-2.617-11.895 1.13-2.24 3.208-3.567 5.385-3.585 1.54-.035 2.964.887 3.82.887.857 0 2.628-1.077 4.464-.906 1.87.126 3.528.905 4.636 2.38-3.834 2.062-3.197 6.945.547 8.358-1.025 2.457-2.585 4.773-3.759 4.915zm-4.32-15.68c-.144-2.124 1.796-4.088 4.02-4.256.34 2.221-1.89 4.225-4.02 4.256z"/>
                                </svg>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </main>
    </div>
  )
}
