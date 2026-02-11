import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

const ANON_USER_ID = '00000000-0000-0000-0000-000000000000'

const TEXT_EXTENSIONS = [
  '.txt', '.md', '.csv', '.json', '.xml',
  '.html', '.css', '.js', '.ts', '.py',
]

function isTextFile(file: File): boolean {
  if (file.type === 'text/plain') return true
  return TEXT_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const filename = file.name
  let content = ''

  try {
    if (isPdfFile(file)) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const pdfData = await pdf(buffer)
      content = pdfData.text
    } else if (isTextFile(file)) {
      content = await file.text()
    } else {
      return NextResponse.json(
        {
          error:
            'Unsupported file type. Supports: .pdf, .txt, .md, .csv, .json, .xml, .html, .css, .js, .ts, .py',
        },
        { status: 400 },
      )
    }
  } catch (parseError) {
    console.error('[v0] File parse error:', parseError)
    return NextResponse.json(
      { error: 'Failed to parse file. Make sure it is a valid document.' },
      { status: 400 },
    )
  }

  if (!content.trim()) {
    return NextResponse.json(
      { error: 'The file appears to be empty or could not be read.' },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: ANON_USER_ID,
      filename,
      content,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
