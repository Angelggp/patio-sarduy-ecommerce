import { createBrowserRouter } from 'react-router-dom'

import { RequireAuth } from '@/modules/auth/components/RequireAuth'
import { RequireRole } from '@/modules/auth/components/RequireRole'
import { RootRedirect } from '@/modules/auth/components/RootRedirect'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { AdminLayout } from '@/modules/admin/components/AdminLayout'
import { InventoryPage } from '@/modules/inventory/pages/InventoryPage'
import { OrdersHistoryPage } from '@/modules/orders/pages/OrdersHistoryPage'
import { OrdersPage } from '@/modules/orders/pages/OrdersPage'
import { PaymentsPage } from '@/modules/payments/pages/PaymentsPage'
import { UsersPermissionsPage } from '@/modules/users-permissions/pages/UsersPermissionsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'inventario',
        element: (
          <RequireRole roles={['ADMIN', 'ASSISTANT', 'STUDENT']}>
            <InventoryPage />
          </RequireRole>
        ),
      },
      {
        path: 'pedidos',
        element: (
          <RequireRole roles={['ADMIN', 'ASSISTANT']}>
            <OrdersPage />
          </RequireRole>
        ),
      },
      {
        path: 'historial',
        element: (
          <RequireRole roles={['ADMIN', 'ASSISTANT']}>
            <OrdersHistoryPage />
          </RequireRole>
        ),
      },
      {
        path: 'pagos',
        element: (
          <RequireRole roles={['ADMIN', 'ASSISTANT']}>
            <PaymentsPage />
          </RequireRole>
        ),
      },
      {
        path: 'usuarios-permisos',
        element: (
          <RequireRole roles={['ADMIN', 'ASSISTANT']}>
            <UsersPermissionsPage />
          </RequireRole>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <RootRedirect />,
  },
])
