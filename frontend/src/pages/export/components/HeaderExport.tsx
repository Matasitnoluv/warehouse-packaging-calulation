export const HeaderExport = ({ children }: { children: React.ReactNode }) => {
    return (<div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Export Management</h1>
            <p className="text-gray-600 mb-6">จัดการการส่งออกกล่องสินค้าในคลัง</p>
            <div className="flex gap-4 mb-6 flex-col md:flex-row">
                {children}

            </div>
        </div>
    </div>)
}