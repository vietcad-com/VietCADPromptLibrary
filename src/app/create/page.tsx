"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, TagGroup, TagPool } from "@/types";
import { TagBadge } from "@/components/TagBadge";
import { AddTagModal } from "@/components/AddTagModal";

const GROUP_ORDER: TagGroup[] = ["model", "type", "topic"];
const GROUP_LABELS: Record<TagGroup, string> = {
  model: "Model AI",
  type: "Loại output",
  topic: "Chủ đề",
};
const GROUP_BORDER: Record<TagGroup, string> = {
  model: "rgba(0,0,0,0.08)",
  type: "rgba(0,0,0,0.08)",
  topic: "rgba(0,0,0,0.08)",
};

type FormTab = "edit" | "preview";

export default function CreatePage() {
  const router = useRouter();

  const [tab, setTab] = useState<FormTab>("edit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [tagPool, setTagPool] = useState<TagPool>({ model: [], type: [], topic: [] });
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [addTagModal, setAddTagModal] = useState<{ open: boolean; group?: TagGroup }>({ open: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch tags from API
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => setTagPool(data));
  }, []);

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const isTagSelected = (tag: Tag) => selectedTags.some((t) => t.id === tag.id);

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
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!content.trim()) e.content = "Vui lòng nhập nội dung prompt";
    if (selectedTags.length === 0) e.tags = "Vui lòng chọn ít nhất 1 tag";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        note: note || undefined,
        author: "User",
        tagIds: selectedTags.map((t) => t.id),
      }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setSubmitting(false);
      const data = await res.json();
      alert(data.error || "Lỗi khi lưu prompt");
    }
  };

  return (
    <div style={{ background: "#f9f8f5", minHeight: "calc(100vh - 52px)", padding: "32px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Form header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Tạo prompt mới</h1>
          <div style={{ display: "flex", gap: 4 }}>
            {(["edit", "preview"] as FormTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: tab === t ? "#f1efe8" : "transparent",
                  color: tab === t ? "#1a1a18" : "#5f5e5a",
                  fontWeight: tab === t ? 500 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t === "edit" ? "Chỉnh sửa" : "Xem trước"}
              </button>
            ))}
          </div>
        </div>

        {/* EDIT VIEW */}
        {tab === "edit" && (
          <>
            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#5f5e5a", marginBottom: 6 }}>
                Tiêu đề <span style={{ color: "#E24B4A" }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                maxLength={100}
                placeholder="Ví dụ: Tạo banner sản phẩm CAD"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `0.5px solid ${errors.title ? "#E24B4A" : "rgba(0,0,0,0.15)"}`,
                  background: "#fff",
                  color: "#1a1a18",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 11, color: errors.title ? "#E24B4A" : "#9c9a92" }}>
                  {errors.title || "Ngắn gọn, dễ tìm kiếm"}
                </span>
                <span style={{ fontSize: 11, color: title.length > 90 ? "#BA7517" : "#9c9a92" }}>
                  {title.length} / 100
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#5f5e5a", marginBottom: 6 }}>
                Nội dung prompt <span style={{ color: "#E24B4A" }}>*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setErrors((p) => ({ ...p, content: "" })); }}
                rows={7}
                maxLength={5000}
                placeholder={"Nhập prompt của bạn tại đây...\n\nTip: dùng {{biến}} cho phần cần thay đổi, ví dụ {{tên sản phẩm}}, {{ngôn ngữ}}"}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `0.5px solid ${errors.content ? "#E24B4A" : "rgba(0,0,0,0.15)"}`,
                  background: "#fff",
                  color: "#1a1a18",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                  lineHeight: 1.65,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 11, color: errors.content ? "#E24B4A" : "#9c9a92" }}>
                  {errors.content || "Hỗ trợ {{biến}} để tái sử dụng linh hoạt"}
                </span>
                <span style={{ fontSize: 11, color: content.length > 4500 ? "#BA7517" : "#9c9a92" }}>
                  {content.length} / 5000
                </span>
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#5f5e5a", marginBottom: 6 }}>
                Chú thích
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Giải thích cách dùng, lưu ý khi sử dụng, hoặc ví dụ output mẫu..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  background: "#fff",
                  color: "#1a1a18",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                  lineHeight: 1.65,
                  boxSizing: "border-box",
                }}
              />
              <p style={{ fontSize: 11, color: "#9c9a92", marginTop: 5 }}>
                Giúp người khác trong team hiểu đúng cách dùng prompt này
              </p>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#5f5e5a", marginBottom: 6 }}>
                Tags <span style={{ color: "#E24B4A" }}>*</span>
              </label>
              <div
                style={{
                  background: "#f1efe8",
                  border: `0.5px solid ${errors.tags ? "#E24B4A" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {GROUP_ORDER.map((group, idx) => (
                  <div
                    key={group}
                    style={{
                      paddingTop: idx > 0 ? 12 : 0,
                      borderTop: idx > 0 ? `0.5px solid ${GROUP_BORDER[group]}` : "none",
                    }}
                  >
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
                          active={isTagSelected(tag)}
                          onClick={() => { toggleTag(tag); setErrors((p) => ({ ...p, tags: "" })); }}
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
              </div>
              {errors.tags && (
                <p style={{ fontSize: 11, color: "#E24B4A", marginTop: 5 }}>{errors.tags}</p>
              )}
              <p style={{ fontSize: 11, color: "#9c9a92", marginTop: 5 }}>
                Tag mới tạo sẽ được chia sẻ cho cả team
              </p>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => router.push("/")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  background: "transparent",
                  color: "#5f5e5a",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: submitting ? "#9c9a92" : "#378ADD",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {submitting ? "Đang lưu..." : "Lưu prompt"}
              </button>
            </div>
          </>
        )}

        {/* PREVIEW VIEW */}
        {tab === "preview" && (
          <>
            <div
              style={{
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {/* Preview header */}
              <div style={{ padding: "20px 24px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>
                  {title || "(Chưa có tiêu đề)"}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {selectedTags.length > 0
                    ? selectedTags.map((tag) => <TagBadge key={tag.id} tag={tag} size="sm" />)
                    : <span style={{ fontSize: 12, color: "#9c9a92" }}>(Chưa chọn tag)</span>
                  }
                </div>
              </div>

              {/* Preview body */}
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9c9a92", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                  Nội dung prompt
                </p>
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
                    color: content ? "#1a1a18" : "#9c9a92",
                    fontFamily: "inherit",
                    margin: 0,
                  }}
                >
                  {content || "(Chưa có nội dung)"}
                </pre>

                {note && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9c9a92", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                      Chú thích
                    </p>
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
                      {note}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setTab("edit")}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "9px",
                borderRadius: 8,
                border: "0.5px solid rgba(0,0,0,0.15)",
                background: "transparent",
                color: "#5f5e5a",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ← Quay lại chỉnh sửa
            </button>
          </>
        )}
      </div>

      {/* Add tag modal */}
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
