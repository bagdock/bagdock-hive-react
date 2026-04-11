"use client"

import * as React from "react"

export function ChatMarkdown({ content }: { content: string }) {
  const blocks = parseBlocks(content)
  return <>{blocks.map((block, i) => renderBlock(block, i))}</>
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "hr" }

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n")
  const at = (idx: number): string => lines[idx] ?? ""
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = at(i)

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" })
      i++
      continue
    }

    if (line.trimStart().startsWith("|") && i + 1 < lines.length && /^\|[\s:-]+\|/.test(at(i + 1).trim())) {
      const headerCells = splitTableRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && at(i).trimStart().startsWith("|")) {
        rows.push(splitTableRow(at(i)))
        i++
      }
      blocks.push({ type: "table", headers: headerCells, rows })
      continue
    }

    if (/^\s*[-*+]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s/.test(at(i))) {
        items.push(at(i).replace(/^\s*[-*+]\s/, ""))
        i++
      }
      blocks.push({ type: "list", ordered: false, items })
      continue
    }

    if (/^\s*\d+[.)]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+[.)]\s/.test(at(i))) {
        items.push(at(i).replace(/^\s*\d+[.)]\s/, ""))
        i++
      }
      blocks.push({ type: "list", ordered: true, items })
      continue
    }

    if (!line.trim()) {
      i++
      continue
    }

    let para = line
    i++
    while (
      i < lines.length &&
      at(i).trim() &&
      !at(i).trimStart().startsWith("|") &&
      !/^\s*[-*+]\s/.test(at(i)) &&
      !/^\s*\d+[.)]\s/.test(at(i)) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(at(i))
    ) {
      para += "\n" + at(i)
      i++
    }
    blocks.push({ type: "paragraph", text: para })
  }

  return blocks
}

function splitTableRow(row: string): string[] {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.type) {
    case "hr":
      return <hr key={key} className="my-2 border-[var(--hive-color-border,#e5e7eb)]" />

    case "table":
      return (
        <div key={key} className="my-2 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {block.headers.map((h, j) => (
                  <th key={j} className="text-left font-semibold text-[var(--hive-color-text,#374151)] px-2 py-1.5 border-b border-[var(--hive-color-border,#e5e7eb)]">
                    <InlineMarkdown text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[var(--hive-color-border,#f3f4f6)] last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1.5 text-[var(--hive-color-text-secondary,#4b5563)]">
                      <InlineMarkdown text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "list": {
      const Tag = block.ordered ? "ol" : "ul"
      return (
        <Tag
          key={key}
          className={`my-1.5 space-y-0.5 ${block.ordered ? "list-decimal" : "list-disc"} pl-4`}
        >
          {block.items.map((item, j) => (
            <li key={j} className="text-sm text-[var(--hive-color-text,#374151)] leading-relaxed">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </Tag>
      )
    }

    case "paragraph":
      return (
        <p key={key} className="leading-relaxed">
          <InlineMarkdown text={block.text} />
        </p>
      )
  }
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = parseInline(text)
  return <>{parts}</>
}

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(renderPlainText(text.slice(lastIndex, match.index), key++))
    }

    if (match[2]) {
      nodes.push(<strong key={key++} className="font-semibold">{match[2]}</strong>)
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[3]}</em>)
    } else if (match[4]) {
      nodes.push(
        <code key={key++} className="text-[0.85em] bg-[var(--hive-color-code-bg,#f3f4f6)] text-[var(--hive-color-code-text,#374151)] px-1 py-0.5 rounded">
          {match[4]}
        </code>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(renderPlainText(text.slice(lastIndex), key++))
  }

  return nodes
}

function renderPlainText(text: string, key: number): React.ReactNode {
  const lines = text.split("\n")
  if (lines.length === 1) return <React.Fragment key={key}>{text}</React.Fragment>

  return (
    <React.Fragment key={key}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </React.Fragment>
  )
}
