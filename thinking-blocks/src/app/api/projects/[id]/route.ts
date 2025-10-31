import { NextRequest, NextResponse } from 'next/server';
import { Project } from '../route';

// インメモリストレージ（本番環境ではデータベースに置き換え）
const projects = new Map<string, Project>();

// GET /api/projects/[id] - 特定プロジェクトの取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const project = projects.get(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - プロジェクトの更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const project = projects.get(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // 更新可能なフィールドのみ更新
    const updatedProject: Project = {
      ...project,
      title: body.title || project.title,
      description: body.description !== undefined ? body.description : project.description,
      content: body.content || project.content,
      theme: body.theme || project.theme,
      updatedAt: new Date().toISOString(),
      isPublic: body.isPublic !== undefined ? body.isPublic : project.isPublic,
      collaborators: body.collaborators || project.collaborators,
      tags: body.tags || project.tags
    };

    projects.set(projectId, updatedProject);

    return NextResponse.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - プロジェクトの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const project = projects.get(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    projects.delete(projectId);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
