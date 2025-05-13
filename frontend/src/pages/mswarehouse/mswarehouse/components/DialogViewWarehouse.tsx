import { useState } from "react";
import { Dialog, Button, Tabs } from "@radix-ui/themes";
import { X } from "lucide-react";
import ZoneList from "./ZoneList";

interface DialogViewWarehouseProps {
  warehouseId: string | number;
  warehouseName: string;
  warehouseVolume: number;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

export default function DialogViewWarehouse({
  warehouseId,
  warehouseName,
  warehouseVolume,
  dimensions
}: DialogViewWarehouseProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button
          size="2"
          variant="soft"
          color="blue"
          className="w-20 px-4"
        >
          View
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="p-0 overflow-hidden" style={{ maxWidth: '95vw', width: '1200px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <Dialog.Title className="text-2xl font-bold">
                {warehouseName}
              </Dialog.Title>
              <p className="text-blue-100 mt-1">Warehouse Management Details</p>
            </div>
            <Dialog.Close>
              <Button variant="ghost" color="gray" className="text-white hover:bg-blue-700 rounded-full p-2">
                <X size={20} />
              </Button>
            </Dialog.Close>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-medium">Dimensions (W×L×H)</div>
            <div className="text-xl font-semibold text-gray-800">
              {dimensions.width} × {dimensions.length} × {dimensions.height} cm
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-medium">Volume</div>
            <div className="text-xl font-semibold text-gray-800">
              {warehouseVolume.toLocaleString()} cm³
            </div>
          </div>
          {/* <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-medium">Warehouse ID</div>
            <div className="text-xl font-semibold text-gray-800 truncate">
              {warehouseId}
            </div>
          </div> */}
        </div>

        {/* Tabs Content */}
        <div className="h-[calc(90vh-220px)] overflow-hidden">
          <Tabs.Root defaultValue="zones" className="h-full">
            <div className="border-b border-gray-200 bg-white px-6">
              <Tabs.List className="w-full">
                <Tabs.Trigger value="zones" className="py-4 px-6 text-base font-medium">Zones</Tabs.Trigger>
                <Tabs.Trigger value="overview" className="py-4 px-6 text-base font-medium">Overview</Tabs.Trigger>
              </Tabs.List>
            </div>

            <div className="h-[calc(90vh-280px)]">
              <Tabs.Content value="zones" className="h-full overflow-y-auto p-6">
                <ZoneList
                  warehouseId={warehouseId.toString()}
                  warehouseName={warehouseName}
                  warehouseVolume={warehouseVolume}
                />
              </Tabs.Content>

              <Tabs.Content value="overview" className="h-full overflow-y-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold mb-4">Warehouse Summary</h3>
                  <p className="text-gray-600 mb-6">
                    This warehouse contains multiple zones and racks for storing items.
                    Use the Zones tab to view and manage all zones within this warehouse.
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Space</div>
                      <div className="text-2xl font-semibold text-gray-800">
                        {warehouseVolume.toLocaleString()} cm³
                      </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Dimensions</div>
                      <div className="text-2xl font-semibold text-gray-800">
                        {dimensions.width} × {dimensions.length} × {dimensions.height} cm
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
