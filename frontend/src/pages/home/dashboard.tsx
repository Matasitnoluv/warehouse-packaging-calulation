// dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Flex, Text, Button, Badge } from '@radix-ui/themes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { LayoutGrid, Package, Calculator, FileText, ChevronRight } from 'lucide-react';

// Components
import WarehouseOverview from '../home/components/WarehouseOverview';
import ZoneUsage from '../home/components/ZoneUsage';
import RackUsage from '../home/components/RackUsage';
import ShelfUsage from '../home/components/ShelfUsage';
import QuickAccessMenu from '../home/components/QuickAccessMenu';
import UsageStatistics from '../home/components/UsageStatistics';
import ProductManagement from '../msproduct';

// Services
import { getMswarehouse } from '@/services/mswarehouse.services';
import { getMszone } from '@/services/mszone.services';
import { getMsrack } from '@/services/msrack.services';
import { getMsshelf } from '@/services/msshelf.services';
import { shelfBoxStorageService } from '@/services/shelfBoxStorage.services';

const Dashboard = () => {
  return <ProductManagement />;
};

export default Dashboard;