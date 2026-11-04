import { NextResponse } from 'next/server';
import { DisposalRulesService } from '@/lib/disposal-rules';

export async function GET() {
  const rules = DisposalRulesService.getAllCategories();
  return NextResponse.json({
    rules,
  });
}
