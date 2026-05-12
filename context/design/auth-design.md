here is the design for custom sign in , sign up pages

===================================================================================================== 
this is code of my custom design of the sign_up and sign_in page. 
code:    
        "<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeuroFox // Welcome</title>
    
    <!-- Premium Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            black: '#0a0a0a',
                            dark: '#121212',
                            surface: '#1A1A1A',
                            accent: '#FFB800', // Gold/Yellow
                            accentDark: '#F58500', // Deep Orange
                        }
                    }
                }
            }
        }
    </script>

    <style>
        body {
            background-color: #050505;
            color: #ffffff;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        /* --- Custom UI Elements --- */
        .glass-input {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-input:focus-within {
            background: rgba(255, 255, 255, 0.05);
            border-color: theme('colors.brand.accent');
            box-shadow: 0 0 0 1px theme('colors.brand.accent'), 0 8px 24px -8px rgba(255, 184, 0, 0.2);
            transform: translateY(-1px);
        }

        /* Autofill override */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #1A1A1A inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        .cta-button {
            background: linear-gradient(135deg, theme('colors.brand.accent') 0%, theme('colors.brand.accentDark') 100%);
            box-shadow: 0 8px 32px -8px rgba(255, 138, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            color: #ffffff; /* Guarantee text color */
        }
        
        .cta-button::after {
            content: '';
            position: absolute;
            top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: skewX(-20deg);
            transition: 0.5s;
            z-index: 0; /* Keep glare behind text */
            pointer-events: none;
        }

        .cta-button:hover::after {
            left: 150%;
        }

        .cta-button:hover {
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 12px 40px -8px rgba(255, 138, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.5);
        }

        .cta-button:active {
            transform: translateY(1px) scale(0.98);
        }

        /* Smooth expanding container for form logic */
        .form-section {
            display: grid;
            grid-template-rows: 1fr;
            transition: grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        }
        
        .form-section[data-hidden="true"] {
            grid-template-rows: 0fr;
            opacity: 0;
            pointer-events: none;
        }

        .form-section-inner {
            overflow: hidden;
        }

        /* Social buttons */
        .social-btn {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }
        .social-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
    </style>
</head>
<body class="min-h-screen p-4 md:p-8 box-border flex items-center justify-center">

    <!-- Main Container -->
    <main class="w-full max-w-[1400px] h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] min-h-[750px] bg-brand-black rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
        
        <!-- Spotlight cursor effect element -->
        <div id="spotlight" class="pointer-events-none absolute inset-0 z-50 opacity-0 transition-opacity duration-500" style="background: radial-gradient(600px circle at 0px 0px, rgba(255, 255, 255, 0.03), transparent 40%);"></div>

        <!-- ================= LEFT PANEL: Image Branding ================= -->
        <div class="hidden lg:flex w-1/2 relative p-12 flex-col justify-between overflow-hidden">
            
            <!-- Real Image Background -->
            <img src="https://img.freepik.com/premium-vector/portrait-beautiful-girl-vector-cartoon-illustration_1196-945.jpg" 
                 alt="Abstract Vision Art" 
                 class="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
                 onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop'" />
                 
            <!-- Gradient Overlay for Text Legibility -->
            <div class="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-brand-black/10 z-10 pointer-events-none"></div>

            <!-- Logo Area -->
            <div class="relative z-20 flex items-center gap-3">
                <!-- Fox Logo SVG -->
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 10C24 10 20 4 14 4C8 4 6 12 6 12C6 12 12 14 16 18C13 22 10 28 10 28L18 26C18 26 21 34 24 38C27 34 30 26 30 26L38 28C38 28 35 22 32 18C36 14 42 12 42 12C42 12 40 4 34 4C28 4 24 10 24 10Z" fill="url(#paint0_linear)"/>
                    <path d="M24 38C24 38 18 44 12 44C6 44 4 38 4 38C4 38 12 36 16 32L24 38Z" fill="#F58500"/>
                    <path d="M24 38C24 38 30 44 36 44C42 44 44 38 44 38C44 38 36 36 32 32L24 38Z" fill="#F58500"/>
                    <defs>
                        <linearGradient id="paint0_linear" x1="24" y1="4" x2="24" y2="38" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#FFB800"/>
                            <stop offset="1" stop-color="#F58500"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span class="text-xl font-bold tracking-wide text-white drop-shadow-md">NeuroFox</span>
            </div>

            <!-- Copy/Typography Area -->
            <div class="relative z-20">
                <!-- Progress Indicator -->
                <div class="flex gap-2 mb-6 items-center">
                    <div class="w-8 h-1 bg-brand-accent rounded-full shadow-[0_0_8px_rgba(255,184,0,0.5)]"></div>
                    <div class="w-2 h-1 bg-white/40 rounded-full"></div>
                    <div class="w-2 h-1 bg-white/40 rounded-full"></div>
                    <div class="w-2 h-1 bg-white/40 rounded-full"></div>
                </div>
                
                <h1 class="text-5xl xl:text-6xl font-bold mb-4 leading-tight tracking-tight text-white drop-shadow-lg">
                    Create Your<br>Vision
                </h1>
                <p class="text-lg text-white/80 max-w-md font-light leading-relaxed drop-shadow-md">
                    AI-assisted workspace to craft and elevate your ideas. Step into the future of creative intelligence.
                </p>
            </div>
        </div>

        <!-- ================= RIGHT PANEL: Form Interface ================= -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-20">
            
            <div class="w-full max-w-[420px] flex flex-col" id="form-container">
                
                <!-- Custom Toggle Pill -->
                <div class="relative flex p-1.5 bg-[#141414] rounded-full w-max mx-auto mb-10 border border-white/5 shadow-inner">
                    <!-- The sliding active background -->
                    <div id="toggle-bg" class="absolute inset-y-1.5 left-1.5 w-[100px] bg-gradient-to-r from-brand-accent to-brand-accentDark rounded-full transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(255,184,0,0.3)]"></div>
                    
                    <button id="btn-signup" class="relative z-10 w-[100px] py-2 text-sm font-semibold text-brand-black transition-colors duration-300">Sign Up</button>
                    <button id="btn-login" class="relative z-10 w-[100px] py-2 text-sm font-semibold text-white/50 hover:text-white transition-colors duration-300">Log In</button>
                </div>

                <!-- Header -->
                <div class="text-center mb-8">
                    <h2 id="form-title" class="text-3xl font-bold text-white tracking-tight mb-2 transition-opacity duration-300">Create An Account</h2>
                    <p id="form-subtitle" class="text-white/40 text-sm">Join the platform and start creating.</p>
                </div>

                <!-- Form -->
                <form id="auth-form" class="space-y-4">
                    
                    <!-- Expanding Name Fields (Sign Up Only) -->
                    <div class="form-section" id="name-fields" data-hidden="false">
                        <div class="form-section-inner pb-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="glass-input rounded-xl relative group">
                                    <input type="text" id="fname" placeholder="First Name" class="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none">
                                </div>
                                <div class="glass-input rounded-xl relative group">
                                    <input type="text" id="lname" placeholder="Last Name" class="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Email Field -->
                    <div class="glass-input rounded-xl relative group flex items-center">
                        <div class="pl-4 text-white/30 group-focus-within:text-brand-accent transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <input type="email" required placeholder="Enter Your Email" class="w-full bg-transparent pl-3 pr-4 py-3.5 text-sm text-white placeholder-white/30 outline-none">
                    </div>

                    <!-- Password Field -->
                    <div class="glass-input rounded-xl relative group flex items-center">
                        <div class="pl-4 text-white/30 group-focus-within:text-brand-accent transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <input type="password" id="password" required placeholder="Password" class="w-full bg-transparent pl-3 pr-10 py-3.5 text-sm text-white placeholder-white/30 outline-none">
                        <button type="button" class="absolute right-4 text-white/30 hover:text-white transition-colors" onclick="togglePassword('password')">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        </button>
                    </div>

                    <!-- Expanding Confirm Password Field (Sign Up Only) -->
                    <div class="form-section" id="confirm-password-field" data-hidden="false">
                        <div class="form-section-inner pt-4">
                            <div class="glass-input rounded-xl relative group flex items-center">
                                <div class="pl-4 text-white/30 group-focus-within:text-brand-accent transition-colors">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input type="password" id="confirm-password" placeholder="Confirm Password" class="w-full bg-transparent pl-3 pr-10 py-3.5 text-sm text-white placeholder-white/30 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- Forgot Password Link (Login Only) -->
                    <div class="form-section" id="forgot-password-link" data-hidden="true">
                        <div class="form-section-inner pt-2 text-right">
                            <a href="#" class="text-xs text-brand-accent hover:text-brand-accentDark transition-colors">Forgot your password?</a>
                        </div>
                    </div>

                    <!-- Submit Button (Fixed Layout & Visibility) -->
                    <button type="submit" id="submit-btn" class="cta-button w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-wide text-center group">
                        <span id="btn-text" class="relative z-10 text-white transition-opacity duration-200 inline-block pointer-events-none">Create an Account</span>
                    </button>
                </form>

                <!-- Divider -->
                <div class="mt-8 mb-6 relative flex items-center">
                    <div class="flex-grow border-t border-white/5"></div>
                    <span class="flex-shrink-0 mx-4 text-white/20 text-xs uppercase tracking-wider">Or</span>
                    <div class="flex-grow border-t border-white/5"></div>
                </div>

                <!-- Social Logins -->
                <div class="grid grid-cols-3 gap-4">
                    <!-- Google -->
                    <button class="social-btn py-3 rounded-xl flex justify-center items-center group">
                        <svg class="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    </button>
                    <!-- Facebook -->
                    <button class="social-btn py-3 rounded-xl flex justify-center items-center group">
                        <svg class="w-5 h-5 text-[#1877F2] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </button>
                    <!-- Apple -->
                    <button class="social-btn py-3 rounded-xl flex justify-center items-center group">
                        <svg class="w-5 h-5 text-white transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.365 21.436c-1.398.986-2.822 1.002-4.225.02-1.282-.897-2.671-1.026-4.041.02-1.574 1.196-3.025 1.135-4.21-.194-2.856-3.21-4.542-8.083-2.617-11.895 1.13-2.24 3.208-3.567 5.385-3.585 1.54-.035 2.964.887 3.82.887.857 0 2.628-1.077 4.464-.906 1.87.126 3.528.905 4.636 2.38-3.834 2.062-3.197 6.945.547 8.358-1.025 2.457-2.585 4.773-3.759 4.915zm-4.32-15.68c-.144-2.124 1.796-4.088 4.02-4.256.34 2.221-1.89 4.225-4.02 4.256z"/>
                        </svg>
                    </button>
                </div>
                
            </div>
        </div>
    </main>

    <!-- Custom Interaction Logic -->
</body>
</html>"