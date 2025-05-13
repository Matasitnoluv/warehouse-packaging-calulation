import MainLayout from "@/components/layouts/layout.main";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/pages/login";
import MsproductFeature from "@/pages/msproduct";
import MsboxFeature from "@/pages/msbox";
import CalculationProductAndBoxFeature from "@/pages/calculationproductbox";
import Commingsoon from "@/components/layouts/navbars/comingsoon";
import CalculationProductAndBoxTable from "@/pages/calculationproductbox/calculationProductAndBoxTable";
import CalculationProductAndBoxTableSingle from "@/pages/calculationproductbox/calculationProductAndBoxTableSingle";
import CalculationProductAndBoxTableMixed from "@/pages/calculationproductbox/calculationProductAndBoxTableMixed";
import SelectProductandBoxPage from "@/pages/calculationproductbox/selectProductAndBox";
import ProtectedRoute from "@/components/ProtectedRoute";
import MsWarehousePage from "@/pages/mswarehouse/mswarehouse";
import WarehouseCalculation from "@/pages/warehouseCalculation/warehouseCalculation";
import ExportPage from "@/pages/export";
import Dashboard from "@/pages/dashboard/dashboard";

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
                path: "/mswarahouse",
                element: <MsWarehousePage />
            },
            {
                path: "/warehouse-calculation/:warehouseId",
                element: <WarehouseCalculation />
            },
            {
                path: "/export",
                element: <ExportPage />
            },
            {
                path: "/dashboard",
                element: <Dashboard />
            },
        ],
    },
]);

export default function Router() {
    return <RouterProvider router={router} />;
}