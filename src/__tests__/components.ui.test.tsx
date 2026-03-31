/**
 * Component tests for TagBadge, PromptModal
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TagBadge } from "@/components/TagBadge";

describe("TagBadge", () => {
  const modelTag = { id: "gemini", label: "Gemini", group: "model" as const };
  const typeTag = { id: "image", label: "Hình ảnh", group: "type" as const };
  const topicTag = { id: "tech", label: "Tech", group: "topic" as const };

  it("renders tag label", () => {
    render(<TagBadge tag={modelTag} />);
    expect(screen.getByText("Gemini")).toBeInTheDocument();
  });

  it("renders different tag groups", () => {
    const { rerender } = render(<TagBadge tag={modelTag} />);
    expect(screen.getByText("Gemini")).toBeInTheDocument();

    rerender(<TagBadge tag={typeTag} />);
    expect(screen.getByText("Hình ảnh")).toBeInTheDocument();

    rerender(<TagBadge tag={topicTag} />);
    expect(screen.getByText("Tech")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<TagBadge tag={modelTag} onClick={handleClick} />);

    fireEvent.click(screen.getByText("Gemini"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows remove button when removable", () => {
    const handleRemove = jest.fn();
    render(<TagBadge tag={modelTag} removable onRemove={handleRemove} />);

    const removeBtn = screen.getByText("×");
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it("does not show remove button when not removable", () => {
    render(<TagBadge tag={modelTag} />);
    expect(screen.queryByText("×")).not.toBeInTheDocument();
  });

  it("applies active style (boxShadow) when active", () => {
    const { container } = render(<TagBadge tag={modelTag} active />);
    const span = container.firstChild as HTMLElement;
    expect(span.style.boxShadow).toBeTruthy();
  });

  it("does not apply active style when not active", () => {
    const { container } = render(<TagBadge tag={modelTag} />);
    const span = container.firstChild as HTMLElement;
    expect(span.style.boxShadow).toBeFalsy();
  });

  it("remove click does not trigger parent onClick", () => {
    const handleClick = jest.fn();
    const handleRemove = jest.fn();
    render(
      <TagBadge
        tag={modelTag}
        onClick={handleClick}
        removable
        onRemove={handleRemove}
      />
    );

    fireEvent.click(screen.getByText("×"));

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("sets cursor to pointer when onClick provided", () => {
    const { container } = render(
      <TagBadge tag={modelTag} onClick={() => {}} />
    );
    const span = container.firstChild as HTMLElement;
    expect(span.style.cursor).toBe("pointer");
  });

  it("sets cursor to default when no onClick", () => {
    const { container } = render(<TagBadge tag={modelTag} />);
    const span = container.firstChild as HTMLElement;
    expect(span.style.cursor).toBe("default");
  });
});
