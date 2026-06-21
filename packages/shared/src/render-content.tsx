import React from "react";
import type { ContentNode } from "./schemas";

function renderMarks(text: string, marks?: ContentNode["marks"]) {
  if (!marks?.length) return text;

  return marks.reduce<React.ReactNode>((node, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{node}</strong>;
      case "italic":
        return <em>{node}</em>;
      case "code":
        return <code>{node}</code>;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        return (
          <a href={href} className="text-blue-700 underline hover:text-blue-900">
            {node}
          </a>
        );
      }
      default:
        return node;
    }
  }, text);
}

function renderNode(node: ContentNode, index: number): React.ReactNode {
  switch (node.type) {
    case "text":
      return <React.Fragment key={index}>{renderMarks(node.text ?? "", node.marks)}</React.Fragment>;
    case "paragraph":
      return (
        <p key={index} className="mb-4 leading-7 text-gray-700">
          {node.content?.map(renderNode)}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const className = "font-semibold tracking-tight text-gray-900";
      const children = node.content?.map(renderNode);
      if (level === 1) return <h1 key={index} className={`mb-4 text-4xl ${className}`}>{children}</h1>;
      if (level === 2) return <h2 key={index} className={`mb-3 mt-8 text-3xl ${className}`}>{children}</h2>;
      if (level === 3) return <h3 key={index} className={`mb-3 mt-6 text-2xl ${className}`}>{children}</h3>;
      return <h4 key={index} className={`mb-2 mt-4 text-xl ${className}`}>{children}</h4>;
    }
    case "bulletList":
      return (
        <ul key={index} className="mb-4 list-disc space-y-2 pl-6 text-gray-700">
          {node.content?.map(renderNode)}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={index} className="mb-4 list-decimal space-y-2 pl-6 text-gray-700">
          {node.content?.map(renderNode)}
        </ol>
      );
    case "listItem":
      return <li key={index}>{node.content?.map(renderNode)}</li>;
    case "blockquote":
      return (
        <blockquote key={index} className="mb-4 border-l-4 border-gray-300 pl-4 italic text-gray-600">
          {node.content?.map(renderNode)}
        </blockquote>
      );
    case "horizontalRule":
      return <hr key={index} className="my-8 border-gray-200" />;
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return (
        <figure key={index} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="rounded-lg border border-gray-200" />
        </figure>
      );
    }
    case "hardBreak":
      return <br key={index} />;
    default:
      return node.content ? (
        <div key={index}>{node.content.map(renderNode)}</div>
      ) : null;
  }
}

export function RenderContent({ doc }: { doc: { content?: ContentNode[] } }) {
  return <>{doc.content?.map(renderNode)}</>;
}
