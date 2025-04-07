// utils/validateApiKey.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function validateApiKey() {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  
  if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
    return NextResponse.json({ error: "Unauthorized - invalid API key" }, { status: 401 });
  }

  return null; // Return null if the API key is valid
}
