import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

const ANON_USER_ID = '00000000-0000-0000-0000-000000000000'

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  ts: 'text/typescript',
  py: 'text/x-python',
}

function buildPdf(content: string): Buffer {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 50
  const maxWidth = pageWidth - margin * 2
  const lineHeight = 14
  const fontSize = 11

  doc.setFont('Courier')
  doc.setFontSize(fontSize)

  const lines = content.split('\n')
  let y = margin

  for (const line of lines) {
    // Wrap long lines to fit within page width
    const wrappedLines = doc.splitTextToSize(line || ' ', maxWidth) as string[]

    for (const wrappedLine of wrappedLines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(wrappedLine, margin, y)
      y += lineHeight
    }
  }

  // Get the PDF as an ArrayBuffer and convert to Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

function buildTextBlob(content: string): Buffer {
  return Buffer.from(content, 'utf-8')
}

function getOutputFilename(originalName: string, targetExt: string): string {
  const baseName = originalName.replace(/\.[^.]+$/, '')
  return `${baseName}.${targetExt}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'original'

  // Fetch the document
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', ANON_USER_ID)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Determine target format
  const targetFormat = format === 'original' ? (doc.file_type || 'txt') : format
  const mimeType = MIME_MAP[targetFormat] || 'application/octet-stream'
  const outputFilename = getOutputFilename(doc.filename, targetFormat)

  let fileBuffer: Buffer

  if (targetFormat === 'pdf') {
    // Generate a real PDF binary from the text content
    fileBuffer = buildPdf(doc.content)
  } else {
    // For all text-based formats, encode as UTF-8
    fileBuffer = buildTextBlob(doc.content)
  }

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Length': String(fileBuffer.byteLength),
    },
  })
}
