"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
} from "react-pdf-highlighter";
import type {
  Content,
  IHighlight,
  NewHighlight,
  ScaledPosition,
} from "react-pdf-highlighter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubbleIcon, Cross1Icon, CheckIcon } from "@radix-ui/react-icons";

// Import CSS for react-pdf-highlighter
import "react-pdf-highlighter/dist/style.css";

interface PdfHighlighterComponentProps {
  pdfUrl: string;
  highlights: Array<IHighlight>;
  onHighlightAdd: (highlight: NewHighlight) => void;
  onHighlightUpdate: (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>
  ) => void;
  onScrollToHighlight: (scrollFn: (highlight: IHighlight) => void) => void;
}

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="bg-white border-2 border-black rounded-none px-3 py-2 shadow-lg text-sm max-w-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="text-lg">{comment.emoji}</span>
        <span className="text-black">{comment.text}</span>
      </div>
    </div>
  ) : null;

interface CustomTipProps {
  onOpen: () => void;
  onConfirm: (comment: { text: string; emoji: string }) => void;
}

const CustomTip = ({ onOpen, onConfirm }: CustomTipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💭");
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = ["💭", "💡", "⚠️", "✅", "❓", "📝", "🔍"];

  const handleOpen = () => {
    onOpen();
    setIsOpen(true);
    // Focus input after a brief delay to ensure it's rendered
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleConfirm = () => {
    if (commentText.trim()) {
      onConfirm({ text: commentText.trim(), emoji: selectedEmoji });
      setCommentText("");
      setSelectedEmoji("💭");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setCommentText("");
    setSelectedEmoji("💭");
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isOpen) {
    return (
      <div className="px-1 py-0 rounded-none border border-black shadow-sm font-mono bg-white">
        <Button
          onClick={handleOpen}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-sm flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
        >
          <ChatBubbleIcon className="w-3" />
          Comment
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black rounded-none shadow-lg p-4 min-w-80 font-mono">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-black">Add Comment</h3>
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-black hover:bg-black hover:text-white"
          >
            <Cross1Icon className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-black block">
            Select Icon
          </label>
          <div className="flex gap-1 flex-wrap">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`text-lg p-2 border-2 transition-colors hover:bg-black hover:border-black ${
                  selectedEmoji === emoji
                    ? "bg-black border-black"
                    : "bg-white border-gray-300"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-black block">
            Comment Text
          </label>
          <Input
            ref={inputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter your comment..."
            className="border-2 border-black rounded-none focus:ring-0 focus:border-black font-mono text-sm"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!commentText.trim()}
            className="flex-1 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors rounded-none font-mono text-sm"
          >
            <CheckIcon className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded-none font-mono text-sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-lg font-mono">Loading PDF...</div>
  </div>
);

export default function PdfHighlighterComponent({
  pdfUrl,
  highlights,
  onHighlightAdd,
  onHighlightUpdate,
  onScrollToHighlight,
}: PdfHighlighterComponentProps) {
  const scrollViewerTo = useRef<(highlight: IHighlight) => void>(() => {});

  const scrollToHighlightFromHash = useCallback(() => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  }, [highlights]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
    return () => {
      window.removeEventListener(
        "hashchange",
        scrollToHighlightFromHash,
        false
      );
    };
  }, [scrollToHighlightFromHash]);

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);
    onHighlightAdd(highlight);
  };

  const updateHighlight = (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>
  ) => {
    console.log("Updating highlight", highlightId, position, content);
    onHighlightUpdate(highlightId, position, content);
  };

  return (
    <div className="h-full relative">
      <PdfLoader url={pdfUrl} beforeLoad={<Spinner />}>
        {(pdfDocument) => (
          <PdfHighlighter
            pdfDocument={pdfDocument}
            enableAreaSelection={(event) => event.altKey}
            onScrollChange={resetHash}
            scrollRef={(scrollTo) => {
              scrollViewerTo.current = scrollTo;
              onScrollToHighlight(scrollTo);
              scrollToHighlightFromHash();
            }}
            onSelectionFinished={(
              position,
              content,
              hideTipAndSelection,
              transformSelection
            ) => (
              <CustomTip
                onOpen={transformSelection}
                onConfirm={(comment) => {
                  addHighlight({ content, position, comment });
                  hideTipAndSelection();
                }}
              />
            )}
            highlightTransform={(
              highlight,
              index,
              setTip,
              hideTip,
              viewportToScaled,
              screenshot,
              isScrolledTo
            ) => {
              const isTextHighlight = !highlight.content?.image;

              const component = isTextHighlight ? (
                <Highlight
                  isScrolledTo={isScrolledTo}
                  position={highlight.position}
                  comment={highlight.comment}
                />
              ) : (
                <AreaHighlight
                  isScrolledTo={isScrolledTo}
                  highlight={highlight}
                  onChange={(boundingRect) => {
                    updateHighlight(
                      highlight.id,
                      { boundingRect: viewportToScaled(boundingRect) },
                      { image: screenshot(boundingRect) }
                    );
                  }}
                />
              );

              return (
                <Popup
                  popupContent={<HighlightPopup {...highlight} />}
                  onMouseOver={(popupContent) =>
                    setTip(highlight, () => popupContent)
                  }
                  onMouseOut={hideTip}
                  key={index}
                >
                  {component}
                </Popup>
              );
            }}
            highlights={highlights}
          />
        )}
      </PdfLoader>
    </div>
  );
}
