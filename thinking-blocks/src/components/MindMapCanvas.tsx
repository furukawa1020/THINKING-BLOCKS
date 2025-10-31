'use client';

import React, { useRef, useEffect } from 'react';

interface MindMapCanvasProps {
  blocks: any[];
  theme: string;
  width?: number;
  height?: number;
}

interface Node {
  id: string;
  type: string;
  text: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

interface Connection {
  from: string;
  to: string;
  type: 'flow' | 'reflection';
}

export default function MindMapCanvas({ blocks, theme, width = 800, height = 600 }: MindMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getThemeColors = (themeKey: string) => {
    const themes: { [key: string]: any } = {
      creative: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        accent: '#F59E0B',
        background: '#FDF4FF',
        text: '#581C87'
      },
      introspection: {
        primary: '#0EA5E9',
        secondary: '#14B8A6',
        accent: '#06B6D4',
        background: '#F0F9FF',
        text: '#0C4A6E'
      },
      research: {
        primary: '#10B981',
        secondary: '#3B82F6',
        accent: '#6366F1',
        background: '#F0FDF4',
        text: '#064E3B'
      },
      education: {
        primary: '#F59E0B',
        secondary: '#EF4444',
        accent: '#F97316',
        background: '#FFFBEB',
        text: '#92400E'
      }
    };
    return themes[themeKey] || themes.creative;
  };

  const getBlockColor = (blockType: string, themeColors: any) => {
    const blockColors: { [key: string]: string } = {
      'thinking_why': '#FFD54F',
      'thinking_how': '#81C784',
      'thinking_what': '#64B5F6',
      'thinking_observe': '#FFB74D',
      'thinking_reflect': '#BA68C8',
      'thinking_connect': '#9575CD'
    };
    return blockColors[blockType] || themeColors.primary;
  };

  const processBlocks = (blocks: any[]): { nodes: Node[], connections: Connection[] } => {
    const nodes: Node[] = [];
    const connections: Connection[] = [];
    const themeColors = getThemeColors(theme);

    // ブロックをノードに変換
    blocks.forEach((block, index) => {
      if (block && block.type && block.getFieldValue) {
        const text = block.getFieldValue('TEXT') || '';
        const node: Node = {
          id: block.id || `block_${index}`,
          type: block.type,
          text: text.length > 30 ? text.substring(0, 27) + '...' : text,
          x: 0,
          y: 0,
          color: getBlockColor(block.type, themeColors),
          connections: []
        };
        nodes.push(node);
      }
    });

    // 接続関係を解析
    blocks.forEach((block, index) => {
      if (block && block.nextConnection && block.nextConnection.targetConnection) {
        const targetBlock = block.nextConnection.targetConnection.sourceBlock_;
        const fromId = block.id || `block_${index}`;
        const toId = targetBlock.id || `block_${blocks.indexOf(targetBlock)}`;
        
        connections.push({
          from: fromId,
          to: toId,
          type: block.type.includes('observe') || block.type.includes('reflect') ? 'reflection' : 'flow'
        });
      }
    });

    return { nodes, connections };
  };

  const calculateLayout = (nodes: Node[], connections: Connection[]) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // 中央配置の場合の座標計算
    if (nodes.length === 1) {
      nodes[0].x = centerX;
      nodes[0].y = centerY;
      return;
    }

    // 思考フローの分析
    const whyNodes = nodes.filter(n => n.type === 'thinking_why');
    const howNodes = nodes.filter(n => n.type === 'thinking_how');
    const whatNodes = nodes.filter(n => n.type === 'thinking_what');
    const observeNodes = nodes.filter(n => n.type === 'thinking_observe');
    const reflectNodes = nodes.filter(n => n.type === 'thinking_reflect');
    const connectNodes = nodes.filter(n => n.type === 'thinking_connect');

    // WHY-HOW-WHATフローを左側に配置
    let yOffset = centerY - (whyNodes.length + howNodes.length + whatNodes.length) * 30;
    const flowX = centerX - 150;

    [...whyNodes, ...howNodes, ...whatNodes].forEach((node, index) => {
      node.x = flowX;
      node.y = yOffset + index * 80;
    });

    // OBSERVE-REFLECTを右側に配置
    let rightYOffset = centerY - (observeNodes.length + reflectNodes.length) * 30;
    const reflectionX = centerX + 150;

    [...observeNodes, ...reflectNodes].forEach((node, index) => {
      node.x = reflectionX;
      node.y = rightYOffset + index * 80;
    });

    // CONNECTノードを中央に配置
    connectNodes.forEach((node, index) => {
      node.x = centerX;
      node.y = centerY + index * 60 - (connectNodes.length * 30);
    });
  };

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas のサイズ設定
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const themeColors = getThemeColors(theme);

    // 背景をクリア
    ctx.fillStyle = themeColors.background;
    ctx.fillRect(0, 0, width, height);

    // データ処理
    const { nodes, connections } = processBlocks(blocks);
    if (nodes.length === 0) {
      // 空の状態のメッセージ
      ctx.fillStyle = themeColors.text;
      ctx.font = '16px Quicksand, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('思考ブロックを組み立てると', width / 2, height / 2 - 20);
      ctx.fillText('ここにマインドマップが表示されます', width / 2, height / 2 + 20);
      return;
    }

    // レイアウト計算
    calculateLayout(nodes, connections);

    // 接続線を描画
    ctx.strokeStyle = themeColors.primary + '40';
    ctx.lineWidth = 2;
    connections.forEach(connection => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.setLineDash(connection.type === 'reflection' ? [5, 5] : []);
        ctx.moveTo(fromNode.x, fromNode.y);
        
        // 曲線で接続
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const offset = connection.type === 'reflection' ? 30 : 20;
        
        ctx.quadraticCurveTo(midX + offset, midY - offset, toNode.x, toNode.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // ノードを描画
    nodes.forEach(node => {
      // ノードの背景
      const nodeWidth = Math.max(120, node.text.length * 8);
      const nodeHeight = 40;
      
      ctx.fillStyle = node.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // 角丸矩形を描画
      const radius = 20;
      ctx.beginPath();
      ctx.roundRect(
        node.x - nodeWidth / 2,
        node.y - nodeHeight / 2,
        nodeWidth,
        nodeHeight,
        radius
      );
      ctx.fill();
      
      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // ノードのテキスト
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Quicksand, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // ブロックタイプ
      ctx.fillText(node.type.replace('thinking_', '').toUpperCase(), node.x, node.y - 8);
      
      // テキスト内容
      ctx.font = '10px Quicksand, sans-serif';
      ctx.fillText(node.text, node.x, node.y + 8);
    });

    // タイトル描画
    ctx.fillStyle = themeColors.text;
    ctx.font = 'bold 18px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('思考マップ', width / 2, 30);
  };

  useEffect(() => {
    drawMindMap();
  }, [blocks, theme, width, height]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // PNG画像としてダウンロード
    const link = document.createElement('a');
    link.download = `thinking-map-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full border border-gray-200 rounded-lg"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      
      {blocks.length > 0 && (
        <button
          onClick={handleDownload}
          className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          画像ダウンロード
        </button>
      )}
    </div>
  );
}