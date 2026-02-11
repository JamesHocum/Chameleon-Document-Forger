import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-mono neon-glow tracking-tight">
              Account Created
            </h1>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 neon-box">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {'Your account has been created. If email confirmation is enabled, check your inbox (and spam folder) for a confirmation link.'}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {"If you don't receive an email within a few minutes, you can try signing in directly -- your project may have auto-confirm enabled."}
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="block text-center text-sm font-mono text-neon-pink hover:underline underline-offset-4"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
