import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ANON_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: Request) {
  const supabase = await createClient()

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const filename = file.name
  let content = ''

  if (
    file.type === 'text/plain' ||
    filename.endsWith('.txt') ||
    filename.endsWith('.md') ||
    filename.endsWith('.csv') ||
    filename.endsWith('.json') ||
    filename.endsWith('.xml') ||
    filename.endsWith('.html') ||
    filename.endsWith('.css') ||
    filename.endsWith('.js') ||
    filename.endsWith('.ts') ||
    filename.endsWith('.py')
  ) {
    content = await file.text()
  } else {
    return NextResponse.json(
      {
        error:
          'Unsupported file type. Currently supports: .txt, .md, .csv, .json, .xml, .html, .css, .js, .ts, .py',
      },
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
