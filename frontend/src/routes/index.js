import { lazy } from 'react';

// Lazy load pages
const Home = lazy(() => import('../pages/HomePage'));
const Login = lazy(() => import('../features/auth/pages/LoginPage'));
const Register = lazy(() => import('../features/auth/pages/RegisterPage'));
const Dashboard = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const Moderator = lazy(() => import('../features/moderator/pages/ModeratorPage'));
const Admin = lazy(() => import('../features/admin/pages/AdminPage'));
const Podcast = lazy(() => import('../features/podcast/pages/PodcastPage'));
const ArticleDetail = lazy(() => import('../features/article/pages/ArticleDetailPage'));
const CategoryPage = lazy(() => import('../pages/CategoryPage'));
const NotFound = lazy(() => import('../pages/NotFoundPage'));

export const routes = [
  {
    path: '/',
    element: Home,
    public: true
  },
  {
    path: '/login',
    element: Login,
    public: true
  },
  {
    path: '/register',
    element: Register,
    public: true
  },
  {
    path: '/dashboard',
    element: Dashboard,
    protected: true
  },
  {
    path: '/me',
    element: Dashboard,
    protected: true
  },
  {
    path: '/moderator',
    element: Moderator,
    protected: true
  },
  {
    path: '/admin',
    element: Admin,
    protected: true
  },
  {
    path: '/podcast/:id',
    element: Podcast,
    protected: true
  },
  {
    path: '/article/:id',
    element: ArticleDetail,
    public: true
  },
  {
    path: '/category/:categoryId',
    element: CategoryPage,
    public: true
  },
  {
    path: '*',
    element: NotFound,
    public: true
  }
];