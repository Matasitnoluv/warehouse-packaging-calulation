import { Text, Dialog, Button, TextField, TextArea } from "@radix-ui/themes";
import { patchMsproduct } from "@/services/msproduct.services"
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { TypeMsproductAll } from "@/types/response/reponse.msproduct";

type DialogMsproductProps = {
    getMsproductData: () => void;
    master_product_id: string;
    master_product_name: string;
    code_product: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_product: number;
    description?: string;
    image_path?: string;
    onEditSuccess: () => void;
}

interface ValidationErrors {
    master_product_name?: string;
    code_product?: string;
    dimensions?: string;
}

const DialogEdit = ({
    getMsproductData,
    master_product_id,
    master_product_name,
    code_product,
    height,
    length,
    width,
    cubic_centimeter_product,
    description,
    image_path,
    onEditSuccess,
}: DialogMsproductProps) => {
    const [patchMaster_product_name, setMaster_product_name] = useState(master_product_name);
    const [patchCode_product, setCode_product] = useState(code_product);
    const [patchHeight, setHeight] = useState<number>(height);
    const [patchLength, setLength] = useState<number>(length);
    const [patchWidth, setWidth] = useState<number>(width);
    const [patchCubic_centimeter_product, setCubic_centimeter_product] = useState(cubic_centimeter_product);
    const [patchDescription, setDescription] = useState(description);
    const [patchImage, setImage] = useState(image_path);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [upimage, setUpImage] = useState<string>("");

    // อัปเดตปริมาตรเมื่อขนาดเปลี่ยน
    useEffect(() => {
        const calculatedVolume = patchHeight * patchWidth * patchLength;
        setCubic_centimeter_product(calculatedVolume);
    }, [patchHeight, patchWidth, patchLength]);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!patchMaster_product_name.trim()) {
            newErrors.master_product_name = "Product name is required";
        }

        if (!patchCode_product || !patchHeight || !patchLength || !patchWidth || patchHeight <= 0 || patchLength <= 0 || patchWidth <= 0) {
            newErrors.dimensions = "All dimensions must be greater than 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size should not exceed 5MB");
                return;
            }

            setSelectedFile(file);
            setSelectedFileName(file.name);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setUpImage(reader.result as string);
            };
        }
    };

    const handleUpdateMsproduct = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('master_product_id', master_product_id);
            formData.append('master_product_name', patchMaster_product_name);
            formData.append('code_product', patchCode_product);
            formData.append('height', patchHeight.toString());
            formData.append('length', patchLength.toString());
            formData.append('width', patchWidth.toString());
            formData.append('cubic_centimeter_product', patchCubic_centimeter_product.toString());
            formData.append('description', patchDescription || '');
            formData.append('sort_by', '0');

            // Handle image upload
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const response = await patchMsproduct(formData as unknown as TypeMsproductAll);

            if (response.statusCode === 200) {
                onEditSuccess();
                getMsproductData();
            } else {
                alert(response.message || "An error occurred while updating the product");
                // Reset to original values on error
                setMaster_product_name(master_product_name);
                setCode_product(code_product);
                setHeight(height);
                setLength(length);
                setWidth(width);
                setCubic_centimeter_product(cubic_centimeter_product);
                setDescription(description);
                setImage(image_path);
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product. Please try again");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors">
                    Edit
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="max-w-xl p-6 rounded-2xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200 z-10">
                    <Dialog.Title className="text-2xl font-bold text-gray-900">Edit Product</Dialog.Title>
                </div>

                <div className="space-y-5">
                    {/* Product ID Section */}
                    <div>
                        <Text className="font-semibold text-gray-700 mb-1 block text-sm">Product ID</Text>
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-600">
                            {master_product_id}
                        </div>
                    </div>
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Product Code *</Text>
                            <TextField.Root
                                defaultValue={code_product}
                                placeholder="Enter product code"
                                onChange={(e) => setCode_product(e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.code_product ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            {errors.code_product && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                    <AlertCircle size={12} />
                                    <span>{errors.code_product}</span>
                                </div>
                            )}
                        </label>
                    </div>
                    {/* Product Name Section */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Product Name *</Text>
                            <TextField.Root
                                defaultValue={master_product_name}
                                placeholder="Enter product name"
                                onChange={(e) => setMaster_product_name(e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.master_product_name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            {errors.master_product_name && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                    <AlertCircle size={12} />
                                    <span>{errors.master_product_name}</span>
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
                                    onChange={(e) => setWidth(parseFloat(e.target.value))}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            <div>
                                <TextField.Root
                                    defaultValue={height}
                                    placeholder="Height"
                                    type="number"
                                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            <div>
                                <TextField.Root
                                    defaultValue={length}
                                    placeholder="Length"
                                    type="number"
                                    onChange={(e) => setLength(parseFloat(e.target.value))}
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
                            {patchCubic_centimeter_product.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Description</Text>
                            <TextArea
                                defaultValue={description}
                                placeholder="Enter product description..."
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-[80px] transition-all duration-200"
                            />
                        </label>
                    </div>

                    {/* Image Section */}
                    <div>
                        <Text className="font-semibold text-gray-700 mb-2 block text-sm">Product Image</Text>

                        {/* Current Image Display */}
                        {patchImage && !upimage && (
                            <div className="mb-3">
                                <Text className="text-xs text-gray-600 mb-1 block">Current Image:</Text>
                                <img
                                    src={patchImage}
                                    alt="Current Product"
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                            </div>
                        )}

                        {/* New Image Preview */}
                        {selectedFileName && (
                            <p className="mt-1 text-xs text-gray-600">Selected: {selectedFileName}</p>
                        )}
                        {upimage && (
                            <div className="mt-2">
                                <Text className="text-xs text-gray-600 mb-1 block">New Image Preview:</Text>
                                <img
                                    src={upimage}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                            </div>
                        )}

                        {/* Image Upload */}
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                                <div className="flex flex-col items-center justify-center p-3">
                                    <svg className="w-6 h-6 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="text-xs text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </label>
                        </div>

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
                            onClick={handleUpdateMsproduct}
                            disabled={isSubmitting}
                            id="btn-update"
                            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Product'}
                        </Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogEdit;