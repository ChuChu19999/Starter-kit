import { axiosInstance } from '../config/axios';

export interface EmployeePhoto {
  photoWebp50?: string | null;
  photoWebp50sha256?: string;
  photoWebp300?: string | null;
  photoJpg300sha256?: string;
  photoWebp200?: string | null;
  photoWebp200Sha256?: string;
}

export interface Employee {
  hashMd5: string;
  fullName: string;
  employeePhoto?: EmployeePhoto | null;
  jobTitle?: string;
  [key: string]: unknown;
}

export interface EmployeesByHashesRequest {
  hashesMd5: string[];
  includePhoto?: boolean | null;
}

export const employeesApi = {
  searchByFio: async (searchFio: string, includePhoto: boolean = true): Promise<Employee[]> => {
    if (!searchFio || searchFio.length < 3) {
      return [];
    }

    const response = await axiosInstance.get<Employee[]>('/api/employees/search/', {
      params: { searchFio, includePhoto },
    });

    return response.data;
  },

  getByHash: async (hash: string, includePhoto: boolean = true): Promise<Employee | null> => {
    if (!hash) {
      return null;
    }

    const response = await axiosInstance.get<Employee>(`/api/employees/${hash}/`, {
      params: { includePhoto },
    });

    return response.data;
  },

  getByHashes: async (request: EmployeesByHashesRequest): Promise<Record<string, Employee>> => {
    if (!request.hashesMd5.length) {
      return {};
    }

    const response = await axiosInstance.post<Record<string, Employee>>(
      '/api/employees/by-hashes/',
      request
    );

    return response.data;
  },
};
