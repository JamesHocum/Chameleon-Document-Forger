'use client'

import React from "react"

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Check, X, Pencil, Trash2 } from 'lucide-react'

interface LineEditorProps {
  lines: string[]
  onLineEdit: (lineIndex: number, oldText: string, newText: string) => void
  onDeleteLine: (lineIndex: number) => void
  isEditMode: boolean
}

export function LineEditor({ lines, onLineEdit, onDeleteLine, isEditMode }: LineEditorProps) {
  const [editingLine, setEditingLine] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingLine !== null && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      )
    }
  }, [editingLine])

  const handleLineClick = useCallback(
    (index: number) => {
      if (!isEditMode) return
      setEditingLine(index)
      setEditValue(lines[index])
    },
    [isEditMode, lines],
  )

  const handleSave = useCallback(() => {
    if (editingLine === null) return
    const oldText = lines[editingLine]
    if (editValue !== oldText) {
      onLineEdit(editingLine, oldText, editValue)
    }
    setEditingLine(null)
  }, [editingLine, editValue, lines, onLineEdit])

  const handleCancel = useCallback(() => {
    setEditingLine(null)
    setEditValue('')
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    },
    [handleSave, handleCancel],
  )

  if (lines.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground font-mono">
          No content. Start typing or upload a file.
        </p>
      </div>
    )
  }

  return (
    <div className="font-mono text-sm leading-relaxed">
      {lines.map((line, index) => (
        <div
          key={`line-${index}`}
          className={cn(
            'group flex min-h-[1.75rem] border-b border-border/30',
            editingLine === index && 'bg-primary/5',
            isEditMode &&
              editingLine !== index &&
              'cursor-pointer hover:bg-muted/50',
          )}
        >
          {/* Line number gutter */}
          <div className="flex w-12 shrink-0 select-none items-start justify-end border-r border-border/30 px-2 py-1">
            <span className="text-xs text-muted-foreground/60">
              {index + 1}
            </span>
          </div>

          {/* Line content */}
          {editingLine === index ? (
            <div className="flex flex-1 items-start gap-1 px-1 py-0.5">
              <textarea
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none border-0 bg-transparent px-2 py-0.5 text-sm text-neon-cyan font-mono focus:outline-none focus:ring-0"
                rows={Math.max(1, editValue.split('\n').length)}
                aria-label={`Editing line ${index + 1}`}
              />
              <div className="flex shrink-0 items-center gap-0.5 py-0.5">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded p-1 text-primary hover:bg-primary/20 transition-colors"
                  aria-label="Save edit"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                  aria-label="Cancel edit"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteLine(index)
                    setEditingLine(null)
                  }}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                  aria-label="Delete entire line"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleLineClick(index)}
                className={cn(
                  'flex flex-1 items-start gap-2 px-3 py-1 text-left transition-colors',
                  isEditMode && 'hover:text-neon-cyan',
                )}
                disabled={!isEditMode}
              >
                <span className="flex-1 whitespace-pre-wrap break-all">
                  {line || '\u00A0'}
                </span>
              </button>
              {isEditMode && editingLine !== index && (
                <div className="flex shrink-0 items-center gap-0.5 pr-1">
                  <span className="mt-0.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors">
                    <Pencil className="h-3 w-3" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteLine(index)
                    }}
                    className="rounded p-1 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/20 transition-colors"
                    aria-label={`Delete line ${index + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
