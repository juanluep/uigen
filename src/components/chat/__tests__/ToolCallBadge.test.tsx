import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel unit tests ---

test("getToolCallLabel: str_replace_editor create in-progress", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "src/components/Button.tsx" }, false)
  ).toBe("Creating Button.tsx");
});

test("getToolCallLabel: str_replace_editor create done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "src/components/Button.tsx" }, true)
  ).toBe("Created Button.tsx");
});

test("getToolCallLabel: str_replace_editor str_replace done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "str_replace", path: "src/components/Card.tsx" }, true)
  ).toBe("Edited Card.tsx");
});

test("getToolCallLabel: str_replace_editor insert done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "insert", path: "src/lib/utils.ts" }, true)
  ).toBe("Edited utils.ts");
});

test("getToolCallLabel: str_replace_editor view done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "view", path: "src/app/index.tsx" }, true)
  ).toBe("Read index.tsx");
});

test("getToolCallLabel: str_replace_editor undo_edit done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "src/app/page.tsx" }, true)
  ).toBe("Reverted page.tsx");
});

test("getToolCallLabel: file_manager rename in-progress", () => {
  expect(
    getToolCallLabel("file_manager", { command: "rename", path: "src/components/old.tsx" }, false)
  ).toBe("Renaming old.tsx");
});

test("getToolCallLabel: file_manager delete done", () => {
  expect(
    getToolCallLabel("file_manager", { command: "delete", path: "src/components/Header.tsx" }, true)
  ).toBe("Deleted Header.tsx");
});

test("getToolCallLabel: missing path falls back to 'file'", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create" }, false)
  ).toBe("Creating file");
});

test("getToolCallLabel: unknown tool returns toolName as-is", () => {
  expect(getToolCallLabel("some_other_tool", {}, true)).toBe("some_other_tool");
});

// --- ToolCallBadge rendering tests ---

test("ToolCallBadge shows in-progress state with spinner label", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/components/Button.tsx" },
        state: "call",
        result: undefined,
      }}
    />
  );

  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("ToolCallBadge shows done state with green dot label", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/components/Button.tsx" },
        state: "result",
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("ToolCallBadge shows in-progress when result is null", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "src/components/Card.tsx" },
        state: "result",
        result: null,
      }}
    />
  );

  // result is null → treated as in-progress
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("ToolCallBadge renders file_manager delete done", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "delete", path: "src/components/OldHeader.tsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Deleted OldHeader.tsx")).toBeDefined();
});

test("ToolCallBadge does not show raw tool name", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/App.tsx" },
        state: "result",
        result: "ok",
      }}
    />
  );

  expect(screen.queryByText("str_replace_editor")).toBeNull();
});
