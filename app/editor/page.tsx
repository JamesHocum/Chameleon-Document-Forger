'use client'

import { useState, useCallback } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DocumentSidebar } from '@/components/editor/document-sidebar'
import { EditorHeader } from '@/components/editor/editor-header'
import { LineEditor } from '@/components/editor/line-editor'
import { UploadDialog } from '@/components/editor/upload-dialog'

interface Document {
  id: string
  filename: string
  content: string
  created_at: string
  updated_at: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EditorPage() {
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [localLines, setLocalLines] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const { data: documents = [], isLoading: isLoadingDocs } = useSWR<Document[]>(
    '/api/documents',
    fetcher,
  )

  const { data: activeDoc } = useSWR<Document>(
    activeDocId ? `/api/documents/${activeDocId}` : null,
    fetcher,
    {
      onSuccess: (data) => {
        if (data?.content !== undefined) {
          setLocalLines(data.content.split('\n'))
          setHasChanges(false)
        }
      },
    },
  )

  const handleSelectDoc = useCallback((id: string) => {
    setActiveDocId(id)
    setIsEditMode(false)
    setHasChanges(false)
  }, [])

  const handleLineEdit = useCallback(
    (lineIndex: number, _oldText: string, newText: string) => {
      setLocalLines((prev) => {
        const updated = [...prev]
        updated[lineIndex] = newText
        return updated
      })
      setHasChanges(true)
    },
    [],
  )

  const handleSave = useCallback(async () => {
    if (!activeDocId || !hasChanges) return
    setIsSaving(true)

    try {
      const content = localLines.join('\n')
      const res = await fetch(`/api/documents/${activeDocId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Save failed')
      }

      setHasChanges(false)
      globalMutate('/api/documents')
      globalMutate(`/api/documents/${activeDocId}`)
      toast.success('Document saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }, [activeDocId, hasChanges, localLines])

  const handleUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Upload failed')
    }

    const doc = await res.json()
    globalMutate('/api/documents')
    setActiveDocId(doc.id)
    toast.success(`Uploaded ${file.name}`)
  }, [])

  const handleNewDoc = useCallback(async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `untitled-${Date.now()}.txt`,
          content: '',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create document')
      }

      const doc = await res.json()
      globalMutate('/api/documents')
      setActiveDocId(doc.id)
      setIsEditMode(true)
      toast.success('New document created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Creation failed')
    }
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Delete failed')

        globalMutate('/api/documents')
        if (activeDocId === id) {
          setActiveDocId(null)
          setLocalLines([])
          setHasChanges(false)
          setIsEditMode(false)
        }
        toast.success('Document deleted')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Delete failed')
      }
    },
    [activeDocId],
  )

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <DocumentSidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelect={handleSelectDoc}
        onUpload={() => setShowUpload(true)}
        onNewDoc={handleNewDoc}
        onDelete={handleDelete}
        isLoading={isLoadingDocs}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <EditorHeader
          filename={activeDoc?.filename ?? null}
          isEditMode={isEditMode}
          onToggleEdit={() => setIsEditMode((prev) => !prev)}
          onSave={handleSave}
          isSaving={isSaving}
          hasChanges={hasChanges}
        />

        <div className="flex-1 overflow-hidden">
          {activeDocId ? (
            <ScrollArea className="h-full">
              <div className="min-h-full">
                <LineEditor
                  lines={localLines}
                  onLineEdit={handleLineEdit}
                  isEditMode={isEditMode}
                />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <span className="text-3xl font-mono text-primary neon-glow">
                  {'{ }'}
                </span>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-mono text-foreground">
                  No document open
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a file or create a new document from the sidebar.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <UploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onUpload={handleUpload}
      />
    </div>
  )
}
