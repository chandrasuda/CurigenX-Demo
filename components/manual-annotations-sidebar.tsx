"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TrashIcon } from "@radix-ui/react-icons";
import type { IHighlight } from "react-pdf-highlighter";

interface ManualAnnotationsSidebarProps {
  highlights: Array<IHighlight>;
  onHighlightClick: (highlight: IHighlight) => void;
  onHighlightRemove: (highlightId: string) => void;
  onClearAllHighlights: () => void;
}

export default function ManualAnnotationsSidebar({
  highlights,
  onHighlightClick,
  onHighlightRemove,
  onClearAllHighlights
}: ManualAnnotationsSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-300 bg-white">
        <h3 className="text-lg font-semibold mb-2">Manual Highlights</h3>
        <p className="text-sm text-gray-600 mb-4">
          Hold <Badge variant="outline">Alt/⌥</Badge> + click and drag to create area highlights
        </p>
        {highlights.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAllHighlights}
            className="w-full"
          >
            Clear All Highlights
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {highlights.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No highlights yet. Select text to add your first highlight.
            </p>
          ) : (
            highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="border border-gray-200 rounded p-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onHighlightClick(highlight)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <strong className="text-sm flex-1">{highlight.comment.text}</strong>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHighlightRemove(highlight.id);
                    }}
                    className="h-auto p-1 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </Button>
                </div>
                
                {highlight.content.text && (
                  <blockquote className="text-xs text-gray-600 border-l-2 border-gray-300 pl-2 mb-2">
                    {`${highlight.content.text.slice(0, 90).trim()}${
                      highlight.content.text.length > 90 ? "..." : ""
                    }`}
                  </blockquote>
                )}
                
                {highlight.content.image && (
                  <div className="mb-2">
                    <img 
                      src={highlight.content.image} 
                      alt="Screenshot" 
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Page {highlight.position.pageNumber}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 