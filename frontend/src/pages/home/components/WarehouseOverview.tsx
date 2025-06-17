// @ts-nocheck
/* eslint-disable */
/* tslint:disable */
import React from 'react';
import { Flex, Text, Badge } from '@radix-ui/themes';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const WarehouseOverview = ({ warehouseData, zoneData, rackData, shelfData, boxData }) => {
  // Calculate total volumes and usage
  const calculateTotalVolumes = () => {
    // ... calculation logic
  };

  const { totalWarehouseVolume, usedVolume, remainingVolume, usagePercentage } = calculateTotalVolumes();

  const pieData = [
    { name: 'Used Space', value: usedVolume },
    { name: 'Free Space', value: remainingVolume },
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <Flex direction="row" gap="6">
      <div className="w-1/2">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text size="5" weight="bold">Warehouse Usage</Text>
            <Badge size="2" color="green">{usagePercentage.toFixed(2)}% Used</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Volume:</span>
              <span>{totalWarehouseVolume.toLocaleString()} cm³</span>
            </div>
            <div className="flex justify-between">
              <span>Used Volume:</span>
              <span>{usedVolume.toLocaleString()} cm³</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Volume:</span>
              <span className="text-green-600">{remainingVolume.toLocaleString()} cm³</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Warehouses:</span>
              <span>{warehouseData.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Zones:</span>
              <span>{zoneData.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Racks:</span>
              <span>{rackData.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Shelves:</span>
              <span>{shelfData.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Stored Boxes:</span>
              <span>{boxData.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString() + ' cm³'} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Flex>
  );
};

export default WarehouseOverview;