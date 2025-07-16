import { Button, ButtonProps, Dialog, Flex } from "@radix-ui/themes";
import { useState } from "react";

type DialogSaveCalwarehouseProps = ButtonProps & {
  children: React.ReactNode;
  onConfirm: () => void; // ให้ parent ส่ง callback มาเมื่อกด Save
};

const DialogSaveCalwarehouse = (props: DialogSaveCalwarehouseProps) => {
  const { children, onConfirm, ...buttonProps } = props;
  const [open, setOpen] = useState(false);
  const handleSaveCalWarehouse = () => {
    onConfirm?.(); // เรียกฟังก์ชัน save จาก parent
    setOpen(false); // ปิด dialog
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>

      <Dialog.Content className="max-w-md p-6 rounded-xl shadow-2xl bg-white">
        <Dialog.Title className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          Confirm Save
        </Dialog.Title>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Do you want to save this calculation to the warehouse shelf storage?
          </div>
        </div>

        <Flex gap="3" mt="6" justify="end">
          <Button
            onClick={() => setOpen(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCalWarehouse}
            className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors"
          >
            Save
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DialogSaveCalwarehouse;
