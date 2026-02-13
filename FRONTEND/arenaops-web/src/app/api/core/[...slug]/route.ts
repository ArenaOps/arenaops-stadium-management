// import { NextRequest, NextResponse } from 'next/server';

// const SERVICE_URL = process.env.CORE_SERVICE_URL || 'http://localhost:5002/api';

// export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
//     const slugPath = (await params).slug.join('/');
//     return NextResponse.json({ message: `[BFF] Proxying GET to ${SERVICE_URL}/${slugPath}` });
// }

// export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
//     const slugPath = (await params).slug.join('/');
//     return NextResponse.json({ message: `[BFF] Proxying POST to ${SERVICE_URL}/${slugPath}` });
// }

// export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
//     const slugPath = (await params).slug.join('/');
//     return NextResponse.json({ message: `[BFF] Proxying PUT to ${SERVICE_URL}/${slugPath}` });
// }

// export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
//     const slugPath = (await params).slug.join('/');
//     return NextResponse.json({ message: `[BFF] Proxying DELETE to ${SERVICE_URL}/${slugPath}` });
// }
