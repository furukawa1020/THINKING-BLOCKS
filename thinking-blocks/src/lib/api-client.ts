// API クライアント - バックエンドとの通信を管理

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

export interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  permission: 'view' | 'edit';
  expiresAt?: string;
  url: string;
  maxUses?: number;
  currentUses: number;
}

export interface AnalyticsEvent {
  userId: string;
  projectId?: string;
  eventType: string;
  data?: any;
}

export interface AIAnalysis {
  stats: any;
  patterns: string[];
  suggestions: string[];
  depth: any;
  timestamp: string;
}

class APIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  // プロジェクト管理
  async getProjects(params?: { owner?: string; public?: boolean }): Promise<Project[]> {
    const queryParams = new URLSearchParams();
    if (params?.owner) queryParams.append('owner', params.owner);
    if (params?.public !== undefined) queryParams.append('public', String(params.public));

    const response = await fetch(`${this.baseUrl}/api/projects?${queryParams}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch projects');
    }
    
    return result.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch project');
    }
    
    return result.data;
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create project');
    }
    
    return result.data;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update project');
    }
    
    return result.data;
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete project');
    }
  }

  // 共有機能
  async createShareLink(
    projectId: string,
    options: {
      permission?: 'view' | 'edit';
      expiresAt?: string;
      maxUses?: number;
    } = {}
  ): Promise<ShareLink> {
    const response = await fetch(`${this.baseUrl}/api/projects/${projectId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create share link');
    }
    
    return result.data;
  }

  async getShareLinks(projectId: string): Promise<ShareLink[]> {
    const response = await fetch(`${this.baseUrl}/api/projects/${projectId}/share`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch share links');
    }
    
    return result.data;
  }

  async accessSharedProject(token: string): Promise<{ projectId: string; permission: string }> {
    const response = await fetch(`${this.baseUrl}/api/share/${token}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to access shared project');
    }
    
    return result.data;
  }

  // AI分析
  async analyzeThinking(content: any, theme: string, analysisType: string = 'comprehensive'): Promise<AIAnalysis> {
    const response = await fetch(`${this.baseUrl}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, theme, analysisType })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to analyze thinking');
    }
    
    return result.data;
  }

  // アナリティクス
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to track event:', error);
      // イベント追跡の失敗はサイレントに処理
    }
  }

  async getAnalytics(params?: {
    userId?: string;
    projectId?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.projectId) queryParams.append('projectId', params.projectId);
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${this.baseUrl}/api/analytics?${queryParams}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch analytics');
    }
    
    return result.data;
  }
}

// シングルトンインスタンス
export const apiClient = new APIClient();
