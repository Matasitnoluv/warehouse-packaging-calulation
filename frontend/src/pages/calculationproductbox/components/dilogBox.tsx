import { useEffect, useState } from "react";
import { Dialog, Button, Table } from "@radix-ui/themes";
import { TypeMsboxAll } from "@/types/response/reponse.msbox";
import { patchMsbox, getBoxes } from "@/services/msbox.services";

const DialogBox = ({
    selectedBoxes,
    setSelectedBoxes,
    getMsboxData
}: {
    selectedBoxes: TypeMsboxAll[];
    setSelectedBoxes: (boxes: TypeMsboxAll[]) => void;
    getMsboxData: () => Promise<void>;
}) => {
    const [msbox, setMsbox] = useState<TypeMsboxAll[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearchTerm, setActiveSearchTerm] = useState("");

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                const response = await getMsboxData();
                if (response?.responseObject) {
                    setMsbox(response.responseObject);
                }
            } catch (error) {
                console.error("Error fetching boxes:", error);
            }
        };
        fetchBoxes();
    }, [getMsboxData]);

    const handleSelectBox = async (box: TypeMsboxAll) => {
        if (!box) return;

        console.log("[DialogBox] Box selected:", box);

        setSelectedBoxes((prev) => [...prev, box]);

        // 1. Save box (patchMsbox) ถ้าต้องการ
        // await patchMsbox(box); // (คอมเมนต์ไว้ถ้าไม่ต้องการ save)

        // 2. Refresh box list
        const result = await getMsboxData();
        console.log("[DialogBox] getMsboxData result:", result);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        setActiveSearchTerm(searchTerm);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const filteredBoxs = msbox.filter(box => {
        const alreadySelected = (selectedBoxes ?? []).some(
            selectedBox => selectedBox.master_box_id === box.master_box_id
        );
        return !alreadySelected && box.master_box_name.toLowerCase().includes(activeSearchTerm.toLowerCase());
    });

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size="2" className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded shadow-xl">
                    Box
                </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="550px">
                <Dialog.Title className="text-xl font-bold mb-2">Select Box</Dialog.Title>

                <div className="flex items-center mt-4 mb-4 relative h-10">
                    <input
                        type="text"
                        placeholder="Search box..."
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

                <Table.Root className="mt-4 w-full">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Code Box</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Name Box</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Scale Box</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Scale Box (cm³)</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className="w-20">Action</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredBoxs.length > 0 ? (
                            filteredBoxs.map((box) => (
                                <Table.Row key={box.master_box_id}>
                                    <Table.Cell>{box.code_box}</Table.Cell>
                                    <Table.Cell>{box.master_box_name}</Table.Cell>
                                    <Table.Cell>{box.width} * {box.length} * {box.height}</Table.Cell>
                                    <Table.Cell>
                                        {(box.cubic_centimeter_box).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            onClick={() => handleSelectBox(box)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded w-full"
                                        >
                                            Select
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={4} className="text-center py-4">
                                    {activeSearchTerm ? "No matching boxes found" : "All boxes have been selected"}
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>

                <div className="mt-4 flex justify-end">
                    <Dialog.Close>
                        <Button className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded shadow-xl">
                            Close
                        </Button>
                    </Dialog.Close>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogBox;
