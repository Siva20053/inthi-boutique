import React from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";
import { productsData } from "./api/Api";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Product from "./components/Product";
import Home from "./Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminBanners from "./pages/AdminBanners";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import AdminSettings from "./pages/AdminSettings";
import AdminAccount from "./pages/AdminAccount";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import AdminResetPassword from "./pages/AdminResetPassword";

const Layout = () => {
  return (
    <div>
      <Header />
      <ScrollRestoration />
      <Outlet />
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
        loader: productsData,
      },
      {
        path: "/product/:id",
        element: <Product />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/shop",
        element: <Shop />,
      },
    ],
  },
  {
  path: "/admin/login",
  element: <AdminLogin />,
  },
  {
  path: "/admin",
  element: <AdminDashboard />,
  },
  {
  path: "/admin/products",
  element: <AdminProducts />,
  },
  {
  path: "/admin/categories",
  element: <AdminCategories />,
  },
  {
  path: "/admin/banners",
  element: <AdminBanners />,
  },
  {
    path: "/shop",
    element: <Shop />,
  },
  {
  path: "/product/:id",
  element: <ProductDetails />,
  },
  {
    path: "/categories",
    element: <Categories />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/admin/settings",
    element: <AdminSettings />,
  },
  {
    path: "/admin/account",
    element: <AdminAccount />,
  },
  {
    path: "/admin/forgot-password",
    element: <AdminForgotPassword />,
  },
  {
    path: "/admin/reset-password",
    element: <AdminResetPassword />,
  },
]);

function App() {
  return (
    <div className="font-bodyFont">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
