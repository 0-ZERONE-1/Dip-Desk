import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl).trim();

    // ZERONE - SSRF Guard: validate URL protocol and IP blocklist
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

    // ZERONE - Google Drive direct image URL redirect
    if (decodedUrl.includes('drive.google.com')) {
      const fileIdMatch = decodedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || decodedUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return NextResponse.redirect(`https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=w1000`, 302);
      }
    }

    // ZERONE - GitHub Blob raw image redirect
    if (decodedUrl.includes('github.com/') && decodedUrl.includes('/blob/')) {
      const rawUrl = decodedUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      return NextResponse.redirect(rawUrl, 302);
    }

    // ZERONE - Fetch external image with strict timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(decodedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return new NextResponse('Failed to fetch target URL', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || '';

    // ZERONE - Stream image response if direct image content type
    if (contentType.startsWith('image/')) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    // ZERONE - Extract og:image meta tag from HTML image host webpages (ImgBB, PostImages)
    const htmlText = await res.text();

    const ogImageMatch =
      htmlText.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      htmlText.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
      htmlText.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      htmlText.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i) ||
      htmlText.match(/<img[^>]+id=["']image-viewer-container["'][^>]+src=["']([^"']+)["']/i);

    if (ogImageMatch && ogImageMatch[1]) {
      let directImageUrl = ogImageMatch[1];

      // ZERONE - Fix relative protocol URLs
      if (directImageUrl.startsWith('//')) {
        directImageUrl = 'https:' + directImageUrl;
      }

      return NextResponse.redirect(directImageUrl, 302);
    }

    return new NextResponse('Could not extract direct image from page', { status: 404 });
  } catch (err) {
    console.error('Image proxy error:', err);
    return new NextResponse('Internal Image Proxy Error', { status: 500 });
  }
}
