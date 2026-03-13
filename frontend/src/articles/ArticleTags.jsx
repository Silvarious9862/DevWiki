// src/articles/ArticleTags.jsx
import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import "./ArticleTags.css";

export default function ArticleTags({
  tagIds,
  clickable = false,
  onTagClick,
  compact = false,
}) {
  const { getTagsByIds } = useApi();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!tagIds || tagIds.length === 0) {
        setTags([]);
        return;
      }
      try {
        const list = await getTagsByIds(tagIds);
        if (!cancelled) setTags(list);
      } catch (e) {
        console.error("Failed to load tags", e);
        if (!cancelled) setTags([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tagIds, getTagsByIds]);

  if (!tags || tags.length === 0) return null;

  return (
    <div
      className="ArticleTags__row"
      style={compact ? { marginBottom: 4 } : undefined}
    >
      {tags.map((tag) => {
        const className =
          "ArticleTags__chip" +
          (clickable ? " ArticleTags__chip--clickable" : "");

        const style = compact
          ? { fontSize: 10, padding: "1px 8px" }
          : undefined;

        const handleClick = (e) => {
          e.stopPropagation();           
          if (clickable && onTagClick) {
            onTagClick(tag);
          }
        };

        return (
          <span
            key={tag.tag_id || tag.id}
            className={className}
            style={style}
            onClick={clickable ? handleClick : undefined}
          >
            {tag.name}
          </span>
        );
      })}
    </div>
  );


}
