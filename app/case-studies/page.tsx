'use client'

import { PageHeader } from '@/libs/shared-ui/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/shared-ui/components'

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Case Studies" backHref="/" actionButton={{ label: 'Start Project', href: '/order', variant: 'leaf' }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-6">
        {[1,2,3,4].map((i) => (
          <Card key={i} variant="organic" className="p-0">
            <CardHeader>
              <CardTitle>Project {i}</CardTitle>
              <CardDescription>High‑level outcome summary and impact.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-bark-700">A short description of the challenge, solution, and measurable results.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
