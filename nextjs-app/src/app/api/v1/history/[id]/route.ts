import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = DataStore.getRecordById(id);
  if (!item) {
    return NextResponse.json({ detail: `Record ${id} not found.` }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = DataStore.deleteRecord(id);
  if (!ok) {
    return NextResponse.json({ detail: `Record ${id} not found.` }, { status: 404 });
  }
  return NextResponse.json({ status: 'success', message: `Record ${id} deleted successfully.` });
}
