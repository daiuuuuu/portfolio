import { createBrowserRouter } from 'react-router-dom'
import { SITE_CONFIG } from '@/config/site'
import RootLayout from '@/layouts/RootLayout'
import Home from '@/pages/Home'
import ProjectDetail from '@/pages/ProjectDetail'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: 'project/:slug',
          element: <ProjectDetail />,
        },
        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ],
  // GitHub Pages base path — must match vite.config.ts
  { basename: SITE_CONFIG.basePath },
)
