export type PayloadCreateBoxInShelfOnStorage = {
    master_shelf_id: string;
    fitBoxes: {
        document_product_no: string;
        cubic_centimeter_box: number;
    }[];
};

export type PayloadUpdateBoxInShelfOnStorage = {
    storage_id: string;
    master_shelf_id: string;
    fitBoxes: {
        document_product_no: string;
        cubic_centimeter_box: number;
    }[];
};

export type PayloadDeleteBoxInShelfOnStorage = {
    storage_id: string;
};
