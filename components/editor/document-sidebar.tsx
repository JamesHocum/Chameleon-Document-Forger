'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Plus, Trash2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  filename: string
  created_at: string
  updated_at: string
}

interface DocumentSidebarProps {
  documents: Document[]
  activeDocId: string | null
  onSelect: (id: string) => void
  onUpload: () => void
  onNewDoc: () => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export function DocumentSidebar({
  documents,
  activeDocId,
  onSelect,
  onUpload,
  onNewDoc,
  onDelete,
  isLoading,
}: DocumentSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="font-mono text-sm font-bold text-primary neon-glow tracking-tight">
          CHAMELEON
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-b border-border px-3 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUpload}
          className="flex-1 gap-1.5 border-border bg-muted text-foreground hover:bg-secondary hover:text-foreground text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNewDoc}
          className="flex-1 gap-1.5 border-border bg-muted text-foreground hover:bg-secondary hover:text-foreground text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>

      {/* Document List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : documents.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              No documents yet. Upload or create one.
            </p>
          ) : (
            documents.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelect(doc.id)}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                  activeDocId === doc.id
                    ? 'bg-primary/10 text-primary neon-box'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate font-mono text-xs">
                  {doc.filename}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(doc.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  aria-label={`Delete ${doc.filename}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
