import { useState } from "react";

export const HeaderExport = ({ children, onSearch }: { children: React.ReactNode, onSearch?: (keyword: string) => void }) => {
    const [search, setSearch] = useState("");

    const handleSearch = () => {
        if (onSearch) onSearch(search.trim());
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };
    return (
        <div className="max-w-7xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Export Management</h1>
                <p className="text-gray-600 mb-6">จัดการการส่งออกกล่องสินค้าในคลัง</p>
                <div className="flex gap-4 mb-6 flex-col md:flex-row">
                    {children}
                    <div className="flex-1" />
                    {/* <div className="flex items-center justify-end w-full md:w-auto absolute right-8 top-8">
                        <input
                            type="text"
                            className="rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-base transition-all w-56 md:w-72"
                            placeholder="ค้นหาเลขกล่องหรือเลขเอกสารสินค้า..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSearch}
                            className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition-colors"
                        >
                            ค้นหา
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};