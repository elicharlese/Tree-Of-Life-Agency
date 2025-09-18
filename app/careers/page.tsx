'use client'

import Link from 'next/link'
import { PageHeader } from '../../../libs/shared-ui/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../../../libs/shared-ui/components'

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Careers" backHref="/" actionButton={{ label: 'Join Collective', href: '/auth/signup', variant: 'leaf' }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {[{t:'Frontend Engineer', d:'React/Next.js, TypeScript, UI systems'},{t:'Backend Engineer', d:'Node.js, databases, security'}, {t:'Designer', d:'Product, UX, systems'}].map((job, i) => (
          <Card key={i} variant="organic">
            <CardHeader>
              <CardTitle>{job.t}</CardTitle>
              <CardDescription>{job.d}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/contact" className="text-leaf-600 font-medium">Express interest →</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
