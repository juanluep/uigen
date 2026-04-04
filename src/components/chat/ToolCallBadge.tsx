"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolInvocation: {
    toolName: string;
    args: Record<string, unknown>;
    state: string;
    result?: unknown;
  };
}

export function getToolCallLabel(
  toolName: string,
  args: Record<string, unknown>,
  done: boolean
): string {
  const fileName =
    typeof args.path === "string"
      ? args.path.split("/").pop() || args.path
      : undefined;

  if (toolName === "str_replace_editor") {
    const command = args.command as string;
    switch (command) {
      case "create":
        return done
          ? `Created ${fileName ?? "file"}`
          : `Creating ${fileName ?? "file"}`;
      case "str_replace":
      case "insert":
        return done
          ? `Edited ${fileName ?? "file"}`
          : `Editing ${fileName ?? "file"}`;
      case "view":
        return done
          ? `Read ${fileName ?? "file"}`
          : `Reading ${fileName ?? "file"}`;
      case "undo_edit":
        return done
          ? `Reverted ${fileName ?? "file"}`
          : `Reverting ${fileName ?? "file"}`;
      default:
        return done
          ? `Edited ${fileName ?? "file"}`
          : `Editing ${fileName ?? "file"}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string;
    switch (command) {
      case "rename":
        return done
          ? `Renamed ${fileName ?? "file"}`
          : `Renaming ${fileName ?? "file"}`;
      case "delete":
        return done
          ? `Deleted ${fileName ?? "file"}`
          : `Deleting ${fileName ?? "file"}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isDone = state === "result" && result != null;
  const label = getToolCallLabel(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
