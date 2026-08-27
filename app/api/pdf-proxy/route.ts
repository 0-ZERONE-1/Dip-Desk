import { NextRequest, NextResponse } from 'next/server';
import { getResourceById } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const targetUrl = searchParams.get('url');

  let rawUrl = targetUrl || '';

  if (id) {
    const resource = await getResourceById(id);
    if (resource && resource.url) {
      rawUrl = resource.url;
    }
  }

  if (!rawUrl) {
    return new NextResponse('Missing url or id parameter', { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(rawUrl).trim();

    // SSRF Guard: validate URL protocol and IP blocklist
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(decodedUrl);
    } catch {
      return new NextResponse('Invalid URL format', { status: 400 });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return new NextResponse('Disallowed protocol', { status: 400 });
    }

    const host = parsedUrl.hostname.toLowerCase();
    const isPrivate =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      /^169\.254\./.test(host);

    if (isPrivate) {
      return new NextResponse('Access to local/private network addresses is forbidden', { status: 403 });
    }

    let fetchUrl = decodedUrl;
    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // Convert Google Drive view URL to direct export stream URL
    if (decodedUrl.includes('drive.google.com')) {
      const fileIdMatch = decodedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || decodedUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        fetchUrl = `https://drive.google.com/uc?id=${fileIdMatch[1]}&export=download`;
      }
    }

    // Fetch the target resource with 15s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(new URL(fetchUrl).toString(), {
      signal: controller.signal,
      headers,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return new NextResponse(`Failed to fetch target PDF (Status ${res.status})`, { status: res.status });
    }

    const buffer = await res.arrayBuffer();

    // Stream back as native PDF preview
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document.pdf"',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    console.error('PDF proxy error:', err);
    return new NextResponse('Internal PDF Proxy Error', { status: 500 });
  }
}
