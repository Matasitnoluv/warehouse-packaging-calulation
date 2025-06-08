import { useQuery } from "@tanstack/react-query"
import { getMszone } from "../mszone.services"

export const useZoneQuery = () => {
    const query = useQuery({
        queryKey: ["zones"],
        queryFn: () => getMszone()
    })
    return query
}