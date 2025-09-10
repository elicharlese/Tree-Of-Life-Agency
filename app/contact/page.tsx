'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Contact" backHref="/" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="organic">
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
            <CardDescription>We usually respond within one business day.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bark-700">Email: hello@treeoflife.agency</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
