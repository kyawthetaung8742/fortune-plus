import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { LoadingProvider } from "./contexts/LoadingContext";
import Main from "./layouts/Main";
import Error from "./pages/Error";
import { Dashboard, Login, UserList, Shareholders, TransactionHistoryPage, Payments, Exchange, Customers, Expenses, Sale, SaleListPage, Categories, Products } from "./pages";
import { SidebarProvider } from "./components/ui/sidebar";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LoadingProvider>
          <SidebarProvider>
            <Main />
          </SidebarProvider>
        </LoadingProvider>
      ),
      errorElement: <Error />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "shareholders", element: <Shareholders /> },
        { path: "transaction-history", element: <TransactionHistoryPage /> },
        { path: "payments", element: <Payments /> },
        { path: "customers", element: <Customers /> },
        { path: "sale", element: <Sale /> },
        { path: "sale-list", element: <SaleListPage /> },
        { path: "categories", element: <Categories /> },
        { path: "products", element: <Products /> },
        { path: "expenses", element: <Expenses /> },
        { path: "exchange", element: <Exchange /> },
        { path: "users", element: <UserList /> },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);

  return (
    <div>
      <Toaster position="top-right" richColors closeButton />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
