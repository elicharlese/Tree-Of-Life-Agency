'use client'

import Link from 'next/link'
import { Smartphone, CheckCircle } from 'lucide-react'
import { PageHeader } from '../../../libs/shared-ui/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '../../../libs/shared-ui/components'

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Mobile Apps" backHref="/services" actionButton={{ label: 'Get Quote', href: '/order', variant: 'leaf' }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="organic">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-leaf-600" />
              <div>
                <CardTitle>Native & Cross‑Platform</CardTitle>
                <CardDescription>React Native & native iOS/Android with modern CI/CD.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-bark-700">
              {['App Store & Play Store deployment','Push notifications','Offline‑first patterns','Accessibility & performance'].map(item => (
                <li key={item} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-leaf-600" /> {item}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Link href="/order"><Button variant="leaf">Order Service</Button></Link>
            <Link href="/services"><Button variant="secondary">All Services</Button></Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
