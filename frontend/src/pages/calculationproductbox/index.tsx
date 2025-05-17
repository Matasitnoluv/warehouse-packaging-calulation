// import DialogSelectWarehouse from "./components/dialogSelectWarehouse";
import DialogSelectCalculationMode from "./components/dialogSelectCalculationMode";
import { Package2, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";
const CalculationProductAndBoxPage = () => {
    const navigate = useNavigate();

    const handleNavigateWarehouse = () => {
        navigate("/calwarehouseTable");
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculation Center</h1>
                    <p className="text-gray-600">Select a calculation method to optimize your packaging and warehouse operations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product & Box Calculation Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
                        <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center p-6">
                            <Package2 size={100} className="text-white" />
                        </div>

                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Calculation Product & Box</h2>
                            <p className="text-gray-600 mb-6">Optimize how products are placed in boxes to maximize space efficiency and minimize waste.</p>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                                        <Package2 size={18} />
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">Product Packaging</span>
                                </div>

                                <DialogSelectCalculationMode
                                    triggerButtonText={
                                        <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 cursor-pointer">
                                            Calculate
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Zone & Warehouse Calculation Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
                        <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center p-6">
                            <Warehouse size={100} className="text-white" />
                        </div>

                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Calculation Zone & Warehouse</h2>
                            <p className="text-gray-600 mb-6">Optimize warehouse space utilization by efficiently organizing boxes within zones and racks.</p>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                                        <Warehouse size={18} />
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">Warehouse Organization</span>
                                </div>

                                <button
                                    onClick={handleNavigateWarehouse}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                                >
                                    Calculate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalculationProductAndBoxPage;
