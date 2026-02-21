'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pencil, Eye, Save, FileText, Download, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

interface EditorHeaderProps {
  filename: string | null
  fileType: string | null
  documentId: string | null
  isEditMode: boolean
  onToggleEdit: () => void
  onSave: () => void
  isSaving: boolean
  hasChanges: boolean
}

const EXPORT_FORMATS = [
  { ext: 'pdf', label: 'PDF Document (.pdf)' },
  { ext: 'txt', label: 'Plain Text (.txt)' },
  { ext: 'md', label: 'Markdown (.md)' },
  { ext: 'html', label: 'HTML (.html)' },
  { ext: 'json', label: 'JSON (.json)' },
  { ext: 'csv', label: 'CSV (.csv)' },
]

async function triggerDownload(docId: string, format: string) {
  try {
    const res = await fetch(`/api/documents/${docId}/download?format=${format}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Download failed' }))
      throw new Error(err.error || 'Download failed')
    }

    const blob = await res.blob()
    const disposition = res.headers.get('Content-Disposition')
    let filename = `document.${format}`
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/)
      if (match) filename = match[1]
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded as ${filename}`)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Download failed')
  }
}

export function EditorHeader({
  filename,
  fileType,
  documentId,
  isEditMode,
  onToggleEdit,
  onSave,
  isSaving,
  hasChanges,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm text-foreground truncate max-w-xs">
          {filename || 'No document selected'}
        </span>
        {fileType && (
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
            {fileType}
          </span>
        )}
        {hasChanges && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent animate-pulse-glow">
            MODIFIED
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {filename && documentId && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleEdit}
              className={`gap-1.5 text-xs border-border ${
                isEditMode
                  ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary'
                  : 'bg-muted text-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {isEditMode ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  View Mode
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Mode
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            {/* Download original format */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerDownload(documentId, 'original')}
              className="gap-1.5 text-xs border-border bg-muted text-foreground hover:bg-secondary hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>

            {/* Export As dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs border-border bg-muted text-foreground hover:bg-secondary hover:text-foreground"
                >
                  Export As
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground font-mono">
                  Export format
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                {EXPORT_FORMATS.map((fmt) => (
                  <DropdownMenuItem
                    key={fmt.ext}
                    onClick={() => triggerDownload(documentId, fmt.ext)}
                    className="text-xs font-mono cursor-pointer text-foreground focus:bg-secondary focus:text-foreground"
                  >
                    <span className="uppercase text-primary mr-2 w-8">
                      .{fmt.ext}
                    </span>
                    {fmt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  )
}
