'use client'

import Link from 'next/link'
import { Shield, Award } from 'lucide-react'
import { PageHeader } from '../../libs/shared-ui/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '../../libs/shared-ui/components'

export default function ElderTreePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader 
        title="Elder Tree"
        backHref="/"
        actionButton={{ label: 'Request Elevation', href: '/contact', variant: 'organic' }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="organic">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-wisdom-500" />
              <div>
                <CardTitle>Advanced leadership & insight</CardTitle>
                <CardDescription>Unlock mentor-led sessions, strategy reviews, and early access to initiatives.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-bark-700">
              <li>Quarterly strategy and architecture reviews</li>
              <li>Invite-only project leadership circles</li>
              <li>Direct collaboration with senior specialists</li>
            </ul>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Link href="/contact">
              <Button variant="organic">Request Elevation</Button>
            </Link>
            <Link href="/collective">
              <Button variant="secondary">Meet the Elders</Button>
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-bark-600 flex items-center justify-center gap-2">
          <Award className="h-4 w-4" />
          <span>Not ready yet? Become a Branch Member first.</span>
          <Link href="/access/branch-member" className="text-leaf-600 hover:text-leaf-700 font-medium">Join Branch</Link>
        </div>
      </div>
    </div>
  )
}
