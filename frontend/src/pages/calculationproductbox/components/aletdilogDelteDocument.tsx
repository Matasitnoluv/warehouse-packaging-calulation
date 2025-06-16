import { deleteCalProduct } from "@/services/calmsproduct.services"
import { Text, Dialog, Button, Flex, Strong } from "@radix-ui/themes";
import { Trash2, AlertTriangle } from "lucide-react";

type DialogCalMsproductProps = {
    getCalMsproductData: Function;
    document_product_id: string;
    document_product_no: string;
}

const AlertDialogDelete = ({ getCalMsproductData, document_product_id, document_product_no }: DialogCalMsproductProps) => {
    const handleDeleteCalMsproduct = async () => {
        try {
            //console.log("Deleting document with ID:", document_product_id);
            const response = await deleteCalProduct({
                document_product_id: document_product_id,
            });

            if (response.statusCode === 200) {
                getCalMsproductData();
                window.location.reload();
            } else {
                alert(response.message || "Unexpected error");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete document. Please try again");
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
                                ID: <Strong className="font-mono">{document_product_id}</Strong>
                            </Text>
                            <Text className="text-sm text-gray-600">
                                Document: <Strong>{document_product_no}</Strong>
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
                            onClick={handleDeleteCalMsproduct}
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

export default AlertDialogDelete;