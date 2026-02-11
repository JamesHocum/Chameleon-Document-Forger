import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ANON_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', ANON_USER_ID)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()
  const { content, line_number, old_text, new_text } = body

  const { data, error } = await supabase
    .from('documents')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', ANON_USER_ID)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Record edit history
  if (line_number !== undefined) {
    await supabase.from('edit_history').insert({
      document_id: id,
      user_id: ANON_USER_ID,
      line_number,
      old_text: old_text || '',
      new_text: new_text || '',
    })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { id } = await params

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', ANON_USER_ID)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
