'use client';

import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';

interface OutputViewerProps {
  activeView: 'text' | 'json' | 'mindmap';
  outputData: {
    text: string;
    json: any;
    blocks: any[];
  };
  theme: string;
}

export default function OutputViewer({ activeView, outputData, theme }: OutputViewerProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getThemeColors = (themeKey: string) => {
    const themes: { [key: string]: any } = {
      creative: {
        gradient: 'from-purple-400 to-pink-400',
        bg: 'bg-purple-50',
        text: 'text-purple-900'
      },
      introspection: {
        gradient: 'from-blue-400 to-teal-400',
        bg: 'bg-blue-50',
        text: 'text-blue-900'
      },
      research: {
        gradient: 'from-green-400 to-blue-400',
        bg: 'bg-green-50',
        text: 'text-green-900'
      },
      education: {
        gradient: 'from-yellow-400 to-orange-400',
        bg: 'bg-orange-50',
        text: 'text-orange-900'
      }
    };
    return themes[themeKey] || themes.creative;
  };

  const themeColors = getThemeColors(theme);

  const renderTextView = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <h3 className="font-semibold text-gray-900">思考構文</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleCopy(outputData.text)}
            className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              copySuccess 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Copy className="w-3 h-3" />
            <span>{copySuccess ? 'コピー済み' : 'コピー'}</span>
          </button>
          <button
            onClick={() => handleDownload(outputData.text, 'thinking-structure.txt', 'text/plain')}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>ダウンロード</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className={`p-4 text-sm font-mono leading-relaxed ${themeColors.bg} ${themeColors.text} whitespace-pre-wrap`}>
          {outputData.text}
        </pre>
      </div>
    </div>
  );

  const renderJsonView = () => {
    const jsonString = JSON.stringify(outputData.json, null, 2);
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <h3 className="font-semibold text-gray-900">構造データ</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCopy(jsonString)}
              className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                copySuccess 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Copy className="w-3 h-3" />
              <span>{copySuccess ? 'コピー済み' : 'コピー'}</span>
            </button>
            <button
              onClick={() => handleDownload(jsonString, 'thinking-structure.json', 'application/json')}
              className="flex items-center space-x-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>ダウンロード</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <pre className="p-4 text-sm font-mono bg-gray-50 text-gray-800 whitespace-pre-wrap">
            {jsonString}
          </pre>
        </div>
      </div>
    );
  };

  const renderMindmapView = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <h3 className="font-semibold text-gray-900">思考マップ</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              // Canvas要素から画像をダウンロード（実装は後で）
              alert('マインドマップのダウンロード機能は開発中です');
            }}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>画像保存</span>
          </button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <MindMapCanvas blocks={outputData.blocks} theme={theme} />
      </div>
    </div>
  );

  return (
    <div className="h-full bg-white">
      {activeView === 'text' && renderTextView()}
      {activeView === 'json' && renderJsonView()}
      {activeView === 'mindmap' && renderMindmapView()}
    </div>
  );
}

// マインドマップCanvas コンポーネント
function MindMapCanvas({ blocks, theme }: { blocks: any[]; theme: string }) {
  React.useEffect(() => {
    // Canvas描画ロジック（後で実装）
  }, [blocks, theme]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <p className="text-sm font-medium">思考マップ表示</p>
        <p className="text-xs mt-1">ブロックを組み立てると<br />ここにマインドマップが表示されます</p>
      </div>
    </div>
  );
}