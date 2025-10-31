import { NextRequest, NextResponse } from 'next/server';

interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  permission: 'view' | 'edit';
  expiresAt?: string;
  createdAt: string;
  maxUses?: number;
  currentUses: number;
}

// インメモリストレージ
const shareLinks = new Map<string, ShareLink>();

// POST /api/projects/[id]/share - 共有リンクの生成
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();

    const token = generateShareToken();
    const shareLinkId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const shareLink: ShareLink = {
      id: shareLinkId,
      projectId,
      token,
      permission: body.permission || 'view',
      expiresAt: body.expiresAt,
      createdAt: new Date().toISOString(),
      maxUses: body.maxUses,
      currentUses: 0
    };

    shareLinks.set(token, shareLink);

    // 共有URLの生成
    const shareUrl = `${request.nextUrl.origin}/shared/${token}`;

    return NextResponse.json({
      success: true,
      data: {
        ...shareLink,
        url: shareUrl
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/share - プロジェクトの共有リンク一覧
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    const projectShareLinks = Array.from(shareLinks.values())
      .filter(link => link.projectId === projectId)
      .map(link => ({
        ...link,
        url: `${request.nextUrl.origin}/shared/${link.token}`
      }));

    return NextResponse.json({
      success: true,
      data: projectShareLinks
    });
  } catch (error) {
    console.error('Error fetching share links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch share links' },
      { status: 500 }
    );
  }
}

// 共有トークンの生成
function generateShareToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('');
}
