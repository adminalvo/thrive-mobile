"use client";

import React, { FC } from "react";
import styles from "@/app/[locale]/dashboard/ai/page.module.css";

interface FormattedMarkdownProps {
  content: string;
}

export const FormattedMarkdown: FC<FormattedMarkdownProps> = ({ content }) => {
  if (!content) return null;

  // Split by code blocks first
  const blocks = content.split(/(```[\s\S]*?```)/g);

  const renderInline = (text: string): React.ReactNode => {
    const tokens: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combined regex for inline elements: **bold**, *italic*, `code`, [text](url)
    const inlineRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.substring(lastIndex, match.index));
      }

      if (match[2] !== undefined) {
        // Bold: **text**
        tokens.push(<strong key={match.index} style={{ fontWeight: 700, color: "#38bdf8" }}>{match[2]}</strong>);
      } else if (match[4] !== undefined) {
        // Italic: *text*
        tokens.push(<em key={match.index} style={{ fontStyle: "italic", color: "#e2e8f0" }}>{match[4]}</em>);
      } else if (match[6] !== undefined) {
        // Code: `code`
        tokens.push(<code key={match.index} className={styles.inlineCode}>{match[6]}</code>);
      } else if (match[7] !== undefined && match[8] !== undefined) {
        // Link: [text](url)
        tokens.push(
          <a
            key={match.index}
            href={match[8]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#38bdf8", textDecoration: "underline" }}
          >
            {match[7]}
          </a>
        );
      }

      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex));
    }

    return tokens.length > 0 ? tokens : text;
  };

  const renderTextBlocks = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const flushTable = (key: number) => {
      if (tableRows.length === 0) return;
      const headers = tableRows[0].split("|").map(s => s.trim()).filter(Boolean);
      const dataRows = tableRows.slice(2).map(r => r.split("|").map(s => s.trim()).filter(Boolean));

      elements.push(
        <div key={`table-${key}`} className={styles.tableContainer}>
          <table className={styles.markdownTable}>
            <thead>
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx}>{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    };

    const flushList = (key: number) => {
      if (listItems.length === 0) return;
      elements.push(<ul key={`ul-${key}`} style={{ margin: "0.4rem 0 0.6rem 1.25rem", padding: 0 }}>{listItems}</ul>);
      listItems = [];
      inList = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check for Table Row
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        if (inList) flushList(idx);
        inTable = true;
        tableRows.push(trimmed);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Check for List item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
        inList = true;
        listItems.push(
          <li key={idx} style={{ marginBottom: "0.25rem", lineHeight: 1.5 }}>
            {renderInline(trimmed.substring(2))}
          </li>
        );
        return;
      } else if (inList && trimmed === "") {
        flushList(idx);
        return;
      } else if (inList && !trimmed.startsWith("- ") && !trimmed.startsWith("* ")) {
        flushList(idx);
      }

      // Headers
      if (trimmed.startsWith("### ")) {
        elements.push(<h4 key={idx} style={{ color: "#38bdf8", margin: "0.75rem 0 0.35rem 0", fontSize: "0.95rem" }}>{renderInline(trimmed.substring(4))}</h4>);
        return;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(<h3 key={idx} style={{ color: "#f8fafc", margin: "0.85rem 0 0.4rem 0", fontSize: "1.05rem" }}>{renderInline(trimmed.substring(3))}</h3>);
        return;
      }
      if (trimmed.startsWith("# ")) {
        elements.push(<h2 key={idx} style={{ color: "#f8fafc", margin: "1rem 0 0.5rem 0", fontSize: "1.2rem" }}>{renderInline(trimmed.substring(2))}</h2>);
        return;
      }

      // Empty line
      if (!trimmed) {
        elements.push(<div key={idx} style={{ height: "0.5rem" }} />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={idx} style={{ margin: "0 0 0.4rem 0", lineHeight: 1.6 }}>
          {renderInline(line)}
        </p>
      );
    });

    if (inTable) flushTable(lines.length);
    if (inList) flushList(lines.length);

    return elements;
  };

  return (
    <div className={styles.formattedMessage}>
      {blocks.map((block, i) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          const lines = block.split("\n");
          const code = lines.slice(1, -1).join("\n");
          return (
            <pre key={i} className={styles.codeBlock}>
              <code>{code}</code>
            </pre>
          );
        }
        return <React.Fragment key={i}>{renderTextBlocks(block)}</React.Fragment>;
      })}
    </div>
  );
};
