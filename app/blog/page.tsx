'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Blog" backHref="/" actionButton={{ label: 'Subscribe', href: '/auth/signup', variant: 'leaf' }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-6">
        {[1,2,3].map((i) => (
          <Link key={i} href="#">
            <Card variant="organic" className="hover:shadow-leaf transition-shadow">
              <CardHeader>
                <CardTitle>Post Title {i}</CardTitle>
                <CardDescription>Short excerpt of the article...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-bark-700">Preview of the content with a call to read more.</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
