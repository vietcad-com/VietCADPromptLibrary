"use client";

import { Tag, TagGroup } from "@/types";

const GROUP_STYLES: Record<TagGroup, { bg: string; text: string; border: string }> = {
  model: {
    bg: "#E6F1FB",
    text: "#0C447C",
    border: "#85B7EB",
  },
  type: {
    bg: "#E1F5EE",
    text: "#085041",
    border: "#5DCAA5",
  },
  topic: {
    bg: "#FAEEDA",
    text: "#633806",
    border: "#EF9F27",
  },
};

interface TagBadgeProps {
  tag: Tag;
  active?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function TagBadge({
  tag,
  active,
  onClick,
  removable,
  onRemove,
  size = "sm",
}: TagBadgeProps) {
  const s = GROUP_STYLES[tag.group];
  const padding = size === "md" ? "4px 12px" : "3px 10px";
  const fontSize = size === "md" ? "12px" : "11px";

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding,
        borderRadius: 20,
        fontSize,
        cursor: onClick ? "pointer" : "default",
        border: `0.5px solid ${s.border}`,
        background: s.bg,
        color: s.text,
        userSelect: "none",
        boxShadow: active ? `0 0 0 2px ${s.text}` : undefined,
        transition: "all .15s",
        whiteSpace: "nowrap",
      }}
    >
      {tag.label}
      {removable && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          style={{ opacity: 0.6, fontSize: 13, lineHeight: 1, cursor: "pointer" }}
        >
          ×
        </span>
      )}
    </span>
  );
}
