import { useQuery } from "@tanstack/react-query"
import { getMswarehouse } from "../mswarehouse.services"

export const useCalMswarehouseQuery = () => {
    const query = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => getMswarehouse()
    })
    return query
}