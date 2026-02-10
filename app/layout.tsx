import React from "react"
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import { Toaster } from 'sonner'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Chameleon Editor | Spellweaver Studios',
  description: 'Upload, view, and edit documents line-by-line with neon precision.',
}

export const viewport: Viewport = {
  themeColor: '#00ff88',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'hsl(240 15% 6%)',
              border: '1px solid hsl(160 60% 18%)',
              color: 'hsl(160 100% 80%)',
            },
          }}
        />
      </body>
    </html>
  )
}
