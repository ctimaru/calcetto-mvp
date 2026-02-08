import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { ChatMessage, User } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatCircle, PaperPlaneRight } from '@phosphor-icons/react'
import { getUserInitials } from '@/lib/helpers'
import { motion, AnimatePresence } from 'framer-motion'

interface MatchChatProps {
  matchId: string
  currentUser: User
}

export function MatchChat({ matchId, currentUser }: MatchChatProps) {
  const [messages] = useKV<ChatMessage[]>('chat-messages', [])
  const [matchMessages, setMatchMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [users] = useKV<User[]>('users', [])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!messages) return
    
    const filtered = messages.filter(m => m.matchId === matchId)
    filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    setMatchMessages(filtered)
  }, [messages, matchId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [matchMessages])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    const allMessages = await window.spark.kv.get<ChatMessage[]>('chat-messages') || []
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      matchId,
      userId: currentUser.id,
      message: newMessage.trim(),
      createdAt: new Date().toISOString()
    }

    await window.spark.kv.set('chat-messages', [...allMessages, message])
    setNewMessage('')
  }

  function getUserForMessage(msg: ChatMessage): User | undefined {
    return users?.find(u => u.id === msg.userId)
  }

  function formatMessageTime(iso: string): string {
    const date = new Date(iso)
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChatCircle size={24} weight="duotone" className="text-primary" />
          Chat della partita
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {matchMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <ChatCircle size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
                <p>Nessun messaggio ancora. Inizia la conversazione!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchMessages.map((msg, index) => {
                  const user = getUserForMessage(msg)
                  const isOwn = msg.userId === currentUser.id
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className="h-8 w-8 border-2 border-border">
                        <AvatarFallback className={isOwn ? 'bg-accent/20 text-accent-foreground' : 'bg-primary/10 text-primary'}>
                          {user ? getUserInitials(user) : '??'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`text-xs text-muted-foreground mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {user?.name || 'Unknown'} · {formatMessageTime(msg.createdAt)}
                        </div>
                        <div 
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn 
                              ? 'bg-accent text-accent-foreground rounded-tr-sm' 
                              : 'bg-muted text-foreground rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
