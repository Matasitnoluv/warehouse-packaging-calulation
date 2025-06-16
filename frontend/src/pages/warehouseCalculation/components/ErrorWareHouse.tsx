import { Card, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

export default function ErrorWareHouse({ title, message }: { title: string, message: string }) {
    const navigate = useNavigate();
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">

        <div className="max-w-7xl mx-auto">
            <Card className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-8">
                    <div className="text-red-500 text-xl mb-4">{title}</div>
                    <p className="text-gray-700">{message}</p >
                    <Button
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                </div>
            </Card>
        </div>
    </div>
}