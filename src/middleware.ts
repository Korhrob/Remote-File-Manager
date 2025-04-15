import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export default async function validateApiKey(req: NextRequest) {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  
  if (apiKey !== process.env.NEXT_API_KEY) {
    return NextResponse.json({ message: "Unauthorized - invalid API key" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/file/:path*',
};