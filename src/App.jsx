import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SystemHealthWidget from "./SystemHealthWidget";
import NotFound404 from "./NotFound404";
import MainLayout from "./layout/MainLayout";
import { BreadcrumbProvider } from "./layout/BreadcrumbContext";
import { AuthProvider } from "./auth/AuthContext";
import ArticlesListPage from "./articles/ArticlesListPage";
import ArticlePage from "./articles/ArticlePage";
import ArticleEditor from "./articles/ArticleEditor"
import DashboardPage from "./dashboard/DashboardPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <BreadcrumbProvider>
          <Routes>
            { /*главная – без крошек */} 
            <Route
              path="/"
              element={
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              }
            />

            { /* список статей – только "Статьи" */} 
            <Route
              path="/articles"
              element={
                <MainLayout>
                  <ArticlesListPage />
                </MainLayout>
              }
            />

            { /* страница статьи */} 
            <Route
              path="/articles/:id"
              element={
                <MainLayout>
                  <ArticlePage />
                </MainLayout>
              }
            />

            { /* создать статью */} 
            <Route
              path="/articles/new"
              element={
                <MainLayout>
                  <ArticleEditor mode="create" />
                </MainLayout>
              }
            />

            { /* редактировать статью */ }
            <Route
              path="/articles/:id/edit"
              element={
                <MainLayout>
                  <ArticleEditor mode="edit" />
                </MainLayout>
              }
            />
            
            { /* health */} 
            <Route
              path="/health"
              element={
                <MainLayout disableBreadcrumbs>
                  <SystemHealthWidget />
                </MainLayout>
              }
            />

            { /* 404 */} 
            <Route
              path="*"
              element={
                <MainLayout disableBreadcrumbs>
                  <NotFound404 />
                </MainLayout>
              }
            />

          </Routes>
        </BreadcrumbProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
