"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * global-error.tsx catches errors thrown inside the root layout.
 * It must include its own <html> and <body> tags because it replaces the root layout.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "24px",
          fontFamily: "system-ui, sans-serif",
          background: "#09090b",
          color: "#fafafa",
          textAlign: "center",
          padding: "32px",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={32} color="#ef4444" />
        </div>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 8px" }}>
            A critical error occurred
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", maxWidth: 400, margin: 0 }}>
            Ghost AI encountered an unexpected problem. Please reload the page.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#52525b", marginTop: 8 }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 8,
            border: "1px solid #27272a",
            background: "transparent",
            color: "#fafafa",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </body>
    </html>
  )
}
