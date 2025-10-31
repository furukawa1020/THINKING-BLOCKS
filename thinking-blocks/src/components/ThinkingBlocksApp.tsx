'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Plus, Save, FolderOpen, Share, Download, Copy, Code, FileText, GitBranch } from 'lucide-react';
import BlocklyEditor from './BlocklyEditor';
import OutputViewer from './OutputViewer';
import AIReflection from './AIReflection';
import { exportService } from './ExportService';

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

  useEffect(() => {
    // キーボードショートカット
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'o':
            event.preventDefault();
            handleLoad();
            break;
          case 'e':
            event.preventDefault();
            handleShare();
            break;
          case 'n':
            event.preventDefault();
            window.location.reload();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspace, outputData, currentTheme]);

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
    // ファイルから読み込み
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.xml,.md';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            
            if (file.name.endsWith('.json')) {
              const data = JSON.parse(content);
              if (data.workspace) {
                // 従来の保存形式
                workspace?.clear();
                workspace?.fromJSON(JSON.parse(data.workspace));
                setCurrentTheme(data.theme || 'creative');
              } else if (data.thinking_structure) {
                // 新しいエクスポート形式
                loadFromExportedData(data);
              }
            } else if (file.name.endsWith('.xml')) {
              // Blockly XML形式
              workspace?.clear();
              const xml = content;
              workspace?.fromXML(xml);
            }
            
            alert(`${file.name} を読み込みました！`);
          } catch (error) {
            alert('ファイルの読み込みに失敗しました。形式を確認してください。');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const loadTemplate = (templateTheme: string) => {
    if (!workspace) return;
    
    setCurrentTheme(templateTheme);
    workspace.clear();
    
    // テーマに応じたテンプレートブロックを作成
    const templates: { [key: string]: any[] } = {
      creative: [
        { type: 'thinking_why', text: 'アイデアを形にしたい', x: 50, y: 50 },
        { type: 'thinking_how', text: 'プロトタイプを作る', x: 50, y: 120 },
        { type: 'thinking_what', text: '革新的なプロダクトを生み出す', x: 50, y: 190 },
        { type: 'thinking_observe', text: '市場には同様のソリューションが少ない', x: 300, y: 50 },
        { type: 'thinking_reflect', text: 'ユーザーフィードバックを積極的に取り入れる', x: 300, y: 120 }
      ],
      introspection: [
        { type: 'thinking_why', text: '自分自身をより深く理解したい', x: 50, y: 50 },
        { type: 'thinking_how', text: '日記を書き、瞑想する', x: 50, y: 120 },
        { type: 'thinking_what', text: '真の自分を発見する', x: 50, y: 190 },
        { type: 'thinking_observe', text: '感情の変化に注意を払う', x: 300, y: 50 },
        { type: 'thinking_reflect', text: 'パターンと傾向を認識する', x: 300, y: 120 }
      ],
      research: [
        { type: 'thinking_why', text: '問題を科学的に解決したい', x: 50, y: 50 },
        { type: 'thinking_how', text: '仮説を立て、実験で検証する', x: 50, y: 120 },
        { type: 'thinking_what', text: '信頼性の高い結論を得る', x: 50, y: 190 },
        { type: 'thinking_observe', text: 'データに一定のパターンが見える', x: 300, y: 50 },
        { type: 'thinking_reflect', text: '研究手法の改善点を考える', x: 300, y: 120 }
      ],
      education: [
        { type: 'thinking_why', text: '学習者の理解を深めたい', x: 50, y: 50 },
        { type: 'thinking_how', text: '体験型学習を導入する', x: 50, y: 120 },
        { type: 'thinking_what', text: '生涯学習者を育成する', x: 50, y: 190 },
        { type: 'thinking_observe', text: '従来の講義形式では集中力が続かない', x: 300, y: 50 },
        { type: 'thinking_reflect', text: '個々の学習スタイルに合わせる必要がある', x: 300, y: 120 }
      ]
    };

    const currentTemplate = templates[templateTheme] || templates.creative;
    const blocks: any[] = [];

    // ブロックを作成
    currentTemplate.forEach((blockData, index) => {
      const block = workspace.newBlock(blockData.type);
      block.setFieldValue(blockData.text, 'TEXT');
      block.moveBy(blockData.x, blockData.y);
      block.initSvg();
      block.render();
      blocks.push(block);
    });

    // WHY-HOW-WHATの接続
    if (blocks.length >= 3 && window.Blockly) {
      const whyBlock = blocks[0];
      const howBlock = blocks[1];
      const whatBlock = blocks[2];

      const whyConnection = whyBlock.nextConnection;
      const howPrevConnection = howBlock.previousConnection;
      const howNextConnection = howBlock.nextConnection;
      const whatConnection = whatBlock.previousConnection;

      if (whyConnection && howPrevConnection) {
        whyConnection.connect(howPrevConnection);
      }
      if (howNextConnection && whatConnection) {
        howNextConnection.connect(whatConnection);
      }
    }

    // OBSERVE-REFLECTの接続
    if (blocks.length >= 5) {
      const observeBlock = blocks[3];
      const reflectBlock = blocks[4];

      const observeConnection = observeBlock.nextConnection;
      const reflectConnection = reflectBlock.previousConnection;

      if (observeConnection && reflectConnection) {
        observeConnection.connect(reflectConnection);
      }
    }

    alert(`${templateTheme}テンプレートを読み込みました！`);
  };

  const loadFromExportedData = (data: any) => {
    if (!workspace || !data.thinking_structure?.blocks) return;
    
    workspace.clear();
    
    // ブロックを再作成
    data.thinking_structure.blocks.forEach((blockData: any) => {
      const block = workspace.newBlock(blockData.type);
      block.setFieldValue(blockData.text, 'TEXT');
      block.moveBy(blockData.position?.x || 0, blockData.position?.y || 0);
      block.initSvg();
      block.render();
    });
    
    if (data.metadata?.theme) {
      setCurrentTheme(data.metadata.theme);
    }
  };

  const handleShare = () => {
    // 高度なシェア機能
    const timestamp = new Date().getTime();
    
    // Markdownエクスポート
    const markdown = exportService.exportAsMarkdown(outputData, currentTheme);
    exportService.downloadFile(markdown, `思考構造_${timestamp}.md`, 'text/markdown');
    
    // JSONエクスポート
    const jsonData = exportService.exportAsJSON(outputData, currentTheme);
    exportService.downloadFile(jsonData, `思考構造_${timestamp}.json`, 'application/json');
    
    // SVGエクスポート
    const svgData = exportService.exportAsSVG(outputData.blocks, currentTheme);
    exportService.downloadFile(svgData, `思考構造_${timestamp}.svg`, 'image/svg+xml');
    
    alert('Markdown、JSON、SVGファイルをダウンロードしました！');
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
              
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>テンプレート</span>
                </button>
                
                {/* テンプレート ドロップダウン */}
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-1">
                    <button
                      onClick={() => loadTemplate('creative')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-900 rounded-md transition-colors"
                    >
                      🎨 創造テンプレート
                    </button>
                    <button
                      onClick={() => loadTemplate('introspection')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-md transition-colors"
                    >
                      🪞 内省テンプレート
                    </button>
                    <button
                      onClick={() => loadTemplate('research')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-900 rounded-md transition-colors"
                    >
                      🔬 研究テンプレート
                    </button>
                    <button
                      onClick={() => loadTemplate('education')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-900 rounded-md transition-colors"
                    >
                      🎓 教育テンプレート
                    </button>
                  </div>
                </div>
              </div>
              
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <div className="p-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span>AI思考アシスタント</span>
          </h3>
          <AIReflection outputData={outputData} theme={currentTheme} />
        </div>
      </footer>
    </div>
  );
}