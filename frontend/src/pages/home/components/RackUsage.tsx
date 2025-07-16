import React from 'react';
import { Card, Text, Badge } from '@radix-ui/themes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RackUsageProps {
  rackData: any[];
  loading: boolean;
}

const RackUsage: React.FC<RackUsageProps> = ({ rackData, loading }) => {
  // Calculate rack usage statistics
  const calculateRackStats = () => {
    if (!rackData || rackData.length === 0) {
      return {
        totalRacks: 0,
        totalVolume: 0,
        usedVolume: 0,
        remainingVolume: 0,
        usagePercentage: 0
      };
    }

    const totalRacks = rackData.length;
    const totalVolume = rackData.reduce((total, rack) => {
      return total + (rack.width_cm * rack.length_cm * rack.height_cm);
    }, 0);

    // Assuming 80% of rack volume is used for shelves (this is a placeholder)
    const usedVolume = totalVolume * 0.8;
    const remainingVolume = totalVolume - usedVolume;
    const usagePercentage = (usedVolume / totalVolume) * 100;

    return {
      totalRacks,
      totalVolume,
      usedVolume,
      remainingVolume,
      usagePercentage
    };
  };

  const stats = calculateRackStats();

  // Prepare chart data
  const chartData = rackData.slice(0, 5).map(rack => ({
    name: rack.master_rack_name || `Rack ${rack.master_rack_id.substring(0, 5)}...`,
    volume: rack.width_cm * rack.length_cm * rack.height_cm,
    used: (rack.width_cm * rack.length_cm * rack.height_cm) * 0.8, // Placeholder
  }));

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Text size="5" weight="bold">Rack Usage</Text>
        <Badge size="2" color="green">{stats.totalRacks} Racks</Badge>
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
                className="bg-green-500 h-2.5 rounded-full"
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
                  <Bar dataKey="volume" name="Total Volume" fill="#82ca9d" />
                  <Bar dataKey="used" name="Used Volume" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default RackUsage;
