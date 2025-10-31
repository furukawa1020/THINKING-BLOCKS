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