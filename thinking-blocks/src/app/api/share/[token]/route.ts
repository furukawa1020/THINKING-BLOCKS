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

// インメモリストレージ（実際にはプロジェクトAPIと共有する必要がある）
const shareLinks = new Map<string, ShareLink>();

// GET /api/share/[token] - 共有トークンからプロジェクトにアクセス
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const shareLink = shareLinks.get(token);

    if (!shareLink) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired share link' },
        { status: 404 }
      );
    }

    // 有効期限チェック
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Share link has expired' },
        { status: 403 }
      );
    }

    // 使用回数チェック
    if (shareLink.maxUses && shareLink.currentUses >= shareLink.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Share link usage limit reached' },
        { status: 403 }
      );
    }

    // 使用回数をインクリメント
    shareLink.currentUses++;
    shareLinks.set(token, shareLink);

    return NextResponse.json({
      success: true,
      data: {
        projectId: shareLink.projectId,
        permission: shareLink.permission,
        expiresAt: shareLink.expiresAt
      }
    });
  } catch (error) {
    console.error('Error accessing share link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to access share link' },
      { status: 500 }
    );
  }
}
