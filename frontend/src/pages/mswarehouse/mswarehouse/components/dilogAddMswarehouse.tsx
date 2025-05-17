import { Text, Dialog, Button, TextField, TextArea } from "@radix-ui/themes";
import { postMswarehouse } from "@/services/mswarehouse.services";
import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";

type DialogMswarehouseProps = {
    getMswarehouseData: () => void;
};

interface ValidationErrors {
    master_warehouse_name?: string;
    dimensions?: string;
}

const DialogAdd = ({ getMswarehouseData }: DialogMswarehouseProps) => {
    const [master_warehouse_name, setmaster_warehouse_name] = useState("");
    const [height, setHeight] = useState<number>(0);
    const [length, setLength] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!master_warehouse_name.trim()) {
            newErrors.master_warehouse_name = "Warehouse name is required";
        }
        if (!height || !length || !width || height <= 0 || length <= 0 || width <= 0) {
            newErrors.dimensions = "All dimensions must be greater than 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateMswarehouse = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        const cubic_centimeter_warehouse = width * length * height;

        try {
            const response = await postMswarehouse({
                master_warehouse_name,
                height,
                length,
                width,
                cubic_centimeter_warehouse,
                description,
            });

            if (response.statusCode === 200) {
                setmaster_warehouse_name("");
                setHeight(0);
                setLength(0);
                setWidth(0);
                setDescription("");
                getMswarehouseData();
            } else {
                alert(response.message || "An error occurred while creating the warehouse");
            }
        } catch (error) {
            console.error("Error creating warehouse:", error);
            alert("Failed to create warehouse. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size="3" className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 rounded-lg shadow-md flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Warehouse
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="max-w-xl p-6 rounded-2xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200 z-10">
                    <Dialog.Title className="text-2xl font-bold text-gray-900">Create New Warehouse</Dialog.Title>
                    <p className="text-gray-600 mt-1">Add a new warehouse with dimensions and details</p>
                </div>

                {/* Body */}
                <div className="space-y-4">
                    {/* Warehouse Name */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Warehouse Name *</Text>
                            <TextField.Root
                                placeholder="Enter warehouse name"
                                value={master_warehouse_name}
                                onChange={(e) => setmaster_warehouse_name(e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.master_warehouse_name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            />
                            {errors.master_warehouse_name && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                    <AlertCircle size={12} />
                                    <span>{errors.master_warehouse_name}</span>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Dimensions */}
                    <div>
                        <Text className="font-semibold text-gray-700 mb-2 block text-sm">Dimensions (cm) *</Text>
                        <div className="grid grid-cols-3 gap-3">
                            {["Width", "Length", "Height"].map((label, index) => {
                                const setters = [setWidth, setLength, setHeight];
                                return (
                                    <TextField.Root
                                        key={label}
                                        placeholder={label}
                                        type="number"
                                        onChange={(e) => setters[index](parseFloat(e.target.value))}
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                    />
                                );
                            })}
                        </div>
                        {errors.dimensions && (
                            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                <AlertCircle size={12} />
                                <span>{errors.dimensions}</span>
                            </div>
                        )}
                    </div>

                    {/* Volume Display */}
                    {(height > 0 && length > 0 && width > 0) && (
                        <div>
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Volume (cm³)</Text>
                            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm">
                                {(height * length * width).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Description</Text>
                            <TextArea
                                placeholder="Enter zone description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-[80px] transition-all duration-200"
                            />
                        </label>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t border-gray-200 flex justify-end gap-3">
                    <Dialog.Close>
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-all duration-200">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button
                        onClick={handleCreateMswarehouse}
                        disabled={isSubmitting}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Plus size={16} />
                        {isSubmitting ? "Creating..." : "Create Warehouse"}
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogAdd;
