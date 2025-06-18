import { Button } from "@radix-ui/themes";
import { useCalculateContext } from "../context/useCalculateCotext";

export const ButtonCalculate = ({ disabled }: { disabled?: boolean }) => {
    const { setShowCalculateDialog } = useCalculateContext();
    return (
        <Button onClick={() => setShowCalculateDialog(prev => !prev)} disabled={disabled}>
            Calculate
        </Button>
    )
}
