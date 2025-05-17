import { deleteBox } from "@/services/msbox.services";
import { Text, Dialog, Button, Flex, Strong } from "@radix-ui/themes";

type DialogMsboxProps = {
    getMsboxData: () => void;
    master_box_id: string;
    master_box_name: string;
    onDeleteSuccess: () => void;
}

const AlertDialogDelete = ({ getMsboxData, master_box_id, master_box_name, onDeleteSuccess }: DialogMsboxProps) => {
    const handleDeleteMsbox = async () => {
        try {
            await deleteBox({
                master_box_id: master_box_id,
            })
                .then((response) => {
                    if (response.statusCode === 200) {
                        onDeleteSuccess();
                        getMsboxData();
                    } else if (response.statusCode === 400) {
                        alert(response.message);
                    } else {
                        alert("Unexpected error: " + response.message);
                    }
                })
                .catch((error) => {
                    console.error("Error Delete box", error.response?.date || error.message);
                    alert("Failed to Delete box. Please try again");
                });
        } catch (error) {
            console.error("Error Delete box", error);
        }
    };
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button className="bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors" size="2" variant="soft">Delete</Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Delete Box</Dialog.Title>
                <Flex direction="column" gap="3">
                    <label>
                        <Text size="2">Id : <Strong>{master_box_id}</Strong></Text>
                    </label>
                    <label>
                        <Text size="2"> <Strong> Before Box name : </Strong>{master_box_name}</Text>
                    </label>
                </Flex>
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button onClick={handleDeleteMsbox} className="bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors">Confirm</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
};

export default AlertDialogDelete;
