import { NextResponse } from 'next/server';
import { DisposalRulesService, SUPPORTED_CATEGORIES } from '@/lib/disposal-rules';

export async function GET() {
  const categories = DisposalRulesService.getAllCategories();
  return NextResponse.json({
    total_categories: SUPPORTED_CATEGORIES.length,
    categories,
  });
}
