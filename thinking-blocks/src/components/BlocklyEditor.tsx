'use client';

import React, { useEffect, useRef } from 'react';

// Blocklyの型定義
declare global {
  interface Window {
    Blockly: any;
  }
}

interface BlocklyEditorProps {
  onWorkspaceChange: (workspace: any) => void;
  theme: string;
}

export default function BlocklyEditor({ onWorkspaceChange, theme }: BlocklyEditorProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && blocklyDiv.current) {
      // Blocklyライブラリを動的に読み込み
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/blockly/blockly.min.js';
      script.onload = () => {
        initializeBlockly();
      };
      document.head.appendChild(script);

      return () => {
        if (workspace.current) {
          workspace.current.dispose();
        }
      };
    }
  }, []);

  const initializeBlockly = () => {
    if (!window.Blockly || !blocklyDiv.current) return;

    // カスタムブロックの定義
    defineCustomBlocks();

    // ツールボックスの設定
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: '思考ブロック',
          colour: '#FFD54F',
          contents: [
            { kind: 'block', type: 'thinking_why' },
            { kind: 'block', type: 'thinking_how' },
            { kind: 'block', type: 'thinking_what' },
            { kind: 'block', type: 'thinking_observe' },
            { kind: 'block', type: 'thinking_reflect' }
          ]
        }
      ]
    };

    // ワークスペースの初期化
    workspace.current = window.Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      theme: getBlocklyTheme(theme),
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true,
      sounds: false
    });

    // ワークスペースの変更を監視
    workspace.current.addChangeListener(() => {
      onWorkspaceChange(workspace.current);
    });

    // 初期ブロックの配置（デモ用）
    addInitialBlocks();
  };

  const defineCustomBlocks = () => {
    if (!window.Blockly) return;

    // WHYブロック
    window.Blockly.Blocks['thinking_why'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('WHY')
          .appendField(new window.Blockly.FieldTextInput('なぜこれをしたいのか？'), 'TEXT');
        this.setNextStatement(true, null);
        this.setColour('#FFD54F');
        this.setTooltip('動機や理由を記述します');
        this.setHelpUrl('');
      }
    };

    // HOWブロック
    window.Blockly.Blocks['thinking_how'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('HOW')
          .appendField(new window.Blockly.FieldTextInput('どのようにやるのか？'), 'TEXT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#81C784');
        this.setTooltip('手段やプロセスを記述します');
        this.setHelpUrl('');
      }
    };

    // WHATブロック
    window.Blockly.Blocks['thinking_what'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('WHAT')
          .appendField(new window.Blockly.FieldTextInput('何を達成するのか？'), 'TEXT');
        this.setPreviousStatement(true, null);
        this.setColour('#64B5F6');
        this.setTooltip('目的や成果を記述します');
        this.setHelpUrl('');
      }
    };

    // OBSERVEブロック
    window.Blockly.Blocks['thinking_observe'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('OBSERVE')
          .appendField(new window.Blockly.FieldTextInput('現状はどうなっているか？'), 'TEXT');
        this.setNextStatement(true, null);
        this.setColour('#FFB74D');
        this.setTooltip('現状や課題を観察します');
        this.setHelpUrl('');
      }
    };

    // REFLECTブロック
    window.Blockly.Blocks['thinking_reflect'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('REFLECT')
          .appendField(new window.Blockly.FieldTextInput('どう改善できるか？'), 'TEXT');
        this.setPreviousStatement(true, null);
        this.setColour('#BA68C8');
        this.setTooltip('思考結果を振り返ります');
        this.setHelpUrl('');
      }
    };
  };

  const getBlocklyTheme = (themeKey: string) => {
    const themes: { [key: string]: any } = {
      creative: {
        name: 'creative',
        base: window.Blockly?.Themes?.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#fff5f5',
          toolboxBackgroundColour: '#fff',
          flyoutBackgroundColour: '#f8f9fa'
        }
      },
      introspection: {
        name: 'introspection',
        base: window.Blockly?.Themes?.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#f0f9ff',
          toolboxBackgroundColour: '#fff',
          flyoutBackgroundColour: '#f8f9fa'
        }
      },
      research: {
        name: 'research',
        base: window.Blockly?.Themes?.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#f0fdf4',
          toolboxBackgroundColour: '#fff',
          flyoutBackgroundColour: '#f8f9fa'
        }
      },
      education: {
        name: 'education',
        base: window.Blockly?.Themes?.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#fffbeb',
          toolboxBackgroundColour: '#fff',
          flyoutBackgroundColour: '#f8f9fa'
        }
      }
    };

    return themes[themeKey] || themes.creative;
  };

  const addInitialBlocks = () => {
    if (!workspace.current || !window.Blockly) return;

    // デモ用の初期ブロック
    const whyBlock = workspace.current.newBlock('thinking_why');
    whyBlock.setFieldValue('人の考えを構造化したい', 'TEXT');
    whyBlock.moveBy(50, 50);
    whyBlock.initSvg();
    whyBlock.render();

    const howBlock = workspace.current.newBlock('thinking_how');
    howBlock.setFieldValue('ブロックで可視化する', 'TEXT');
    howBlock.moveBy(50, 120);
    howBlock.initSvg();
    howBlock.render();

    const whatBlock = workspace.current.newBlock('thinking_what');
    whatBlock.setFieldValue('思考プログラミング環境をつくる', 'TEXT');
    whatBlock.moveBy(50, 190);
    whatBlock.initSvg();
    whatBlock.render();

    // ブロックを接続
    const whyConnection = whyBlock.nextConnection;
    const howConnection = howBlock.previousConnection;
    const howNextConnection = howBlock.nextConnection;
    const whatConnection = whatBlock.previousConnection;

    if (whyConnection && howConnection) {
      whyConnection.connect(howConnection);
    }
    if (howNextConnection && whatConnection) {
      howNextConnection.connect(whatConnection);
    }
  };

  return (
    <div className="w-full h-full">
      <div 
        ref={blocklyDiv} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}