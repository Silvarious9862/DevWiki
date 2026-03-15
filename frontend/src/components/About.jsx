// frontend/src/components/About.jsx
import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      <h1 className="about-title">О DEV WIKI</h1>

      <section className="about-section">
        <p>
          DEV WIKI — это совместная база знаний, созданная разработчиками и
          системными администраторами. Она объединяет статьи, ответы на частые
          вопросы и практические руководства, чтобы помогать командам быстрее
          решать технические задачи и делиться лучшими практиками в разных
          областях.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Наша миссия</h2>
        <ul className="about-list">
          <li>
            Собирать и систематизировать практические знания в областях DevOps,
            UI/UX и администрирования систем.
          </li>
          <li>
            Обеспечивать сотрудничество, позволяя участникам редактировать,
            улучшать и расширять статьи.
          </li>
          <li>
            Давать быстрый доступ к надежным гайдам и документации для
            повседневных задач.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Команда</h2>
        <p>DEV WIKI поддерживается сообществом участников.</p>
        <ul className="about-list">
          <li>
            <strong>BobrikVU</strong> — редактор и сопровождающий статьи по
            инфраструктуре и core-сервисам.
          </li>
          <li>
            <strong>Sergeychik</strong> — автор статей по Linux и сетям.
          </li>
          <li>
            <strong>al3kbrk</strong> — автор материалов по UI/UX и оптимизации
            баз данных.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Как пользоваться</h2>
        <ul className="about-list">
          <li>
            Навигируйте через боковое меню: Dashboard, Articles, FAQ, About.
          </li>
          <li>
            Используйте строку поиска, чтобы быстро находить нужные темы.
          </li>
          <li>
            В каждой статье есть метаданные: автор, дата публикации и дата
            последнего изменения.
          </li>
          <li>
            Зарегистрированные пользователи могут оставлять комментарии,
            предлагать правки и добавлять новые статьи.
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Лицензирование</h2>
        <p>
          Весь контент публикуется под лицензией Creative Commons Attribution.
          Вы можете свободно использовать и адаптировать материалы при условии
          указания авторства оригинальных авторов.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Зачем DEV WIKI?</h2>
        <p>
          Мы считаем, что знания должны быть доступными, структурированными и
          совместно развиваемыми. DEV WIKI задумана как живой ресурс, который
          растет вместе с сообществом, делая техническую документацию понятной,
          поддерживаемой и полезной для всех.
        </p>
      </section>
    </div>
  );
};

export default About;
