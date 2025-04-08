import '@/styles/globals.css'
import { Metadata, Viewport } from 'next'

import { siteConfig } from '@/config/site'
import { fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
// import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { ThemeProvider } from '@/components/theme-provider'
import { AppThemeProvider } from '@/contexts/theme-context'
import { LanguageProvider } from '@/contexts/language-context'
import { Toaster } from "@/components/ui/toaster"

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/WZ.ico',
    shortcut: '/WZ.ico',
    apple: '/WZ.ico',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="zh-CN" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/WZ.ico?v=2" />
        </head>
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LanguageProvider>
              <AppThemeProvider>
                <div className="relative flex min-h-screen flex-col">
                  {/* SiteHeader Example, you can remove it.  */}
                  {/* <SiteHeader /> */}
                  <div className="flex-1">{children}</div>
                </div>
                <TailwindIndicator />
                <Toaster />
              </AppThemeProvider>
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
