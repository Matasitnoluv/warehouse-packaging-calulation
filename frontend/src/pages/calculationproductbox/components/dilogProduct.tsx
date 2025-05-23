import { useEffect, useState } from "react";
import { Dialog, Button, Table } from "@radix-ui/themes";
import { TypeMsproductAll } from "@/types/response/reponse.msproduct";
import { patchMsproduct, getProducts } from "@/services/msproduct.services";
import { getMsbox, getBoxes } from "@/services/msbox.services";

// นำเข้า icon จาก lucide-react หรือใช้ SVG inline
// ถ้าคุณมี lucide-react ให้ import แบบนี้:
// import { Search } from "lucide-react";

const DialogProduct = ({
    selectedProducts,
    setSelectedProducts,
    getMsproductData,
    selectedBoxes
}: {
    selectedProducts: TypeMsproductAll[];
    setSelectedProducts: () => void;
    getMsproductData: () => void;
    selectedBoxes: any[];
}) => {
    const [msproduct, setMsproduct] = useState<TypeMsproductAll[]>([]);
    const [msbox, setMsbox] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearchTerm, setActiveSearchTerm] = useState("");
    const [productCounts, setProductCounts] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products
                const productResponse = await getMsproductData();
                if (productResponse?.responseObject) {
                    const updatedProducts = productResponse.responseObject.map((product: any, index: number) => ({
                        ...product,
                        sort_by: index + 1,
                    }));
                    setMsproduct(updatedProducts);
                }

                // Fetch boxes
                const boxResponse = await getMsbox();
                if (boxResponse?.responseObject) {
                    setMsbox(boxResponse.responseObject);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [getMsproductData]);

    // เพิ่มฟังก์ชันตรวจสอบว่าสินค้าใส่ในกล่องได้หรือไม่
    const checkProductFitsInBox = (product: any, box: any) => {
        // ตรวจสอบว่ามีกล่องที่เลือกหรือไม่
        if (!box) {
            return {
                fits: false,
                message: "No box selected"
            };
        }

        // ตรวจสอบขนาด (ทุกด้านของสินค้าต้องเล็กกว่าหรือเท่ากับกล่อง)
        const productDimensions = [product.width, product.length, product.height].sort((a, b) => b - a);
        const boxDimensions = [box.width, box.length, box.height].sort((a, b) => b - a);

        // ตรวจสอบทุกด้าน
        for (let i = 0; i < 3; i++) {
            if (productDimensions[i] > boxDimensions[i]) {
                return {
                    fits: false,
                    message: `Product dimensions (${product.width}×${product.length}×${product.height}) are too large for box (${box.width}×${box.length}×${box.height})`
                };
            }
        }

        // ตรวจสอบปริมาตร
        if (product.cubic_centimeter_product > box.cubic_centimeter_box) {
            return {
                fits: false,
                message: `Product volume (${product.cubic_centimeter_product.toLocaleString()} cm³) exceeds box volume (${box.cubic_centimeter_box.toLocaleString()} cm³)`
            };
        }

        return {
            fits: true,
            message: "Product fits in the box"
        };
    };

    // ปรับปรุงฟังก์ชัน handleSelectProduct
    const handleSelectProduct = async (product: TypeMsproductAll) => {
        if (!product) return;

        // Get calculation type from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const calculationType = urlParams.get('type') || localStorage.getItem('calculationType') || 'mixed';

        // ตรวจสอบว่ามีการใส่จำนวนสินค้าหรือไม่
        const count = productCounts[product.master_product_id] || 0;
        if (count <= 0) {
            alert("Please enter product quantity");
            return;
        }

        // Add the new product to the list
        setSelectedProducts((prev: TypeMsproductAll[]) => {
            const newProduct = {
                ...product,
                count, // Add the count to the product object
                sort_by: prev.length + 1, // คำนวณ `sort_by` ใหม่ให้ต่อเนื่อง
            };

            const updatedList = [...prev, newProduct].map((item, index) => ({
                ...item,
                sort_by: index + 1, // อัปเดตลำดับให้ทุกตัว
            }));

            return updatedList;
        });

        // ถ้ามีกล่องที่เลือก ให้ตรวจสอบความเข้ากันได้
        // if (selectedBoxes.length > 0) {
        //     const fitCheck = checkProductFitsInBox(product, selectedBoxes[0]);
        //     if (!fitCheck.fits) {
        //         if (!confirm(`${fitCheck.message}\nDo you want to continue adding the product anyway?`)) {
        //             return;
        //         }
        //     }

        //     const box = selectedBoxes[0];
        //     const productsPerBox = Math.floor(box.cubic_centimeter_box / product.cubic_centimeter_product);

        //     if (count > productsPerBox) {
        //         const boxesNeeded = Math.ceil(count / productsPerBox);
        //         if (!confirm(`This product requires ${boxesNeeded} boxes for ${count} items. Each box can fit ${productsPerBox} items. Do you want to continue?`)) {
        //             return;
        //         }
        //     }
        // }

        try {
            await Promise.all(
                [product, ...selectedProducts].map((product) =>
                    patchMsproduct({
                        master_product_id: product.master_product_id,
                        master_product_name: product.master_product_name,
                        height: product.height,
                        length: product.length,
                        width: product.width,
                        cubic_centimeter_product: product.cubic_centimeter_product,
                        image: product.image,
                        sort_by: product.sort_by,
                        description: product.description,
                        code_product: product.code_product
                    })
                )
            );
            console.log("Product updated successfully");
        } catch (error) {
            console.error("Failed to update product order:", error);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        setActiveSearchTerm(searchTerm);
    };

    // ทำให้สามารถกด Enter เพื่อค้นหาได้
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const filteredProducts = msproduct.filter(product => {
        const alreadySelected = selectedProducts.some(
            selectedProduct => selectedProduct.master_product_id === product.master_product_id
        );
        return !alreadySelected && product.master_product_name.toLowerCase().includes(activeSearchTerm.toLowerCase());
    });

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size="2" className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded shadow-xl transition-all duration-200">
                    Product
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[1800px] min-h-[600px] max-h-[90vh] bg-white rounded-xl shadow-2xl p-8">
                {/* Header */}
                <div className="mb-6">
                    <Dialog.Title className="text-2xl font-bold text-gray-800">
                        Select Product
                    </Dialog.Title>
                    <p className="text-gray-600 mt-2">
                        Add products to your calculation. Box selection is optional.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex items-center mb-6 relative h-10">
                    <input
                        type="text"
                        placeholder="Search product..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full px-4 py-2 border border-gray-300 rounded-md pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-0 h-full px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                    {/* Products Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📦</span>
                            Available Products
                        </h3>
                        <div className="rounded-lg border border-gray-200">
                            <Table.Root className="w-full">
                                <Table.Header>
                                    <Table.Row className="bg-gray-50">
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-32">Code</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-96">Name</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-48">Dimensions (W×L×H)</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-40">Volume (cm³)</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-32">Count</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-32">Action</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <Table.Row key={product.master_product_id} className="hover:bg-blue-50 transition-colors duration-150">
                                                <Table.Cell className="px-4 py-3 whitespace-nowrap">{product.code_product}</Table.Cell>
                                                <Table.Cell className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis">{product.master_product_name}</Table.Cell>
                                                <Table.Cell className={`px-4 py-3 text-right font-mono whitespace-nowrap ${selectedBoxes.length > 0 && !checkProductFitsInBox(product, selectedBoxes[0]).fits
                                                    ? 'text-red-500 font-bold'
                                                    : ''
                                                    }`}>
                                                    {`${product.width}×${product.length}×${product.height}`}
                                                </Table.Cell>
                                                <Table.Cell className={`px-4 py-3 text-right font-mono whitespace-nowrap ${selectedBoxes.length > 0 && product.cubic_centimeter_product > selectedBoxes[0].cubic_centimeter_box
                                                    ? 'text-red-500 font-bold'
                                                    : ''
                                                    }`}>
                                                    {(product.cubic_centimeter_product).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                                </Table.Cell>
                                                <Table.Cell className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-24 h-8 border border-gray-300 rounded-md px-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        value={productCounts[product.master_product_id] || ""}
                                                        onChange={(e) =>
                                                            setProductCounts((prev) => ({
                                                                ...prev,
                                                                [product.master_product_id]: parseInt(e.target.value) || 0,
                                                            }))
                                                        }
                                                    />
                                                </Table.Cell>
                                                <Table.Cell className="px-4 py-3">
                                                    <Button
                                                        onClick={() => handleSelectProduct(product)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-1 rounded-md transition-colors duration-200 text-sm whitespace-nowrap w-28"
                                                    >
                                                        Select
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))
                                    ) : (
                                        <Table.Row>
                                            <Table.Cell colSpan={6} className="text-center py-8 text-gray-500">
                                                {activeSearchTerm ? "No matching products found" : "All products have been selected"}
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </div>
                    </div>

                    {/* Boxes Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📥</span>
                            Selected Boxes
                        </h3>
                        <div className="rounded-lg border border-gray-200">
                            <Table.Root className="w-full">
                                <Table.Header>
                                    <Table.Row className="bg-gray-50">
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-20">No.</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-32">Code</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-96">Name</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-48">Dimensions (W×L×H)</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell className="font-semibold text-gray-700 px-4 py-3 w-40">Volume (cm³)</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {selectedBoxes.length > 0 ? (
                                        selectedBoxes.map((box) => (
                                            <Table.Row key={box.master_box_id} className="hover:bg-blue-50 transition-colors duration-150">
                                                <Table.Cell className="px-4 py-3 whitespace-nowrap">{box.sort_by}</Table.Cell>
                                                <Table.Cell className="px-4 py-3 whitespace-nowrap">{box.code_box}</Table.Cell>
                                                <Table.Cell className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis">{box.master_box_name}</Table.Cell>
                                                <Table.Cell className="px-4 py-3 text-right font-mono whitespace-nowrap">
                                                    {`${box.width}×${box.length}×${box.height}`}
                                                </Table.Cell>
                                                <Table.Cell className="px-4 py-3 text-right font-mono whitespace-nowrap">
                                                    {(box.cubic_centimeter_box).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))
                                    ) : (
                                        <Table.Row>
                                            <Table.Cell colSpan={5} className="text-center py-8 text-gray-500">
                                                No boxes selected
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end">
                    <Dialog.Close>
                        <Button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2">
                            Close
                        </Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogProduct;