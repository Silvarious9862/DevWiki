// src/dashboard/DashboardTopAuthors.jsx
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import { ReactComponent as TrophyIcon } from "../assets/icons/trophy.svg";

// те же размеры и эффекты, что в DashboardStats / DashboardNewArticles
const CARD_SX = {
  width: 250,
  height: 150,
  borderRadius: "16px",
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-color)",
  boxShadow: "var(--shadow)",
  position: "relative",
  overflow: "hidden",
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
};

function getAwardStyle(index) {
  if (index === 0) {
    return {
      label: "Золото",
      gradient:
        "linear-gradient(90deg, #facc15 0%, #eab308 40%, rgba(0,0,0,0) 100%)",
      color: "#facc15",
    };
  }
  if (index === 1) {
    return {
      label: "Серебро",
      gradient:
        "linear-gradient(90deg, #e5e7eb 0%, #d1d5db 40%, rgba(0,0,0,0) 100%)",
      color: "#e5e7eb",
    };
  }
  return {
    label: "Бронза",
    gradient:
      "linear-gradient(90deg, #f97316 0%, #ea580c 40%, rgba(0,0,0,0) 100%)",
    color: "#f97316",
  };
}

export default function DashboardTopAuthors({ items }) {
  const hasItems = items && items.length > 0;

  return (
    <section className="DashboardTopAuthors">
      <Typography
        sx={{
          mb: 2,
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: 2,
        }}
      >
        Топ авторов
      </Typography>

      {!hasItems && (
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Пока нет активных авторов.
        </Typography>
      )}

      {hasItems && (
        <Grid container spacing={2} sx={{ m: 0, width: "100%" }}>
          {items.map((u, index) => {
            const award = getAwardStyle(index);

            return (
              <Grid item xs={12} md={3} key={u.author_id}>
                <Card sx={CARD_SX}>
                  {/* верхняя лента */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 6,
                      backgroundImage: award.gradient,
                    }}
                  />

                  {/* кубок справа */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 12,
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: award.color,
                    }}
                  >
                    <TrophyIcon style={{ width: "100%", height: "100%" }} />
                  </Box>

                  <CardContent sx={CONTENT_SX}>
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: 0.08,
                        mb: 0.25,
                      }}
                    >
                      {award.label.toUpperCase()}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        mb: 0.5,
                      }}
                    >
                      {u.author_name}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        mb: 0.5,
                      }}
                    >
                      {u.articles_count} статей · {u.comments_count} комментариев
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 0.5,
                        color: "var(--text-muted)",
                      }}
                    >
                      Доля статей: {u.articles_share_percent.toFixed(1)}%
                    </Typography>

                    <Box
                      sx={{
                        position: "relative",
                        height: 3,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        overflow: "hidden",
                        mb: 0.75,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "inherit",
                          background:
                            "linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))",
                          transformOrigin: "left center",
                          transform: `scaleX(${Math.max(
                            0,
                            Math.min(100, u.articles_share_percent)
                          ) / 100})`,
                          transition: "transform 0.15s ease-out",
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Получено реакций:{" "}
                      <Box
                        component="span"
                        sx={{ fontWeight: 500, color: "var(--text-primary)" }}
                      >
                        {u.reactions_received}
                      </Box>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </section>
  );
}

DashboardTopAuthors.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      author_id: PropTypes.number.isRequired,
      author_name: PropTypes.string.isRequired,
      articles_count: PropTypes.number.isRequired,
      articles_share_percent: PropTypes.number.isRequired,
      comments_count: PropTypes.number.isRequired,
      reactions_received: PropTypes.number.isRequired,
    })
  ),
};
