"use client";

import { useEffect, useState } from "react";
import { Prompt } from "@/types";
import { TagBadge } from "./TagBadge";

interface PromptModalProps {
  prompt: Prompt | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function PromptModal({ prompt, onClose, onDelete }: PromptModalProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmDelete) setConfirmDelete(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, confirmDelete]);

  useEffect(() => {
    if (prompt) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [prompt]);

  useEffect(() => {
    if (copiedIdx !== null) {
      const timer = setTimeout(() => setCopiedIdx(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedIdx]);

  // Reset confirm state when modal changes
  useEffect(() => {
    setConfirmDelete(false);
    setDeleting(false);
  }, [prompt?.id]);

  if (!prompt) return null;

  const handleCopyItem = (idx: number) => {
    navigator.clipboard.writeText(prompt.items[idx].content);
    setCopiedIdx(idx);
  };

  const handleCopyAll = () => {
    const allContent = prompt.items
      .map((item, idx) => `--- Prompt ${idx + 1}: ${item.header} ---\n${item.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(allContent);
    setCopiedIdx(-1);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    onDelete?.(prompt.id);
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
          maxWidth: 700,
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
              <span
                style={{
                  fontSize: 11,
                  color: "#5f5e5a",
                  background: "#f1efe8",
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  borderRadius: 20,
                  padding: "3px 8px",
                }}
              >
                {prompt.items.length} prompt
              </span>
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
          {prompt.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: idx < prompt.items.length - 1 ? 20 : (prompt.note ? 20 : 0),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1a1a18",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#378ADD",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  {item.header}
                </div>
                <button
                  onClick={() => handleCopyItem(idx)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "0.5px solid rgba(0,0,0,0.12)",
                    background: copiedIdx === idx ? "#E1F5EE" : "transparent",
                    color: copiedIdx === idx ? "#085041" : "#9c9a92",
                    fontSize: 11,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all .15s",
                  }}
                >
                  {copiedIdx === idx ? "Copied!" : "Copy"}
                </button>
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
                {item.content}
              </pre>
            </div>
          ))}

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#9c9a92" }}>
              Tạo bởi {prompt.author} · {prompt.createdAt}
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: `0.5px solid ${confirmDelete ? "#E24B4A" : "rgba(0,0,0,0.1)"}`,
                  background: confirmDelete ? "#FEE8E7" : "transparent",
                  color: confirmDelete ? "#E24B4A" : "#9c9a92",
                  fontSize: 11,
                  cursor: deleting ? "not-allowed" : "pointer",
                  transition: "all .15s",
                }}
              >
                {deleting ? "Đang xoá..." : confirmDelete ? "Xác nhận xoá?" : "Xoá"}
              </button>
            )}
          </div>
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
              onClick={handleCopyAll}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: copiedIdx === -1 ? "#085041" : "#378ADD",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background .15s",
              }}
            >
              {copiedIdx === -1 ? "Copied!" : "Copy tất cả"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
