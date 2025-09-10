'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="About Us" backHref="/" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="organic">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
            <CardDescription>A family of specialists collaborating to ship quality software.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bark-700">We combine frontend, backend, mobile, design, DevOps, and strategy to deliver end‑to‑end solutions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
