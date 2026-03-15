import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    question: "Как я могу внести вклад в статьи?",
    answer:
      "Зарегистрируйтесь в системе, найдите нужную статью и предложите правки или создайте новую. После модерации изменения будут опубликованы.",
  },
  {
    question: "Могу ли я предлагать новые темы для статей?",
    answer:
      "Да, вы можете оставить предложение в комментариях к подходящей статье или создать черновик с описанием новой темы.",
  },
  {
    question: "Как понять, что статья актуальна?",
    answer:
      "Обращайте внимание на дату последнего изменения и активность обсуждения. При необходимости вы можете предложить обновление статьи.",
  },
  {
    question: "Кто может редактировать статьи?",
    answer:
      "Редактировать статьи могут зарегистрированные пользователи. Некоторые материалы доступны только модераторам и редакторам.",
  },
  {
    question: "Могу ли я использовать контент в своих проектах?",
    answer:
      "Да, при указании авторства и ссылки на DEV WIKI. Соблюдайте условия лицензии Creative Commons Attribution.",
  },
  {
    question: "Как сообщить об ошибке в статье?",
    answer:
      "Оставьте комментарий под статьёй или отметьте проблему через встроенный механизм обратной связи, если он доступен.",
  },
  {
    question: "Есть ли светлая тема интерфейса?",
    answer:
      "Да, вы можете переключаться между тёмной и светлой темами с помощью переключателя в правом верхнем углу.",
  },
  {
    question: "Как указываются авторы статей?",
    answer:
      "У каждой статьи отображаются имя автора, дата публикации и авторы значимых правок, если они есть.",
  },
  {
    question: "Могу ли я комментировать без регистрации?",
    answer:
      "Нет, комментирование доступно только зарегистрированным пользователям. Это помогает поддерживать качество обсуждений.",
  },
  {
    question: "Как часто публикуется новый контент?",
    answer:
      "Новые статьи и обновления выходят по мере готовности и активности сообщества.",
  },
];

const FAQ = () => {
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);

  const handleChange =
    (panel) =>
    (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };

  const filteredFaqs = faqs.filter((item) =>
    (item.question + item.answer)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        maxWidth: 960,
        mx: "auto",
        p: 3,
        color: "var(--text-primary)",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "var(--text-primary)" }}
      >
        Часто задаваемые вопросы
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 2, color: "var(--text-secondary)" }}
      >
        Здесь вы найдёте ответы на распространённые вопросы о платформе,
        статьях и процессе внесения вклада.
      </Typography>

      <Box
        sx={{
          bgcolor: "var(--bg-card)",
          borderRadius: 8,
          boxShadow: "var(--shadow)",
          border: `1px solid ${
            "var(--border-color)"
          }`,
          overflow: "hidden",
          transition: "border-color 0.15s ease-out",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid var(--border-color)" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по FAQ…"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              sx: {
                bgcolor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                borderRadius: 999,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-color)",
                  borderRadius: 999,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-secondary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-primary)",
                },
              },
            }}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                color: "var(--text-muted)",
                opacity: 1,
              },
            }}
          />
        </Box>

        {filteredFaqs.map((item, index) => {
          const panelId = `panel-${index}`;
          const isOpen = expanded === panelId;

          return (
            <Accordion
              key={panelId}
              expanded={isOpen}
              onChange={handleChange(panelId)}
              disableGutters
              square={false}
              sx={{
                bgcolor: "var(--bg-card)",
                color: "var(--text-primary)",
                boxShadow: "none",
                borderTop:
                  index === 0 ? "none" : "1px solid var(--border-color)",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color: isOpen
                        ? "var(--accent-primary)"
                        : "var(--text-secondary)",
                    }}
                  />
                }
                sx={{
                  "& .MuiTypography-root": {
                    color: isOpen
                      ? "var(--accent-primary)"
                      : "var(--text-primary)",
                    fontWeight: 500,
                  },
                  "&:hover": {
                    bgcolor: "var(--bg-secondary)",
                  },
                }}
              >
                <Typography>{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  bgcolor: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <Typography>{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export default FAQ;
