"use client";

import { useState } from "react";
import { Tag, TagGroup } from "@/types";

const GROUPS: { id: TagGroup; label: string; dotColor: string; selClass: string }[] = [
  { id: "model",  label: "Model AI",    dotColor: "#378ADD", selClass: "model"  },
  { id: "type",   label: "Loại output", dotColor: "#1D9E75", selClass: "type"   },
  { id: "topic",  label: "Chủ đề",      dotColor: "#BA7517", selClass: "topic"  },
];

const SEL_STYLES: Record<TagGroup, { bg: string; border: string; color: string }> = {
  model:  { bg: "#E6F1FB", border: "#85B7EB", color: "#0C447C" },
  type:   { bg: "#E1F5EE", border: "#5DCAA5", color: "#085041" },
  topic:  { bg: "#FAEEDA", border: "#EF9F27", color: "#633806" },
};

interface AddTagModalProps {
  defaultGroup?: TagGroup;
  onConfirm: (tag: Tag) => void;
  onClose: () => void;
}

export function AddTagModal({ defaultGroup, onConfirm, onClose }: AddTagModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<TagGroup | null>(defaultGroup ?? null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!selectedGroup) { setError("Vui lòng chọn danh mục"); return; }
    if (!name.trim()) { setError("Vui lòng nhập tên tag"); return; }
    const tag: Tag = {
      id: name.trim().toLowerCase().replace(/\s+/g, "-"),
      label: name.trim(),
      group: selectedGroup,
    };
    onConfirm(tag);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 22,
          width: 300,
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Tạo tag mới</h3>

        <p style={{ fontSize: 12, color: "#5f5e5a", marginBottom: 8 }}>Chọn danh mục</p>
        {GROUPS.map((g) => {
          const isSelected = selectedGroup === g.id;
          const sel = isSelected ? SEL_STYLES[g.id] : null;
          return (
            <button
              key={g.id}
              onClick={() => { setSelectedGroup(g.id); setError(""); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: `0.5px solid ${sel ? sel.border : "rgba(0,0,0,0.1)"}`,
                background: sel ? sel.bg : "#f1efe8",
                color: sel ? sel.color : "#1a1a18",
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 8,
                textAlign: "left",
                transition: "all .15s",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: g.dotColor,
                  flexShrink: 0,
                }}
              />
              {g.label}
            </button>
          );
        })}

        <p style={{ fontSize: 12, color: "#5f5e5a", margin: "12px 0 6px" }}>Tên tag</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          placeholder="Nhập tên tag..."
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 8,
            border: `0.5px solid ${error ? "#E24B4A" : "rgba(0,0,0,0.15)"}`,
            background: "#f1efe8",
            color: "#1a1a18",
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        {error && (
          <p style={{ fontSize: 11, color: "#E24B4A", marginTop: 5 }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.15)",
              background: "transparent",
              color: "#5f5e5a",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 8,
              border: "none",
              background: "#378ADD",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Tạo tag
          </button>
        </div>
      </div>
    </div>
  );
}
