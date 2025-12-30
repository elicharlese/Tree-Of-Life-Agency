'use client'

import Link from 'next/link'
import { BarChart3, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/libs/shared-ui/components/layout/PageHeader'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/libs/shared-ui/components'

export default function StrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Business Strategy" backHref="/services" actionButton={{ label: 'Get Quote', href: '/order', variant: 'primary' }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-wisdom-600" />
              <div>
                <CardTitle>From Idea to Impact</CardTitle>
                <CardDescription>Technical audits, roadmaps, and data‑driven growth planning.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-bark-700">
              {['Product & growth strategy','Architecture reviews','Team enablement','KPIs & analytics'].map(item => (
                <li key={item} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-leaf-600" /> {item}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Link href="/order"><Button variant="primary">Order Service</Button></Link>
            <Link href="/services"><Button variant="secondary">All Services</Button></Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
