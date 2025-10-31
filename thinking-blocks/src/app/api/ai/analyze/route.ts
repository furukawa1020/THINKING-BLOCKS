import { NextRequest, NextResponse } from 'next/server';

// AI分析エンドポイント（OpenAI APIと統合可能）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, theme, analysisType } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // 思考構造の解析
    const analysis = await analyzeThinkingStructure(content, theme, analysisType);

    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing thinking structure:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze thinking structure' },
      { status: 500 }
    );
  }
}

async function analyzeThinkingStructure(
  content: any,
  theme: string,
  analysisType: string
): Promise<any> {
  // ブロックの統計を取得
  const stats = calculateBlockStats(content);
  
  // パターン分析
  const patterns = detectThinkingPatterns(content);
  
  // 改善提案の生成
  const suggestions = generateSuggestions(stats, patterns, theme);
  
  // 思考の深さ分析
  const depth = analyzeThinkingDepth(content);

  // OpenAI APIを使用する場合はここで統合
  // const aiInsights = await getOpenAIInsights(content, theme);

  return {
    stats,
    patterns,
    suggestions,
    depth,
    timestamp: new Date().toISOString()
  };
}

function calculateBlockStats(content: any): any {
  const blocks = content.blocks || [];
  
  const blockTypes = blocks.reduce((acc: any, block: any) => {
    acc[block.type] = (acc[block.type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: blocks.length,
    byType: blockTypes,
    averageDepth: calculateAverageDepth(blocks),
    connections: countConnections(blocks)
  };
}

function detectThinkingPatterns(content: any): string[] {
  const patterns: string[] = [];
  const blocks = content.blocks || [];

  // WHY → HOW → WHAT パターン
  if (hasSequence(blocks, ['why_block', 'how_block', 'what_block'])) {
    patterns.push('論理的展開パターン検出');
  }

  // OBSERVE → REFLECT パターン
  if (hasSequence(blocks, ['observe_block', 'reflect_block'])) {
    patterns.push('振り返りサイクルパターン検出');
  }

  // 多数のCONNECTブロック
  const connectCount = blocks.filter((b: any) => b.type === 'connect_block').length;
  if (connectCount > 3) {
    patterns.push('多角的思考パターン検出');
  }

  return patterns;
}

function generateSuggestions(stats: any, patterns: string[], theme: string): string[] {
  const suggestions: string[] = [];

  // ブロック数に基づく提案
  if (stats.total < 3) {
    suggestions.push('思考をさらに深掘りしてみましょう。WHYブロックを追加して根本原因を探ってみてください。');
  }

  // WHYブロックが少ない場合
  if ((stats.byType.why_block || 0) < 2) {
    suggestions.push('「なぜ？」を繰り返すことで、より深い理解が得られます。');
  }

  // REFLECTブロックがない場合
  if (!stats.byType.reflect_block) {
    suggestions.push('振り返りブロックを追加して、思考プロセスを客観視してみましょう。');
  }

  // テーマに応じた提案
  if (theme === 'research') {
    suggestions.push('OBSERVEブロックで観察事実を増やすと、より科学的なアプローチになります。');
  } else if (theme === 'creative') {
    suggestions.push('CONNECTブロックを使って、異なるアイデアを結びつけてみましょう。');
  }

  return suggestions;
}

function analyzeThinkingDepth(content: any): any {
  const blocks = content.blocks || [];
  const maxDepth = calculateMaxDepth(blocks);
  
  return {
    maxDepth,
    quality: maxDepth >= 4 ? '深い' : maxDepth >= 2 ? '中程度' : '浅い',
    recommendation: maxDepth < 3 ? 'さらに掘り下げることで新しい発見があるかもしれません' : '十分な深さで思考が展開されています'
  };
}

// ヘルパー関数
function hasSequence(blocks: any[], sequence: string[]): boolean {
  for (let i = 0; i < blocks.length - sequence.length + 1; i++) {
    if (sequence.every((type, j) => blocks[i + j]?.type === type)) {
      return true;
    }
  }
  return false;
}

function calculateAverageDepth(blocks: any[]): number {
  if (blocks.length === 0) return 0;
  const depths = blocks.map((b: any) => b.depth || 1);
  return depths.reduce((a, b) => a + b, 0) / depths.length;
}

function calculateMaxDepth(blocks: any[]): number {
  if (blocks.length === 0) return 0;
  return Math.max(...blocks.map((b: any) => b.depth || 1));
}

function countConnections(blocks: any[]): number {
  return blocks.reduce((count: number, block: any) => {
    return count + (block.connections?.length || 0);
  }, 0);
}
