import MainLayout from "@/components/layouts/layout.main";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/pages/login";
import MsproductFeature from "@/pages/msproduct";
import MsboxFeature from "@/pages/msbox";
import CalculationProductAndBoxFeature from "@/pages/calculationproductbox";
import CalculationProductAndBoxTable from "@/pages/calculationproductbox/calculationProductAndBoxTable";
import CalculationProductAndBoxTableSingle from "@/pages/calculationproductbox/calculationProductAndBoxTableSingle";
import CalculationProductAndBoxTableMixed from "@/pages/calculationproductbox/calculationProductAndBoxTableMixed";
import SelectProductandBoxPage from "@/pages/calculationproductbox/selectProductAndBox";
import ProtectedRoute from "@/components/ProtectedRoute";
import MsWarehousePage from "@/pages/mswarehouse/mswarehouse";
import WarehouseCalculation from "@/pages/warehouseCalculation";
import ExportPage from "@/pages/export";
import Dashboard from "@/pages/home/dashboard";

import SelectWarehousePage from "@/pages/calculationproductbox/SelectWarehousePage";
import UserManagement from "@/pages/user-management";
import CalWarehouseTable from "@/pages/warehouseCalculation/components/calwarehouseTable";
import NotFound from "@/pages/notFound";

const router = createBrowserRouter([
    {
        index: true,
        path: "/",
        element: <Login />,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "/msproduct",
                element: <MsproductFeature />,
            },
            {
                path: "/msbox",
                element: <MsboxFeature />
            },
            {
                path: "/calculationproductbox",
                element: <CalculationProductAndBoxFeature />
            },
            {
                path: "/calculationProductAndBoxTable",
                element: <CalculationProductAndBoxTable />
            },
            {
                path: "/calculationProductAndBoxTableSingle",
                element: <CalculationProductAndBoxTableSingle />
            },
            {
                path: "/calculationProductAndBoxTableMixed",
                element: <CalculationProductAndBoxTableMixed />
            },
            {
                path: "/selectProductandBoxPage",
                element: <SelectProductandBoxPage />
            },
            {
                path: "/mswarehouse",
                element: <MsWarehousePage />
            },
            {
                path: "/warehouse-calculation/:warehouseId/:actions?",
                element: <WarehouseCalculation />
            },
            {
                path: "/export",
                element: <ExportPage />
            },
            {
                path: "/calwarehouseTable",
                element: <CalWarehouseTable />
            },
            {
                path: "/calculationproductbox/select-warehouse",
                element: <SelectWarehousePage />
            },
            {
                path: "/dashboard",
                element: <Dashboard />
            },
            {
                path: "/user-management",
                element: <UserManagement />
            },
        ],
    },
    {
        path: "/404",
        element: (
            <NotFound />
        ),
    }
]);

export default function Router() {
    return <RouterProvider router={router} />;
}