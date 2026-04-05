import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useHiveClient } from '../hooks/useHiveContext'
import type { ChatMessage } from '@bagdock/hive'

export interface HiveChatProps {
  /** Initial greeting message from the bot */
  greeting?: string
  /** Placeholder text for the input */
  placeholder?: string
  /** Bot name displayed in the chat */
  botName?: string
  /** Height of the chat container */
  height?: string | number
  /** Callback when a message is sent */
  onMessage?: (message: string) => void
  /** CSS class name */
  className?: string
}

export function HiveChat({
  greeting = "Hi! I'm Cora, your storage assistant. How can I help?",
  placeholder = 'Ask me anything...',
  botName = 'Cora',
  height = 500,
  onMessage,
  className,
}: HiveChatProps) {
  const client = useHiveClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (greeting) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString(),
      }])
    }
  }, [greeting])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    onMessage?.(userMessage.content)

    try {
      let currentSession = sessionId
      if (!currentSession) {
        const session = await client.chat.create(userMessage.content)
        currentSession = session.id
        setSessionId(session.id)
      }

      const response = await client.chat.send(currentSession, userMessage.content)
      setMessages(prev => [...prev, response])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, sessionId, client, onMessage])

  return (
    <div
      className={className}
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--hive-radius-lg, 1rem)',
        border: '1px solid var(--hive-color-border, #e5e7eb)',
        overflow: 'hidden',
        fontFamily: 'var(--hive-font-family)',
        backgroundColor: 'var(--hive-color-bg, #fff)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--hive-color-border, #e5e7eb)',
        fontWeight: 600,
        fontSize: 14,
        color: 'var(--hive-color-text, #111827)',
      }}>
        {botName}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: 'var(--hive-radius, 0.75rem)',
              fontSize: 14,
              lineHeight: 1.5,
              ...(msg.role === 'user'
                ? {
                    backgroundColor: 'var(--hive-color-primary, #111827)',
                    color: '#fff',
                  }
                : {
                    backgroundColor: 'var(--hive-color-surface, #f9fafb)',
                    color: 'var(--hive-color-text, #111827)',
                  }),
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--hive-radius)',
              backgroundColor: 'var(--hive-color-surface)',
              color: 'var(--hive-color-text-secondary)',
              fontSize: 14,
            }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--hive-color-border, #e5e7eb)',
        display: 'flex',
        gap: 8,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder={placeholder}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--hive-radius)',
            border: '1px solid var(--hive-color-border)',
            fontSize: 14,
            fontFamily: 'var(--hive-font-family)',
            backgroundColor: 'var(--hive-color-bg)',
            color: 'var(--hive-color-text)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--hive-radius)',
            border: 'none',
            backgroundColor: 'var(--hive-color-primary)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            fontFamily: 'var(--hive-font-family)',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
