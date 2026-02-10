import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-mono neon-glow tracking-tight">
              Check Your Email
            </h1>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 neon-box">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {"You've successfully signed up. Please check your email to confirm your account before signing in."}
            </p>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="block text-center text-sm text-neon-pink hover:underline underline-offset-4"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
