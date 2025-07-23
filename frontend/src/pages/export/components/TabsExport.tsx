"use client"
import { Tabs } from "@radix-ui/themes"
import { useQuery } from "@tanstack/react-query";
import { getShelfExport } from "@/services/shelfBoxStorage.services";
import { TabsExportContent } from "./TabsExportContent";
export const TabsExport = ({ wareHouse, zone, searchKeyword }: { wareHouse: string, zone: string, searchKeyword?: string }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["export", wareHouse, zone],
        queryFn: () => getShelfExport(wareHouse, zone),
        enabled: !!wareHouse && !!zone
    })
    const exportData = data?.responseObject;
    return (
        <>
            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
                </div>
            )}
            {!isLoading && (
                <Tabs.Root className="TabsRoot max-w-7xl mx-auto" defaultValue="tab1" id={`${zone}-${wareHouse}`}>
                    <Tabs.List className="TabsList mb-3" aria-label="Manage your account">
                        <Tabs.Trigger className="TabsTrigger" value="tab1">
                            กล่องที่รอส่งออก
                        </Tabs.Trigger>
                        <Tabs.Trigger className="TabsTrigger" value="tab2" disabled={exportData?.shelfBoxStorage.length === 0}>
                            ประวัติการส่งออก
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content className="TabsContent " value="tab1">
                        <TabsExportContent exportData={exportData!} searchKeyword={searchKeyword} />
                    </Tabs.Content>
                    <Tabs.Content className="TabsContent" value="tab2">
                        <TabsExportContent exportData={exportData!} exportTabs searchKeyword={searchKeyword} />
                    </Tabs.Content>
                </Tabs.Root>
            )}
        </>
    )


}

