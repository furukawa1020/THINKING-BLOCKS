// Vercel KVを使用したデータ永続化レイヤー
// 本番環境では、このファイルをアンコメントして使用

/*
import { kv } from '@vercel/kv';

export interface Project {
  id: string;
  title: string;
  description: string;
  content: any;
  theme: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  isPublic: boolean;
  collaborators: string[];
  tags: string[];
}

// プロジェクトの保存
export async function saveProject(project: Project): Promise<void> {
  await kv.set(`project:${project.id}`, project);
  
  // インデックス作成（検索用）
  if (project.owner) {
    await kv.sadd(`user:${project.owner}:projects`, project.id);
  }
  
  if (project.isPublic) {
    await kv.zadd('projects:public', {
      score: new Date(project.updatedAt).getTime(),
      member: project.id
    });
  }
}

// プロジェクトの取得
export async function getProject(id: string): Promise<Project | null> {
  return await kv.get(`project:${id}`);
}

// ユーザーのプロジェクト一覧取得
export async function getUserProjects(userId: string): Promise<Project[]> {
  const projectIds = await kv.smembers(`user:${userId}:projects`);
  const projects = await Promise.all(
    projectIds.map(id => kv.get<Project>(`project:${id}`))
  );
  return projects.filter((p): p is Project => p !== null);
}

// 公開プロジェクト一覧取得
export async function getPublicProjects(limit: number = 20): Promise<Project[]> {
  const projectIds = await kv.zrange('projects:public', 0, limit - 1, {
    rev: true
  });
  const projects = await Promise.all(
    projectIds.map(id => kv.get<Project>(`project:${id}`))
  );
  return projects.filter((p): p is Project => p !== null);
}

// プロジェクトの削除
export async function deleteProject(id: string): Promise<void> {
  const project = await getProject(id);
  if (!project) return;
  
  await kv.del(`project:${id}`);
  
  if (project.owner) {
    await kv.srem(`user:${project.owner}:projects`, id);
  }
  
  if (project.isPublic) {
    await kv.zrem('projects:public', id);
  }
}

// 共有リンクの保存
export async function saveShareLink(shareLink: any): Promise<void> {
  await kv.set(`share:${shareLink.token}`, shareLink);
  await kv.expire(`share:${shareLink.token}`, 60 * 60 * 24 * 7); // 7日間
}

// 共有リンクの取得
export async function getShareLink(token: string): Promise<any> {
  return await kv.get(`share:${token}`);
}

// アナリティクスイベントの保存
export async function saveAnalyticsEvent(event: any): Promise<void> {
  await kv.lpush('analytics:events', event);
  await kv.ltrim('analytics:events', 0, 9999); // 最新10000件を保持
  
  // 日次統計
  const date = new Date(event.timestamp).toISOString().split('T')[0];
  await kv.hincrby(`analytics:daily:${date}`, event.eventType, 1);
}

export default {
  saveProject,
  getProject,
  getUserProjects,
  getPublicProjects,
  deleteProject,
  saveShareLink,
  getShareLink,
  saveAnalyticsEvent
};
*/

// インメモリ実装（開発用）
// 本番環境では上記のVercel KV実装を使用してください

const inMemoryStore = new Map<string, any>();

export async function saveProject(project: any): Promise<void> {
  inMemoryStore.set(`project:${project.id}`, project);
}

export async function getProject(id: string): Promise<any> {
  return inMemoryStore.get(`project:${id}`) || null;
}

export async function getUserProjects(userId: string): Promise<any[]> {
  const projects: any[] = [];
  inMemoryStore.forEach((value, key) => {
    if (key.startsWith('project:') && value.owner === userId) {
      projects.push(value);
    }
  });
  return projects;
}

export async function getPublicProjects(limit: number = 20): Promise<any[]> {
  const projects: any[] = [];
  inMemoryStore.forEach((value, key) => {
    if (key.startsWith('project:') && value.isPublic) {
      projects.push(value);
    }
  });
  return projects.slice(0, limit);
}

export async function deleteProject(id: string): Promise<void> {
  inMemoryStore.delete(`project:${id}`);
}

export async function saveShareLink(shareLink: any): Promise<void> {
  inMemoryStore.set(`share:${shareLink.token}`, shareLink);
}

export async function getShareLink(token: string): Promise<any> {
  return inMemoryStore.get(`share:${token}`) || null;
}

export async function saveAnalyticsEvent(event: any): Promise<void> {
  const events = inMemoryStore.get('analytics:events') || [];
  events.push(event);
  inMemoryStore.set('analytics:events', events);
}

export default {
  saveProject,
  getProject,
  getUserProjects,
  getPublicProjects,
  deleteProject,
  saveShareLink,
  getShareLink,
  saveAnalyticsEvent
};
