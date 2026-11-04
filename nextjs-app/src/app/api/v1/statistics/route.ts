import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/store';

export async function GET() {
  const stats = DataStore.getStatistics();
  return NextResponse.json(stats);
}
