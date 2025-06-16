"use client"
import { Tabs } from "@radix-ui/themes"
import { useQuery } from "@tanstack/react-query";
import { getShelfExport } from "@/services/shelfBoxStorage.services";
import { TabsExportContent } from "./TabsExportContent";
export const TabsExport = ({ wareHouse, zone }: { wareHouse: string, zone: string }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["export", wareHouse, zone],
        queryFn: () => getShelfExport(wareHouse, zone),
        enabled: !!wareHouse && !!zone
    })
    const exportData = data?.responseObject;
    return (<Tabs.Root className="TabsRoot max-w-7xl mx-auto" defaultValue="tab1" id={`${zone}-${wareHouse}`}>
        <Tabs.List className="TabsList mb-3" aria-label="Manage your account">
            <Tabs.Trigger className="TabsTrigger" value="tab1">
                กล่องที่รอส่งออก
            </Tabs.Trigger>
            <Tabs.Trigger className="TabsTrigger" value="tab2" disabled={exportData?.shelfBoxStorage.length === 0}>
                ประวัติการส่งออก
            </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className="TabsContent " value="tab1">
            <TabsExportContent exportData={exportData!} />
        </Tabs.Content>
        <Tabs.Content className="TabsContent" value="tab2">
            <TabsExportContent exportData={exportData!} exportTabs />
        </Tabs.Content>
    </Tabs.Root>)


}

