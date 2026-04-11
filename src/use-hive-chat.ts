"use client"

import * as React from "react"

import type { AIMessage, AIMessageMetadata, AIMessagePart } from "./types"
import { useHiveConfig } from "./provider"

export interface UseHiveChatConfig {
  /** Hive API key (embed key or restricted key) */
  apiKey: string
  /** Operator ID for multi-tenant resolution */
  operatorId?: string
  /** Base URL override for local development (e.g., ngrok tunnel) */
  baseUrl?: string
  /** Initial messages to pre-populate */
  initialMessages?: AIMessage[]
  /** Callback when session ID is resolved from the first response */
  onSessionId?: (sessionId: string) => void
  /** Callback when the current agent changes */
  onAgentChange?: (agent: string) => void
}

export interface UseHiveChatReturn {
  messages: AIMessage[]
  isLoading: boolean
  error: string | null
  sessionId: string | null
  currentAgent: string | null
  sendMessage: (text: string) => void
  clearMessages: () => void
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>
}

/**
 * Hook that wraps the Vercel AI SDK `useChat` with HiveChatTransport.
 *
 * Requires `@bagdock/hive` and `@ai-sdk/react` as peer dependencies.
 * When those are not installed, this hook throws a helpful error.
 *
 * Usage:
 * ```tsx
 * import { useHiveChat } from '@bagdock/hive-react'
 *
 * function ChatPage() {
 *   const { messages, sendMessage, isLoading } = useHiveChat({
 *     apiKey: 'ek_live_...',
 *     operatorId: 'op_...',
 *   })
 *   // ...
 * }
 * ```
 */
