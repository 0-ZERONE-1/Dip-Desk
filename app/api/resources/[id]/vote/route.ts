import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Resource from '@/lib/models/Resource';
import { toggleVoteStore } from '@/lib/store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id || session.user?.email || 'demo_student_id';
    const { vote } = await req.json(); // 'up' | 'down'

    // 1. Always update local/in-memory store
    const storeResult = await toggleVoteStore(userId, id, vote);

    // 2. Also try updating MongoDB if connected
    if (id.length === 24) {
      try {
        await dbConnect();
        const resource = await Resource.findById(id);
        if (resource) {
          const existingRatingIndex = resource.ratings.findIndex(
            (r: any) => r.userId.toString() === userId || r.userId === userId
          );

          if (existingRatingIndex !== -1) {
            const existing = resource.ratings[existingRatingIndex];
            if (existing.vote === vote) {
              if (vote === 'up') resource.upvotes = Math.max(0, resource.upvotes - 1);
              else resource.downvotes = Math.max(0, resource.downvotes - 1);
              resource.ratings.splice(existingRatingIndex, 1);
            } else {
              if (vote === 'up') {
                resource.upvotes += 1;
                resource.downvotes = Math.max(0, resource.downvotes - 1);
              } else {
                resource.downvotes += 1;
                resource.upvotes = Math.max(0, resource.upvotes - 1);
              }
              resource.ratings[existingRatingIndex].vote = vote;
            }
          } else {
            resource.ratings.push({ userId, vote });
            if (vote === 'up') resource.upvotes += 1;
            else resource.downvotes += 1;
          }

          await resource.save();
          return NextResponse.json({ upvotes: resource.upvotes, downvotes: resource.downvotes });
        }
      } catch {}
    }

    return NextResponse.json(storeResult);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}
