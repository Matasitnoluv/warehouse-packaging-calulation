import { Link } from 'react-router-dom';
import { Card, Flex, Button } from '@radix-ui/themes';
import { LayoutGrid, Package, Calculator, FileText } from 'lucide-react';

const QuickAccessMenu = () => {
  return (
    <Card className="mb-6 p-4">
      <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
      <Flex gap="4" wrap="wrap">
        <Link to="/msproduct" className="no-underline">
          <Button size="3" className="p-6 flex flex-col items-center">
            <LayoutGrid size={24} className="mb-2" />
            <span>Report Product</span>
          </Button>
        </Link>
        <Link to="/msbox" className="no-underline">
          <Button size="3" className="p-6 flex flex-col items-center">
            <Package size={24} className="mb-2" />
            <span>Report Box</span>
          </Button>
        </Link>
        <Link to="/calculationproductbox" className="no-underline">
          <Button size="3" className="p-6 flex flex-col items-center">
            <Calculator size={24} className="mb-2" />
            <span>Calculation</span>
          </Button>
        </Link>
        <Link to="/export" className="no-underline">
          <Button size="3" className="p-6 flex flex-col items-center">
            <FileText size={24} className="mb-2" />
            <span>Export</span>
          </Button>
        </Link>
      </Flex>
    </Card>
  );
};

export default QuickAccessMenu;