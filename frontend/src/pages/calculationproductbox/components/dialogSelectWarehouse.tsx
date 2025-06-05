import { useEffect, useState, ReactNode } from "react";
import { Dialog, Button, Card, Flex, Box, Text, Badge, Separator } from "@radix-ui/themes";
import { getMswarehouse, getMswarehouseUsage } from "@/services/mswarehouse.services";
import { useNavigate } from "react-router-dom";
import { TypeMswarehouse } from "@/types/response/reponse.mswarehouse";

// Define warehouse usage type for the enhanced warehouse selection dialog

// Define warehouse usage type
interface WarehouseUsage {
  master_warehouse_id: string;
  master_warehouse_name: string;
  total_volume: number; // พื้นที่ทั้งหมดของ warehouse
  used_by_zones: number; // พื้นที่ที่ถูกใช้ไปในการสร้าง Zone
  used_by_boxes: number; // พื้นที่ที่ถูกใช้ไปในการเก็บของใน rack
  available_space: number; // พื้นที่ที่ยังเหลือ
  usage_percentage: number; // เปอร์เซ็นต์การใช้พื้นที่
  width: number;
  length: number;
  height: number;
  description?: string;
}

interface DialogSelectWarehouseProps {
  triggerButtonText?: ReactNode;
  documentWarehouseNo?: string;
  buttonClassName?: string;
}

