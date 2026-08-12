import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Resource from '@/lib/models/Resource';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();
    const isConnected = (mongoose.connection.readyState as number) === 1;
    return NextResponse.json({
      success: true,
      connected: isConnected,
      database: mongoose.connection.name || 'Connected',
      readyState: mongoose.connection.readyState,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: err?.message || 'Database connection error',
    }, { status: 500 });
  }
}

// Admin: check link health for all resources
export async function POST(req: NextRequest) {
  try {
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
