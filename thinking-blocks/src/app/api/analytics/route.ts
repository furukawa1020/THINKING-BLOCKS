import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  id: string;
  userId: string;
  projectId?: string;
  eventType: string;
  data: any;
  timestamp: string;
}

// インメモリストレージ
const events: AnalyticsEvent[] = [];

// POST /api/analytics - イベントの記録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId || 'anonymous',
      projectId: body.projectId,
      eventType: body.eventType,
      data: body.data || {},
      timestamp: new Date().toISOString()
    };

    events.push(event);

    return NextResponse.json({
      success: true,
      data: event
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording analytics event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record event' },
      { status: 500 }
    );
  }
}

// GET /api/analytics - 分析データの取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredEvents = [...events];

    // フィルタリング
    if (userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === userId);
    }
    if (projectId) {
      filteredEvents = filteredEvents.filter(e => e.projectId === projectId);
    }
    if (eventType) {
      filteredEvents = filteredEvents.filter(e => e.eventType === eventType);
    }
    if (startDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) <= new Date(endDate));
    }

    // 統計の計算
    const stats = calculateAnalytics(filteredEvents);

    return NextResponse.json({
      success: true,
      data: {
        events: filteredEvents,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function calculateAnalytics(events: AnalyticsEvent[]): any {
  const eventsByType = events.reduce((acc: any, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});

  const uniqueUsers = new Set(events.map(e => e.userId)).size;
  const uniqueProjects = new Set(events.map(e => e.projectId).filter(Boolean)).size;

  // 時系列データ
  const eventsByDate = events.reduce((acc: any, event) => {
    const date = event.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    uniqueUsers,
    uniqueProjects,
    eventsByType,
    eventsByDate,
    averageEventsPerUser: uniqueUsers > 0 ? events.length / uniqueUsers : 0
  };
}
