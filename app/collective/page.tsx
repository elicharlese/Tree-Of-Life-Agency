'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  Star, 
  MapPin, 
  Calendar,
  ArrowLeft,
  TreePine,
  Github,
  Linkedin,
  Mail,
  Award
} from 'lucide-react'
import Link from 'next/link'

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Frontend Architect',
    specialty: 'React & TypeScript',
    location: 'San Francisco, CA',
    experience: '8 years',
    avatar: '👩‍💻',
    bio: 'Passionate about creating beautiful, performant user interfaces with modern web technologies.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    projects: 47,
    rating: 4.9
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'Backend Engineer',
    specialty: 'Node.js & Cloud Architecture',
    location: 'Austin, TX',
    experience: '10 years',
    avatar: '👨‍💻',
    bio: 'Expert in building scalable backend systems and cloud infrastructure solutions.',
    skills: ['Node.js', 'AWS', 'Docker', 'PostgreSQL'],
    projects: 62,
    rating: 4.8
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'UX/UI Designer',
    specialty: 'Product Design & Research',
    location: 'New York, NY',
    experience: '6 years',
    avatar: '🎨',
    bio: 'Creating user-centered designs that bridge the gap between functionality and beauty.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    projects: 34,
    rating: 4.9
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'DevOps Specialist',
    specialty: 'Infrastructure & Automation',
    location: 'Seattle, WA',
    experience: '7 years',
    avatar: '⚙️',
    bio: 'Streamlining deployment processes and ensuring reliable, scalable infrastructure.',
    skills: ['Kubernetes', 'CI/CD', 'Terraform', 'Monitoring'],
    projects: 41,
    rating: 4.8
  },
  {
    id: 5,
    name: 'Lisa Park',
    role: 'Mobile Developer',
    specialty: 'iOS & React Native',
    location: 'Los Angeles, CA',
    experience: '5 years',
    avatar: '📱',
    bio: 'Building native and cross-platform mobile experiences that users love.',
    skills: ['React Native', 'Swift', 'iOS', 'App Store'],
    projects: 28,
    rating: 4.9
  },
  {
    id: 6,
    name: 'Alex Thompson',
    role: 'Business Strategist',
    specialty: 'Product & Growth Strategy',
    location: 'Chicago, IL',
    experience: '12 years',
    avatar: '📊',
    bio: 'Helping businesses grow through strategic planning and data-driven decisions.',
    skills: ['Strategy', 'Analytics', 'Product Management', 'Growth'],
    projects: 55,
    rating: 4.8
  }
]

export default function Collective() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-bark-600 hover:text-leaf-600 mr-6">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Home
              </Link>
              <div className="flex items-center">
                <TreePine className="h-8 w-8 text-leaf-500 mr-3" />
                <h1 className="text-2xl font-serif text-bark-800">Our Collective</h1>
              </div>
            </div>
            <button className="btn-organic">Join Us</button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-serif text-bark-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Meet Our <span className="text-leaf-600">Family</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-bark-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A diverse group of specialists who share knowledge, collaborate on projects, 
            and grow together like branches of the same tree.
          </motion.p>
        </div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-leaf-600 mb-2">6</div>
            <div className="text-bark-600">Family Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-leaf-600 mb-2">267</div>
            <div className="text-bark-600">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-leaf-600 mb-2">48</div>
            <div className="text-bark-600">Years Combined Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-leaf-600 mb-2">4.8</div>
            <div className="text-bark-600">Average Rating</div>
          </div>
        </motion.div>

        {/* Team Members */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-organic p-8 hover:shadow-leaf group"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-semibold text-bark-800 mb-1">{member.name}</h3>
                <p className="text-leaf-600 font-medium mb-2">{member.role}</p>
                <div className="flex items-center justify-center text-bark-500 text-sm mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {member.location}
                </div>
                <div className="flex items-center justify-center text-wisdom-500">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  <span className="font-medium">{member.rating}</span>
                </div>
              </div>

              <p className="text-bark-600 text-sm mb-6 text-center">{member.bio}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-bark-800 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-leaf-100 text-leaf-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-bark-600">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {member.projects} projects
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {member.experience}
                  </div>
                </div>

                <div className="flex justify-center space-x-3 pt-4 border-t border-bark-200">
                  <button className="p-2 text-bark-500 hover:text-leaf-600 transition-colors">
                    <Github className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-bark-500 hover:text-leaf-600 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-bark-500 hover:text-leaf-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center bg-gradient-to-r from-leaf-500 to-wisdom-500 rounded-branch shadow-organic p-12"
        >
          <Users className="h-16 w-16 text-white mx-auto mb-6" />
          <h3 className="text-3xl font-serif text-white mb-4">Want to Join Our Family?</h3>
          <p className="text-leaf-100 mb-8 max-w-2xl mx-auto">
            We&apos;re always looking for talented individuals who share our passion for 
            creating exceptional digital experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn-organic bg-white text-leaf-600 hover:bg-bark-50">
              Apply Now
            </button>
            <button className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
