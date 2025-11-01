'use client';

import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import MindMapCanvas from './MindMapCanvas';

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
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h3 className="font-bold text-lg flex items-center">
          <span className="mr-2">📊</span>
          実行結果
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleCopy(outputData.text)}
            className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-md ${
              copySuccess 
                ? 'bg-green-400 text-white' 
                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
          >
            <Copy className="w-3 h-3" />
            <span>{copySuccess ? 'コピー済み' : 'コピー'}</span>
          </button>
          <button
            onClick={() => handleDownload(outputData.text, 'thinking-structure.txt', 'text/plain')}
            className="flex items-center space-x-1 px-4 py-2 text-sm font-medium bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>ダウンロード</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-300 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">🖥️</span>
              コンソール出力
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {new Date().toLocaleTimeString('ja-JP')}
            </span>
          </div>
          <pre className="text-base font-mono leading-relaxed text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border-2 border-gray-200 min-h-[200px]">
            {outputData.text || '(出力なし)\n\nブロックを実行すると、結果がここに表示されます。'}
          </pre>
        </div>
      </div>
    </div>
  );

  const renderJsonView = () => {
    const jsonString = JSON.stringify(outputData.json, null, 2);
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <h3 className="font-bold text-lg flex items-center">
            <span className="mr-2">📊</span>
            構造データ (JSON)
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCopy(jsonString)}
              className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-md ${
                copySuccess 
                  ? 'bg-green-400 text-white' 
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>{copySuccess ? 'コピー済み' : 'コピー'}</span>
            </button>
            <button
              onClick={() => handleDownload(jsonString, 'thinking-structure.json', 'application/json')}
              className="flex items-center space-x-1 px-4 py-2 text-sm font-medium bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>ダウンロード</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 to-green-50">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-green-300 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🗂️</span>
                JSON構造
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {Object.keys(outputData.json || {}).length} keys
              </span>
            </div>
            <pre className="text-sm font-mono bg-gray-50 text-gray-800 whitespace-pre-wrap p-4 rounded-xl border-2 border-gray-200 min-h-[200px]">
              {jsonString || '{}'}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const renderMindmapView = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <h3 className="font-semibold text-gray-900">思考マップ</h3>
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