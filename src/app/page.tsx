"use client";

import { useState, useMemo, useEffect } from "react";
import { Prompt, Tag, TagGroup, TagPool } from "@/types";
import { TagBadge } from "@/components/TagBadge";
import { PromptModal } from "@/components/PromptModal";
import { AddTagModal } from "@/components/AddTagModal";

const GROUP_ORDER: TagGroup[] = ["model", "type", "topic"];
const GROUP_LABELS: Record<TagGroup, string> = {
  model: "Model AI",
  type: "Loại output",
  topic: "Chủ đề",
};

export default function HomePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tagPool, setTagPool] = useState<TagPool>({ model: [], type: [], topic: [] });
  const [loading, setLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState<Record<TagGroup, string[]>>({
    model: [],
    type: [],
    topic: [],
  });

  const [search, setSearch] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [addTagModal, setAddTagModal] = useState<{ open: boolean; group?: TagGroup }>({ open: false });

  useEffect(() => {
    Promise.all([
      fetch("/api/prompts").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([promptsData, tagsData]) => {
      setPrompts(promptsData);
      setTagPool(tagsData);
      setLoading(false);
    });
  }, []);

  const toggleFilter = (group: TagGroup, tagId: string) => {
    setActiveFilters((prev) => {
      const current = prev[group];
      return {
        ...prev,
        [group]: current.includes(tagId)
          ? current.filter((id) => id !== tagId)
          : [...current, tagId],
      };
    });
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const tagIds = p.tags.map((t) => t.id);

      const searchLower = search.toLowerCase();
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(searchLower) ||
        p.items.some(
          (item) =>
            item.header.toLowerCase().includes(searchLower) ||
            item.content.toLowerCase().includes(searchLower)
        );

      const matchModel =
        activeFilters.model.length === 0 ||
        activeFilters.model.some((id) => tagIds.includes(id));

      const matchType =
        activeFilters.type.length === 0 ||
        activeFilters.type.some((id) => tagIds.includes(id));

      const matchTopic =
        activeFilters.topic.length === 0 ||
        activeFilters.topic.some((id) => tagIds.includes(id));

      return matchSearch && matchModel && matchType && matchTopic;
    });
  }, [prompts, search, activeFilters]);

  const logicExplain = useMemo(() => {
    const parts: string[] = [];
    GROUP_ORDER.forEach((g) => {
      if (activeFilters[g].length > 0) {
        const labels = activeFilters[g]
          .map((id) => tagPool[g].find((t) => t.id === id)?.label ?? id)
          .join(" hoặc ");
        parts.push(`(${labels})`);
      }
    });
    return parts.join(" và ");
  }, [activeFilters, tagPool]);

  const handleAddTag = async (tag: Tag) => {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tag),
    });
    if (res.ok) {
      setTagPool((prev) => ({
        ...prev,
        [tag.group]: [...prev[tag.group], tag],
      }));
    }
  };

  const handleDeletePrompt = async (id: string) => {
    const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      setSelectedPrompt(null);
    }
  };

  const hasAnyFilter = GROUP_ORDER.some((g) => activeFilters[g].length > 0);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 52px)", background: "#f9f8f5" }}>
        <p style={{ color: "#9c9a92", fontSize: 14 }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 52px)", background: "#f9f8f5" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: "#fff",
          borderRight: "0.5px solid rgba(0,0,0,0.08)",
          padding: "20px 16px",
          position: "sticky",
          top: 52,
          height: "calc(100vh - 52px)",
          overflowY: "auto",
        }}
      >
        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 18 }}>Bộ lọc</p>

        {GROUP_ORDER.map((group) => (
          <div key={group} style={{ marginBottom: 18 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#9c9a92",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {GROUP_LABELS[group]}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {tagPool[group].map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  active={activeFilters[group].includes(tag.id)}
                  onClick={() => toggleFilter(group, tag.id)}
                />
              ))}
              <span
                onClick={() => setAddTagModal({ open: true, group })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  cursor: "pointer",
                  border: "0.5px dashed rgba(0,0,0,0.2)",
                  color: "#9c9a92",
                  userSelect: "none",
                }}
              >
                + Thêm
              </span>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
            fontSize: 11,
            color: "#9c9a92",
            lineHeight: 1.7,
          }}
        >
          <span style={{ color: "#5f5e5a", fontWeight: 500 }}>OR</span> trong nhóm ·{" "}
          <span style={{ color: "#5f5e5a", fontWeight: 500 }}>AND</span> giữa nhóm
          {logicExplain && (
            <p style={{ marginTop: 6, fontStyle: "italic", lineHeight: 1.5 }}>
              {logicExplain}
            </p>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: 24, maxWidth: 900 }}>
        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.15)",
              borderRadius: 8,
              padding: "0 12px",
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#9c9a92" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L13 13" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm prompt..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: "#1a1a18",
                fontSize: 13,
                padding: "9px 0",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "#9c9a92", whiteSpace: "nowrap" }}>
            {filteredPrompts.length} / {prompts.length} prompt
          </span>
        </div>

        {/* Active filter bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
            marginBottom: 16,
            minHeight: 24,
          }}
        >
          {hasAnyFilter ? (
            GROUP_ORDER.flatMap((g) =>
              activeFilters[g].map((id) => {
                const tag = tagPool[g].find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <TagBadge
                    key={`${g}-${id}`}
                    tag={tag}
                    removable
                    onRemove={() => toggleFilter(g, id)}
                    size="sm"
                  />
                );
              })
            )
          ) : (
            <span style={{ fontSize: 11, color: "#9c9a92" }}>
              Không có filter — hiển thị tất cả
            </span>
          )}
        </div>

        {/* Prompt list */}
        {filteredPrompts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9c9a92" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#5f5e5a", marginBottom: 6 }}>
              Không tìm thấy prompt
            </p>
            <p style={{ fontSize: 12 }}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => setSelectedPrompt(prompt)}
                style={{
                  background: "#fff",
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: "16px 18px",
                  cursor: "pointer",
                  transition: "border-color .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.2)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.08)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{prompt.title}</h3>
                  <span style={{ fontSize: 11, color: "#9c9a92", flexShrink: 0, marginLeft: 12 }}>
                    {prompt.createdAt}
                  </span>
                </div>

                {/* Show sub-prompt headers + content preview */}
                <div style={{ marginBottom: 10 }}>
                  {prompt.items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: idx < prompt.items.length - 1 ? 6 : 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#1a1a18",
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        <span style={{ color: "#378ADD", fontWeight: 600 }}>
                          {idx + 1}.
                        </span>{" "}
                        {item.header}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#9c9a92",
                          lineHeight: 1.5,
                          margin: "2px 0 0 18px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {prompt.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
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
                  {prompt.note && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#BA7517",
                        background: "#FAEEDA",
                        border: "0.5px solid #EF9F27",
                        borderRadius: 20,
                        padding: "3px 8px",
                      }}
                    >
                      Có chú thích
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PromptModal
        prompt={selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onDelete={handleDeletePrompt}
      />

      {addTagModal.open && (
        <AddTagModal
          defaultGroup={addTagModal.group}
          onConfirm={handleAddTag}
          onClose={() => setAddTagModal({ open: false })}
        />
      )}
    </div>
  );
}
