'use client'

import { useState } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PageHeader } from '@/libs/shared-ui/components/layout/PageHeader'
import { CardVariant as Card, CardHeaderVariant as CardHeader, CardTitleVariant as CardTitle, CardDescriptionVariant as CardDescription, CardContentVariant as CardContent } from '@/libs/shared-ui/components'
import { Input } from '@/libs/shared-ui/components'
import { Button } from '@/libs/shared-ui/components'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, just log the form data
    console.log('Contact form submitted:', formData)
    alert('Thank you for your message! We\'ll get back to you soon.')
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader title="Contact" backHref="/" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="organic">
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
            <CardDescription>Tell us what you’re building. We usually respond within one business day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                      helperText="We’ll only use this to reply."
                    />
                  </div>

                  <Input
                    label="Subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="e.g. New website build, CRM setup, design sprint"
                  />

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-bark-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={7}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="block w-full border border-gray-300 shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      placeholder="Share goals, timeline, budget range, and links (if any)…"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Include any relevant links (Figma, repo, site, docs) to help us respond faster.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                      By submitting, you agree we can reply to the email provided.
                    </p>
                    <Button type="submit" variant="primary" size="lg">
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2">
                <div className="border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact details</h3>

                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-gray-700">hello@treeoflife.agency</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Phone</div>
                        <div className="text-gray-700">Available after first reply</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Response time</div>
                        <div className="text-gray-700">Within 1 business day</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">Working style</div>
                        <div className="text-gray-700">Remote-first, async-friendly</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500">
                      Prefer email? Send a note directly and include your best callback times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
