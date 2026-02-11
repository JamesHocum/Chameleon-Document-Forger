'use client'

import React from "react"

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, FileUp } from 'lucide-react'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => Promise<void>
}

export function UploadDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setIsUploading(true)
    try {
      await onUpload(file)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-primary neon-glow">
            Upload Document
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Drag and drop or browse for a PDF or text file.
          </DialogDescription>
        </DialogHeader>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground'
          }`}
        >
          <div className="rounded-full bg-muted p-3">
            <FileUp className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm text-foreground">Drop your file here or</p>
            <Button
              variant="link"
              onClick={() => fileInputRef.current?.click()}
              className="text-neon-pink hover:text-neon-pink/80"
              disabled={isUploading}
            >
              browse files
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports: .pdf, .txt, .md, .csv, .json, .xml, .html, .css, .js, .ts, .py
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive neon-glow-pink">{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.csv,.json,.xml,.html,.css,.js,.ts,.py"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        {isUploading && (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground font-mono">
              Uploading...
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
