'use client'

import { PageHeader } from '../../../libs/shared-ui/components/layout/PageHeader'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Terms of Service" backHref="/" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 prose prose-bark">
        <p>These are placeholder terms of service. Replace with your actual terms.</p>
      </div>
    </div>
  )
}
