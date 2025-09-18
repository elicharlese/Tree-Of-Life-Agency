'use client'

import { PageHeader } from '../../libs/shared-ui/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../../libs/shared-ui/components'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="About Us" backHref="/" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
            <p className="text-gray-600">A family of specialists collaborating to ship quality software.</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">We combine frontend, backend, mobile, design, DevOps, and strategy to deliver end‑to‑end solutions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
