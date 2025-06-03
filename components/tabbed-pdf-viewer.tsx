"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil1Icon, GearIcon } from "@radix-ui/react-icons";
import PdfHighlighterComponent from "@/components/pdf-highlighter";
import ManualAnnotationsSidebar from "@/components/manual-annotations-sidebar";
import AIAnalysis from "@/components/ai-analysis";
import { type Document } from "@/lib/document-store";
import type {
  IHighlight,
  NewHighlight,
  ScaledPosition,
  Content,
} from "react-pdf-highlighter";

interface TabbedPdfViewerProps {
  document: Document;
}

const getNextId = () => String(Math.random()).slice(2);

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export default function TabbedPdfViewer({ 
  document
}: TabbedPdfViewerProps) {
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const scrollToHighlight = useRef<(highlight: IHighlight) => void>(() => {});

  // Load highlights from localStorage on component mount
  useEffect(() => {
    const savedHighlights = localStorage.getItem(`highlights-${document.id}`);
    if (savedHighlights) {
      try {
        setHighlights(JSON.parse(savedHighlights));
      } catch (error) {
        console.error('Error loading highlights:', error);
      }
    }
  }, [document.id]);

  // Save highlights to localStorage whenever they change
  useEffect(() => {
    if (highlights.length > 0) {
      localStorage.setItem(`highlights-${document.id}`, JSON.stringify(highlights));
    }
  }, [highlights, document.id]);

  const handleHighlightAdd = useCallback((highlight: NewHighlight) => {
    setHighlights((prevHighlights) => [
      { ...highlight, id: getNextId() },
      ...prevHighlights,
    ]);
  }, []);

  const handleHighlightUpdate = useCallback((
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>,
  ) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      }),
    );
  }, []);

  const handleHighlightClick = useCallback((highlight: IHighlight) => {
    updateHash(highlight);
  }, []);

  const handleHighlightRemove = useCallback((highlightId: string) => {
    setHighlights((prevHighlights) =>
      prevHighlights.filter((h) => h.id !== highlightId)
    );
  }, []);

  const handleClearAllHighlights = useCallback(() => {
    setHighlights([]);
    localStorage.removeItem(`highlights-${document.id}`);
  }, [document.id]);

  const handleScrollToHighlight = useCallback((scrollFn: (highlight: IHighlight) => void) => {
    scrollToHighlight.current = scrollFn;
  }, []);

  return (
    <div className="h-full flex">
      {/* Main PDF Viewer */}
      <div className="flex-1">
        <PdfHighlighterComponent 
          pdfUrl={document.url} 
          highlights={highlights}
          onHighlightAdd={handleHighlightAdd}
          onHighlightUpdate={handleHighlightUpdate}
          onScrollToHighlight={handleScrollToHighlight}
        />
      </div>

      {/* Tabbed Sidebar */}
      <div className="w-[420px] border-l border-black bg-white">
        <Tabs defaultValue="manual" className="h-full flex flex-col">
          <div className="border-b border-black bg-white px-2 py-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2 text-xs font-mono">
                <Pencil1Icon className="w-4 h-4" />
                Annotations
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2 text-xs font-mono">
                <GearIcon className="w-4 h-4" />
                AI Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="manual" className="flex-1 mt-0 overflow-hidden">
            <ManualAnnotationsSidebar
              highlights={highlights}
              onHighlightClick={handleHighlightClick}
              onHighlightRemove={handleHighlightRemove}
              onClearAllHighlights={handleClearAllHighlights}
            />
          </TabsContent>

          <TabsContent value="ai" className="flex-1 mt-0 overflow-hidden">
            <AIAnalysis document={document} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 