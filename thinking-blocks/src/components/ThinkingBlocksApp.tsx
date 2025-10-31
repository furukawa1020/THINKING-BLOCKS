'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Plus, Save, FolderOpen, Share, Download, Copy, Code, FileText, GitBranch } from 'lucide-react';
import BlocklyEditor from './BlocklyEditor';
import OutputViewer from './OutputViewer';

export default function ThinkingBlocksApp() {
  const [activeView, setActiveView] = useState<'text' | 'json' | 'mindmap'>('text');
  const [currentTheme, setCurrentTheme] = useState('creative');
  const [workspace, setWorkspace] = useState<any>(null);
  const [outputData, setOutputData] = useState({
    text: '',
    json: {},
    blocks: []
  });

  const themes = {
    creative: { name: '創造', color: 'from-purple-400 to-pink-400' },
    introspection: { name: '内省', color: 'from-blue-400 to-teal-400' },
    research: { name: '研究', color: 'from-green-400 to-blue-400' },
    education: { name: '教育', color: 'from-yellow-400 to-orange-400' }
  };

  const handleWorkspaceChange = (newWorkspace: any) => {
    setWorkspace(newWorkspace);
    // Generate output from workspace
    generateOutput(newWorkspace);
  };

  const generateOutput = (workspace: any) => {
    if (!workspace) return;

    try {
      // Generate text output
      const textOutput = generateTextOutput(workspace);
      
      // Generate JSON output
      const jsonOutput = generateJsonOutput(workspace);
      
      // Get blocks data
      const blocks = workspace.getAllBlocks();

      setOutputData({
        text: textOutput,
        json: jsonOutput,
        blocks: blocks
      });
    } catch (error) {
      console.error('Error generating output:', error);
    }
  };

  const generateTextOutput = (workspace: any) => {
    const blocks = workspace.getAllBlocks();
    let output = '';
    
    blocks.forEach((block: any) => {
      const type = block.type;
      const text = block.getFieldValue?.('TEXT') || '';
      
      switch (type) {
        case 'thinking_why':
          output += `WHY("${text}")\n`;
          break;
        case 'thinking_how':
          output += `  HOW("${text}")\n`;
          break;
        case 'thinking_what':
          output += `    WHAT("${text}")\n`;
          break;
        case 'thinking_observe':
          output += `OBSERVE("${text}")\n`;
          break;
        case 'thinking_reflect':
          output += `REFLECT("${text}")\n`;
          break;
      }
    });

    return output || '思考ブロックを組み立てると、ここに構文が表示されます...\n\n例:\nWHY("人の考えを構造化したい")\n  HOW("ブロックで可視化する")\n    WHAT("思考プログラミング環境をつくる")\nOBSERVE("現状：考えが抽象的すぎる")\nREFLECT("より直感的な可視化を導入する必要がある")';
  };

  const generateJsonOutput = (workspace: any) => {
    const blocks = workspace.getAllBlocks();
    const structure: any = {
      thinking_structure: {
        created_at: new Date().toISOString().split('T')[0],
        theme: currentTheme,
        blocks: []
      }
    };

    blocks.forEach((block: any) => {
      const blockData = {
        id: block.id,
        type: block.type,
        text: block.getFieldValue?.('TEXT') || '',
        position: {
          x: block.getRelativeToSurfaceXY().x,
          y: block.getRelativeToSurfaceXY().y
        }
      };
      structure.thinking_structure.blocks.push(blockData);
    });

    return structure;
  };

  const handleSave = () => {
    if (!workspace) return;
    
    const data = {
      workspace: JSON.stringify(workspace.save()),
      theme: currentTheme,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('thinking-blocks-save', JSON.stringify(data));
    
    // Show success feedback
    alert('思考構造を保存しました！');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('thinking-blocks-save');
    if (saved && workspace) {
      try {
        const data = JSON.parse(saved);
        workspace.clear();
        workspace.fromJSON(JSON.parse(data.workspace));
        setCurrentTheme(data.theme);
        
        alert('思考構造を読み込みました！');
      } catch (error) {
        alert('保存データの読み込みに失敗しました。');
      }
    } else {
      alert('保存されたデータがありません。');
    }
  };

  const handleShare = () => {
    const shareData = {
      text: outputData.text,
      json: outputData.json,
      theme: currentTheme
    };
    
    navigator.clipboard.writeText(JSON.stringify(shareData, null, 2))
      .then(() => alert('共有データをクリップボードにコピーしました！'))
      .catch(() => alert('コピーに失敗しました。'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  THINKING BLOCKS
                </h1>
                <p className="text-sm text-gray-600">Program your way of thinking</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>新規作成</span>
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
              
              <button
                onClick={handleLoad}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span>読み込み</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share className="w-4 h-4" />
                <span>共有</span>
              </button>

              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="ml-4 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {Object.entries(themes).map(([key, theme]) => (
                  <option key={key} value={key}>{theme.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
          
          {/* Left Panel: Block Editor */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <div className="p-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <span>思考ブロック</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">なぜ・どのように・何を の構造を組み立てる</p>
            </div>
            
            <div className="h-[calc(100%-5rem)]">
              <BlocklyEditor onWorkspaceChange={handleWorkspaceChange} theme={currentTheme} />
            </div>

            {/* Block Legend */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-200/50">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span>WHY</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span>HOW</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span>WHAT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  <span>OBSERVE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded"></div>
                  <span>REFLECT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Output Views */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <div className="p-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span>思考の可視化</span>
                </h2>
                
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveView('text')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeView === 'text' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Code className="w-4 h-4 inline mr-1" />
                    テキスト
                  </button>
                  <button
                    onClick={() => setActiveView('json')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeView === 'json' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setActiveView('mindmap')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeView === 'mindmap' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    マップ
                  </button>
                </div>
              </div>
            </div>
            
            <div className="h-[calc(100%-5rem)]">
              <OutputViewer 
                activeView={activeView} 
                outputData={outputData}
                theme={currentTheme}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer: Reflection Area */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <div className="p-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span>思考の振り返り</span>
          </h3>
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              思考構造を組み立てると、ここに振り返りのヒントが表示されます...
              <br />
              <span className="text-gray-500">
                WHY（なぜ）から始めて、HOW（どのように）を経て、WHAT（何を）に至る思考の流れを観察してみましょう。
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}