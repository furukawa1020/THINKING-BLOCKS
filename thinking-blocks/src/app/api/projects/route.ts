import { NextRequest, NextResponse } from 'next/server';

// プロジェクトの型定義
export interface Project {
  id: string;
  title: string;
  description: string;
  content: any; // Blocklyのワークスペース内容
  theme: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  isPublic: boolean;
  collaborators: string[];
  tags: string[];
}

// インメモリストレージ（本番環境ではデータベースに置き換え）
const projects = new Map<string, Project>();

// GET /api/projects - プロジェクト一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const owner = searchParams.get('owner');
    const isPublic = searchParams.get('public');

    let filteredProjects = Array.from(projects.values());

    // フィルタリング
    if (owner) {
      filteredProjects = filteredProjects.filter(p => p.owner === owner);
    }
    if (isPublic === 'true') {
      filteredProjects = filteredProjects.filter(p => p.isPublic);
    }

    // 最新順にソート
    filteredProjects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredProjects,
      count: filteredProjects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - 新規プロジェクト作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const projectId = generateId();
    const now = new Date().toISOString();

    const newProject: Project = {
      id: projectId,
      title: body.title,
      description: body.description || '',
      content: body.content,
      theme: body.theme || 'creative',
      createdAt: now,
      updatedAt: now,
      owner: body.owner || 'anonymous',
      isPublic: body.isPublic || false,
      collaborators: body.collaborators || [],
      tags: body.tags || []
    };

    projects.set(projectId, newProject);

    return NextResponse.json({
      success: true,
      data: newProject
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// ユニークIDの生成
function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
