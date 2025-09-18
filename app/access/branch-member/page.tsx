'use client'

import Link from 'next/link'
import { TreePine, Users } from 'lucide-react'
import { PageHeader } from '@/libs/shared-ui/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/libs/shared-ui/components'

export default function BranchMemberPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader 
        title="Branch Member"
        backHref="/"
        actionButton={{ label: 'Join Collective', href: '/auth/signup', variant: 'leaf' }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="organic">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TreePine className="h-8 w-8 text-wisdom-600" />
              <div>
                <CardTitle>Full access to the knowledge base</CardTitle>
                <CardDescription>Participate, contribute, and collaborate with our family of specialists.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-bark-700">
              <li>Access member-only articles and resources</li>
              <li>Comment, discuss, and request topics</li>
              <li>Receive project guidance and code reviews</li>
            </ul>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Link href="/auth/signup">
              <Button variant="leaf">Become a Member</Button>
            </Link>
            <Link href="/collective">
              <Button variant="secondary">Meet the Team</Button>
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-bark-600 flex items-center justify-center gap-2">
          <Users className="h-4 w-4" />
          <span>Looking for advanced access? Explore Elder Tree.</span>
          <Link href="/access/elder-tree" className="text-leaf-600 hover:text-leaf-700 font-medium">Learn more</Link>
        </div>
      </div>
    </div>
  )
}
