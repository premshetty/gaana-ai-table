import axios from "axios";

const API_URL = "http://localhost:3001/users"; // Adjust if needed

const api = axios.create({
  baseURL: API_URL,
});

export type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  createdAt: string;
};

// Types for fetch params
export type FetchUsersParams = {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
};

// Build query string for Next.js API
const buildQueryParams = (params: FetchUsersParams) => {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.pageIndex !== undefined && params.pageSize !== undefined) {
    query.set("pageIndex", String(params.pageIndex));
    query.set("pageSize", String(params.pageSize));
  }

  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
    query.set("sortOrder", params.sortOrder || "asc");
  }

  return query.toString();
};

// ✅ Fetch users with pagination, sorting, filtering
export const fetchUsers = async (params: FetchUsersParams = {}) => {
  try {
    const queryString = buildQueryParams(params);

    const response = await axios.get(`/api/users?${queryString}`);
    const { data, total } = response.data;

    return {
      data,
      total,
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
};


// ✅ Create user
export const createUser = async (user: Omit<User, "id" | "createdAt">) => {
  try {
    const newUser = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    const response = await api.post("", newUser);
    return response.data;
  } catch {
    throw new Error("Failed to create user");
  }
};

// ✅ Update user
export const updateUser = async (id: number, user: Partial<User>) => {
  try {
    const response = await api.patch(`/${Number(id)}`, user);
    return response.data;
  } catch {
    throw new Error("Failed to update user");
  }
};

// ✅ Delete user
export const deleteUser = async (id: number) => {
  try {
    await api.delete(`/${id}`);
  } catch {
    throw new Error("Failed to delete user");
  }
};
