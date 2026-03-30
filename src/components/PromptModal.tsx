"use client";

import { useEffect } from "react";
import { Prompt } from "@/types";
import { TagBadge } from "./TagBadge";

interface PromptModalProps {
  prompt: Prompt | null;
  onClose: () => void;
}

export function PromptModal({ prompt, onClose }: PromptModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (prompt) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [prompt]);

  if (!prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 640,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>
              {prompt.title}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {prompt.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.12)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "#5f5e5a",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Prompt content */}
          <div style={{ marginBottom: prompt.note ? 20 : 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#9c9a92",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Nội dung prompt
            </div>
            <pre
              style={{
                background: "#f1efe8",
                border: "0.5px solid rgba(0,0,0,0.08)",
                borderRadius: 10,
                padding: "14px 16px",
                fontSize: 13,
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#1a1a18",
                fontFamily: "inherit",
                margin: 0,
              }}
            >
              {prompt.content}
            </pre>
          </div>

          {/* Note */}
          {prompt.note && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9c9a92",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Chú thích
              </div>
              <div
                style={{
                  background: "#FAEEDA",
                  border: "0.5px solid #EF9F27",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: "#633806",
                  whiteSpace: "pre-wrap",
                }}
              >
                {prompt.note}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "#9c9a92" }}>
            Tạo bởi {prompt.author} · {prompt.createdAt}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "0.5px solid rgba(0,0,0,0.15)",
                background: "transparent",
                color: "#5f5e5a",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
            <button
              onClick={handleCopy}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "#378ADD",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Copy prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
