import { deleteMswarehouse } from "@/services/mswarehouse.services";
import { Text, Dialog, Button, Flex, Strong } from "@radix-ui/themes";

type DialogMswarehouseProps = {
    getMswarehouseData: () => void;
    master_warehouse_id: string;
    master_warehouse_name: string;
}

const AlertDialogDelete = ({ getMswarehouseData, master_warehouse_id, master_warehouse_name }: DialogMswarehouseProps) => {
    const handleDeleteMswarehouse = async () => {
        try {
            await deleteMswarehouse({
                master_warehouse_id: master_warehouse_id,
            })
                .then((response) => {
                    if (response.statusCode === 200) {
                        getMswarehouseData();
                        window.location.reload();
                    } else if (response.statusCode === 400) {
                        alert(response.message);
                    } else {
                        alert("Unexpected error:" + response.message);
                    }
                })
                .catch((error) => {
                    console.error("Error Delete product", error.response?.date || error.message);
                    alert("Failed to Delete product. Please try again");
                });
        } catch (error) {
            console.error("Error Delete product", error);
        }
    };
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button id="btn-delete" className="bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors" size="2" variant="soft">Delete</Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Delete Warehouse</Dialog.Title>
                <Flex direction="column" gap="3">
                    <label>
                        <Text size="2">Id : <Strong>{master_warehouse_id}</Strong></Text>
                    </label>
                    <label>
                        <Text size="2"> <Strong> Before Category name : </Strong>{master_warehouse_name}</Text>
                    </label>
                </Flex>
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button 
                        id="btn-confirm-delete"
                        onClick={handleDeleteMswarehouse} className="bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors">Confirm</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
};


export default AlertDialogDelete;