export function useHiveChat({
  apiKey,
  operatorId,
  baseUrl,
  initialMessages = [],
  onSessionId,
  onAgentChange,
}: UseHiveChatConfig): UseHiveChatReturn {
  const config = useHiveConfig()
  const [messages, setMessages] = React.useState<AIMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [currentAgent, setCurrentAgent] = React.useState<string | null>(null)

  const resolvedBaseUrl = React.useMemo(() => {
    if (baseUrl) return baseUrl
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = globalThis as any
      if (g?.process?.env?.BAGDOCK_API_URL) return g.process.env.BAGDOCK_API_URL as string
    } catch {
      /* browser — no process */
    }
    return "https://api.bagdock.com"
  }, [baseUrl])

  const sendMessage = React.useCallback(
    async (text: string) => {
      const userMsg: AIMessage = {
        id: `usr_${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setError(null)

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        }
        if (operatorId) headers["X-Bagdock-Operator-Id"] = operatorId

        const body = JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          ...(sessionId ? { sessionId } : {}),
        })

        const res = await fetch(`${resolvedBaseUrl}/api/v1/hive/chat/stream`, {
          method: "POST",
          headers,
          body,
        })

        if (!res.ok) {
          const errBody = await res.text().catch(() => "")
          throw new Error(`Chat request failed (${res.status}): ${errBody}`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        let assistantContent = ""
        let metadata: AIMessageMetadata = {}
        const parts: AIMessagePart[] = []
        const assistantId = `ast_${Date.now()}`
        let sseBuffer = ""
        let currentTextId: string | null = null

        const upsertAssistant = () => {
          setMessages((prev) => {
            const msg: AIMessage = {
              id: assistantId,
              role: "assistant",
              content: assistantContent,
              timestamp: new Date().toISOString(),
              metadata,
              parts: [...parts],
            }
            const idx = prev.findIndex((m) => m.id === assistantId)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = msg
              return next
            }
            return [...prev, msg]
          })
        }

        const handleEvent = (data: Record<string, unknown>) => {
          switch (data.type) {
            case "start": {
              const mm = data.messageMetadata as Record<string, unknown> | undefined
              if (mm?.sessionId && typeof mm.sessionId === "string") {
                setSessionId(mm.sessionId)
                onSessionId?.(mm.sessionId)
              }
              if (mm?.currentAgent && typeof mm.currentAgent === "string") {
                setCurrentAgent(mm.currentAgent)
                onAgentChange?.(mm.currentAgent)
              }
              if (mm?.routing) {
                metadata = { ...metadata, routing: mm.routing as AIMessageMetadata["routing"] }
              }
              break
            }
            case "text-start": {
              currentTextId = (data.id as string) ?? null
              break
            }
            case "text-delta": {
              const deltaId = (data.id as string) ?? null
              const delta = data.delta as string
              assistantContent += delta

              let existingText: AIMessagePart | undefined
              for (let j = parts.length - 1; j >= 0; j--) {
                if (parts[j].type === "text" && (parts[j] as any)._textId === deltaId) {
                  existingText = parts[j]
                  break
                }
              }
              if (existingText) {
                existingText.text = (existingText.text ?? "") + delta
              } else {
                const newPart: AIMessagePart = { type: "text", text: delta }
                ;(newPart as any)._textId = deltaId
                parts.push(newPart)
              }
              upsertAssistant()
              break
            }
            case "text-end": {
              currentTextId = null
              break
            }
            case "tool-input-available": {
              const existing = parts.find(
                (p) => p.type === "tool-invocation" && p.toolCallId === data.toolCallId,
              )
              if (existing) {
                existing.args = data.input as Record<string, unknown>
              } else {
                parts.push({
                  type: "tool-invocation",
                  state: "call",
                  toolCallId: data.toolCallId as string,
                  toolName: data.toolName as string,
                  args: data.input as Record<string, unknown>,
                })
              }
              upsertAssistant()
              break
            }
            case "tool-output-available": {
              const existing = parts.find(
                (p) => p.type === "tool-invocation" && p.toolCallId === data.toolCallId,
              )
              if (existing) {
                existing.state = "result"
                existing.output = data.output
              } else {
                parts.push({
                  type: "tool-invocation",
                  state: "result",
                  toolCallId: data.toolCallId as string,
                  output: data.output,
                })
              }
              upsertAssistant()
              break
            }
          }
        }

        // Also handle legacy Data Stream Protocol prefixes (0:, 8:, 9:, a:)
        const handleLegacyLine = (line: string): boolean => {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2)) as string
              assistantContent += text
              const existingText = parts.find((p) => p.type === "text")
              if (existingText) {
                existingText.text = assistantContent
              } else {
                parts.push({ type: "text", text: assistantContent })
              }
              upsertAssistant()
              return true
            } catch { /* skip */ }
          }
          if (line.startsWith("9:")) {
            try {
              const call = JSON.parse(line.slice(2)) as {
                toolCallId: string; toolName: string; args: Record<string, unknown>
              }
              const existing = parts.find(
                (p) => p.type === "tool-invocation" && p.toolCallId === call.toolCallId,
              )
              if (existing) { existing.args = call.args }
              else { parts.push({ type: "tool-invocation", state: "call", toolCallId: call.toolCallId, toolName: call.toolName, args: call.args }) }
              upsertAssistant()
              return true
            } catch { /* skip */ }
          }
          if (line.startsWith("a:")) {
            try {
              const result = JSON.parse(line.slice(2)) as { toolCallId: string; result: unknown }
              const existing = parts.find(
                (p) => p.type === "tool-invocation" && p.toolCallId === result.toolCallId,
              )
              if (existing) { existing.state = "result"; existing.output = result.result }
              else { parts.push({ type: "tool-invocation", state: "result", toolCallId: result.toolCallId, output: result.result }) }
              upsertAssistant()
              return true
            } catch { /* skip */ }
          }
          if (line.startsWith("8:")) {
            try {
              const meta = JSON.parse(line.slice(2)) as Record<string, unknown>
              if (meta.sessionId && typeof meta.sessionId === "string") {
                setSessionId(meta.sessionId); onSessionId?.(meta.sessionId)
              }
              if (meta.currentAgent && typeof meta.currentAgent === "string") {
                setCurrentAgent(meta.currentAgent); onAgentChange?.(meta.currentAgent)
              }
              if (meta.routing) { metadata = { ...metadata, routing: meta.routing as AIMessageMetadata["routing"] } }
              return true
            } catch { /* skip */ }
          }
          return false
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          sseBuffer += chunk

          // Split SSE events on double newline
          const eventBlocks = sseBuffer.split("\n\n")
          sseBuffer = eventBlocks.pop() || ""

          for (const block of eventBlocks) {
            const lines = block.split("\n").filter(Boolean)
            for (const line of lines) {
              // UI Message Stream Protocol: "data: {...}"
              if (line.startsWith("data: ")) {
                const payload = line.slice(6)
                if (payload === "[DONE]") continue
                try {
                  const data = JSON.parse(payload) as Record<string, unknown>
                  handleEvent(data)
                } catch {
                  /* unparseable SSE data */
                }
                continue
              }
              // Legacy Data Stream Protocol: "0:", "8:", "9:", "a:"
              handleLegacyLine(line)
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    },
    [apiKey, operatorId, resolvedBaseUrl, messages, sessionId, onSessionId, onAgentChange],
  )

  const clearMessages = React.useCallback(() => {
    setMessages([])
    setSessionId(null)
    setCurrentAgent(null)
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sessionId,
    currentAgent,
    sendMessage,
    clearMessages,
    setMessages,
  }
}
