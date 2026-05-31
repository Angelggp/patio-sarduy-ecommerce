import { createBrowserRouter } from 'react-router-dom'

import { CustomerLayout } from '@/modules/customer/components/CustomerLayout'
import { AuthPage } from '@/modules/auth/pages/AuthPage'
import { PlantsCatalogPage } from '@/modules/catalog/pages/PlantsCatalogPage'
import { PlantDetailPage } from '@/modules/catalog/pages/PlantDetailPage'
import { PlantsStorePage } from '@/modules/catalog/pages/PlantsStorePage'
import { OrdersPage } from '@/modules/orders/pages/OrdersPage'
import { CheckoutPage } from '@/modules/checkout/pages/CheckoutPage'
import { LandingPage } from '@/modules/landing/pages/LandingPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'plantas',
        element: <PlantsCatalogPage />,
      },
      {
        path: 'plantas/:id',
        element: <PlantDetailPage />,
      },
      {
        path: 'tienda',
        element: <PlantsStorePage />,
      },
      {
        path: 'pedidos',
        element: <OrdersPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'acceso',
        element: <AuthPage />,
      },
    ],
  },
])
