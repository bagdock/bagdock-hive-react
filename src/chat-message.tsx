"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "./utils"
import { ChatMarkdown } from "./chat-markdown"
import {
  HIDDEN_TOOL_STEPS,
  isToolDone,
  isToolError,
  ToolExecutionStep,
  QuickReplyChips,
  VerificationCard,
} from "./chat-primitives"
import { ReasoningBlock } from "./reasoning-block"
import { defaultRenderToolResult } from "./tool-cards"
import type { AIMessage, ToolResultRenderer } from "./types"

export interface ChatMessageProps {
  message: AIMessage
  onSendMessage?: (message: string) => void
  renderToolResult?: ToolResultRenderer
}

export function ChatMessage({ message, onSendMessage, renderToolResult }: ChatMessageProps) {
  const isUser = message.role === "user"
  const parts = message.parts
  const hasParts =
    parts && parts.length > 0 && parts.some((p) => p.type === "text" || p.type?.startsWith("tool-"))
  const hasContent = !!message.content?.trim()

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      {!isUser && message.metadata?.routing && (
        <ReasoningBlock routing={message.metadata.routing} />
      )}

      {hasParts ? (
        <>
          {parts!.map((part, i) => {
            if (part.type === "text" && part.text) {
              return (
                <div
                  key={`${message.id}-text-${i}`}
                  className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    isUser
                      ? "bg-gray-100 text-gray-900 rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-900 rounded-bl-md shadow-sm",
                  )}
                >
                  <ChatMarkdown content={part.text} />
                </div>
              )
            }

            if (part.type?.startsWith("tool-") && part.toolName) {
              const isDone = isToolDone(part.state)

              if (part.toolName === "offerChoices" && isDone) {
                const output = part.output as
                  | { choices?: { label: string; value: string }[] }
                  | undefined
                const choices = output?.choices ?? []
                if (choices.length > 0) {
                  return (
                    <QuickReplyChips
                      key={`${message.id}-qr-${i}`}
                      choices={choices}
                      onSelect={onSendMessage}
                    />
                  )
                }
                return null
              }

              if (part.toolName === "startIdentityVerification" && isDone) {
                const output = part.output as
                  | { url?: string | null; sessionRef?: string | null; success?: boolean }
                  | undefined
                if (output?.url) {
                  return (
                    <VerificationCard
                      key={`${message.id}-verify-${i}`}
                      url={output.url}
                      sessionRef={output.sessionRef}
                      onVerified={() =>
                        onSendMessage?.(
                          "My identity is now verified, please continue with the rental",
                        )
                      }
                    />
                  )
                }
                return null
              }

              if (HIDDEN_TOOL_STEPS.has(part.toolName)) return null

              const toolResultNode =
                renderToolResult?.(part.toolName, part.output, onSendMessage) ??
                defaultRenderToolResult(part.toolName, part.output)
              return (
                <div key={`${message.id}-tool-${i}`} className="w-full max-w-[90%]">
                  <ToolExecutionStep toolName={part.toolName} state={part.state}>
                    {toolResultNode}
                  </ToolExecutionStep>
                </div>
              )
            }

            return null
          })}
        </>
      ) : hasContent ? (
        <div
          className={cn(
            "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-gray-100 text-gray-900 rounded-br-md"
              : "bg-white border border-gray-100 text-gray-900 rounded-bl-md shadow-sm",
          )}
        >
          <ChatMarkdown content={message.content || ""} />
        </div>
      ) : !isUser && message.metadata?.routing ? (
        <div className="max-w-[85%] px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        </div>
      ) : null}

      {message.timestamp && (
        <span className="text-[10px] text-gray-300 px-2">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  )
}

export function LoadingMessage() {
  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="max-w-[85%] px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </div>
  )
}
