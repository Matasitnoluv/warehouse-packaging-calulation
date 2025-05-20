import { useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Table, Dialog } from "@radix-ui/themes";
import { getMsproduct, patchMsproduct } from "@/services/msproduct.services";
import DialogProduct from "./components/dilogProduct";
import DialogBox from "./components/dilogBox";
import { getMsbox } from "@/services/msbox.services";
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { postCalBox, getCalBox } from "@/services/calbox.servicers";

// เพิ่ม interface สำหรับ Alert Dialog
interface AlertDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

// สร้าง Alert Dialog Component
const AlertDialog = ({ isOpen, title, message, type, onClose }: AlertDialogProps) => {
    const bgColor = {
        success: 'bg-green-50',
        error: 'bg-red-50',
        info: 'bg-blue-50'
    }[type];

    const iconColor = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500'
    }[type];

    const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

    return (
        <Dialog.Root open={isOpen}>
            <Dialog.Content className={`${bgColor} p-6 rounded-xl shadow-lg max-w-md mx-auto`}>
                <div className="flex items-start gap-4">
                    <Icon className={`${iconColor} w-6 h-6 mt-1`} />
                    <div className="flex-1">
                        <Dialog.Title className="text-xl font-semibold mb-2">{title}</Dialog.Title>
                        <div className="text-gray-600 mb-6">{message}</div>
                        <div className="flex justify-end">
                            <Button
                                onClick={onClose}
                                className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

interface BoxItem {
    productId: any;
    productName: any;
    productCode: any;
    quantity: number;
}

const CalculationProductAndBox = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const documentProductNo = location.state?.documentProductNo || "ไม่พบข้อมูล";
    const calculationType = location.state?.calculationType || "mixed"; // ค่าเริ่มต้นเป็น mixed ถ้าไม่ได้ระบุ

    // Store calculation type in localStorage for use in dialog components
    useEffect(() => {
        if (calculationType) {
            localStorage.setItem('calculationType', calculationType);
        }

        // Clean up when component unmounts
        return () => {
            localStorage.removeItem('calculationType');
        };
    }, [calculationType]);

    // State เก็บข้อมูลสินค้า
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [selectedBoxs, setSelectedBoxs] = useState<any[]>([]);
    const [calculationResults, setCalculationResults] = useState<any[]>([]); // ใช้สำหรับเก็บผลคำนวณที่แสดงในตาราง

    // State สำหรับ Alert Dialog
    const [alertDialog, setAlertDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // โหลดข้อมูลสินค้าที่เคยเลือกไว้จาก localStorage เมื่อเริ่มต้น
    useEffect(() => {
        if (documentProductNo) {
            const savedProducts = localStorage.getItem(`selectedProducts_${documentProductNo}`);
            if (savedProducts) {
                console.log("Loaded products from localStorage:", JSON.parse(savedProducts));
                setSelectedProducts(JSON.parse(savedProducts));
            }

            const savedBoxs = localStorage.getItem(`selectedBoxs_${documentProductNo}`);
            if (savedBoxs) {
                console.log("Loaded boxes from localStorage:", JSON.parse(savedBoxs));
                setSelectedBoxs(JSON.parse(savedBoxs));
            }
        }
    }, [documentProductNo]);


    // บันทึกข้อมูลสินค้าที่เลือกลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
    useEffect(() => {
        if (documentProductNo) {
            if (selectedProducts.length > 0) {
                localStorage.setItem(`selectedProducts_${documentProductNo}`, JSON.stringify(selectedProducts));
            } else {
                localStorage.removeItem(`selectedProducts_${documentProductNo}`);
            }
        }
    }, [selectedProducts, documentProductNo]);

    useEffect(() => {
        if (documentProductNo) {
            if (selectedBoxs.length > 0) {
                localStorage.setItem(`selectedBoxs_${documentProductNo}`, JSON.stringify(selectedBoxs));
            } else {
                localStorage.removeItem(`selectedBoxs_${documentProductNo}`);
            }
        }
    }, [selectedBoxs, documentProductNo]);

    // ฟังก์ชันสำหรับแสดง Alert
    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setAlertDialog({
            isOpen: true,
            title,
            message,
            type
        });
    };

    const handleCalculation = () => {
        if (selectedProducts.length === 0) {
            showAlert(
                'Missing Information',
                'Please select at least one product before calculating.',
                'error'
            );
            return;
        }

        // ตรวจสอบเงื่อนไขเฉพาะสำหรับโหมด Single
        if (calculationType === "single") {
            // Check if all products can fit in a single box
            const totalProductVolume = selectedProducts.reduce((total, product) => {
                return total + (product.cubic_centimeter_product * product.count);
            }, 0);

            const selectedBox = selectedBoxs[0];
            if (!selectedBox) {
                showAlert(
                    'Missing Box',
                    'Please select a box for calculation.',
                    'error'
                );
                return;
            }
        }

        // เตรียมข้อมูลสินค้าและกล่อง
        const products = selectedProducts.map((product, index) => ({
            ...product,
            id: product.master_product_id,
            name: product.master_product_name,
            width: product.width,
            length: product.length,
            height: product.height,
            volume: product.cubic_centimeter_product,
            totalCount: product.count,
            remainingCount: product.count,
            code: product.code_product,
            originalOrder: index // เก็บลำดับเดิมไว้
        }));

        // ถ้าไม่มีกล่องที่เลือก ให้แสดงเฉพาะรายการสินค้า
        if (selectedBoxs.length === 0) {
            const result = products.map(product => ({
                productName: product.name,
                productCode: product.code,
                dimensions: `${product.width}×${product.length}×${product.height}`,
                volume: product.volume,
                count: product.totalCount,
                boxRequired: 'Not assigned'
            }));
            setCalculationResults(result);
            return;
        }

        const boxes = selectedBoxs.map(box => ({
            ...box,
            id: box.master_box_id,
            name: box.master_box_name,
            width: box.width,
            length: box.length,
            height: box.height,
            volume: box.cubic_centimeter_box,
            code: box.code_box
        }));

        const packedBoxesResult: any[] = [];
        let boxInstanceCounter = 0;
        let currentBoxIndex = 0;
        let totalItemsPackedOverall = 0;

        // ลูปตามลำดับสินค้าที่เลือก
        while (products.some(p => p.remainingCount > 0)) {
            // หาสินค้าถัดไปที่ยังไม่ได้บรรจุทั้งหมด ตามลำดับเดิม
            const productToPack = products.find(p => p.remainingCount > 0);
            if (!productToPack) break;

            const currentBox = boxes[currentBoxIndex];
            const maxItemsInCurrentBox = Math.floor(currentBox.volume / productToPack.volume);

            if (maxItemsInCurrentBox > 0) {
                // สร้างกล่องใหม่
                boxInstanceCounter++;
                const currentBoxInstance: {
                    boxTypeId: any;
                    boxTypeName: any;
                    boxCode: any;
                    boxVolume: any;
                    no: number;
                    items: BoxItem[];
                    usedVolume: number;
                    remainingVolume: number;
                } = {
                    boxTypeId: currentBox.id,
                    boxTypeName: currentBox.name,
                    boxCode: currentBox.code,
                    boxVolume: currentBox.volume,
                    no: boxInstanceCounter,
                    items: [],
                    usedVolume: 0,
                    remainingVolume: currentBox.volume
                };

                // ใส่สินค้าหลักลงในกล่อง
                const qtyToAdd = Math.min(productToPack.remainingCount, maxItemsInCurrentBox);
                currentBoxInstance.items.push({
                    productId: productToPack.id,
                    productName: productToPack.name,
                    productCode: productToPack.code,
                    quantity: qtyToAdd
                });

                const volumeAdded = qtyToAdd * productToPack.volume;
                currentBoxInstance.usedVolume += volumeAdded;
                currentBoxInstance.remainingVolume -= volumeAdded;
                productToPack.remainingCount -= qtyToAdd;
                totalItemsPackedOverall += qtyToAdd;

                // ในโหมด single ไม่ต้องพยายามเติมสินค้าอื่น
                if (calculationType !== "single") {
                    // พยายามเติมพื้นที่ที่เหลือด้วยสินค้าถัดไปตามลำดับ
                    if (currentBoxInstance.remainingVolume > 0) {
                        for (const nextProduct of products) {
                            if (nextProduct.remainingCount > 0 &&
                                nextProduct.id !== productToPack.id &&
                                nextProduct.volume <= currentBoxInstance.remainingVolume) {

                                const maxAdditionalItems = Math.floor(currentBoxInstance.remainingVolume / nextProduct.volume);
                                const qtyToAddNext = Math.min(nextProduct.remainingCount, maxAdditionalItems);

                                if (qtyToAddNext > 0) {
                                    currentBoxInstance.items.push({
                                        productId: nextProduct.id,
                                        productName: nextProduct.name,
                                        productCode: nextProduct.code,
                                        quantity: qtyToAddNext
                                    });

                                    const additionalVolume = qtyToAddNext * nextProduct.volume;
                                    currentBoxInstance.usedVolume += additionalVolume;
                                    currentBoxInstance.remainingVolume -= additionalVolume;
                                    nextProduct.remainingCount -= qtyToAddNext;
                                    totalItemsPackedOverall += qtyToAddNext;
                                }
                            }
                        }
                    }
                }

                packedBoxesResult.push(currentBoxInstance);
            } else {
                // ถ้าสินค้าไม่สามารถใส่ในกล่องปัจจุบันได้ ให้เปลี่ยนไปใช้กล่องถัดไป
                currentBoxIndex = (currentBoxIndex + 1) % boxes.length;
                if (currentBoxIndex === 0) {
                    // ถ้าลองทุกกล่องแล้วยังใส่ไม่ได้
                    showAlert(
                        'Volume Error',
                        `Product "${productToPack.name}" is too large for any available box.`,
                        'error'
                    );
                    break;
                }
                continue;
            }
        }

        // แปลงผลลัพธ์ให้เข้ากับรูปแบบที่ต้องการแสดงผล
        const calculationResultsFormatted = [];
        for (const box of packedBoxesResult) {
            for (const item of box.items) {
                calculationResultsFormatted.push({
                    no: box.no,
                    boxCode: box.boxCode,
                    boxName: box.boxTypeName,
                    productName: item.productName,
                    productCode: item.productCode,
                    productCountPerBox: item.quantity,
                    documentProductNo: documentProductNo
                });
            }
        }

        setCalculationResults(calculationResultsFormatted);

        // แสดงผลสรุป
        if (products.some(p => p.remainingCount > 0)) {
            const unpackedProducts = products
                .filter(p => p.remainingCount > 0)
                .map(p => `${p.name} (${p.remainingCount} remaining)`);
            showAlert(
                'Incomplete Packing',
                `Some products could not be packed: ${unpackedProducts.join(', ')}`,
                'info'
            );
        } else {
            showAlert(
                'Calculation Complete',
                `Successfully packed all products into ${boxInstanceCounter} boxes.`,
                'success'
            );
        }
    };

    const moveItem = (list: any[], index: number, direction: "up" | "down") => {
        const newList = [...list];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newList.length) return newList;
        [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
        return newList;
    };

    const handleMoveProduct = async (index: number, direction: "up" | "down") => {
        let updatedProducts = moveItem(selectedProducts, index, direction);

        // อัปเดตค่า sort_by ใหม่ให้ถูกต้อง
        updatedProducts = updatedProducts.map((product, i) => ({
            ...product,
            sort_by: i + 1, // กำหนดค่าลำดับใหม่
        }));

        setSelectedProducts(updatedProducts);

        try {
            // ส่ง API request เฉพาะ `sort_by` และ `master_product_id`
            await Promise.all(
                updatedProducts.map(product =>
                    patchMsproduct(product as any)
                )
            );
        } catch (error) {
            console.error("Failed to update product order:", error);
        }
    };


    // ฟังก์ชันลบสินค้าออกจากรายการที่เลือก
    const handleRemoveProduct = (productId: number) => {
        setSelectedProducts(prev => prev.filter(item => item.master_product_id !== productId));
    };

    const handleRemoveBox = (boxId: number) => {
        setSelectedBoxs(prev => prev.filter(item => item.master_box_id !== boxId));
    };

    useEffect(() => {
        if (!documentProductNo) return;
        // Ensure document number has parentheses
        const formattedDocNo = documentProductNo.startsWith("(") ? documentProductNo : `(${documentProductNo})`;
        // ดึงข้อมูลจากฐานข้อมูล cal_box
        getCalBox(formattedDocNo).then((res) => {
            if (res && res.success && Array.isArray(res.responseObject)) {
                // กรองข้อมูลเฉพาะที่ตรงกับ documentProductNo ปัจจุบัน
                const filteredData = res.responseObject.filter(
                    (item: any) => item.document_product_no === formattedDocNo
                );

                // map ข้อมูลให้ตรงกับ calculationResults
                const formatted = filteredData.map((item: any, idx: number) => ({
                    no: item.box_no,
                    boxCode: item.code_box,
                    boxName: item.master_box_name,
                    productName: item.master_product_name,
                    productCode: item.code_product,
                    productCountPerBox: item.count,
                    documentProductNo: item.document_product_no,
                }));

                setCalculationResults(formatted);
            }
        });
    }, [documentProductNo]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        {calculationType === "single" ? "Single Box Calculation" : "Mixed Box Calculation"}
                    </h2>

                    {/* Document Number Display */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Document Number</label>
                        <div className="text-lg font-medium text-gray-800">{documentProductNo}</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Product List</h3>
                            <DialogProduct
                                selectedProducts={selectedProducts}
                                setSelectedProducts={setSelectedProducts}
                                getMsproductData={getMsproduct}
                                selectedBoxes={selectedBoxs}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <Table.Root className="w-full">
                                <Table.Header className="bg-gray-50">
                                    <Table.Row>
                                        <Table.ColumnHeaderCell className="font-semibold">No.</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Code</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Name</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Scale</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Volume (cm³)</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Count</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Order</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Action</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {selectedProducts.length > 0 ? (
                                        selectedProducts.map((product, index) => (
                                            <Table.Row key={product.master_product_id} className="hover:bg-gray-50">
                                                <Table.RowHeaderCell>{product.sort_by}</Table.RowHeaderCell>
                                                <Table.Cell>{product.code_product}</Table.Cell>
                                                <Table.Cell>{product.master_product_name}</Table.Cell>
                                                <Table.Cell className="text-right">{product.width} × {product.length} × {product.height}</Table.Cell>
                                                <Table.Cell className="text-right">{(product.cubic_centimeter_product).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</Table.Cell>
                                                <Table.Cell className="text-right">{product.count}</Table.Cell>
                                                <Table.Cell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleMoveProduct(index, "up")}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200"
                                                        >
                                                            <ArrowUp size={16} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleMoveProduct(index, "down")}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200"
                                                        >
                                                            <ArrowDown size={16} />
                                                        </Button>
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Button
                                                        onClick={() => handleRemoveProduct(product.master_product_id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                                                    >
                                                        Remove
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))
                                    ) : (
                                        <Table.Row>
                                            <Table.Cell colSpan={8} className="text-center py-8 text-gray-500">
                                                No products selected
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </div>
                    </div>

                    {/* Box Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Box List</h3>
                            <DialogBox
                                selectedBoxes={selectedBoxs}
                                setSelectedBoxes={setSelectedBoxs}
                                getMsboxData={getMsbox}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <Table.Root className="w-full">
                                <Table.Header className="bg-gray-50">
                                    <Table.Row>
                                        <Table.ColumnHeaderCell className="font-semibold">No.</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Code</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Name</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Scale</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Volume (cm³)</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold">Action</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {selectedBoxs.length > 0 ? (
                                        selectedBoxs.map((box, idx) => (
                                            <Table.Row key={box.master_box_id} className="hover:bg-gray-50">
                                                <Table.RowHeaderCell>{idx + 1}</Table.RowHeaderCell>
                                                <Table.Cell>{box.code_box}</Table.Cell>
                                                <Table.Cell>{box.master_box_name}</Table.Cell>
                                                <Table.Cell className="text-right">{box.width} × {box.height} × {box.length}</Table.Cell>
                                                <Table.Cell className="text-right">{(box.cubic_centimeter_box).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</Table.Cell>
                                                <Table.Cell>
                                                    <Button
                                                        onClick={() => handleRemoveBox(box.master_box_id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                                                    >
                                                        Remove
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))
                                    ) : (
                                        <Table.Row>
                                            <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
                                                No boxes selected
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </div>
                    </div>
                </div>

                {/* Calculation Section */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Calculation Results</h3>
                            <p className="text-gray-600 mt-1">Summary of products distribution in boxes</p>
                        </div>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-lg font-semibold shadow-md"
                            onClick={handleCalculation}
                        >
                            Calculate
                        </Button>
                    </div>

                    {calculationResults.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* สรุปจำนวนกล่องทั้งหมด */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-blue-700">Total Boxes</h4>
                                    <p className="text-2xl font-bold text-blue-800">
                                        {new Set(calculationResults.map(item => item.no)).size}
                                    </p>
                                </div>
                            </div>

                            {/* สรุปจำนวนสินค้าทั้งหมด */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex items-center">
                                <div className="bg-green-100 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-green-700">Total Products</h4>
                                    <p className="text-2xl font-bold text-green-800">
                                        {calculationResults.reduce((sum, item) => sum + item.productCountPerBox, 0)}
                                    </p>
                                </div>
                            </div>

                            {/* สรุปประเภทกล่องที่ใช้ */}
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                        <path d="M3 3v18h18"></path>
                                        <path d="M18 17V9"></path>
                                        <path d="M13 17V5"></path>
                                        <path d="M8 17v-3"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-purple-700">Box Types Used</h4>
                                    <p className="text-2xl font-bold text-purple-800">
                                        {new Set(calculationResults.map(item => item.boxCode)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <Table.Root className="w-full">
                            <Table.Header>
                                <Table.Row className="bg-gray-100">
                                    <Table.ColumnHeaderCell className="font-semibold text-gray-800 px-6 py-4 w-24 text-center">Box No.</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="font-semibold text-gray-800 px-6 py-4 w-32">Box Code</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="font-semibold text-gray-800 px-6 py-4 w-48">Box Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="font-semibold text-gray-800 px-6 py-4 w-48">Product</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="font-semibold text-gray-800 px-6 py-4 w-32">Product Code</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="font-semibold text-gray-800 px-6 py-4 w-32 text-center">Products per Box</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {calculationResults.length > 0 ? (
                                    (() => {
                                        // จัดกลุ่มผลลัพธ์ตามหมายเลขกล่อง
                                        const groupedResults = calculationResults.reduce((acc: Record<number, any[]>, result) => {
                                            if (!acc[result.no]) {
                                                acc[result.no] = [];
                                            }
                                            acc[result.no].push(result);
                                            return acc;
                                        }, {} as Record<number, any[]>);

                                        // สลับสีพื้นหลังกล่อง: เขียวอ่อน และ เทาอ่อน
                                        const boxColors = [
                                            'bg-write-50',
                                            'bg-gray-50'
                                        ];

                                        return Object.entries(groupedResults).map(([boxNo, items], boxIndex) => (
                                            items.map((result, itemIndex) => {
                                                const isFirstItemInBox = itemIndex === 0;

                                                return (
                                                    <Table.Row
                                                        key={`${boxNo}-${itemIndex}`}
                                                        className={`${boxColors[boxIndex % boxColors.length]} hover:bg-opacity-70 transition-colors duration-150`}
                                                    >
                                                        <Table.Cell className={`px-6 py-4 text-center font-medium ${!isFirstItemInBox ? 'text-transparent' : ''} ${isFirstItemInBox ? 'border-t border-gray-200' : ''}`}>
                                                            {isFirstItemInBox ? result.no : ''}
                                                        </Table.Cell>
                                                        <Table.Cell className={`px-6 py-4 font-mono ${!isFirstItemInBox ? 'text-transparent' : ''}`}>
                                                            {isFirstItemInBox ? result.boxCode : ''}
                                                        </Table.Cell>
                                                        <Table.Cell className={`px-6 py-4 ${!isFirstItemInBox ? 'text-transparent' : ''}`}>
                                                            {isFirstItemInBox ? result.boxName : ''}
                                                        </Table.Cell>
                                                        <Table.Cell className="px-6 py-4 font-medium">{result.productName}</Table.Cell>
                                                        <Table.Cell className="px-6 py-4 font-mono">{result.productCode}</Table.Cell>
                                                        <Table.Cell className="px-6 py-4 text-center font-medium">
                                                            <span className="bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                                                                {result.productCountPerBox}
                                                            </span>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                );
                                            })
                                        )).flat();
                                    })()
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={6} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                                </svg>
                                                <span className="text-lg">No calculation results available</span>
                                                <span className="text-sm">Click Calculate button to see the results</span>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </div>

                    {calculationResults.length > 0 && (
                        <div className="mt-6 flex justify-end">
                            <Button
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md"
                                onClick={async () => {
                                    try {
                                        console.log('Exported:', calculationResults);
                                        // Export each calculation result to the database
                                        for (const result of calculationResults) {
                                            await postCalBox({
                                                box_no: result.no,
                                                master_box_name: result.boxName,
                                                code_box: result.boxCode,
                                                master_product_name: result.productName,
                                                code_product: result.productCode,
                                                cubic_centimeter_box: selectedBoxs.find(box => box.code_box === result.boxCode)?.cubic_centimeter_box || 0,
                                                count: result.productCountPerBox,
                                                document_product_no: result.documentProductNo
                                            });

                                        }
                                        showAlert(
                                            'Export Success',
                                            'Calculation results have been saved to the database successfully.',
                                            'success'
                                        );
                                    } catch (error) {
                                        console.error('Export error:', error);
                                        showAlert(
                                            'Export Failed',
                                            'Failed to save calculation results to the database. Please try again.',
                                            'error'
                                        );
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Save
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Alert Dialog */}
            <AlertDialog
                isOpen={alertDialog.isOpen}
                title={alertDialog.title}
                message={alertDialog.message}
                type={alertDialog.type}
                onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default CalculationProductAndBox;