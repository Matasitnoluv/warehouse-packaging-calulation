// dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Flex, Text, Button, Badge } from '@radix-ui/themes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { LayoutGrid, Package, Calculator, FileText, ChevronRight } from 'lucide-react';

// Components
import WarehouseOverview from './components/WarehouseOverview';
import ZoneUsage from './components/ZoneUsage';
import RackUsage from './components/RackUsage';
import ShelfUsage from './components/ShelfUsage';
import QuickAccessMenu from './components/QuickAccessMenu';
import UsageStatistics from './components/UsageStatistics';

// Services
import { getMswarehouse } from '@/services/mswarehouse.services';
import { getMszone } from '@/services/mszone.services';
import { getMsrack } from '@/services/msrack.services';
import { getMsshelf } from '@/services/msshelf.services';
import { shelfBoxStorageService } from '@/services/shelfBoxStorage.services';

const Dashboard = () => {
  // State for data
  const [loading, setLoading] = useState(true);
  const [warehouseData, setWarehouseData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [rackData, setRackData] = useState([]);
  const [shelfData, setShelfData] = useState([]);
  const [boxData, setBoxData] = useState([]);
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch warehouse data
        const warehouseResponse = await getMswarehouse();
        if (warehouseResponse.success) {
          setWarehouseData(warehouseResponse.responseObject);
        }
        
        // Fetch zone data
        const zoneResponse = await getMszone();
        if (zoneResponse.success) {
          setZoneData(zoneResponse.responseObject);
        }
        
        // Fetch rack data
        const rackResponse = await getMsrack();
        if (rackResponse.success) {
          setRackData(rackResponse.responseObject);
        }
        
        // Fetch shelf data
        const shelfResponse = await getMsshelf();
        if (shelfResponse.success) {
          setShelfData(shelfResponse.responseObject);
        }
        
        // Fetch box storage data
        const boxResponse = await shelfBoxStorageService.getAllStoredBoxes();
        if (boxResponse.success) {
          setBoxData(boxResponse.responseObject);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Calculate overview statistics
  const calculateOverviewStats = () => {
    // ... calculation logic
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Warehouse Management Dashboard</h1>
      
      {/* Quick Access Menu */}
      <QuickAccessMenu />
      
      {/* Warehouse Overview */}
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-4">Warehouse Overview</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">Loading...</div>
        ) : (
          <WarehouseOverview 
            warehouseData={warehouseData} 
            zoneData={zoneData}
            rackData={rackData}
            shelfData={shelfData}
            boxData={boxData}
          />
        )}
      </Card>
      
      {/* Zone, Rack, Shelf Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ZoneUsage zoneData={zoneData} loading={loading} />
        <RackUsage rackData={rackData} loading={loading} />
        <ShelfUsage shelfData={shelfData} boxData={boxData} loading={loading} />
      </div>
      
      {/* Usage Statistics */}
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">Loading...</div>
        ) : (
          <UsageStatistics 
            warehouseData={warehouseData}
            zoneData={zoneData}
            rackData={rackData}
            shelfData={shelfData}
            boxData={boxData}
          />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;