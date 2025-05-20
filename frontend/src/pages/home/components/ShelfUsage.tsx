import React from 'react';
import { Card, Flex, Text, Badge } from '@radix-ui/themes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ShelfUsageProps {
  shelfData: any[];
  boxData: any[];
  loading: boolean;
}

const ShelfUsage: React.FC<ShelfUsageProps> = ({ shelfData, boxData, loading }) => {
  // Calculate shelf usage statistics
  const calculateShelfStats = () => {
    if (!shelfData || shelfData.length === 0) {
      return {
        totalShelves: 0,
        totalVolume: 0,
        usedVolume: 0,
        remainingVolume: 0,
        usagePercentage: 0
      };
    }

    const totalShelves = shelfData.length;
    const totalVolume = shelfData.reduce((total, shelf) => {
      return total + (shelf.cubic_centimeter_shelf || 0);
    }, 0);

    // Calculate actual used volume from box data if available
    let usedVolume = 0;
    if (boxData && boxData.length > 0) {
      usedVolume = boxData.reduce((total, box) => {
        return total + (box.total_volume || 0);
      }, 0);
    } else {
      // Fallback to assumption if no box data
      usedVolume = totalVolume * 0.6; // Assuming 60% usage
    }

    const remainingVolume = totalVolume - usedVolume;
    const usagePercentage = totalVolume > 0 ? (usedVolume / totalVolume) * 100 : 0;

    return {
      totalShelves,
      totalVolume,
      usedVolume,
      remainingVolume,
      usagePercentage
    };
  };

  const stats = calculateShelfStats();

  // Prepare chart data - top 5 shelves by volume
  const chartData = shelfData
    .slice(0, 5)
    .map(shelf => {
      const shelfVolume = shelf.cubic_centimeter_shelf || 0;

      // Find boxes stored in this shelf
      const boxesInShelf = boxData.filter(box => box.master_shelf_id === shelf.master_shelf_id);
      const usedVolume = boxesInShelf.reduce((total, box) => total + (box.total_volume || 0), 0);

      return {
        name: shelf.master_shelf_name || `Shelf ${shelf.master_shelf_id.substring(0, 5)}...`,
        volume: shelfVolume,
        used: usedVolume || shelfVolume * 0.6, // Fallback if no box data
      };
    });

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Text size="5" weight="bold">Shelf Usage</Text>
        <Badge size="2" color="purple">{stats.totalShelves} Shelves</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">Loading...</div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Total Volume:</span>
              <span>{stats.totalVolume.toLocaleString()} cm³</span>
            </div>
            <div className="flex justify-between">
              <span>Used Volume:</span>
              <span>{stats.usedVolume.toLocaleString()} cm³</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Volume:</span>
              <span className="text-green-600">{stats.remainingVolume.toLocaleString()} cm³</span>
            </div>
            <div className="flex justify-between">
              <span>Usage:</span>
              <span>{stats.usagePercentage.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-purple-500 h-2.5 rounded-full"
                style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString() + ' cm³'} />
                  <Legend />
                  <Bar dataKey="volume" name="Total Volume" fill="#9c27b0" />
                  <Bar dataKey="used" name="Used Volume" fill="#d1c4e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ShelfUsage;
