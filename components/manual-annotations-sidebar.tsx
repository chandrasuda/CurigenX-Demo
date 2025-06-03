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
    <div className="h-full flex flex-col border-black">
      <div className="p-2 border-b border-black bg-white">
        <h3 className="text-sm font-mono font-semibold mb-1">Manual Highlights</h3>
        <p className="text-xs text-gray-600 mb-2 font-mono">
          Hold <Badge variant="outline" className="font-mono border border-black">Alt/⌥</Badge> + click and drag to create area highlights
        </p>
        {highlights.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAllHighlights}
            className="w-full text-xs h-7 font-mono border border-black"
          >
            Clear All Highlights
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {highlights.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4 font-mono">
              No highlights yet. Select text to add your first highlight.
            </p>
          ) : (
            highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="border border-black p-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors w-[403px]"
                onClick={() => onHighlightClick(highlight)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <strong className="text-xs font-mono flex-1 break-words">{highlight.comment.text}</strong>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHighlightRemove(highlight.id);
                    }}
                    className="h-auto p-1 text-black hover:text-gray-600 flex-shrink-0"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </Button>
                </div>
                
                {highlight.content.text && (
                  <blockquote className="text-xs text-gray-600 border-l border-black pl-2 mb-1 font-mono break-words">
                    {`${highlight.content.text.slice(0, 90).trim()}${
                      highlight.content.text.length > 90 ? "..." : ""
                    }`}
                  </blockquote>
                )}
                
                {highlight.content.image && (
                  <div className="mb-1">
                    <img 
                      src={highlight.content.image} 
                      alt="Screenshot" 
                      className="max-w-full h-auto border border-black"
                    />
                  </div>
                )}
                
                <div className="text-[10px] text-gray-500 font-mono">
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