import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const recyclableParam = searchParams.get('recyclable_only');
  const recyclableOnly =
    recyclableParam === 'true' ? true : recyclableParam === 'false' ? false : undefined;
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';

  const result = DataStore.getRecords({
    page,
    limit,
    category,
    search,
    recyclableOnly,
    sortBy,
    sortOrder,
  });

  return NextResponse.json(result);
}
