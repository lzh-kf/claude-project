import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './router/AuthGuard'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/login'
import DashboardPage from './pages/dashboard'
import UsersPage from './pages/users'
import RolesPage from './pages/roles'
import PermissionsPage from './pages/permissions'
import ProductsPage from './pages/products'
import ProductFormPage from './pages/products/ProductForm'
import CategoriesPage from './pages/categories'
import OrdersPage from './pages/orders'
import OrderDetailPage from './pages/orders/detail'
import MembersPage from './pages/members'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="members" element={<MembersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
