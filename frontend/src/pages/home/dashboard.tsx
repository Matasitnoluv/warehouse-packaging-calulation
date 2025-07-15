import { getRemaining } from "@/services/shelfBoxStorage.services";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Warehouse,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Activity,
  Layers,
  Box,
  MapPin,
  ChevronDown
} from "lucide-react";
import { ZoneData } from "@/types/response/response.remainingSpace";
import { TypeMswarehouse } from "@/types/response/reponse.mswarehouse";

const Dashboard = () => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [warehouses, setWarehouses] = useState<TypeMswarehouse[]>([]);

  // ดึงข้อมูล warehouses
  const {
    data: warehousesData,
    status: warehousesStatus
  } = useQuery({
    queryKey: ['Warehouses'],
    queryFn: () => getMswarehouse(),
  });

  // ดึงข้อมูล remaining space สำหรับ warehouse ที่เลือก
  const {
    data,
    status
  } = useQuery({
    queryKey: ['Dashboard', selectedWarehouseId],
    queryFn: () => getRemaining(selectedWarehouseId),
    enabled: !!selectedWarehouseId,
  });

  // Set warehouses และเลือก warehouse แรกเมื่อโหลดข้อมูลเสร็จ
  useEffect(() => {
    if (warehousesData?.responseObject) {
      const warehouseList = Array.isArray(warehousesData.responseObject)
        ? warehousesData.responseObject
        : [warehousesData.responseObject];
      setWarehouses(warehouseList);

      // เลือก warehouse แรกถ้ายังไม่ได้เลือก
      if (warehouseList.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(warehouseList[0].master_warehouse_id);
      }
    }
  }, [warehousesData, selectedWarehouseId]);

  const remainingData = data?.responseObject;
  const warehouse = remainingData?.warehouse;
  const zones = remainingData?.zones || [];

  if (warehousesStatus === 'pending') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (warehousesStatus === 'error') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
            <p className="text-gray-500">ไม่สามารถโหลดข้อมูล Warehouses ได้</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedWarehouseId) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Warehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบ Warehouse</h2>
            <p className="text-gray-500">กรุณาเพิ่ม Warehouse ก่อน</p>
          </div>
        </div>
      </div>
    );
  }

  // คำนวณสถิติเพิ่มเติม
  const totalZones = zones.length;
  const totalRacks = zones.reduce((sum, zone) => sum + zone.racks.length, 0);
  const totalShelves = zones.reduce((sum, zone) =>
    sum + zone.racks.reduce((rackSum, rack) => rackSum + rack.shelves.length, 0), 0
  );
  const usagePercentage = warehouse ? (warehouse.used / warehouse.total) * 100 : 0;
  const overUsedZones = zones.filter(zone => zone.overUsed).length;
  const overUsedRacks = zones.reduce((sum, zone) =>
    sum + zone.racks.filter(rack => rack.overUsed).length, 0
  );

  const selectedWarehouse = warehouses.find(w => w.master_warehouse_id === selectedWarehouseId);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Warehouse Selector */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Warehouse Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                ภาพรวมการใช้งานพื้นที่คลังสินค้า
              </p>
            </div>

            {/* Warehouse Selector */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">เลือกคลังสินค้า:</span>
              </div>
              <div className="relative min-w-[280px]">
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.master_warehouse_id} value={warehouse.master_warehouse_id}>
                      {warehouse.master_warehouse_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Selected Warehouse Info */}
          {selectedWarehouse && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Warehouse className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {selectedWarehouse.master_warehouse_name}
                  </h2>
                  <p className="text-gray-600">
                    ขนาด: {selectedWarehouse.width} × {selectedWarehouse.length} × {selectedWarehouse.height} cm
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State for Dashboard Data */}
        {status === 'pending' && (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State for Dashboard Data */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
                <p className="text-sm text-red-600">ไม่สามารถโหลดข้อมูล Dashboard สำหรับคลังสินค้านี้ได้</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {status === 'success' && remainingData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Space Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Warehouse className="h-6 w-6 text-blue-600" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">พื้นที่รวม</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {warehouse?.total.toLocaleString()} cm³
                </p>
                <p className="text-xs text-gray-500 mt-1">พื้นที่ทั้งหมดของคลังสินค้า</p>
              </div>

              {/* Used Space Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">พื้นที่ที่ใช้แล้ว</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {warehouse?.used.toLocaleString()} cm³
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {usagePercentage.toFixed(1)}% ของพื้นที่ทั้งหมด
                </p>
              </div>

              {/* Remaining Space Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">พื้นที่ที่เหลือ</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {warehouse?.remain.toLocaleString()} cm³
                </p>
                <p className="text-xs text-gray-500 mt-1">พื้นที่ว่างที่สามารถใช้ได้</p>
              </div>

              {/* Usage Overview Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Layers className="h-6 w-6 text-purple-600" />
                  </div>
                  <Box className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">โครงสร้าง</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {totalZones} Zones
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalRacks} Racks • {totalShelves} Shelves
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">อัตราการใช้งานพื้นที่</h2>
                <span className="text-2xl font-bold text-blue-600">{usagePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${usagePercentage > 90 ? 'bg-red-500' :
                    usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Zones Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Zones Summary */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <MapPin className="h-6 w-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">สรุป Zones</h2>
                </div>
                <div className="space-y-4">
                  {zones.map((zone: ZoneData) => (
                    <div key={zone.zoneId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{zone.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${zone.overUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                          {zone.overUsed ? 'เกินขีดจำกัด' : 'ปกติ'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>ใช้แล้ว: {zone.used.toLocaleString()} cm³</span>
                        <span>เหลือ: {zone.remain.toLocaleString()} cm³</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${zone.overUsed ? 'bg-red-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.min((zone.used / zone.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts & Warnings */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">การแจ้งเตือน</h2>
                </div>
                <div className="space-y-4">
                  {overUsedZones > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-red-800">Zones ที่เกินขีดจำกัด</h3>
                          <p className="text-sm text-red-600">{overUsedZones} zones ใช้งานเกินพื้นที่ที่กำหนด</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {overUsedRacks > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-yellow-800">Racks ที่เกินขีดจำกัด</h3>
                          <p className="text-sm text-yellow-600">{overUsedRacks} racks ใช้งานเกินพื้นที่ที่กำหนด</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {overUsedZones === 0 && overUsedRacks === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-green-800">สถานะปกติ</h3>
                          <p className="text-sm text-green-600">ทุก zones และ racks อยู่ในขีดจำกัดที่กำหนด</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <h3 className="font-semibold text-blue-800">คำแนะนำ</h3>
                        <p className="text-sm text-blue-600">
                          {usagePercentage > 80
                            ? 'พื้นที่คลังสินค้าใกล้เต็มแล้ว ควรพิจารณาขยายพื้นที่หรือจัดระเบียบใหม่'
                            : 'พื้นที่คลังสินค้ายังมีพื้นที่ว่างเพียงพอ'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;