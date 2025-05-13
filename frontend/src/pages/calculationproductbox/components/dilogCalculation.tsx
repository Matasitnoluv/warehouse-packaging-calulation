import React from "react";
import { Table } from "@radix-ui/themes";

interface CalculationResult {
    master_box_name: string;
    code_box: string;
    master_product_name: string;
    code_product: string;
    cubic_centimeter_box: number;
    count: number;
}

interface DialogCalculationProps {
    calculationResults: CalculationResult[];
}

const DialogCalculation: React.FC<DialogCalculationProps> = ({ calculationResults }) => {
    return (
        <div className="bg-white p-4 border rounded shadow-md w-full max-w-7xl mt-6">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>No. box</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Code box</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>CodeProduct</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Count</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {calculationResults.length > 0 ? (
                        calculationResults.map((cal_box, index) => (
                            <Table.Row key={index}>
                                <Table.RowHeaderCell>{cal_box.master_box_name}</Table.RowHeaderCell>
                                <Table.Cell>{cal_box.code_box}</Table.Cell>
                                <Table.Cell>{cal_box.master_product_name}</Table.Cell>
                                <Table.Cell>{cal_box.code_product}</Table.Cell>
                                <Table.Cell>{cal_box.cubic_centimeter_box}</Table.Cell>
                                <Table.Cell>{cal_box.count}</Table.Cell>
                            </Table.Row>
                        ))
                    ) : (
                        <Table.Row>
                            <Table.Cell colSpan={5} className="text-center py-4">
                                No calculation results
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table.Root>
        </div>
    );
};

export default DialogCalculation;
