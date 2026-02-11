import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ANON_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('id, filename, created_at, updated_at')
    .eq('user_id', ANON_USER_ID)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()
  const { filename, content } = body

  if (!filename || content === undefined) {
    return NextResponse.json(
      { error: 'filename and content are required' },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({ user_id: ANON_USER_ID, filename, content })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