const DialogSelectWarehouse = ({
  triggerButtonText = "Calculation",
  documentWarehouseNo,
  buttonClassName = "inline-flex items-center gap-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-lg shadow-md transition-colors text-sm"
}: DialogSelectWarehouseProps) => {
  const [warehouses, setWarehouses] = useState<WarehouseUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWarehouseUsage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Directly try to get the warehouse usage data which includes all information
        const usageResponse = await getMswarehouseUsage();

        if (usageResponse.success && usageResponse.responseObject) {
          setWarehouses(usageResponse.responseObject);
        } else {
          // If usage endpoint fails, fallback to basic warehouse data
          const basicResponse = await getMswarehouse();

          if (basicResponse.success) {
            // Create warehouse data with default usage values
            const warehousesWithDefaultUsage = (basicResponse.responseObject as TypeMswarehouse[] || []).map((warehouse: any) => ({
              master_warehouse_id: warehouse.master_warehouse_id,
              master_warehouse_name: warehouse.master_warehouse_name || '',
              total_volume: warehouse.cubic_centimeter_warehouse || 0,
              used_by_zones: 0, // Default value
              used_by_boxes: 0, // Default value
              available_space: warehouse.cubic_centimeter_warehouse || 0, // Default = total volume
              usage_percentage: 0, // Default = 0%
              width: warehouse.width || 0,
              length: warehouse.length || 0,
              height: warehouse.height || 0,
              description: warehouse.description || ''
            }));

            setWarehouses(warehousesWithDefaultUsage);
            setError("ไม่สามารถดึงข้อมูลการใช้พื้นที่ warehouse ได้ กำลังแสดงข้อมูลพื้นฐาน");
          } else {
            setError("ไม่สามารถดึงข้อมูล warehouse ได้");
          }
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล warehouse");

        // Try to get basic data as fallback
        try {
          const basicResponse = await getMswarehouse();
          if (basicResponse.success) {
            const warehousesWithDefaultUsage = (basicResponse.responseObject as TypeMswarehouse[] || []).map((warehouse: any) => ({
              master_warehouse_id: warehouse.master_warehouse_id,
              master_warehouse_name: warehouse.master_warehouse_name || '',
              total_volume: warehouse.cubic_centimeter_warehouse || 0,
              used_by_zones: 0,
              used_by_boxes: 0,
              available_space: warehouse.cubic_centimeter_warehouse || 0,
              usage_percentage: 0,
              width: warehouse.width || 0,
              length: warehouse.length || 0,
              height: warehouse.height || 0,
              description: warehouse.description || ''
            }));
            setWarehouses(warehousesWithDefaultUsage);
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseUsage();
  }, []);

  const handleWarehouseSelect = (warehouse: WarehouseUsage) => {
    //console.log("Selected warehouse:", warehouse);
    if (documentWarehouseNo) {
      navigate(`/warehouse-calculation/${warehouse.master_warehouse_id}`, {
        state: { documentWarehouseNo, warehouseName: warehouse.master_warehouse_name }
      });
    } else {
      navigate(`/warehouse-calculation/${warehouse.master_warehouse_id}`, {
        state: { warehouseName: warehouse.master_warehouse_name }
      });
    }
  };

  // const handleEditCalmsbox = () => {
  //   navigate("/calculationproductbox/select-warehouse", { state: { documentWarehouseNo } });
  // };

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Get color based on usage percentage
  const getSpaceStatusColor = (percentage: number) => {
    if (percentage < 40) return "green";
    if (percentage < 70) return "orange";
    return "red";
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button
          className={buttonClassName}
        >
          {triggerButtonText}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-5xl overflow-y-auto" style={{ maxHeight: '80vh' }}>
        <Dialog.Title className="text-2xl font-bold mb-2">Select Warehouse</Dialog.Title>
        <Dialog.Description className="text-gray-600 mb-6">
          Choose a warehouse to calculate box placement in racks. View detailed information about each warehouse below.
        </Dialog.Description>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : warehouses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {warehouses.map((warehouse) => (
              <Card key={warehouse.master_warehouse_id} className="p-0 overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Flex>
                  {/* Left side with warehouse image/icon */}
                  <Box className="bg-blue-50 w-24 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </Box>

                  {/* Main content */}
                  <Box className="p-4 flex-grow">
                    <Flex justify="between" align="start">
                      <Box>
                        <Text className="text-lg font-bold text-gray-800">{warehouse.master_warehouse_name}</Text>
                        <Text className="text-sm text-gray-500 mt-1">{warehouse.description || 'No description available'}</Text>
                      </Box>
                      <Badge color={getSpaceStatusColor(warehouse.usage_percentage || 0)} size="2" className="font-semibold">
                        {warehouse.usage_percentage?.toFixed(2) || '0.00'}% Used
                      </Badge>
                    </Flex>

                    <Separator className="my-3" />

                    <Flex gap="4" className="mt-3">
                      <Box>
                        <Text className="text-xs text-gray-500">Dimensions (W×L×H)</Text>
                        <Text className="text-sm font-medium">
                          {warehouse.width} × {warehouse.length} × {warehouse.height} cm
                        </Text>
                      </Box>

                      <Box>
                        <Text className="text-xs text-gray-500">Total Volume</Text>
                        <Text className="text-sm font-medium">
                          {formatNumber(warehouse.total_volume)} cm³
                        </Text>
                      </Box>

                      <Box>
                        <Text className="text-xs text-gray-500">Available Space</Text>
                        <Text className="text-sm font-semibold text-green-600">
                          {formatNumber(warehouse.available_space || 0)} cm³
                        </Text>
                      </Box>
                    </Flex>

                    {/* Space usage visualization */}
                    <Box className="mt-3">
                      <Flex justify="between" className="mb-1">
                        <Text className="text-xs text-gray-500">Storage Usage</Text>
                        <Text className="text-xs font-medium">
                          {formatNumber(warehouse.used_by_boxes || 0)} / {formatNumber(warehouse.total_volume)} cm³
                        </Text>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(warehouse.usage_percentage || 0, 100)}%`,
                            backgroundColor: (warehouse.usage_percentage || 0) < 40 ? '#22c55e' :
                              (warehouse.usage_percentage || 0) < 70 ? '#f97316' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </Box>

                    <Flex justify="end" className="mt-4">
                      <Button
                        size="2"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        onClick={() => handleWarehouseSelect(warehouse)}
                      >
                        Select Warehouse
                      </Button>
                    </Flex>
                  </Box>
                </Flex>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No warehouses found</p>
            <p className="text-sm text-gray-400 mt-1">Please create a warehouse first</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Dialog.Close>
            <Button
              size="2"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded"
            >
              Cancel
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DialogSelectWarehouse;
