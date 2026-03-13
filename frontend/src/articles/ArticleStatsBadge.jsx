// ArticleStatsBadge.jsx
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import "./ArticleStatsBadge.css";

export function ArticleStatsBadge({
  viewCount,
  likesCount,
  dislikesCount,
  commentsCount,
  userReaction, // "like" | "dislike" | null
}) {
  return (
    <div className="article-stats">
      <div
        className="article-stats__item"
      >
        <VisibilityIcon sx={{ fontSize: 16 }} />
        <span className="article-stats__value">{viewCount}</span>
      </div>

      <div className="article-stats__item">
        <ThumbUpIcon
          sx={{
            fontSize: 16,
            color: userReaction === "like" ? "var(--accent-primary)" : "inherit",
          }}
        />
        <span
          className="article-stats__value"
          style={{
            color:
              userReaction === "like" ? "var(--accent-primary)" : "inherit",
          }}
        >
          {likesCount}
        </span>
      </div>

      <div className="article-stats__item">
        <ThumbDownIcon
          sx={{
            fontSize: 16,
            color:
              userReaction === "dislike" ? "var(--accent-primary)" : "inherit",
          }}
        />
        <span
          className="article-stats__value"
          style={{
            color:
              userReaction === "dislike" ? "var(--accent-primary)" : "inherit",
          }}
        >
          {dislikesCount}
        </span>
      </div>

      <div className="article-stats__item">
        <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
        <span className="article-stats__value">{commentsCount}</span>
      </div>
    </div>
  );
}
