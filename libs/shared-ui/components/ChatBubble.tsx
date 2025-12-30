'use client'

import { useState } from 'react'
import { Heart, MessageCircle, MessageSquare, Send, X } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'support'
  timestamp: Date
}

interface ChatBubbleProps {
  position?: 'bottom-right' | 'bottom-left'
}

export function ChatBubble({ position = 'bottom-right' }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'messages' | 'favorites'>('messages')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can we help you today?',
      sender: 'support',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [unreadCount] = useState(0)

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6'

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setInputMessage('')

    // Simulate support response
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. Our team will respond shortly.',
        sender: 'support',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, supportMessage])
    }, 1000)
  }

  const favorites = [
    { id: '1', title: 'E-commerce Platform', type: 'Project', status: 'In Progress' },
    { id: '2', title: 'Mobile App MVP', type: 'Project', status: 'Pending' },
    { id: '3', title: 'Frontend Development', type: 'Service', price: '$15,000' }
  ]

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] popout-glassmorphic bg-white/95 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-leaf-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Support & Favorites</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-leaf-700 p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-bark-200">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-leaf-50 text-leaf-700 border-b-2 border-leaf-600'
                  : 'text-bark-600 hover:bg-bark-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="bg-leaf-600 text-white text-xs px-2 py-0.5 font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-leaf-50 text-leaf-700 border-b-2 border-leaf-600'
                  : 'text-bark-600 hover:bg-bark-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'messages' ? (
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 ${
                          message.sender === 'user'
                            ? 'bg-leaf-600 text-white'
                            : 'bg-bark-100 text-bark-800'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-leaf-100' : 'text-bark-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-bark-200 bg-white">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-bark-300 bg-white text-bark-800 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-leaf-500 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-leaf-600 text-white p-2 hover:bg-leaf-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-bark-300 mx-auto mb-3" />
                    <p className="text-bark-600">No favorites yet</p>
                    <p className="text-sm text-bark-500 mt-1">
                      Add projects and services to your favorites
                    </p>
                  </div>
                ) : (
                  favorites.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-bark-200 p-3 hover:border-leaf-500 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-bark-800">{item.title}</h4>
                        <Heart className="w-4 h-4 text-leaf-600 fill-leaf-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-bark-600">{item.type}</span>
                        <span className="text-bark-700 font-medium">
                          {item.status || item.price}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-leaf-600 text-white w-14 h-14 flex items-center justify-center shadow-lg hover:bg-leaf-700 transition-all hover:scale-110 relative"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  )
}
