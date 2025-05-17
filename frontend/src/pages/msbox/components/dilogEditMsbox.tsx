import { Text, Dialog, Button, TextField, TextArea } from "@radix-ui/themes";
import { patchMsbox } from "@/services/msbox.services";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

type DialogMsboxProps = {
    getMsboxData: () => void;
    master_box_id: string;
    master_box_name: string;
    code_box: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_box: number;
    description: string;
    image_path: string;
    onEditSuccess: () => void;
}

interface ValidationErrors {
    master_box_name?: string;
    dimensions?: string;
    code_box?: string;
}

const DialogEdit = ({
    getMsboxData,
    master_box_id,
    master_box_name,
    code_box,
    height,
    length,
    width,
    cubic_centimeter_box,
    description,
    image_path,
    onEditSuccess,
}: DialogMsboxProps) => {
    const [patchMaster_box_name, setMaster_box_name] = useState(master_box_name);
    const [patchCode_box, setCode_box] = useState(code_box);
    const [patchHeight, setHeight] = useState<number>(height);
    const [patchLength, setLength] = useState<number>(length);
    const [patchWidth, setWidth] = useState<number>(width);
    const [patchCubic_centimeter_box, setCubic_centimeter_box] = useState(cubic_centimeter_box);
    const [patchDescription, setDescription] = useState(description);
    const [patchImage, setImage] = useState(image_path);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [upimage,setUpImage] = useState("");

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!patchMaster_box_name.trim()) {
            newErrors.master_box_name = "Box name is required";
        }

        if (!patchHeight || !patchLength || !patchWidth || patchHeight <= 0 || patchLength <= 0 || patchWidth <= 0) {
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

    const handleUpdateMsbox = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const calculatedVolume = patchWidth * patchLength * patchHeight;
            setCubic_centimeter_box(calculatedVolume);

            const formData = new FormData();
            formData.append('master_box_id', master_box_id);
            formData.append('master_box_name', patchMaster_box_name);
            formData.append('code_box', patchCode_box);
            formData.append('height', patchHeight.toString());
            formData.append('length', patchLength.toString());
            formData.append('width', patchWidth.toString());
            formData.append('cubic_centimeter_box', calculatedVolume.toString());
            formData.append('description', patchDescription);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const response = await patchMsbox(formData);

            if (response.statusCode === 200) {
                onEditSuccess()
                getMsboxData();
            } else {
                alert(response.message || "An error occurred while updating the box");
                // Reset to original values on error
                setMaster_box_name(master_box_name);
                setCode_box(code_box);
                setHeight(height);
                setLength(length);
                setWidth(width);
                setCubic_centimeter_box(cubic_centimeter_box);
                setDescription(description);
                setImage(image_path);
            }
        } catch (error) {
            console.error("Error updating box:", error);
            alert("Failed to update box. Please try again");
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
                    <Dialog.Title className="text-2xl font-bold text-gray-900">Edit Box</Dialog.Title>
                </div>

                <div className="space-y-5">
                    {/* Box ID Section */}
                    <div>
                        <Text className="font-semibold text-gray-700 mb-1 block text-sm">Box ID</Text>
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-600">
                            {master_box_id}
                        </div>
                    </div>
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Box Name *</Text>
                            <TextField.Root
                                defaultValue={code_box}
                                placeholder="Enter box code"
                                onChange={(e) => setCode_box(e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.code_box ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            {errors.code_box && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                    <AlertCircle size={12} />
                                    <span>{errors.code_box}</span>
                                </div>
                            )}
                        </label>
                    </div>
                    {/* Box Name Section */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Box Name *</Text>
                            <TextField.Root
                                defaultValue={master_box_name}
                                placeholder="Enter box name"
                                onChange={(e) => setMaster_box_name(e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.master_box_name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                            />
                            {errors.master_box_name && (
                                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                    <AlertCircle size={12} />
                                    <span>{errors.master_box_name}</span>
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
                            {(patchWidth * patchHeight *  patchLength).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Description</Text>
                            <TextArea
                                defaultValue={description}
                                placeholder="Enter box description..."
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-[80px] transition-all duration-200"
                            />
                        </label>
                    </div>

                    {/* Image Section */}
                    <div>
                    {selectedFileName && (
                            <p className="mt-1 text-xs text-gray-600">Selected: {selectedFileName}</p>
                        )}
                        {upimage && (
                            <div className="mt-2">
                                <img
                                    src={upimage}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                            </div>
                        )}
                        <Text className="font-semibold text-gray-700 mb-2 block text-sm">Box Image</Text>
                        {/* Current Image Preview */}
                        
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
                            onClick={handleUpdateMsbox}
                            disabled={isSubmitting}
                            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Box'}
                        </Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogEdit;