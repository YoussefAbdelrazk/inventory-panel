

import { CategoryFormData } from "@/schemas/CategoryFormSchema";
import APIClient from "../apiClient";


export interface CategoryItemResponse {
    name: string;
    number: string;
    createdByUserId: string;
    createdUser: string | null;
    createdDate: string;
    lastModifiedUserId: string;
    lastModifiedUser: string | null;
    lastModifiedDate: string;
    isDeleted: boolean;
    id: number;
  }
  
export default new APIClient<CategoryFormData,CategoryItemResponse >("api/SQs");

