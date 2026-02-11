'use client'

import React from "react"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/editor`,
        },
      })
      if (error) throw error

      // Check if the user was auto-confirmed (no email confirmation required)
      // If session exists, they're confirmed and we can go straight to the editor
      if (data.session) {
        router.push('/editor')
      } else {
        // Email confirmation is required -- show the check-email page
        router.push('/auth/sign-up-success')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-mono neon-glow tracking-tight">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join the Chameleon Editor
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 neon-box">
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive neon-glow-pink">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {'Already have an account? '}
                <Link
                  href="/auth/login"
                  className="text-neon-pink hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
