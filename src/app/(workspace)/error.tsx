"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";

export default function WorkspaceError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-wrap">
      <div className="error-state surface">
        <WarningCircleIcon size={28} />
        <h1>Something went wrong</h1>
        <p>jobbr could not load this page. Your saved data has not been changed.</p>
        <button type="button" className="button button-primary" onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
