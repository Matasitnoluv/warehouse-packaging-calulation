import { Text, Dialog, Button, TextField, TextArea } from "@radix-ui/themes";
import { patchMswarehouse } from "@/services/mswarehouse.services";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

type DialogWarehouseProps = {
  getMswarehouseData: () => void;
  master_warehouse_id: string;
  master_warehouse_name: string;
  height: number;
  length: number;
  width: number;
  cubic_centimeter_warehouse: number;
  description: string;
};

interface ValidationErrors {
  master_warehouse_name?: string;
  dimensions?: string;
}

const DialogEdit = ({
  getMswarehouseData,
  master_warehouse_id,
  master_warehouse_name,
  height,
  length,
  width,
  cubic_centimeter_warehouse,
  description,
}: DialogWarehouseProps) => {
  const [patchMasterWarehouseName, setPatchMasterWarehouseName] = useState(master_warehouse_name);
  const [patchHeight, setPatchHeight] = useState<number>(height);
  const [patchLength, setPatchLength] = useState<number>(length);
  const [patchWidth, setPatchWidth] = useState<number>(width);
  const [patchCubic_centimeter_warehouse, setCubic_centimeter_warehouse] = useState(cubic_centimeter_warehouse);
  const [patchDescription, setPatchDescription] = useState(description);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!patchMasterWarehouseName.trim()) {
      newErrors.master_warehouse_name = "Warehouse name is required";
    }
    if (!patchHeight || !patchLength || !patchWidth || patchHeight <= 0 || patchLength <= 0 || patchWidth <= 0) {
      newErrors.dimensions = "All dimensions must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateMswarehouse = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const calculatedVolume = patchHeight * patchLength * patchWidth;
      setCubic_centimeter_warehouse(calculatedVolume);

      const response = await patchMswarehouse({
        master_warehouse_id: master_warehouse_id,
        master_warehouse_name: patchMasterWarehouseName,
        height: patchHeight,
        length: patchLength,
        width: patchWidth,
        cubic_centimeter_warehouse: calculatedVolume,
        description: patchDescription
      });

      if (response.statusCode === 200) {
        getMswarehouseData();
        window.location.reload();
      } else {
        const errorMessage = response.message || 'An error occurred while updating the warehouse';
        alert(errorMessage);
        // Reset to original values on error
        setPatchMasterWarehouseName(master_warehouse_name);
        setPatchHeight(height);
        setPatchLength(length);
        setPatchWidth(width);
        setPatchDescription(description);
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      alert('Failed to update warehouse. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button id="btn-edit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors">
          Edit
        </Button>
      </Dialog.Trigger>

      <Dialog.Content className="max-w-xl p-6 rounded-2xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200 z-10">
          <Dialog.Title className="text-2xl font-bold text-gray-900">Edit warehouse</Dialog.Title>
        </div>

        <div className="space-y-5">
          {/* Warehouse ID Section */}
          <div>
            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Warehouse ID</Text>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-600">
              {master_warehouse_id}
            </div>
          </div>
          {/* Warehouse Name Section */}
          <div>
            <label className="block">
              <Text className="font-semibold text-gray-700 mb-1 block text-sm">Warehouse Name *</Text>
              <TextField.Root
                defaultValue={master_warehouse_name}
                placeholder="Enter warehouse name"
                onChange={(e) => setPatchMasterWarehouseName(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.master_warehouse_name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
              />
              {errors.master_warehouse_name && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                  <AlertCircle size={12} />
                  <span>{errors.master_warehouse_name}</span>
                </div>
              )}
            </label>
          </div>

          {/* Dimensions Section */}
          <div>
            <Text className="font-semibold text-gray-700 mb-2 block text-sm">Dimensions (cm) *</Text>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <TextField.Root
                  defaultValue={width}
                  placeholder="Width"
                  type="number"
                  onChange={(e) => setPatchWidth(parseFloat(e.target.value))}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                />
              </div>
              <div>
                <TextField.Root
                  defaultValue={height}
                  placeholder="Height"
                  type="number"
                  onChange={(e) => setPatchHeight(parseFloat(e.target.value))}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                />
              </div>
              <div>
                <TextField.Root
                  defaultValue={length}
                  placeholder="Length"
                  type="number"
                  onChange={(e) => setPatchLength(parseFloat(e.target.value))}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                />
              </div>
            </div>
            {errors.dimensions && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                <AlertCircle size={12} />
                <span>{errors.dimensions}</span>
              </div>
            )}
          </div>

          {/* Volume Section */}
          <div>
            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Volume (cm³)</Text>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm">
              {(patchWidth * patchHeight * patchLength).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <label className="block">
              <Text className="font-semibold text-gray-700 mb-1 block text-sm">Description</Text>
              <TextArea
                defaultValue={description}
                placeholder="Enter warehouse description..."
                onChange={(e) => setPatchDescription(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-[80px] transition-all duration-200"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t border-gray-200 flex justify-end gap-3">
          <Dialog.Close>
            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-200">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              onClick={handleUpdateMswarehouse}
              disabled={isSubmitting}
              id="btn-update"
              className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Updating...' : 'Update Warehouse'}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DialogEdit;