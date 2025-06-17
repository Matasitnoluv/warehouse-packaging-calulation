import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flex, Text } from '@radix-ui/themes';

interface UsageStatisticsProps {
  warehouseData: any[];
  zoneData: any[];
  rackData: any[];
  shelfData: any[];
  boxData: any[];
}

const UsageStatistics: React.FC<UsageStatisticsProps> = ({
  warehouseData,
  zoneData,
  rackData,
  shelfData,
  boxData
}) => {
  // Calculate usage statistics for pie chart
  const calculateUsageData = () => {
    // Total warehouse volume
    const totalWarehouseVolume = warehouseData.reduce((total, warehouse) => {
      return total + (warehouse.width_cm * warehouse.length_cm * warehouse.height_cm);
    }, 0);

    // Total zone volume
    const totalZoneVolume = zoneData.reduce((total, zone) => {
      return total + (zone.width_cm * zone.length_cm * zone.height_cm);
    }, 0);

    // Total rack volume
    const totalRackVolume = rackData.reduce((total, rack) => {
      return total + (rack.width_cm * rack.length_cm * rack.height_cm);
    }, 0);

    // Total shelf volume
    const totalShelfVolume = shelfData.reduce((total, shelf) => {
      return total + (shelf.cubic_centimeter_shelf || 0);
    }, 0);

    // Total used volume (from boxes)
    const totalUsedVolume = boxData.reduce((total, box) => {
      return total + (box.total_volume || 0);
    }, 0);

    // Calculate unused space in each level
    const unusedWarehouseSpace = totalWarehouseVolume - totalZoneVolume;
    const unusedZoneSpace = totalZoneVolume - totalRackVolume;
    const unusedRackSpace = totalRackVolume - totalShelfVolume;
    const unusedShelfSpace = totalShelfVolume - totalUsedVolume;

    return [
      { name: 'Used by Boxes', value: totalUsedVolume, color: '#8884d8' },
      { name: 'Unused Shelf Space', value: unusedShelfSpace, color: '#82ca9d' },
      { name: 'Unused Rack Space', value: unusedRackSpace, color: '#ffc658' },
      { name: 'Unused Zone Space', value: unusedZoneSpace, color: '#ff8042' },
      { name: 'Unused Warehouse Space', value: unusedWarehouseSpace, color: '#0088fe' }
    ];
  };

  // Generate mock trend data (in a real app, this would come from historical data)
  const generateTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
      // Create a realistic trend with some randomness
      const baseUsage = 30 + (index * 5); // Increasing trend
      const randomFactor = Math.random() * 10 - 5; // Random fluctuation
      const usage = Math.max(0, Math.min(100, baseUsage + randomFactor));

      // Mark current month
      const isCurrent = index === currentMonth;

      return {
        name: month,
        usage: usage,
        current: isCurrent
      };
    });
  };

  const usageData = calculateUsageData();
  const trendData = generateTrendData();

  return (
    <div className="space-y-6">
      <Text size="5" weight="bold">Space Utilization</Text>

      <Flex direction={{ initial: 'column', md: 'row' }} gap="6">
        {/* Pie Chart */}
        <div className="w-full md:w-1/2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={usageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                }
              >
                {usageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString() + ' cm³'} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="w-full md:w-1/2 h-80">
          <Text size="3" weight="medium" className="mb-2">Usage Trend (Last 12 Months)</Text>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="usage"
                name="Space Usage (%)"
                stroke="#8884d8"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return payload.current ? (
                    <circle cx={cx} cy={cy} r={6} fill="#8884d8" stroke="white" strokeWidth={2} />
                  ) : (
                    <circle cx={cx} cy={cy} r={4} fill="#8884d8" />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Flex>
    </div>
  );
};

export default UsageStatistics;
