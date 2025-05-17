import { Text, Dialog, Button, TextField, TextArea } from "@radix-ui/themes";
import { postMsproduct } from "@/services/msproduct.services";
import { useState } from "react";
import { AlertCircle, Plus, Upload } from "lucide-react";

type DialogMsproductProps = {
    getMsproductData: () => void;
}

interface ValidationErrors {
    code_product?: string;
    master_product_name?: string;
    dimensions?: string;
}

const DialogAdd = ({ getMsproductData }: DialogMsproductProps) => {
    const [master_product_name, setMaster_product_name] = useState("");
    const [height, setHeight] = useState<number | "">("");
    const [length, setLength] = useState<number | "">("");
    const [width, setWidth] = useState<number | "">("");
    const [cubic_centimeter_product, setCubic_centimeter_product] = useState(0);
    const [description, setDescription] = useState("");
    const [code_product, setCode_product] = useState("");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [image, setImage] = useState<string>("");

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!code_product.trim()) {
            newErrors.code_product = "Code name is required";
        }

        if (!master_product_name.trim()) {
            newErrors.master_product_name = "Product name is required";
        }

        if (!height || !length || !width || height <= 0 || length <= 0 || width <= 0) {
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

            const filetypes = /jpeg|jpg|png|gif/;
            const mimetype = filetypes.test(file.type);
            const extname = filetypes.test(file.name.toLowerCase().split('.').pop() || '');

            if (!mimetype || !extname) {
                alert("Only image files (JPEG, JPG, PNG, GIF) are allowed!");
                return;
            }

            setSelectedFile(file);
            setSelectedFileName(file.name);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateMsproduct = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const calculatedVolume = Number(width) * Number(length) * Number(height);
            setCubic_centimeter_product(calculatedVolume);

            const formData = new FormData();
            formData.append('master_product_name', master_product_name);
            formData.append('code_product', code_product);
            formData.append('height', height.toString());
            formData.append('length', length.toString());
            formData.append('width', width.toString());
            formData.append('cubic_centimeter_product', calculatedVolume.toString());
            formData.append('description', description);
            formData.append('sort_by', '0');
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const response = await postMsproduct(formData);

            if (response.statusCode === 200) {
                // Reset form
                setMaster_product_name("");
                setHeight("");
                setLength("");
                setWidth("");
                setCubic_centimeter_product(0);
                setDescription("");
                setCode_product("");
                setSelectedFile(null);
                setSelectedFileName("");
                setShowSuccessAlert(true);

                setTimeout(() => {
                    setShowSuccessAlert(false);
                    setTimeout(() => {
                        window.location.reload();
                    }, 500); // รออีกครึ่งวิให้ Alert จางหายไปก่อนรีหน้า
                }, 800);

                getMsproductData();
            } else {
                alert(response.message || "An error occurred while creating the product");
            }
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Failed to create product. Please try again");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size="3" className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 rounded-lg shadow-md flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Product
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="max-w-xl p-8 rounded-xl shadow-xl bg-white">
                <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">Create New Product</Dialog.Title>

                <div className="space-y-6">
                    {/* Code Name & Product Name Section */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block">Code Name *</Text>
                            <TextField.Root
                                placeholder="Enter product code"
                                onChange={(e) => setCode_product(e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-200 ${errors.code_product ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            {errors.code_product && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                    <AlertCircle size={12} />
                                    <span>{errors.code_product}</span>
                                </div>
                            )}
                        </label>
                    </div>

                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block">Product Name *</Text>
                            <TextField.Root
                                placeholder="Enter product name"
                                onChange={(e) => setMaster_product_name(e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-200 ${errors.master_product_name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            {errors.master_product_name && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                    <AlertCircle size={12} />
                                    <span>{errors.master_product_name}</span>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Dimensions Section */}
                    <div>
                        <Text className="font-semibold text-gray-700 mb-3 block">Dimensions (cm) *</Text>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <TextField.Root
                                type="number"
                                placeholder="Width"
                                onChange={(e) => {
                                    const value = e.target.value ? Number(e.target.value) : "";
                                    setWidth(value);
                                }}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            <TextField.Root
                                type="number"
                                placeholder="Height"
                                onChange={(e) => {
                                    const value = e.target.value ? Number(e.target.value) : "";
                                    setHeight(value);
                                }}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            <TextField.Root
                                type="number"
                                placeholder="Length"
                                onChange={(e) => {
                                    const value = e.target.value ? Number(e.target.value) : "";
                                    setLength(value);
                                }}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                        </div>
                        {errors.dimensions && (
                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                <AlertCircle size={12} />
                                <span>{errors.dimensions}</span>
                            </div>
                        )}
                    </div>

                    {/* Volume Display */}
                    {(height && length && width) && (
                        <div>
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Volume (cm³)</Text>
                            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm">
                                {(Number(height) * Number(length) * Number(width)).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    )}
                    {/* Description Section */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block">Description</Text>
                            <TextArea
                                placeholder="Enter product description (optional)"
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-200"
                            />
                        </label>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                    <div>
                        <Text className="font-semibold text-gray-700 mb-2 block text-sm">Product Image</Text>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                                <div className="flex flex-col items-center justify-center p-3">
                                    <Upload className="w-6 h-6 mb-2 text-gray-500" />
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
                        {selectedFileName && (
                            <p className="mt-1 text-xs text-gray-600">Selected: {selectedFileName}</p>
                        )}
                        {image && (
                            <div className="mt-2">
                                <img
                                    src={image}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                            </div>
                        )}
                    </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-8">
                        <Dialog.Close>
                            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all duration-200">
                                Cancel
                            </Button>
                        </Dialog.Close>
                        <Dialog.Close>
                            <Button
                                onClick={handleCreateMsproduct}
                                disabled={isSubmitting}
                                className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Product'}
                            </Button>
                        </Dialog.Close>
                    </div>
                </div>
            </Dialog.Content>
            {
                showSuccessAlert && (
                    <div className="fixed bottom-4 right-4 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl z-50 shadow-lg transform transition-all duration-500 ease-in-out animate-fade-in-down">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="block sm:inline font-medium"> Product created successfully.</span>
                    </div>
                )
            }

        </Dialog.Root >
    );
};

export default DialogAdd;
