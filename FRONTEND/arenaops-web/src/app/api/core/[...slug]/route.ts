import { NextRequest, NextResponse } from 'next/server';

const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL || 'http://localhost:5002/api';

async function handleProxy(request: NextRequest, slug: string[]) {
    const slugPath = slug.join('/');
    const url = `${CORE_SERVICE_URL}/${slugPath}${request.nextUrl.search}`;

    const headers = new Headers(request.headers);
    headers.set('Host', new URL(CORE_SERVICE_URL).host);

    try {
        const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

        const response = await fetch(url, {
            method: request.method,
            headers: headers,
            body: body,
            // @ts-ignore
            duplex: 'half',
        });

        const data = await response.blob();
        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        console.error(`[BFF Core Proxy Error]:`, error);
        return NextResponse.json({ error: 'Failed to proxy request to Core Service' }, { status: 502 });
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    return handleProxy(request, slug);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    return handleProxy(request, slug);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    return handleProxy(request, slug);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    return handleProxy(request, slug);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    return handleProxy(request, slug);
}
