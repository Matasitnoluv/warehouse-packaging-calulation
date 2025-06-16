import { Text, Dialog, Button, TextField, TextArea } from "@radix-ui/themes";
import { postMsbox } from "@/services/msbox.services";
import { useState } from "react";
import { AlertCircle, Upload, Plus } from "lucide-react";

type DialogMsboxProps = {
    getMsboxData: () => void;
    buttonId?: string;
}

interface ValidationErrors {
    code_box?: string;
    master_box_name?: string;
    dimensions?: string;
}

const DialogAdd = ({ getMsboxData, buttonId }: DialogMsboxProps) => {
    const [master_box_name, setMaster_box_name] = useState("");
    const [height, setHeight] = useState<number | "">("");
    const [length, setLength] = useState<number | "">("");
    const [width, setWidth] = useState<number | "">("");
    const [cubic_centimeter_box, setCubic_centimeter_box] = useState(0);
    const [description, setDescription] = useState("");
    const [code_box, setCode_box] = useState("");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [image, setImage] = useState<string>("");

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!code_box.trim()) {
            newErrors.code_box = "Box code is required";
        }

        if (!master_box_name.trim()) {
            newErrors.master_box_name = "Box name is required";
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

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateMsbox = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const calculatedVolume = Number(width) * Number(length) * Number(height);
            setCubic_centimeter_box(calculatedVolume);

            const formData = new FormData();
            formData.append('master_box_name', master_box_name);
            formData.append('code_box', code_box);
            formData.append('height', height.toString());
            formData.append('length', length.toString());
            formData.append('width', width.toString());
            formData.append('cubic_centimeter_box', calculatedVolume.toString());
            formData.append('description', description);
            formData.append('sort_by', '0');
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const response = await postMsbox(formData);

            if (response.statusCode === 200) {
                setMaster_box_name("");
                setHeight("");
                setLength("");
                setWidth("");
                setCubic_centimeter_box(0);
                setDescription("");
                setCode_box("");
                setSelectedFile(null);
                setSelectedFileName("");
                setImage("");
                setShowSuccessAlert(true);

                setTimeout(() => {
                    setShowSuccessAlert(false);
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }, 800);

                getMsboxData();
            } else {
                alert(response.message || "An error occurred while creating the box");
            }
        } catch (error) {
            console.error("Error creating box:", error);
            alert("Failed to create box. Please try again");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button id="btn-add" className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Box
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="max-w-xl p-8 rounded-2xl shadow-2xl bg-white">
                <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">Create New Box</Dialog.Title>

                <div className="space-y-6">
                    {/* Code Name & Box Name Section */}
                        <div>
                            <label className="block">
                                <Text className="font-semibold text-gray-700 mb-1 block">Box Code *</Text>
                                <TextField.Root
                                    placeholder="Enter box code"
                                    onChange={(e) => setCode_box(e.target.value)}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.code_box ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.code_box && (
                                    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                        <AlertCircle size={12} />
                                        <span>{errors.code_box}</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div>
                            <label className="block">
                                <Text className="font-semibold text-gray-700 mb-1 block">Box Name *</Text>
                                <TextField.Root
                                    placeholder="Enter box name"
                                    onChange={(e) => setMaster_box_name(e.target.value)}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.master_box_name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.master_box_name && (
                                    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                        <AlertCircle size={12} />
                                        <span>{errors.master_box_name}</span>
                                    </div>
                                )}
                            </label>
                        </div>

                    {/* Dimensions Section */}
                    <div>
                        <Text className="font-semibold text-gray-700 mb-3 block">Dimensions (cm) *</Text>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <TextField.Root
                                    placeholder="Width"
                                    type="number"
                                    onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : "")}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                />
                            </div>
                            <div>
                                <TextField.Root
                                    placeholder="Height"
                                    type="number"
                                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : "")}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                />
                            </div>
                            <div>
                                <TextField.Root
                                    placeholder="Length"
                                    type="number"
                                    onChange={(e) => setLength(e.target.value ? Number(e.target.value) : "")}
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${errors.dimensions ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                />
                            </div>
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
                                {(Number(width) * Number(height) * Number(length)).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    )}

                    {/* Description Section */}
                    <div>
                        <label className="block">
                            <Text className="font-semibold text-gray-700 mb-1 block text-sm">Description</Text>
                            <TextArea
                                placeholder="Enter box description..."
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-[80px] transition-all duration-200"
                            />
                        </label>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <Text className="font-semibold text-gray-700 mb-2 block text-sm">Box Image</Text>
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
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                    <Dialog.Close>
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-all duration-200">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button
                        onClick={handleCreateMsbox}
                        disabled={isSubmitting}
                        id="btn-create"
                        className={`
                            inline-flex items-center gap-2 px-4 py-2 
                            bg-blue-500 hover:bg-blue-600 
                            text-white font-semibold rounded-lg 
                            shadow-md transition-all duration-200
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <Plus size={18} />
                        Create Box
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogAdd;