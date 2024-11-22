import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: Date
}

export default function InternalChat({ currentModule }: { currentModule: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load initial messages from localStorage
    const storedMessages = localStorage.getItem('chatMessages')
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }

    // Set up event listener for new messages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatMessages') {
        setMessages(JSON.parse(e.newValue || '[]'))
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        sender: currentModule,
        content: newMessage.trim(),
        timestamp: new Date(),
      }
      const updatedMessages = [...messages, message]
      setMessages(updatedMessages)
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
      setNewMessage('')
    }
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardContent className="flex-grow flex flex-col pt-6">
        <ScrollArea className="flex-grow mb-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{message.sender[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{message.sender}</p>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <Button type="submit">Enviar</Button>
        </form>
      </CardContent>
    </Card>
  )
}

