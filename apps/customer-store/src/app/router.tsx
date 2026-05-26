import { createBrowserRouter } from 'react-router-dom'

import { CustomerLayout } from '@/modules/customer/components/CustomerLayout'
import { AuthPage } from '@/modules/auth/pages/AuthPage'
import { PlantsCatalogPage } from '@/modules/catalog/pages/PlantsCatalogPage'
import { OrdersPage } from '@/modules/orders/pages/OrdersPage'
import { CheckoutPage } from '@/modules/checkout/pages/CheckoutPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <PlantsCatalogPage />,
      },
      {
        path: 'plantas',
        element: <PlantsCatalogPage />,
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
