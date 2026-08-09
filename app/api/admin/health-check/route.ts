import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Resource from '@/lib/models/Resource';

// Admin: check link health for all resources
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resources = await Resource.find({}).select('url _id');
    const results = [];

    for (const resource of resources) {
      let isActive = false;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(resource.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeout);
        isActive = response.ok || response.status === 302 || response.status === 301;
      } catch {
        isActive = false;
      }

      await Resource.findByIdAndUpdate(resource._id, {
        isActive,
        lastChecked: new Date(),
      });

      results.push({ id: resource._id, url: resource.url, isActive });
    }

    const active = results.filter((r) => r.isActive).length;
    const broken = results.filter((r) => !r.isActive).length;

    return NextResponse.json({ results, summary: { total: results.length, active, broken } });
  } catch (error) {
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
