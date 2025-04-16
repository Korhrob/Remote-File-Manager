import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
	return proxyHandler(req, params);
  }
  
  export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
	return proxyHandler(req, params);
  }

export async function proxyHandler(req: NextRequest, params: { slug: string[] }) {
	try {
	  const { slug } = await params;

	  if (!slug || slug.length === 0) {
		return NextResponse.json({ message: 'Invalid API request'}, { status: 400 });
	  }

	  const headersList = await headers();
	  const apiUrl = `/api/${slug.join("/")}`;
	  const apiKey = process.env.NEXT_API_KEY || '';
	  const endUrl = path.join(req.nextUrl.origin, apiUrl);

	  console.log("req.nextUrl.origin:", req.nextUrl.origin);
	  console.log("apiUrl:", apiUrl);
	  console.log(`endUrl: ${endUrl}`);

	  const response = await fetch(endUrl, {
		method: req.method,
		headers: {
		  "Content-Type": headersList.get("content-type") || "application/json",
		  "x-api-key": apiKey,
		},
		body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
	  });
  
	  const data = await response.json();
	  return NextResponse.json(data, { status: response.status });
	} catch (error) {
	  console.error(error);
	  return NextResponse.json({ message: "Error while proxying request." }, { status: 500 });
	}
  }
  