'use client'

import Link from 'next/link'
import { Leaf, BookOpen } from 'lucide-react'
import { PageHeader } from '@/libs/shared-ui/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/libs/shared-ui/components'

export default function SeedlingAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader 
        title="Seedling Access"
        backHref="/"
        actionButton={{ label: 'Explore Library', href: '/library', variant: 'leaf' }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="organic">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8 text-leaf-600" />
              <div>
                <CardTitle>Begin your journey</CardTitle>
                <CardDescription>Get started with our foundational knowledge and community resources.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-bark-700">
              <li>Read public articles and best‑practice guides</li>
              <li>Follow along with open discussions</li>
              <li>Preview project case studies and patterns</li>
            </ul>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Link href="/library">
              <Button variant="leaf">Browse Library</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-bark-600 flex items-center justify-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Want full access? Consider becoming a Branch Member.</span>
          <Link href="/access/branch-member" className="text-leaf-600 hover:text-leaf-700 font-medium">Learn more</Link>
        </div>
      </div>
    </div>
  )
}
