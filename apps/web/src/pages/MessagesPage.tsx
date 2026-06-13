import { useState } from 'react'
import { Send, Search } from 'lucide-react'

const conversations = [
  {
    id: '1',
    landlord: 'James Okafor',
    listing: 'Modern Studio Near University Gate',
    lastMessage: 'Hi, the flat is still available. Would you like to arrange a viewing?',
    time: '10:24',
    unread: 2,
  },
  {
    id: '2',
    landlord: 'Priya Sharma',
    listing: 'Shared House – 4 Beds Available',
    lastMessage: 'Thanks for your interest. Please fill out the application form.',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: '3',
    landlord: 'Chen Wei',
    listing: '1-Bed Apartment with City View',
    lastMessage: "The deposit is one month's rent. Let me know if you have questions.",
    time: 'Mon',
    unread: 0,
  },
]

const messagesData: Record<string, { from: string; text: string; time: string }[]> = {
  '1': [
    { from: 'landlord', text: 'Hello! Thanks for enquiring about the studio.', time: '09:10' },
    { from: 'me', text: 'Hi, is the property still available for September?', time: '09:30' },
    { from: 'landlord', text: 'Hi, the flat is still available. Would you like to arrange a viewing?', time: '10:24' },
  ],
  '2': [
    { from: 'me', text: "Good morning, I'm interested in a room in your shared house.", time: 'Yesterday 11:00' },
    { from: 'landlord', text: 'Thanks for your interest. Please fill out the application form.', time: 'Yesterday 14:30' },
  ],
  '3': [
    { from: 'me', text: "What's the deposit amount?", time: 'Mon 16:00' },
    { from: 'landlord', text: "The deposit is one month's rent. Let me know if you have questions.", time: 'Mon 17:00' },
  ],
}

export default function MessagesPage() {
  const [selected, setSelected] = useState('1')
  const [input, setInput] = useState('')
  const conv = conversations.find(c => c.id === selected)!
  const messages = messagesData[selected] || []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex h-[600px]">
        <div className="w-72 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected === c.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 text-sm">{c.landlord}</span>
                  <span className="text-xs text-gray-400">{c.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">{c.listing}</p>
                <p className="text-xs text-gray-400 truncate">{c.lastMessage}</p>
                {c.unread > 0 && (
                  <span className="mt-1 inline-block bg-blue-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">{c.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">{conv.landlord}</p>
            <p className="text-xs text-gray-400">{conv.listing}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${m.from === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.from === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => { if (e.key === 'Enter' && input.trim()) setInput('') }}
            />
            <button
              onClick={() => setInput('')}
              className="bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
