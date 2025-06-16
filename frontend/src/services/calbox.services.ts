import { GET_CAL_BOX, CREATE_CAL_BOX, UPDATE_CAL_BOX, DELETE_CAL_BOX } from "@/apis/endpoint.api";
import mainApi from "@/apis/main.api";

export type CalBoxPayload = {
  cal_box_id?: string;
  document_product_no: string;
  box_no: number;
  master_box_name: string;
  code_box: string;
  master_product_name: string;
  code_product: string;
  cubic_centimeter_box: number;
  count: number;
};

// Get boxes for a specific document
export const getCalBox = async (document_product_no: string) => {
  console.log(`[calbox.services] Getting boxes for document: ${document_product_no}`);

  try {
    const { data: response } = await mainApi.get(
      GET_CAL_BOX,
      { params: { document_product_no } }
    );

    console.log(`[calbox.services] Response for document ${document_product_no}:`, response);

    if (response.success) {
      console.log(`[calbox.services] Found ${response.responseObject?.length || 0} boxes`);

      if (response.responseObject) {
        // Log each box for debugging
        response.responseObject.forEach((box: any, index: number) => {
          console.log(`[calbox.services] Box ${index + 1}:`, {
            cal_box_id: box.cal_box_id,
            document_product_no: box.document_product_no,
            master_box_name: box.master_box_name,
            cubic_centimeter_box: box.cubic_centimeter_box,
            count: box.count
          });
        });
      }
    } else {
      console.error(`[calbox.services] Error getting boxes:`, response.message);
    }

    return response;
  } catch (error) {
    console.error(`[calbox.services] Exception getting boxes:`, error);
    throw error;
  }
};

// Create a new box
export const createCalBox = async (data: CalBoxPayload) => {
  const { data: response } = await mainApi.post(
    CREATE_CAL_BOX,
    data
  );
  return response;
};

// Update an existing box
export const updateCalBox = async (data: CalBoxPayload) => {
  const { data: response } = await mainApi.patch(
    UPDATE_CAL_BOX,
    data
  );
  return response;
};

// Delete a box by ID
export const deleteCalBox = async (cal_box_id: string) => {
  const { data: response } = await mainApi.delete(
    `${DELETE_CAL_BOX}/${cal_box_id}`
  );
  return response;
};
