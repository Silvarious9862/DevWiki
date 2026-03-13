// src/dashboard/DashboardStats.jsx
import PropTypes from "prop-types";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { IconButton } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";


function formatDelta(value) {
  if (value === null || value === undefined) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

function Delta({ value, label }) {
  if (value === null || value === undefined) {
    return (
      <Typography sx={{ fontSize: 12, color: "var(--text-muted)", mt: 0.25 }}>
        нет данных
      </Typography>
    );
  }

  const positive = value >= 0;
  return (
    <Typography sx={{ fontSize: 12, color: "var(--text-muted)", mt: 0.25 }}>
      <Box
        component="span"
        sx={{
          fontWeight: 500,
          color: positive ? "#4ade80" : "#f97373",
        }}
      >
        {formatDelta(value)}
      </Box>{" "}
      {label}
    </Typography>
  );
}

const CARD_SX = {
  width: 200,
  height: 150,
  borderRadius: "16px",
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-color)",
  boxShadow: "var(--shadow)",
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
};

export default function DashboardStats({ data }) {
  if (!data) return null;

  const {
    articles_total,
    articles_delta_week,
    visitors_total,
    visitors_delta_week,
    comments_total,
    comments_delta_week,
    likes_total,
    dislikes_total,
    likes_delta_week,
    dislikes_delta_week,
  } = data;

  return (
    <section>
      <Typography
        sx={{
          mb: 2,
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: 2,
        }}
      >
        Статистика
      </Typography>

      <Grid container spacing={2} sx={{ m: 0, width: "100%" }}>
        <Grid item xs={12} md={3}>
          <Card sx={CARD_SX}>
            <CardContent sx={CONTENT_SX}>
              <Typography
                sx={{ fontSize: 13, color: "var(--text-secondary)", mb: 0.5 }}
              >
                Всего статей
              </Typography>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {articles_total}
              </Typography>
              <Delta value={articles_delta_week} label="на этой неделе" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={CARD_SX}>
            <CardContent sx={CONTENT_SX}>
              <Typography
                sx={{ fontSize: 13, color: "var(--text-secondary)", mb: 0.5 }}
              >
                Посетители
              </Typography>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {visitors_total}
              </Typography>
              <Delta value={visitors_delta_week} label="за эту неделю" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={CARD_SX}>
            <CardContent sx={CONTENT_SX}>
              <Typography
                sx={{ fontSize: 13, color: "var(--text-secondary)", mb: 0.5 }}
              >
                Комментарии
              </Typography>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {comments_total}
              </Typography>
              <Delta value={comments_delta_week} label="за эту неделю" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={CARD_SX}>
            <CardContent sx={CONTENT_SX}>
              <Typography
                sx={{ fontSize: 13, color: "var(--text-secondary)", mb: 0.5 }}
              >
                Реакции
              </Typography>

              {/* общие счетчики с иконками */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mb: 0.5,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                <ThumbUpAltOutlinedIcon
                  fontSize="small"
                  sx={{ mr: 0.25 }}
                />
                <span>{likes_total}</span>

                <div className="ArticlePage__statsDivider" />

                <ThumbDownAltOutlinedIcon
                  fontSize="small"
                  sx={{ mr: 0.25 }}
                />
                <span>{dislikes_total}</span>
              </Box>

              {/* дельта за неделю: только числа и разделитель */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3.5,
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#4ade80" }}>
                  {formatDelta(likes_delta_week)}
                </span>

                <div className="ArticlePage__statsDivider" />

                <span style={{ color: "#f97373" }}>
                  {formatDelta(dislikes_delta_week)}
                </span>
              </Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  mt: 1,
                }}
              >
                за эту неделю
              </Typography>
            </CardContent>
          </Card>
        </Grid>


      </Grid>
    </section>
  );
}

DashboardStats.propTypes = {
  data: PropTypes.shape({
    articles_total: PropTypes.number.isRequired,
    articles_delta_week: PropTypes.number.isRequired,
    visitors_total: PropTypes.number.isRequired,
    visitors_delta_week: PropTypes.number,
    comments_total: PropTypes.number.isRequired,
    comments_delta_week: PropTypes.number.isRequired,
    likes_total: PropTypes.number.isRequired,
    dislikes_total: PropTypes.number.isRequired,
    likes_delta_week: PropTypes.number.isRequired,
    dislikes_delta_week: PropTypes.number.isRequired,
  }),
};
