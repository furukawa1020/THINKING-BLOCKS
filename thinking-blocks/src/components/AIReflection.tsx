'use client';

import React from 'react';
import { Brain, Lightbulb, Target, Zap } from 'lucide-react';

interface AIReflectionProps {
  outputData: {
    text: string;
    json: any;
    blocks: any[];
  };
  theme: string;
}

interface Reflection {
  type: 'question' | 'insight' | 'suggestion' | 'connection';
  title: string;
  content: string;
  icon: React.ReactNode;
}

export default function AIReflection({ outputData, theme }: AIReflectionProps) {
  const generateReflections = (): Reflection[] => {
    const reflections: Reflection[] = [];
    const { blocks, text } = outputData;

    if (!blocks || blocks.length === 0) {
      return [{
        type: 'suggestion',
        title: '思考を始めてみましょう',
        content: 'WHYブロックから始めて、あなたの動機や理由を明確にしてみてください。',
        icon: <Brain className="w-4 h-4" />
      }];
    }

    // ブロックタイプの分析
    const blockTypes = blocks.map(b => b.type).filter(Boolean);
    const hasWhy = blockTypes.includes('thinking_why');
    const hasHow = blockTypes.includes('thinking_how');
    const hasWhat = blockTypes.includes('thinking_what');
    const hasObserve = blockTypes.includes('thinking_observe');
    const hasReflect = blockTypes.includes('thinking_reflect');

    // 思考フローの完全性チェック
    if (hasWhy && !hasHow) {
      reflections.push({
        type: 'question',
        title: '手段を考えてみませんか？',
        content: 'WHYで動機を明確にしました。次はHOWブロックで「どのように実現するか」を考えてみましょう。',
        icon: <Lightbulb className="w-4 h-4" />
      });
    }

    if (hasHow && !hasWhat) {
      reflections.push({
        type: 'question',
        title: '最終的な目標は何ですか？',
        content: '手段は明確になりました。WHATブロックで「何を達成したいか」を明確にしてみましょう。',
        icon: <Target className="w-4 h-4" />
      });
    }

    if (!hasObserve && blocks.length > 2) {
      reflections.push({
        type: 'suggestion',
        title: '現状を観察してみましょう',
        content: 'OBSERVEブロックを使って、現在の状況や課題を客観的に観察してみてください。',
        icon: <Zap className="w-4 h-4" />
      });
    }

    if (!hasReflect && blocks.length > 3) {
      reflections.push({
        type: 'insight',
        title: '振り返りの時間です',
        content: 'REFLECTブロックを追加して、これまでの思考を振り返り、改善点を考えてみましょう。',
        icon: <Brain className="w-4 h-4" />
      });
    }

    // テキスト内容の分析
    const textLower = text.toLowerCase();
    
    // 感情的な言葉の検出
    const emotionalWords = ['好き', '嫌い', '楽しい', '困った', '心配', '不安', '嬉しい', '悲しい'];
    const hasEmotionalContent = emotionalWords.some(word => textLower.includes(word));
    
    if (hasEmotionalContent && !hasReflect) {
      reflections.push({
        type: 'insight',
        title: '感情と論理のバランス',
        content: '感情的な要素が含まれています。REFLECTブロックで感情と論理のバランスを考えてみましょう。',
        icon: <Brain className="w-4 h-4" />
      });
    }

    // 抽象的すぎる内容の検出
    const abstractWords = ['なんとなく', 'たぶん', 'きっと', '多分', 'なんか'];
    const hasAbstractContent = abstractWords.some(word => textLower.includes(word));
    
    if (hasAbstractContent) {
      reflections.push({
        type: 'question',
        title: 'より具体的に考えてみましょう',
        content: '抽象的な表現が見つかりました。より具体的な言葉で表現してみませんか？',
        icon: <Lightbulb className="w-4 h-4" />
      });
    }

    // テーマ別のアドバイス
    const themeAdvice = getThemeAdvice(theme, blockTypes);
    if (themeAdvice) {
      reflections.push(themeAdvice);
    }

    // デフォルトの励ましメッセージ
    if (reflections.length === 0) {
      reflections.push({
        type: 'insight',
        title: '素晴らしい思考構造です！',
        content: 'バランスの取れた思考構造ができています。さらに深く掘り下げてみませんか？',
        icon: <Brain className="w-4 h-4" />
      });
    }

    return reflections.slice(0, 3); // 最大3つまで
  };

  const getThemeAdvice = (theme: string, blockTypes: string[]): Reflection | null => {
    const themeAdviceMap: { [key: string]: Reflection } = {
      creative: {
        type: 'suggestion',
        title: '創造性を広げてみましょう',
        content: '異なる視点や突飛なアイデアも歓迎です。CONNECTブロックで意外な繋がりを探してみませんか？',
        icon: <Zap className="w-4 h-4" />
      },
      introspection: {
        type: 'insight',
        title: '内なる声に耳を傾けて',
        content: '感情や直感も大切な情報です。論理だけでなく、感覚的な要素も思考に取り入れてみましょう。',
        icon: <Brain className="w-4 h-4" />
      },
      research: {
        type: 'question',
        title: '仮説は検証可能ですか？',
        content: 'あなたの思考を検証する方法はありますか？観察や実験による裏付けを考えてみましょう。',
        icon: <Target className="w-4 h-4" />
      },
      education: {
        type: 'suggestion',
        title: '学習者の視点で考えてみましょう',
        content: '他の人にも理解しやすい構造になっていますか？教える立場で思考を整理してみてください。',
        icon: <Lightbulb className="w-4 h-4" />
      }
    };

    return themeAdviceMap[theme] || null;
  };

  const getReflectionColor = (type: string, theme: string) => {
    const themeColors: { [key: string]: { [key: string]: string } } = {
      creative: {
        question: 'bg-purple-50 border-purple-200 text-purple-800',
        insight: 'bg-pink-50 border-pink-200 text-pink-800',
        suggestion: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        connection: 'bg-violet-50 border-violet-200 text-violet-800'
      },
      introspection: {
        question: 'bg-blue-50 border-blue-200 text-blue-800',
        insight: 'bg-teal-50 border-teal-200 text-teal-800',
        suggestion: 'bg-cyan-50 border-cyan-200 text-cyan-800',
        connection: 'bg-sky-50 border-sky-200 text-sky-800'
      },
      research: {
        question: 'bg-green-50 border-green-200 text-green-800',
        insight: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        suggestion: 'bg-lime-50 border-lime-200 text-lime-800',
        connection: 'bg-teal-50 border-teal-200 text-teal-800'
      },
      education: {
        question: 'bg-orange-50 border-orange-200 text-orange-800',
        insight: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        suggestion: 'bg-amber-50 border-amber-200 text-amber-800',
        connection: 'bg-red-50 border-red-200 text-red-800'
      }
    };

    return themeColors[theme]?.[type] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const reflections = generateReflections();

  return (
    <div className="space-y-3">
      {reflections.map((reflection, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getReflectionColor(reflection.type, theme)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {reflection.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">
                {reflection.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {reflection.content}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {reflections.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            思考ブロックを組み立てると<br />
            ここにAIからのヒントが表示されます
          </p>
        </div>
      )}
    </div>
  );
}