// src/articles/ArticlesSearchBar.jsx

import { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import "./ArticlesSearchBar.css"

export function parseQuery(raw) {
  if (!raw) return { title: "", tagIds: [], authorName: "", categoryName: "" };

  let title = raw;
  let tagIds = [];
  let authorName = "";
  let categoryName = "";

  // author:"Имя Фамилия"
  const authorMatch = raw.match(/author:\s*"([^"]+)"/);
  if (authorMatch) {
    authorName = authorMatch[1].trim();
    title = title.replace(authorMatch[0], "").trim();
  }

  // category:"Название"
  const categoryMatch = raw.match(/category:\s*"([^"]+)"/);
  if (categoryMatch) {
    categoryName = categoryMatch[1].trim();
    title = title.replace(categoryMatch[0], "").trim();
  }

  const arrayMatch = raw.match(/tag:\s*\[([^\]]*)\]/);
  if (arrayMatch) {
    const inner = arrayMatch[1];
    tagIds = inner
      .split(",")
      .map((s) => s.trim())
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    title = title.replace(arrayMatch[0], "").trim();
  }

  const singleMatches = [...title.matchAll(/tag:\s*(\d+)/g)];
  if (singleMatches.length > 0) {
    const singles = singleMatches
      .map((m) => Number(m[1]))
      .filter((n) => !Number.isNaN(n));
    tagIds = Array.from(new Set([...tagIds, ...singles]));
    title = title.replace(/tag:\s*\d+/g, "").trim();
  }

  title = title.replace(/author:\s*"[^"]*"/g, "").trim();

  return { title, tagIds, authorName, categoryName };
}


export function buildQueryString(title, tagIds, authorName, categoryName) {
  const parts = [];

  if (authorName && authorName.trim()) {
    parts.push(`author:"${authorName.trim()}"`);
  }

  if (categoryName && categoryName.trim()) {
    parts.push(`category:"${categoryName.trim()}"`);
  }

  if (tagIds && tagIds.length > 0) {
    const unique = Array.from(new Set(tagIds));
    if (unique.length === 1) {
      parts.push(`tag:${unique[0]}`);
    } else {
      parts.push(`tag:[${unique.join(",")}]`);
    }
  }
  if (title && title.trim()) parts.push(title.trim());

  return parts.join(" ");
}

export default function ArticlesSearchBar({ initialQuery = "", onSearch }) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseQuery(value);
    onSearch({ raw: value, ...parsed });
  };

  const handleClear = () => {
    setValue("");
    onSearch({
      raw: "",
      title: "",
      tagIds: [],
      authorName: "",
      categoryName: "",
    });
  };

  const showClear = value && value.length > 0;

  return (
    <form className="ArticlesSearchBar" onSubmit={handleSubmit}>
      <div className="ArticlesSearchBar__field">
        <SearchIcon className="ArticlesSearchBar__icon" />
        <input
          type="text"
          className="ArticlesSearchBar__input"
          placeholder={'Поиск по статьям: "markdown", "tag:7" или author:"Имя Фамилия"'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {showClear && (
          <button
            type="button"
            className="ArticlesSearchBar__clear"
            onClick={handleClear}
            aria-label="Сбросить поиск"
          >
            ×
          </button>
        )}
        <button type="submit" className="ArticlesSearchBar__submit">
          Найти
        </button>
      </div>
    </form>
  );
}