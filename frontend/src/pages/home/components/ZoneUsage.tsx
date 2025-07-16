import React from 'react';
import { Card, Text, Badge } from '@radix-ui/themes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ZoneUsageProps {
  zoneData: any[];
  loading: boolean;
}

const ZoneUsage: React.FC<ZoneUsageProps> = ({ zoneData, loading }) => {
  // Calculate zone usage statistics
  const calculateZoneStats = () => {
    if (!zoneData || zoneData.length === 0) {
      return {
        totalZones: 0,
        totalVolume: 0,
        usedVolume: 0,
        remainingVolume: 0,
        usagePercentage: 0
      };
    }

    const totalZones = zoneData.length;
    const totalVolume = zoneData.reduce((total, zone) => {
      return total + (zone.width_cm * zone.length_cm * zone.height_cm);
    }, 0);

    // Assuming 70% of zone volume is used for racks (this is a placeholder)
    const usedVolume = totalVolume * 0.7;
    const remainingVolume = totalVolume - usedVolume;
    const usagePercentage = (usedVolume / totalVolume) * 100;

    return {
      totalZones,
      totalVolume,
      usedVolume,
      remainingVolume,
      usagePercentage
    };
  };

  const stats = calculateZoneStats();

  // Prepare chart data
  const chartData = zoneData.slice(0, 5).map(zone => ({
    name: zone.master_zone_name || `Zone ${zone.master_zone_id.substring(0, 5)}...`,
    volume: zone.width_cm * zone.length_cm * zone.height_cm,
    used: (zone.width_cm * zone.length_cm * zone.height_cm) * 0.7, // Placeholder
  }));

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Text size="5" weight="bold">Zone Usage</Text>
        <Badge size="2" color="blue">{stats.totalZones} Zones</Badge>
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
                className="bg-blue-500 h-2.5 rounded-full"
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
                  <Bar dataKey="volume" name="Total Volume" fill="#8884d8" />
                  <Bar dataKey="used" name="Used Volume" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ZoneUsage;
