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
          name: '🎯 思考フレームワーク',
          colour: '#FFD54F',
          contents: [
            { kind: 'block', type: 'thinking_why' },
            { kind: 'block', type: 'thinking_how' },
            { kind: 'block', type: 'thinking_what' },
            { kind: 'block', type: 'thinking_observe' },
            { kind: 'block', type: 'thinking_reflect' },
            { kind: 'block', type: 'thinking_connect' }
          ]
        },
        {
          kind: 'category',
          name: '🎮 イベント',
          colour: '#FFAB40',
          contents: [
            { kind: 'block', type: 'event_start' },
            { kind: 'block', type: 'event_click' },
            { kind: 'block', type: 'event_keypress' },
            { kind: 'block', type: 'event_timer' },
            { kind: 'block', type: 'event_custom' }
          ]
        },
        {
          kind: 'category',
          name: '🔄 制御フロー',
          colour: '#FF7043',
          contents: [
            { kind: 'block', type: 'controls_if' },
            { kind: 'block', type: 'controls_repeat' },
            { kind: 'block', type: 'controls_whileuntil' },
            { kind: 'block', type: 'controls_for' },
            { kind: 'block', type: 'controls_forEach' },
            { kind: 'block', type: 'controls_flow_statements' },
            { kind: 'block', type: 'switch_case' },
            { kind: 'block', type: 'try_catch' }
          ]
        },
        {
          kind: 'category',
          name: '📦 変数とスコープ',
          colour: '#AB47BC',
          contents: [
            { kind: 'block', type: 'variables_set' },
            { kind: 'block', type: 'variables_get' },
            { kind: 'block', type: 'const_declare' },
            { kind: 'block', type: 'pointer_declare' },
            { kind: 'block', type: 'global_variable' }
          ]
        },
        {
          kind: 'category',
          name: '🔢 数値・計算',
          colour: '#5C6BC0',
          contents: [
            { kind: 'block', type: 'math_number' },
            { kind: 'block', type: 'math_arithmetic' },
            { kind: 'block', type: 'math_comparison' },
            { kind: 'block', type: 'math_random_int' },
            { kind: 'block', type: 'math_bitwise' },
            { kind: 'block', type: 'math_modulo' },
            { kind: 'block', type: 'math_power' },
            { kind: 'block', type: 'math_sqrt' },
            { kind: 'block', type: 'math_abs' },
            { kind: 'block', type: 'math_round' }
          ]
        },
        {
          kind: 'category',
          name: '📝 文字列操作',
          colour: '#26A69A',
          contents: [
            { kind: 'block', type: 'text' },
            { kind: 'block', type: 'text_join' },
            { kind: 'block', type: 'text_length' },
            { kind: 'block', type: 'text_print' },
            { kind: 'block', type: 'text_split' },
            { kind: 'block', type: 'text_replace' },
            { kind: 'block', type: 'text_substring' },
            { kind: 'block', type: 'text_format' },
            { kind: 'block', type: 'regex_match' }
          ]
        },
        {
          kind: 'category',
          name: '📋 配列・リスト',
          colour: '#42A5F5',
          contents: [
            { kind: 'block', type: 'lists_create_empty' },
            { kind: 'block', type: 'lists_create_with' },
            { kind: 'block', type: 'lists_getIndex' },
            { kind: 'block', type: 'lists_setIndex' },
            { kind: 'block', type: 'lists_length' },
            { kind: 'block', type: 'array_push' },
            { kind: 'block', type: 'array_pop' },
            { kind: 'block', type: 'array_slice' },
            { kind: 'block', type: 'array_map' },
            { kind: 'block', type: 'array_filter' },
            { kind: 'block', type: 'array_reduce' },
            { kind: 'block', type: 'array_sort' }
          ]
        },
        {
          kind: 'category',
          name: '🗂️ 辞書・オブジェクト',
          colour: '#7E57C2',
          contents: [
            { kind: 'block', type: 'dict_create' },
            { kind: 'block', type: 'dict_get' },
            { kind: 'block', type: 'dict_set' },
            { kind: 'block', type: 'dict_keys' },
            { kind: 'block', type: 'dict_values' },
            { kind: 'block', type: 'json_parse' },
            { kind: 'block', type: 'json_stringify' }
          ]
        },
        {
          kind: 'category',
          name: '⚙️ 関数定義',
          colour: '#8D6E63',
          contents: [
            { kind: 'block', type: 'procedures_defnoreturn' },
            { kind: 'block', type: 'procedures_defreturn' },
            { kind: 'block', type: 'procedures_callnoreturn' },
            { kind: 'block', type: 'procedures_callreturn' },
            { kind: 'block', type: 'lambda_function' },
            { kind: 'block', type: 'function_return' }
          ]
        },
        {
          kind: 'category',
          name: '🎨 出力・表示',
          colour: '#66BB6A',
          contents: [
            { kind: 'block', type: 'display_text' },
            { kind: 'block', type: 'display_clear' },
            { kind: 'block', type: 'display_color' },
            { kind: 'block', type: 'console_log' },
            { kind: 'block', type: 'console_error' },
            { kind: 'block', type: 'console_warn' },
            { kind: 'block', type: 'alert_message' },
            { kind: 'block', type: 'draw_shape' }
          ]
        },
        {
          kind: 'category',
          name: '📥 入力',
          colour: '#FFA726',
          contents: [
            { kind: 'block', type: 'input_prompt' },
            { kind: 'block', type: 'input_confirm' },
            { kind: 'block', type: 'file_read' },
            { kind: 'block', type: 'user_input' }
          ]
        },
        {
          kind: 'category',
          name: '🌐 ネットワーク・API',
          colour: '#29B6F6',
          contents: [
            { kind: 'block', type: 'http_get' },
            { kind: 'block', type: 'http_post' },
            { kind: 'block', type: 'fetch_api' },
            { kind: 'block', type: 'websocket_connect' }
          ]
        },
        {
          kind: 'category',
          name: '� ファイル・ストレージ',
          colour: '#8BC34A',
          contents: [
            { kind: 'block', type: 'file_write' },
            { kind: 'block', type: 'file_read' },
            { kind: 'block', type: 'file_delete' },
            { kind: 'block', type: 'local_storage_set' },
            { kind: 'block', type: 'local_storage_get' }
          ]
        },
        {
          kind: 'category',
          name: '🧮 論理演算',
          colour: '#EC407A',
          contents: [
            { kind: 'block', type: 'logic_boolean' },
            { kind: 'block', type: 'logic_compare' },
            { kind: 'block', type: 'logic_operation' },
            { kind: 'block', type: 'logic_negate' },
            { kind: 'block', type: 'logic_ternary' }
          ]
        },
        {
          kind: 'category',
          name: '⏱️ 時間・遅延',
          colour: '#FDD835',
          contents: [
            { kind: 'block', type: 'time_sleep' },
            { kind: 'block', type: 'time_now' },
            { kind: 'block', type: 'time_format' },
            { kind: 'block', type: 'timer_set' }
          ]
        },
        {
          kind: 'category',
          name: '🔧 ユーティリティ',
          colour: '#78909C',
          contents: [
            { kind: 'block', type: 'type_check' },
            { kind: 'block', type: 'type_convert' },
            { kind: 'block', type: 'random_choice' },
            { kind: 'block', type: 'comment_block' }
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

    // === 思考フレームワークブロック ===
    
    // WHYブロック（開始ブロック）
    window.Blockly.Blocks['thinking_why'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('WHY')
          .appendField(new window.Blockly.FieldTextInput('なぜこれをしたいのか？'), 'TEXT');
        this.setNextStatement(true, 'thinking_flow');
        this.setColour('#FFD54F');
        this.setTooltip('動機や理由を記述します（思考の開始点）');
        this.setHelpUrl('');
        this.setDeletable(true);
        this.setMovable(true);
      }
    };

    // HOWブロック（中間ブロック）
    window.Blockly.Blocks['thinking_how'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('HOW')
          .appendField(new window.Blockly.FieldTextInput('どのようにやるのか？'), 'TEXT');
        this.setPreviousStatement(true, 'thinking_flow');
        this.setNextStatement(true, 'thinking_flow');
        this.setColour('#81C784');
        this.setTooltip('手段やプロセスを記述します');
        this.setHelpUrl('');
        this.setDeletable(true);
        this.setMovable(true);
      }
    };

    // WHATブロック（終了ブロック）
    window.Blockly.Blocks['thinking_what'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('WHAT')
          .appendField(new window.Blockly.FieldTextInput('何を達成するのか？'), 'TEXT');
        this.setPreviousStatement(true, 'thinking_flow');
        this.setColour('#64B5F6');
        this.setTooltip('目的や成果を記述します（思考の終着点）');
        this.setHelpUrl('');
        this.setDeletable(true);
        this.setMovable(true);
      }
    };

    // OBSERVEブロック（独立ブロック）
    window.Blockly.Blocks['thinking_observe'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('OBSERVE')
          .appendField(new window.Blockly.FieldTextInput('現状はどうなっているか？'), 'TEXT');
        this.setNextStatement(true, 'thinking_reflection');
        this.setColour('#FFB74D');
        this.setTooltip('現状や課題を観察します');
        this.setHelpUrl('');
        this.setDeletable(true);
        this.setMovable(true);
      }
    };

    // REFLECTブロック（振り返りブロック）
    window.Blockly.Blocks['thinking_reflect'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('REFLECT')
          .appendField(new window.Blockly.FieldTextInput('どう改善できるか？'), 'TEXT');
        this.setPreviousStatement(true, 'thinking_reflection');
        this.setNextStatement(true, 'thinking_reflection');
        this.setColour('#BA68C8');
        this.setTooltip('思考結果を振り返ります');
        this.setHelpUrl('');
        this.setDeletable(true);
        this.setMovable(true);
      }
    };

    // CONNECTブロック（思考同士をつなぐ）
    window.Blockly.Blocks['thinking_connect'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('CONNECT')
          .appendField(new window.Blockly.FieldTextInput('関連性や繋がり'), 'TEXT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9575CD');
        this.setTooltip('思考同士の繋がりを記述します');
        this.setHelpUrl('');
        this.setDeletable(true);
        this.setMovable(true);
      }
    };

    // === イベントブロック ===
    
    window.Blockly.Blocks['event_start'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('🚀 プログラムが始まったとき');
        this.appendStatementInput('DO')
          .appendField('実行');
        this.setColour('#FFAB40');
        this.setTooltip('プログラム開始時に実行されます');
      }
    };

    window.Blockly.Blocks['event_click'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('🖱️ クリックされたとき');
        this.appendStatementInput('DO')
          .appendField('実行');
        this.setColour('#FFAB40');
        this.setTooltip('クリック時に実行されます');
      }
    };

    window.Blockly.Blocks['event_keypress'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('⌨️ キー')
          .appendField(new window.Blockly.FieldTextInput('スペース'), 'KEY')
          .appendField('が押されたとき');
        this.appendStatementInput('DO')
          .appendField('実行');
        this.setColour('#FFAB40');
        this.setTooltip('指定したキーが押されたとき実行されます');
      }
    };

    // === 見た目ブロック ===
    
    window.Blockly.Blocks['display_text'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('💬 表示する');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('テキストを画面に表示します');
      }
    };

    window.Blockly.Blocks['display_clear'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('🧹 画面をクリア');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('画面をクリアします');
      }
    };

    window.Blockly.Blocks['display_color'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('🎨 色を')
          .appendField(new window.Blockly.FieldColour('#ff0000'), 'COLOR')
          .appendField('に変更');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('表示色を変更します');
      }
    };

    // === 追加のイベントブロック ===
    
    window.Blockly.Blocks['event_timer'] = {
      init: function() {
        this.appendValueInput('MILLISECONDS')
          .setCheck('Number')
          .appendField('⏱️')
          .appendField(new window.Blockly.FieldNumber(1000, 0), 'TIME')
          .appendField('ミリ秒後に実行');
        this.appendStatementInput('DO')
          .appendField('実行');
        this.setColour('#FFAB40');
        this.setTooltip('指定時間後に実行されます');
      }
    };

    window.Blockly.Blocks['event_custom'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('📡 カスタムイベント')
          .appendField(new window.Blockly.FieldTextInput('myEvent'), 'EVENT');
        this.appendStatementInput('DO')
          .appendField('実行');
        this.setColour('#FFAB40');
        this.setTooltip('カスタムイベント発火時に実行');
      }
    };

    // === 制御フローブロック ===
    
    window.Blockly.Blocks['switch_case'] = {
      init: function() {
        this.appendValueInput('VALUE')
          .appendField('🔀 switch');
        this.appendStatementInput('CASE1')
          .appendField('case 1:');
        this.appendStatementInput('CASE2')
          .appendField('case 2:');
        this.appendStatementInput('DEFAULT')
          .appendField('default:');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip('switch-case文');
      }
    };

    window.Blockly.Blocks['try_catch'] = {
      init: function() {
        this.appendStatementInput('TRY')
          .appendField('🛡️ try');
        this.appendStatementInput('CATCH')
          .appendField('catch (エラー)');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip('エラーハンドリング');
      }
    };

    // === 変数スコープブロック ===
    
    window.Blockly.Blocks['const_declare'] = {
      init: function() {
        this.appendValueInput('VALUE')
          .appendField('📌 const')
          .appendField(new window.Blockly.FieldTextInput('定数名'), 'VAR')
          .appendField('=');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#AB47BC');
        this.setTooltip('定数宣言(変更不可)');
      }
    };

    window.Blockly.Blocks['pointer_declare'] = {
      init: function() {
        this.appendValueInput('VALUE')
          .appendField('👉 ポインタ')
          .appendField(new window.Blockly.FieldTextInput('ptr'), 'VAR')
          .appendField('=');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#AB47BC');
        this.setTooltip('ポインタ宣言(C言語風)');
      }
    };

    window.Blockly.Blocks['global_variable'] = {
      init: function() {
        this.appendValueInput('VALUE')
          .appendField('🌍 グローバル変数')
          .appendField(new window.Blockly.FieldTextInput('global_var'), 'VAR')
          .appendField('=');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#AB47BC');
        this.setTooltip('グローバルスコープ変数');
      }
    };

    // === 数値演算ブロック ===
    
    window.Blockly.Blocks['math_bitwise'] = {
      init: function() {
        this.appendValueInput('A');
        this.appendValueInput('B')
          .appendField(new window.Blockly.FieldDropdown([
            ['& (AND)', 'AND'],
            ['| (OR)', 'OR'],
            ['^ (XOR)', 'XOR'],
            ['<< (左シフト)', 'LSHIFT'],
            ['>> (右シフト)', 'RSHIFT']
          ]), 'OP');
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
        this.setColour('#5C6BC0');
        this.setTooltip('ビット演算');
      }
    };

    window.Blockly.Blocks['math_modulo'] = {
      init: function() {
        this.appendValueInput('DIVIDEND')
          .appendField('余り');
        this.appendValueInput('DIVISOR')
          .appendField('÷');
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
        this.setColour('#5C6BC0');
        this.setTooltip('剰余演算');
      }
    };

    window.Blockly.Blocks['math_power'] = {
      init: function() {
        this.appendValueInput('BASE');
        this.appendValueInput('EXPONENT')
          .appendField('^');
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
        this.setColour('#5C6BC0');
        this.setTooltip('累乗計算');
      }
    };

    window.Blockly.Blocks['math_sqrt'] = {
      init: function() {
        this.appendValueInput('NUM')
          .appendField('√');
        this.setOutput(true, 'Number');
        this.setColour('#5C6BC0');
        this.setTooltip('平方根');
      }
    };

    window.Blockly.Blocks['math_abs'] = {
      init: function() {
        this.appendValueInput('NUM')
          .appendField('絶対値');
        this.setOutput(true, 'Number');
        this.setColour('#5C6BC0');
        this.setTooltip('絶対値を返す');
      }
    };

    window.Blockly.Blocks['math_round'] = {
      init: function() {
        this.appendValueInput('NUM')
          .appendField(new window.Blockly.FieldDropdown([
            ['四捨五入', 'ROUND'],
            ['切り上げ', 'CEIL'],
            ['切り捨て', 'FLOOR']
          ]), 'OP');
        this.setOutput(true, 'Number');
        this.setColour('#5C6BC0');
        this.setTooltip('数値の丸め処理');
      }
    };

    // === 文字列操作ブロック ===
    
    window.Blockly.Blocks['text_split'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('分割');
        this.appendValueInput('DELIMITER')
          .appendField('区切り文字');
        this.setInputsInline(true);
        this.setOutput(true, 'Array');
        this.setColour('#26A69A');
        this.setTooltip('文字列を分割');
      }
    };

    window.Blockly.Blocks['text_replace'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('置換');
        this.appendValueInput('FROM')
          .appendField('検索');
        this.appendValueInput('TO')
          .appendField('→');
        this.setInputsInline(true);
        this.setOutput(true, 'String');
        this.setColour('#26A69A');
        this.setTooltip('文字列置換');
      }
    };

    window.Blockly.Blocks['text_substring'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('部分文字列');
        this.appendValueInput('START')
          .appendField('開始');
        this.appendValueInput('END')
          .appendField('終了');
        this.setInputsInline(true);
        this.setOutput(true, 'String');
        this.setColour('#26A69A');
        this.setTooltip('部分文字列を取得');
      }
    };

    window.Blockly.Blocks['text_format'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('フォーマット');
        this.appendValueInput('ARGS')
          .appendField('引数');
        this.setInputsInline(true);
        this.setOutput(true, 'String');
        this.setColour('#26A69A');
        this.setTooltip('文字列フォーマット (printf風)');
      }
    };

    window.Blockly.Blocks['regex_match'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('正規表現マッチ');
        this.appendValueInput('PATTERN')
          .appendField('パターン');
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setColour('#26A69A');
        this.setTooltip('正規表現でパターンマッチング');
      }
    };

    // === 配列操作ブロック ===
    
    window.Blockly.Blocks['array_push'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('配列');
        this.appendValueInput('ITEM')
          .appendField('に追加');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#42A5F5');
        this.setTooltip('配列の末尾に要素を追加');
      }
    };

    window.Blockly.Blocks['array_pop'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('配列');
        this.appendDummyInput()
          .appendField('から末尾を削除');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour('#42A5F5');
        this.setTooltip('配列の末尾要素を削除して返す');
      }
    };

    window.Blockly.Blocks['array_slice'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('配列スライス');
        this.appendValueInput('START')
          .appendField('開始');
        this.appendValueInput('END')
          .appendField('終了');
        this.setInputsInline(true);
        this.setOutput(true, 'Array');
        this.setColour('#42A5F5');
        this.setTooltip('配列の一部を抽出');
      }
    };

    window.Blockly.Blocks['array_map'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('配列');
        this.appendStatementInput('FUNCTION')
          .appendField('各要素に適用');
        this.setOutput(true, 'Array');
        this.setColour('#42A5F5');
        this.setTooltip('map関数 - 各要素を変換');
      }
    };

    window.Blockly.Blocks['array_filter'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('配列');
        this.appendStatementInput('CONDITION')
          .appendField('条件でフィルタ');
        this.setOutput(true, 'Array');
        this.setColour('#42A5F5');
        this.setTooltip('filter関数 - 条件に合う要素のみ');
      }
    };

    window.Blockly.Blocks['array_reduce'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('配列');
        this.appendStatementInput('FUNCTION')
          .appendField('を集約');
        this.appendValueInput('INITIAL')
          .appendField('初期値');
        this.setOutput(true);
        this.setColour('#42A5F5');
        this.setTooltip('reduce関数 - 配列を1つの値に');
      }
    };

    window.Blockly.Blocks['array_sort'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('配列');
        this.appendDummyInput()
          .appendField('を')
          .appendField(new window.Blockly.FieldDropdown([
            ['昇順', 'ASC'],
            ['降順', 'DESC']
          ]), 'ORDER')
          .appendField('ソート');
        this.setInputsInline(true);
        this.setOutput(true, 'Array');
        this.setColour('#42A5F5');
        this.setTooltip('配列をソート');
      }
    };

    // === 辞書・オブジェクトブロック ===
    
    window.Blockly.Blocks['dict_create'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('🗂️ 辞書を作成');
        this.setOutput(true, 'Dictionary');
        this.setColour('#7E57C2');
        this.setTooltip('空の辞書を作成');
      }
    };

    window.Blockly.Blocks['dict_get'] = {
      init: function() {
        this.appendValueInput('DICT')
          .appendField('辞書');
        this.appendValueInput('KEY')
          .appendField('キー');
        this.appendDummyInput()
          .appendField('の値を取得');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour('#7E57C2');
        this.setTooltip('辞書から値を取得');
      }
    };

    window.Blockly.Blocks['dict_set'] = {
      init: function() {
        this.appendValueInput('DICT')
          .appendField('辞書');
        this.appendValueInput('KEY')
          .appendField('キー');
        this.appendValueInput('VALUE')
          .appendField('=');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#7E57C2');
        this.setTooltip('辞書に値を設定');
      }
    };

    window.Blockly.Blocks['dict_keys'] = {
      init: function() {
        this.appendValueInput('DICT')
          .appendField('辞書');
        this.appendDummyInput()
          .appendField('のキー一覧');
        this.setInputsInline(true);
        this.setOutput(true, 'Array');
        this.setColour('#7E57C2');
        this.setTooltip('辞書のキー一覧を取得');
      }
    };

    window.Blockly.Blocks['dict_values'] = {
      init: function() {
        this.appendValueInput('DICT')
          .appendField('辞書');
        this.appendDummyInput()
          .appendField('の値一覧');
        this.setInputsInline(true);
        this.setOutput(true, 'Array');
        this.setColour('#7E57C2');
        this.setTooltip('辞書の値一覧を取得');
      }
    };

    window.Blockly.Blocks['json_parse'] = {
      init: function() {
        this.appendValueInput('JSON')
          .appendField('JSON解析');
        this.setOutput(true);
        this.setColour('#7E57C2');
        this.setTooltip('JSON文字列をオブジェクトに変換');
      }
    };

    window.Blockly.Blocks['json_stringify'] = {
      init: function() {
        this.appendValueInput('OBJECT')
          .appendField('JSON文字列化');
        this.setOutput(true, 'String');
        this.setColour('#7E57C2');
        this.setTooltip('オブジェクトをJSON文字列に変換');
      }
    };

    // === 出力ブロック ===
    
    window.Blockly.Blocks['console_log'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('📝 console.log');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('コンソールに出力');
      }
    };

    window.Blockly.Blocks['console_error'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('❌ console.error');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('エラーメッセージを出力');
      }
    };

    window.Blockly.Blocks['console_warn'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('⚠️ console.warn');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('警告メッセージを出力');
      }
    };

    window.Blockly.Blocks['alert_message'] = {
      init: function() {
        this.appendValueInput('TEXT')
          .appendField('🔔 アラート表示');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('アラートダイアログを表示');
      }
    };

    window.Blockly.Blocks['draw_shape'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('🎨 図形')
          .appendField(new window.Blockly.FieldDropdown([
            ['円', 'circle'],
            ['四角', 'rect'],
            ['三角', 'triangle'],
            ['線', 'line']
          ]), 'SHAPE')
          .appendField('を描画');
        this.appendValueInput('X')
          .appendField('X');
        this.appendValueInput('Y')
          .appendField('Y');
        this.appendValueInput('SIZE')
          .appendField('サイズ');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#66BB6A');
        this.setTooltip('図形を描画');
      }
    };

    // === 入力ブロック ===
    
    window.Blockly.Blocks['input_prompt'] = {
      init: function() {
        this.appendValueInput('MESSAGE')
          .appendField('📥 入力');
        this.setOutput(true, 'String');
        this.setColour('#FFA726');
        this.setTooltip('ユーザーからの入力を受け取る');
      }
    };

    window.Blockly.Blocks['input_confirm'] = {
      init: function() {
        this.appendValueInput('MESSAGE')
          .appendField('❓ 確認');
        this.setOutput(true, 'Boolean');
        this.setColour('#FFA726');
        this.setTooltip('はい/いいえの確認');
      }
    };

    window.Blockly.Blocks['user_input'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('⌨️ ユーザー入力待ち');
        this.setOutput(true, 'String');
        this.setColour('#FFA726');
        this.setTooltip('ユーザー入力を待つ');
      }
    };

    // === ネットワークブロック ===
    
    window.Blockly.Blocks['http_get'] = {
      init: function() {
        this.appendValueInput('URL')
          .appendField('🌐 HTTP GET');
        this.setOutput(true);
        this.setColour('#29B6F6');
        this.setTooltip('HTTP GETリクエスト');
      }
    };

    window.Blockly.Blocks['http_post'] = {
      init: function() {
        this.appendValueInput('URL')
          .appendField('🌐 HTTP POST');
        this.appendValueInput('DATA')
          .appendField('データ');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour('#29B6F6');
        this.setTooltip('HTTP POSTリクエスト');
      }
    };

    window.Blockly.Blocks['fetch_api'] = {
      init: function() {
        this.appendValueInput('URL')
          .appendField('📡 Fetch API');
        this.setOutput(true);
        this.setColour('#29B6F6');
        this.setTooltip('Fetch APIでデータ取得');
      }
    };

    window.Blockly.Blocks['websocket_connect'] = {
      init: function() {
        this.appendValueInput('URL')
          .appendField('🔌 WebSocket接続');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#29B6F6');
        this.setTooltip('WebSocketサーバーに接続');
      }
    };

    // === ファイル・ストレージブロック ===
    
    window.Blockly.Blocks['file_write'] = {
      init: function() {
        this.appendValueInput('PATH')
          .appendField('💾 ファイル書き込み');
        this.appendValueInput('CONTENT')
          .appendField('内容');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8BC34A');
        this.setTooltip('ファイルに書き込み');
      }
    };

    window.Blockly.Blocks['file_delete'] = {
      init: function() {
        this.appendValueInput('PATH')
          .appendField('🗑️ ファイル削除');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8BC34A');
        this.setTooltip('ファイルを削除');
      }
    };

    window.Blockly.Blocks['local_storage_set'] = {
      init: function() {
        this.appendValueInput('KEY')
          .appendField('💿 localStorage保存');
        this.appendValueInput('VALUE')
          .appendField('=');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8BC34A');
        this.setTooltip('ローカルストレージに保存');
      }
    };

    window.Blockly.Blocks['local_storage_get'] = {
      init: function() {
        this.appendValueInput('KEY')
          .appendField('💿 localStorage取得');
        this.setOutput(true, 'String');
        this.setColour('#8BC34A');
        this.setTooltip('ローカルストレージから取得');
      }
    };

    // === 時間・遅延ブロック ===
    
    window.Blockly.Blocks['time_sleep'] = {
      init: function() {
        this.appendValueInput('DURATION')
          .appendField('⏱️ 待機');
        this.appendDummyInput()
          .appendField('秒');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FDD835');
        this.setTooltip('指定秒数待機');
      }
    };

    window.Blockly.Blocks['time_now'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('⏰ 現在時刻');
        this.setOutput(true);
        this.setColour('#FDD835');
        this.setTooltip('現在時刻を取得');
      }
    };

    window.Blockly.Blocks['time_format'] = {
      init: function() {
        this.appendValueInput('TIME')
          .appendField('📅 時刻フォーマット');
        this.appendValueInput('FORMAT')
          .appendField('形式');
        this.setInputsInline(true);
        this.setOutput(true, 'String');
        this.setColour('#FDD835');
        this.setTooltip('時刻を指定形式で表示');
      }
    };

    window.Blockly.Blocks['timer_set'] = {
      init: function() {
        this.appendValueInput('DURATION')
          .appendField('⏲️ タイマー設定');
        this.appendDummyInput()
          .appendField('秒後に通知');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FDD835');
        this.setTooltip('タイマーを設定');
      }
    };

    // === ユーティリティブロック ===
    
    window.Blockly.Blocks['type_check'] = {
      init: function() {
        this.appendValueInput('VALUE')
          .appendField('🔍 型チェック');
        this.setOutput(true, 'String');
        this.setColour('#78909C');
        this.setTooltip('値の型を返す');
      }
    };

    window.Blockly.Blocks['type_convert'] = {
      init: function() {
        this.appendValueInput('VALUE')
          .appendField('🔄 型変換');
        this.appendDummyInput()
          .appendField('→')
          .appendField(new window.Blockly.FieldDropdown([
            ['文字列', 'string'],
            ['数値', 'number'],
            ['真偽値', 'boolean'],
            ['配列', 'array']
          ]), 'TYPE');
        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour('#78909C');
        this.setTooltip('値を指定の型に変換');
      }
    };

    window.Blockly.Blocks['random_choice'] = {
      init: function() {
        this.appendValueInput('LIST')
          .appendField('🎲 ランダム選択');
        this.setOutput(true);
        this.setColour('#78909C');
        this.setTooltip('リストからランダムに1つ選択');
      }
    };

    window.Blockly.Blocks['comment_block'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('💭 コメント:')
          .appendField(new window.Blockly.FieldTextInput('ここに説明を書く'), 'COMMENT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#78909C');
        this.setTooltip('コメント(実行されない)');
      }
    };

    // === 関数ブロック ===
    
    window.Blockly.Blocks['lambda_function'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('λ ラムダ関数');
        this.appendValueInput('PARAM')
          .appendField('引数');
        this.appendStatementInput('BODY')
          .appendField('実行内容');
        this.setOutput(true, 'Function');
        this.setColour('#8D6E63');
        this.setTooltip('無名関数(ラムダ)');
      }
    };

    window.Blockly.Blocks['function_return'] = {
      init: function() {
        this.appendValueInput('VALUE')
          .appendField('↩️ 戻り値');
        this.setPreviousStatement(true, null);
        this.setColour('#8D6E63');
        this.setTooltip('関数から値を返す');
      }
    };

    // JavaScript生成器の定義
    if (window.Blockly.JavaScript) {
      // 思考ブロック
      window.Blockly.JavaScript['thinking_why'] = function(block: any) {
        const text = block.getFieldValue('TEXT');
        const nextBlock = window.Blockly.JavaScript.statementToCode(block, 'NEXT');
        return `WHY("${text}")\n${nextBlock}`;
      };

      window.Blockly.JavaScript['thinking_how'] = function(block: any) {
        const text = block.getFieldValue('TEXT');
        const nextBlock = window.Blockly.JavaScript.statementToCode(block, 'NEXT');
        return `  HOW("${text}")\n${nextBlock}`;
      };

      window.Blockly.JavaScript['thinking_what'] = function(block: any) {
        const text = block.getFieldValue('TEXT');
        return `    WHAT("${text}")\n`;
      };

      window.Blockly.JavaScript['thinking_observe'] = function(block: any) {
        const text = block.getFieldValue('TEXT');
        const nextBlock = window.Blockly.JavaScript.statementToCode(block, 'NEXT');
        return `OBSERVE("${text}")\n${nextBlock}`;
      };

      window.Blockly.JavaScript['thinking_reflect'] = function(block: any) {
        const text = block.getFieldValue('TEXT');
        const nextBlock = window.Blockly.JavaScript.statementToCode(block, 'NEXT');
        return `REFLECT("${text}")\n${nextBlock}`;
      };

      window.Blockly.JavaScript['thinking_connect'] = function(block: any) {
        const text = block.getFieldValue('TEXT');
        const nextBlock = window.Blockly.JavaScript.statementToCode(block, 'NEXT');
        return `CONNECT("${text}")\n${nextBlock}`;
      };

      // イベントブロック
      window.Blockly.JavaScript['event_start'] = function(block: any) {
        const statements = window.Blockly.JavaScript.statementToCode(block, 'DO');
        return `// プログラム開始\n${statements}\n`;
      };

      window.Blockly.JavaScript['event_click'] = function(block: any) {
        const statements = window.Blockly.JavaScript.statementToCode(block, 'DO');
        return `document.addEventListener('click', function() {\n${statements}});\n`;
      };

      window.Blockly.JavaScript['event_keypress'] = function(block: any) {
        const key = block.getFieldValue('KEY');
        const statements = window.Blockly.JavaScript.statementToCode(block, 'DO');
        return `document.addEventListener('keypress', function(e) {\n  if(e.key === '${key}') {\n${statements}  }\n});\n`;
      };

      // 見た目ブロック
      window.Blockly.JavaScript['display_text'] = function(block: any) {
        const text = window.Blockly.JavaScript.valueToCode(block, 'TEXT', window.Blockly.JavaScript.ORDER_NONE) || '""';
        return `console.log(${text});\n`;
      };

      window.Blockly.JavaScript['display_clear'] = function(block: any) {
        return `console.clear();\n`;
      };

      window.Blockly.JavaScript['display_color'] = function(block: any) {
        const color = block.getFieldValue('COLOR');
        return `document.body.style.backgroundColor = '${color}';\n`;
      };
    }
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

    // テーマに応じた初期ブロックのテンプレート
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

    // 現在のテーマに応じたテンプレートを取得
    const currentTemplate = templates[theme] || templates.creative;
    const blocks: any[] = [];

    // ブロックを作成
    currentTemplate.forEach((blockData, index) => {
      const block = workspace.current.newBlock(blockData.type);
      block.setFieldValue(blockData.text, 'TEXT');
      block.moveBy(blockData.x, blockData.y);
      block.initSvg();
      block.render();
      blocks.push(block);
    });

    // WHY-HOW-WHATの接続
    if (blocks.length >= 3) {
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