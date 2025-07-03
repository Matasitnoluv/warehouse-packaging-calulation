import React, { useEffect, useState } from 'react';
import { Table, Card, Button, AlertDialog } from "@radix-ui/themes";
import { getShelfBoxStorage, storeMultipleBoxes } from '@/services/shelfBoxStorage.services';
import { getMsshelf } from '@/services/msshelf.services';

interface CalculationSummaryProps {
    selectedZone: string;
    selectedDocument: string;
    onCalculate: () => void;
}

interface BoxPlacement {
    shelf_id: string;
    shelf_name: string;
    box_id: string;
    box_name: string;
    cubic_centimeter: number;
    count: number;
    status: 'success' | 'error';
    message?: string;
}

const CalculationSummary: React.FC<CalculationSummaryProps> = ({
    selectedZone,
    selectedDocument,
    onCalculate
}) => {
    const [boxPlacements, setBoxPlacements] = useState<BoxPlacement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleCalculate = async () => {
        if (!selectedZone || !selectedDocument) {
            setError('Please select both zone and document');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Get all shelves in the zone
            const shelvesResponse = await getMsshelf(selectedZone);
            const shelves = shelvesResponse.responseObject || [];

            // Get boxes for the document
            const boxesResponse = await getShelfBoxStorage(selectedDocument);
            const boxes = boxesResponse.responseObject || [];

            // Calculate placements
            const placements: BoxPlacement[] = [];
            const remainingBoxes = [...boxes];

            for (const shelf of shelves) {
                const shelfVolume = shelf.cubic_centimeter_shelf || 0;
                let usedVolume = 0;

                // Try to fit boxes in this shelf
                for (let i = 0; i < remainingBoxes.length; i++) {
                    const box = remainingBoxes[i];
                    const boxVolume = box.cubic_centimeter_box * box.count;

                    if (usedVolume + boxVolume <= shelfVolume) {
                        placements.push({
                            shelf_id: shelf.master_shelf_id,
                            shelf_name: shelf.master_shelf_name,
                            box_id: box.cal_box_id,
                            box_name: box.master_box_name,
                            cubic_centimeter: boxVolume,
                            count: box.count,
                            status: 'success'
                        });
                        usedVolume += boxVolume;
                        remainingBoxes.splice(i, 1);
                        i--;
                    }
                }
            }

            // Add remaining boxes as errors
            remainingBoxes.forEach(box => {
                placements.push({
                    shelf_id: '',
                    shelf_name: 'No shelf available',
                    box_id: box.cal_box_id,
                    box_name: box.master_box_name,
                    cubic_centimeter: box.cubic_centimeter_box * box.count,
                    count: box.count,
                    status: 'error',
                    message: 'No shelf with sufficient space available'
                });
            });

            setBoxPlacements(placements);

            // If there are successful placements, save them
            const successfulPlacements = placements.filter(p => p.status === 'success');
            if (successfulPlacements.length > 0) {
                const groupedPayload: { [key: string]: any } = {};
                for (const item of successfulPlacements) {
                    const key = `${item.shelf_id}_${item.box_id}`;
                    if (!groupedPayload[key]) {
                        groupedPayload[key] = { ...item };
                    } else {
                        groupedPayload[key].count += item.count;
                    }
                }
                const finalPayload = Object.values(groupedPayload);
                //console.log('Final payload to DB:', finalPayload);
                const response = await storeMultipleBoxes(finalPayload);
                setAlertMessage('Boxes have been successfully stored in shelves');
                setShowAlert(true);
            }

        } catch (error) {
            console.error('Error calculating box placement:', error);
            setError('Failed to calculate box placements');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Calculation Summary</h3>
                    <Button
                        onClick={handleCalculate}
                        disabled={loading || !selectedZone || !selectedDocument}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                        {loading ? 'Calculating...' : 'Calculate'}
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>Shelf</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Box</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Volume (cm³)</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Count</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {boxPlacements.map((placement, index) => (
                                <Table.Row key={index}>
                                    <Table.Cell>{placement.shelf_name}</Table.Cell>
                                    <Table.Cell>{placement.box_name}</Table.Cell>
                                    <Table.Cell>{placement.cubic_centimeter}</Table.Cell>
                                    <Table.Cell>{placement.count}</Table.Cell>
                                    <Table.Cell>
                                        <span className={`px-2 py-1 rounded-full text-sm ${placement.status === 'success'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {placement.status === 'success' ? 'Success' : 'Error'}
                                        </span>
                                        {placement.message && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                {placement.message}
                                            </div>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </div>
            </Card>

            <AlertDialog.Root open={showAlert} onOpenChange={setShowAlert}>
                <AlertDialog.Content>
                    <AlertDialog.Title>Success</AlertDialog.Title>
                    <AlertDialog.Description>
                        {alertMessage}
                    </AlertDialog.Description>
                    <div className="mt-4 flex justify-end">
                        <AlertDialog.Cancel>
                            <Button>Close</Button>
                        </AlertDialog.Cancel>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </div>
    );
};

export default CalculationSummary; 