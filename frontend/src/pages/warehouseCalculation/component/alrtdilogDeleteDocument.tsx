
import { Dialog, Button, Flex, Text, Strong } from "@radix-ui/themes";
import { deleteCalWarehouse } from "@/services/calwarehouse.service";
import { Trash2, AlertTriangle } from "lucide-react";

type DialogDeleteWarehouseProps = {
    getCalWarehouseData: Function;
    document_warehouse_id: string;
    document_warehouse_no: string;
}

const AlrtdilogDeleteDocument = ({ getCalWarehouseData, document_warehouse_id }: DialogDeleteWarehouseProps) => {
    const handleDeleteCalWarehouse = async () => {
        try {
            console.log("Deleting document with ID:", document_warehouse_id);
            const response = await deleteCalWarehouse({
                document_warehouse_id: document_warehouse_id,
            });

            if (response.statusCode === 200) {
                getCalWarehouseData();
                window.location.reload();
            } else {
                alert(response.message || "Unexpected error");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                >
                    <Trash2 size={16} />
                    Delete
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="max-w-md p-6 rounded-xl shadow-2xl bg-white">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={24} />
                    Confirm Deletion
                </Dialog.Title>

                <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <Text className="text-sm text-gray-700">
                            Are you sure you want to delete this document?
                        </Text>
                        <div className="mt-2 space-y-1">
                            <Text className="text-sm text-gray-600">
                                ID: <Strong className="font-mono">{document_warehouse_id}</Strong>
                            </Text>
                            <Text className="text-sm text-gray-600">
                                Document: <Strong>{document_warehouse_id}</Strong>
                            </Text>
                        </div>
                    </div>

                    <Text className="text-sm text-red-600">
                        This action cannot be undone.
                    </Text>
                </div>

                <Flex gap="3" mt="6" justify="end">
                    <Dialog.Close>
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-all duration-200">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button
                            onClick={handleDeleteCalWarehouse}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                        >
                            <Trash2 size={16} />
                            Delete
                        </Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default AlrtdilogDeleteDocument;
