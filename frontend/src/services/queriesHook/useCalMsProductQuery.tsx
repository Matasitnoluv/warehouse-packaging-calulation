import { useQuery } from "@tanstack/react-query"
import { getCalMsproduct } from "../calmsproduct.services"

export const useCalMsProductQuery = () => {
    const query = useQuery({
        queryKey: ["cal_msproducts"],
        queryFn: () => getCalMsproduct()
    })
    return query
}