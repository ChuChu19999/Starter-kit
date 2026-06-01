import { axiosInstance } from '../config/axios';

export interface UserResponse {
  personnel_number?: string | null;
  department_number?: number | null;
  full_name?: string | null;
  ad_login?: string | null;
  email?: string | null;
  hsnils?: string | null;
  is_staff?: boolean;
}

export const userApi = {
  getCurrent: async (): Promise<UserResponse> => {
    const response = await axiosInstance.get<UserResponse>('/api/me/');
    return response.data;
  },
};
