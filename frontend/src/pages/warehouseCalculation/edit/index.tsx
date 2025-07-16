'use client';

import * as React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCalWarehouseEdit } from '@/services/calwarehouse.services';

type Item = {
    id: string;
    label: string;
    checked: boolean;
};

const initialItems: Item[] = [
    { id: '1', label: 'กล่องที่ 1', checked: false },
    { id: '2', label: 'กล่องที่ 2', checked: false },
    { id: '3', label: 'กล่องที่ 3', checked: false },
];

export default function MainEditCal({ warehouseId }: { warehouseId?: string }) {

    const { data, error, status } = useQuery({ enabled: !!warehouseId, queryKey: [warehouseId], queryFn: () => getCalWarehouseEdit(warehouseId!) });


    if (status === 'success' && (error || !data?.success)) {
        return <Navigate to="/404" replace />;
    }

    return (
        <>
            <PreviewWarehouseEdit />
            <SecctionDnd />
        </>
    );
}

const PreviewWarehouseEdit = () => {

    return <></>

}





export const SecctionDnd = () => {

    const [items, setItems] = React.useState(initialItems);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over?.id);
            setItems(arrayMove(items, oldIndex, newIndex));
        }
    };

    const toggleChecked = (id: string) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
        );
    };
    return <div className="w-full max-w-md mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">แก้ไขรายการกล่อง</h1>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {items.map((item) => (
                        <SortableItem key={item.id} item={item} toggleChecked={toggleChecked} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    </div>
}

function SortableItem({
    item,
    toggleChecked,
}: {
    item: Item;
    toggleChecked: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={clsx(
                'flex items-center justify-between rounded-md border p-3 bg-white shadow-sm hover:shadow',
                item.checked && 'border-green-500 bg-green-50'
            )}
        >
            <div className="flex items-center space-x-2">
                <Checkbox.Root
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={() => toggleChecked(item.id)}
                    className="h-5 w-5 rounded border border-gray-400 bg-white data-[state=checked]:bg-green-600"
                >
                    <Checkbox.Indicator className="text-white">
                        <CheckIcon />
                    </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor={item.id} className="text-sm font-medium">
                    {item.label}
                </label>
            </div>
        </div>
    );
}
