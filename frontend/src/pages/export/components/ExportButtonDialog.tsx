import { useState } from "react";
import { updateStoredBox } from "@/services/shelfBoxStorage.services";
import { Dialog, Button } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";

export const ExportButtonDialog = ({ storage_id, wareHouse, zone }: { storage_id: string, wareHouse: string, zone: string }) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const handleSave = async () => {
        try {
            await updateStoredBox(storage_id, {
                export: true,
                export_date: new Date().toISOString(),
            });
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ["export", wareHouse, zone], });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger >
                <Button>Export</Button>
            </Dialog.Trigger>

            <Dialog.Content>
                <Dialog.Title>Export Data</Dialog.Title>
                <Dialog.Description>
                    Please review the export settings before proceeding.
                </Dialog.Description>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 25, gap: 10 }}>
                    <Dialog.Close >
                        <Button color="gray">Close</Button>
                    </Dialog.Close>

                    <Button color="green" onClick={handleSave}>
                        Export
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
