import { useState, ReactNode } from "react";
import { Dialog, Button, Card, Flex, Box, Text } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

interface DialogSelectCalculationModeProps {
  triggerButtonText?: ReactNode;
}

const DialogSelectCalculationMode = ({ triggerButtonText = "Calculation" }: DialogSelectCalculationModeProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Define calculation modes
  const calculationModes = [
    {
      id: "single",
      name: "คำนวณกล่องแบบ Single",
      description: "คำนวณกล่องแบบเดี่ยว สำหรับสินค้าประเภทเดียวกัน",
      color: "blue",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      ),
      route: "/calculationProductAndBoxTableSingle"
    },
    {
      id: "mixed",
      name: "คำนวณกล่องแบบ Mixed",
      description: "คำนวณกล่องแบบผสม สำหรับสินค้าหลายประเภทรวมกัน",
      color: "green",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      route: "/calculationProductAndBoxTableMixed"
    }
  ];

  const handleModeSelect = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        {typeof triggerButtonText === 'string' ? (
          <Button
            size="3"
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            {triggerButtonText}
          </Button>
        ) : (
          triggerButtonText
        )}
      </Dialog.Trigger>

      <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-3xl">
        <Dialog.Title className="text-2xl font-bold mb-2">เลือกโหมดการคำนวณกล่อง</Dialog.Title>
        <Dialog.Description className="text-gray-600 mb-6">
          กรุณาเลือกโหมดการคำนวณกล่องที่ต้องการ เพื่อดำเนินการต่อ
        </Dialog.Description>

        <div className="grid grid-cols-1 gap-6">
          {calculationModes.map((mode) => (
            <Card
              key={mode.id}
              className="p-0 overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleModeSelect(mode.route)}
            >
              <Flex>
                {/* Left side with mode icon */}
                <Box className={`bg-${mode.color}-50 w-24 flex items-center justify-center p-4`} style={{ backgroundColor: mode.color === 'blue' ? '#eff6ff' : '#f0fdf4' }}>
                  <div className={`text-${mode.color}-500`} style={{ color: mode.color === 'blue' ? '#3b82f6' : '#22c55e' }}>
                    {mode.icon}
                  </div>
                </Box>

                {/* Main content */}
                <Box className="p-5 flex-grow">
                  <Flex justify="between" align="start">
                    <Box>
                      <Text className="text-lg font-bold text-gray-800">{mode.name}</Text>
                      <Text className="text-sm text-gray-500 mt-2">{mode.description}</Text>
                    </Box>
                  </Flex>

                  <Flex justify="end" className="mt-4">
                    <Button
                      size="2"
                      className={`bg-${mode.color}-500 hover:bg-${mode.color}-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200`}
                      style={{
                        backgroundColor: mode.color === 'blue' ? '#3b82f6' : '#22c55e'
                      }}
                    >
                      Select Mode
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Dialog.Close>
            <Button
              size="2"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded"
            >
              ยกเลิก
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DialogSelectCalculationMode;
