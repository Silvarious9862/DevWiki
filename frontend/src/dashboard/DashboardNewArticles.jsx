// src/dashboard/DashboardNewArticles.jsx
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
} from "@mui/material";

import { IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";


const CARD_SX = {
  width: 250,
  height: 150,
  borderRadius: "16px",
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-color)",
  boxShadow: "var(--shadow)",
  position: "relative",          // <-- важно
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  transition:
    "transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px var(--accent-secondary)",
    borderColor: "var(--header-border)",
  },
};


const CONTENT_SX = {
  padding: "12px 14px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardNewArticles({ items }) {
  const hasItems = items && items.length > 0;

  return (
    <section className="DashboardNewArticles">
      <Typography
        sx={{
          mb: 2,
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: 2,
        }}
      >
        Новые статьи
      </Typography>

      {!hasItems && (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Пока нет новых публикаций.
        </Typography>
      )}

      {hasItems && (
        <Grid container spacing={2} sx={{ m: 0, width: "100%" }}>
          {items.map((a) => (
            <Grid item xs={12} md={3} key={a.article_id}>
              <Card sx={CARD_SX}>
                {/* верхняя полоска */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    background: "var(--accent-primary)",
                  }}
                />

                <CardContent sx={CONTENT_SX}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      mb: 0.5,
                      marginTop: 2,
                    }}
                  >
                    {a.author_name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      mb: 0.5,
                    }}
                  >
                    {a.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      mb: 1,
                    }}
                  >
                    {formatDate(a.published_at ?? a.created_at)}
                  </Typography>

                  <Box
                    sx={{
                      mt: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      disableRipple
                      sx={{
                        borderRadius: 999,
                        px: 1,
                        py: 0.25,
                        color: "var(--text-secondary)",
                        pointerEvents: "none",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                      <span className="ArticlePage__reactionCount">
                        {a.view_count}
                      </span>
                    </IconButton>

                    <div className="ArticlePage__statsDivider" />

                    <IconButton
                      size="small"
                      disableRipple
                      sx={{
                        borderRadius: 999,
                        px: 1,
                        py: 0.25,
                        color: "var(--text-secondary)",
                        pointerEvents: "none",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <ThumbUpAltOutlinedIcon fontSize="small" />
                      <span className="ArticlePage__reactionCount">
                        {a.likes_count}
                      </span>
                    </IconButton>

                    <IconButton
                      size="small"
                      disableRipple
                      sx={{
                        borderRadius: 999,
                        px: 1,
                        py: 0.25,
                        color: "var(--text-secondary)",
                        pointerEvents: "none",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <ThumbDownAltOutlinedIcon fontSize="small" />
                      <span className="ArticlePage__reactionCount">
                        {a.dislikes_count}
                      </span>
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </section>
  );
}

DashboardNewArticles.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      article_id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      author_id: PropTypes.number.isRequired,
      author_name: PropTypes.string.isRequired,
      published_at: PropTypes.string,
      created_at: PropTypes.string,
      likes_count: PropTypes.number.isRequired,
      dislikes_count: PropTypes.number.isRequired,
      view_count: PropTypes.number.isRequired,
    })
  ),
};
