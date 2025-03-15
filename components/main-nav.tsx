"use client";

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NavItem } from '@/types/nav'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { useLanguage } from '@/contexts/language-context'

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <div className="mr-4 flex items-center space-x-6">
      <Link href="/" className="flex items-center space-x-2">
        {/* <span className="font-semibold text-lg transition-colors hover:text-primary">
          WeeklyZen
        </span> */}
      </Link>
      <nav className="flex items-center space-x-6">
        {items?.map((item) => (
          item.href && (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hidden text-sm font-medium transition-colors hover:text-primary md:inline-block",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {t(item.title, item.titleEn || item.title)}
            </Link>
          )
        ))}
      </nav>
    </div>
  )
}
