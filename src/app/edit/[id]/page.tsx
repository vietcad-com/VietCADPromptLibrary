"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Prompt } from "@/types";
import { PromptForm } from "@/components/PromptForm";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/prompts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setPrompt)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 52px)", background: "#f9f8f5" }}>
        <p style={{ color: "#E24B4A", fontSize: 14 }}>Prompt không tồn tại</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 52px)", background: "#f9f8f5" }}>
        <p style={{ color: "#9c9a92", fontSize: 14 }}>Đang tải...</p>
      </div>
    );
  }

  return <PromptForm existing={prompt} />;
}
