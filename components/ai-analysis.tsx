"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Document } from "@/lib/document-store";
import { 
  FileTextIcon, 
  GearIcon, 
  CheckCircledIcon, 
  InfoCircledIcon,
  ExclamationTriangleIcon,
//   LightbulbIcon
} from "@radix-ui/react-icons";
import { LightbulbIcon } from "lucide-react";

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

// Mock AI-generated comments - in a real app, these would come from your AI API
const generateAIComments = (): AIComment[] => [
  {
    id: '1',
    type: 'warning',
    title: 'Missing Data References',
    content: 'Several statistical analyses lack proper data source citations. Consider adding references to the original datasets.',
    page: 3,
    confidence: 0.89,
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    type: 'suggestion',
    title: 'Methodology Clarity',
    content: 'The statistical methodology could be explained more clearly for regulatory reviewers. Consider adding a flowchart.',
    page: 5,
    confidence: 0.76,
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    type: 'highlight',
    title: 'Key Finding',
    content: 'Primary endpoint achieved statistical significance (p < 0.001). This is a strong result for regulatory submission.',
    page: 12,
    confidence: 0.94,
    timestamp: new Date().toISOString()
  },
  {
    id: '4',
    type: 'info',
    title: 'Regulatory Compliance',
    content: 'Document structure aligns with ICH E3 guidelines for Clinical Study Reports.',
    page: 1,
    confidence: 0.88,
    timestamp: new Date().toISOString()
  },
  {
    id: '5',
    type: 'warning',
    title: 'Inconsistent Terminology',
    content: 'Mixed usage of "adverse event" vs "adverse reaction". Standardize terminology throughout the document.',
    confidence: 0.82,
    timestamp: new Date().toISOString()
  },
  {
    id: '6',
    type: 'suggestion',
    title: 'Table Formatting',
    content: 'Tables 3.1-3.5 could benefit from better alignment with FDA guidance on tabular data presentation.',
    page: 8,
    confidence: 0.71,
    timestamp: new Date().toISOString()
  }
];

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
  const [analyzing, setAnalyzing] = useState(false);
  const [aiComments, setAiComments] = useState<AIComment[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

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

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newComments = generateAIComments();
      setAiComments(newComments);
      setAnalysisComplete(true);
      
      // Save to localStorage
      localStorage.setItem(`ai-comments-${document.id}`, JSON.stringify(newComments));
      
      setAnalyzing(false);
    }, 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const groupedComments = {
    warnings: aiComments.filter(c => c.type === 'warning'),
    suggestions: aiComments.filter(c => c.type === 'suggestion'),
    highlights: aiComments.filter(c => c.type === 'highlight'),
    info: aiComments.filter(c => c.type === 'info')
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <GearIcon className="w-4 h-4 text-gray-700" />
          <h2 className="text-sm font-semibold">AI Analysis</h2>
        </div>
        
        {/* Compact Document Info */}
        <div className="text-xs text-gray-600 space-y-1 mb-3">
          <div className="truncate"><strong>File:</strong> {document.name}</div>
          <div className="flex gap-4">
            <span><strong>Size:</strong> {formatFileSize(document.size)}</span>
            {document.analysis?.pageCount && (
              <span><strong>Pages:</strong> {document.analysis.pageCount}</span>
            )}
          </div>
        </div>

        {!analysisComplete && (
          <Button 
            className="w-full text-xs h-8" 
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <GearIcon className="w-3 h-3 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Run AI Analysis'
            )}
          </Button>
        )}
      </div>

      {analysisComplete && (
        <>
          {/* Fixed Analysis Summary */}
          <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-gray-50">
            <Card>
              <CardContent className="p-3">
                <h3 className="text-xs font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-bold text-red-700">{groupedComments.warnings.length}</div>
                    <div className="text-red-600 text-[10px]">Warnings</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-bold text-blue-700">{groupedComments.suggestions.length}</div>
                    <div className="text-blue-600 text-[10px]">Suggestions</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-700">{groupedComments.highlights.length}</div>
                    <div className="text-green-600 text-[10px]">Key Points</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-700">{groupedComments.info.length}</div>
                    <div className="text-gray-600 text-[10px]">Info</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scrollable AI Comments Section */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3">
                {aiComments.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">
                    No analysis results available.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {aiComments.map((comment) => (
                      <Card key={comment.id} className="border-l-4 border-l-gray-300">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {getIconForType(comment.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-xs font-medium leading-tight line-clamp-2">{comment.title}</h4>
                                <Badge variant={getBadgeVariant(comment.type)} className="text-[10px] px-1 py-0 h-4 flex-shrink-0">
                                  {comment.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2 leading-relaxed break-words hyphens-auto">
                                {comment.content}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                {comment.page && (
                                  <>
                                    <span>Page {comment.page}</span>
                                    <span>•</span>
                                  </>
                                )}
                                <span>{Math.round(comment.confidence * 100)}% confidence</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Fixed Re-analyze Button */}
          <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
            <Button 
              variant="outline" 
              className="w-full text-xs h-8" 
              onClick={handleRunAIAnalysis}
              disabled={analyzing}
            >
              Re-analyze Document
            </Button>
          </div>
        </>
      )}

      {/* Loading State */}
      {analyzing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-6">
            <GearIcon className="w-6 h-6 mx-auto mb-3 animate-spin text-gray-500" />
            <p className="text-xs text-gray-600 px-2">
              Analyzing document for compliance and improvements...
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 