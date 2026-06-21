import type { ReactNode } from "react";
import type { LayoutShellProps } from "./index";

function hasVisibleBody(body: ReactNode): boolean {
  if (!body) return false;
  if (typeof body === "string") return body.trim().length > 0;
  return true;
}

/** Custom homepage shell — widget blocks only, no duplicate page title. */
export function HomepageLayout({ body, blocks }: LayoutShellProps) {
  return (
    <article>
      {blocks ? <div>{blocks}</div> : null}
      {hasVisibleBody(body) ? (
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="prose-content">{body}</div>
        </div>
      ) : null}
    </article>
  );
}
