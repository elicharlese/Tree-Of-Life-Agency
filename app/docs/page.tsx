'use client'

import Link from 'next/link'
import { PageHeader } from '../../../libs/shared-ui/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../libs/shared-ui/components'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Documentation" backHref="/" actionButton={{ label: 'View on GitHub', href: '#', variant: 'secondary' }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-6">
        {[{t:'Getting Started', d:'Install, run, and deploy'}, {t:'Design System', d:'Tokens and components'}, {t:'API', d:'Endpoints and auth'}].map((s, i) => (
          <Link key={i} href="#">
            <Card variant="organic" className="hover:shadow-leaf transition-shadow">
              <CardHeader>
                <CardTitle>{s.t}</CardTitle>
                <CardDescription>{s.d}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-bark-700">Reference and guides for the Tree of Life Agency project.</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
