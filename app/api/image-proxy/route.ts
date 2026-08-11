import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl).trim();

    // 1. Google Drive direct link handling
    if (decodedUrl.includes('drive.google.com')) {
      const fileIdMatch = decodedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || decodedUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return NextResponse.redirect(`https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=w1000`, 302);
      }
    }

    // 2. GitHub Blob / Permalink handling
    if (decodedUrl.includes('github.com/') && decodedUrl.includes('/blob/')) {
      const rawUrl = decodedUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      return NextResponse.redirect(rawUrl, 302);
    }

    // 2. Fetch page/image content
    const res = await fetch(decodedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch target URL', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || '';

    // If it's already an image, stream it back
    if (contentType.startsWith('image/')) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    // If it's HTML (like ImgBB ibb.co webpage link, PostImages, Flickr, etc.)
    const htmlText = await res.text();

    // Parse og:image meta tag
    const ogImageMatch =
      htmlText.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      htmlText.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
      htmlText.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      htmlText.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i) ||
      htmlText.match(/<img[^>]+id=["']image-viewer-container["'][^>]+src=["']([^"']+)["']/i);

    if (ogImageMatch && ogImageMatch[1]) {
      let directImageUrl = ogImageMatch[1];

      // Fix relative protocol URLs (e.g. //i.ibb.co/...)
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
