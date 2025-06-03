"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { type Document } from "@/lib/document-store";
import { 
  GearIcon, 
  CheckCircledIcon, 
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { LightbulbIcon } from "lucide-react";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { aiAnalysisSchema } from '@/app/api/chat/schema';

interface AIAnalysisProps {
  document: Document;
}

interface AIComment {
  id: string;
  type: 'suggestion' | 'warning' | 'info' | 'highlight';
  title: string;
  content: string;
  page?: number;
  confidence: number;
  timestamp: string;
}

const getIconForType = (type: AIComment['type']) => {
  switch (type) {
    case 'warning':
      return <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />;
    case 'suggestion':
      return <LightbulbIcon className="w-4 h-4 text-blue-600" />;
    case 'highlight':
      return <CheckCircledIcon className="w-4 h-4 text-green-600" />;
    case 'info':
      return <InfoCircledIcon className="w-4 h-4 text-gray-600" />;
    default:
      return <InfoCircledIcon className="w-4 h-4 text-gray-600" />;
  }
};

const getBadgeVariant = (type: AIComment['type']) => {
  switch (type) {
    case 'warning':
      return 'destructive' as const;
    case 'suggestion':
      return 'default' as const;
    case 'highlight':
      return 'secondary' as const;
    case 'info':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
};

export default function AIAnalysis({ document }: AIAnalysisProps) {
  const [aiComments, setAiComments] = useState<AIComment[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const { object, submit, isLoading, error } = useObject({
    api: '/api/chat',
    schema: aiAnalysisSchema,
    onFinish: ({ object, error }) => {
      console.log('Analysis finished:', { object, error });
      if (object?.analysis?.comments) {
        setAiComments(object.analysis.comments);
        setAnalysisComplete(true);
        // Save to localStorage
        localStorage.setItem(`ai-comments-${document.id}`, JSON.stringify(object.analysis.comments));
      }
    },
    onError: (error) => {
      console.error('AI Analysis error:', error);
    }
  });

  useEffect(() => {
    console.log('Object state changed:', object);
  }, [object]);

  useEffect(() => {
    // Load saved AI comments from localStorage
    const savedComments = localStorage.getItem(`ai-comments-${document.id}`);
    if (savedComments) {
      try {
        const comments = JSON.parse(savedComments);
        setAiComments(comments);
        setAnalysisComplete(true);
      } catch (error) {
        console.error('Error loading AI comments:', error);
      }
    }
  }, [document.id]);

  const handleRunAIAnalysis = () => {
    console.log('Starting AI analysis for document:', document);
    setAnalysisComplete(false);
    setAiComments([]);
    submit({ document });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate summary counts in real-time from current comments
  const summary = {
    warnings: aiComments.filter(c => c.type === 'warning').length,
    suggestions: aiComments.filter(c => c.type === 'suggestion').length,
    highlights: aiComments.filter(c => c.type === 'highlight').length,
    info: aiComments.filter(c => c.type === 'info').length
  };

  // Display AI-generated comments if available, otherwise fall back to local state
  const displayComments = object?.analysis?.comments || aiComments;

  return (
    <div className="h-full flex flex-col border-black">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-2 border-b border-black bg-white">
        <div className="flex items-center gap-2 mb-1">
          <GearIcon className="w-4 h-4 text-black" />
          <h2 className="text-sm font-mono font-semibold">AI Analysis</h2>
        </div>
        
        {/* Compact Document Info */}
        <div className="text-xs text-gray-600 space-y-0.5 mb-2">
          <div className="truncate font-mono"><strong>File:</strong> {document.name}</div>
          <div className="flex gap-4 font-mono">
            <span><strong>Size:</strong> {formatFileSize(document.size)}</span>
            {document.analysis?.pageCount && (
              <span><strong>Pages:</strong> {document.analysis.pageCount}</span>
            )}
          </div>
        </div>

        {!analysisComplete && !isLoading && (
          <Button 
            className="w-full text-xs h-7 font-mono border border-black" 
            onClick={handleRunAIAnalysis}
            disabled={isLoading}
            variant="outline"
          >
            Run AI Analysis
          </Button>
        )}

        {error && (
          <div className="text-xs text-red-600 font-mono mt-1">
            Analysis failed: {error.message || 'Please try again.'}
          </div>
        )}
      </div>

      {(analysisComplete || displayComments.length > 0) && (
        <>
          {/* Fixed Analysis Summary */}
          <div className="flex-shrink-0 p-2 border-b border-black bg-white">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-medium">Summary</h3>
              <div className="grid grid-cols-4 gap-1 text-xs">
                <div className="text-center p-1 border border-black rounded-none">
                  <div className="font-mono font-bold">{summary.warnings}</div>
                  <div className="text-[10px] font-mono">Warnings</div>
                </div>
                <div className="text-center p-1 border border-black rounded-none">
                  <div className="font-mono font-bold">{summary.suggestions}</div>
                  <div className="text-[10px] font-mono">Suggestions</div>
                </div>
                <div className="text-center p-1 border border-black rounded-none">
                  <div className="font-mono font-bold">{summary.highlights}</div>
                  <div className="text-[10px] font-mono">Key Points</div>
                </div>
                <div className="text-center p-1 border border-black rounded-none">
                  <div className="font-mono font-bold">{summary.info}</div>
                  <div className="text-[10px] font-mono">Info</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable AI Comments Section */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2">
                {displayComments.length === 0 && !isLoading ? (
                  <p className="text-xs text-gray-500 text-center py-4 font-mono">
                    No analysis results available.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {displayComments.filter(comment => comment != null).map((comment) => (
                      <div key={`${comment.id}-${comment.timestamp}`} className="border border-black p-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIconForType(comment.type || 'info')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-xs font-mono font-medium leading-tight line-clamp-2">{comment.title}</h4>
                              <Badge variant={getBadgeVariant(comment.type || 'info')} className="text-[10px] px-1 py-0 h-4 flex-shrink-0 font-mono border border-black">
                                {comment.type || 'info'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1 leading-relaxed break-words hyphens-auto font-mono">
                              {comment.content}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                              {comment.page && (
                                <>
                                  <span>Page {comment.page}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{Math.round((comment.confidence || 0) * 100)}% confidence</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Fixed Re-analyze Button */}
          <div className="flex-shrink-0 p-2 border-t border-black bg-white">
            <Button 
              variant="outline" 
              className="w-full text-xs h-7 font-mono border border-black" 
              onClick={handleRunAIAnalysis}
              disabled={isLoading}
            >
              Re-analyze Document
            </Button>
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && displayComments.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-4">
            <GearIcon className="w-6 h-6 mx-auto mb-2 animate-spin text-black" />
            <p className="text-xs text-gray-600 px-2 font-mono">
              Analyzing document for compliance and improvements...
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 