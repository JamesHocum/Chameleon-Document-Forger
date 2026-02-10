import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-mono neon-glow-pink tracking-tight">
              Auth Error
            </h1>
          </div>
          <div className="rounded-lg border border-destructive/50 bg-card p-6 neon-box-pink">
            {params?.error ? (
              <p className="text-sm text-muted-foreground">
                {'Error: '}{params.error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                An unspecified error occurred.
              </p>
            )}
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="block text-center text-sm text-neon-green hover:underline underline-offset-4"
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
