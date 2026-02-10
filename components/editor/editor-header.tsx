'use client'

import { Button } from '@/components/ui/button'
import { Pencil, Eye, Save, FileText } from 'lucide-react'

interface EditorHeaderProps {
  filename: string | null
  isEditMode: boolean
  onToggleEdit: () => void
  onSave: () => void
  isSaving: boolean
  hasChanges: boolean
}

export function EditorHeader({
  filename,
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
        {hasChanges && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent animate-pulse-glow">
            MODIFIED
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {filename && (
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
          </>
        )}
      </div>
    </header>
  )
}
