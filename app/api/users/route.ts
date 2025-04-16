import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { User } from "@/app/lib/api";

// Load data from db.json
async function getUsersFromDB() {
  const filePath = path.join(process.cwd(), "db.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(fileContents);
  return data.users;
}

export async function GET(req: NextRequest) {
  const users = await getUsersFromDB();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") ?? "asc";
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  // Filter by name OR email
  let filteredUsers = users;
  if (search) {
    filteredUsers = users.filter(
      (user: User) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
  }

  // Sort
  if (sortBy) {
    filteredUsers = filteredUsers.sort((a: User, b: User) => {
      const valA = a[sortBy as keyof User]?.toString().toLowerCase() || a[sortBy as keyof User]?.toString();
      const valB = b[sortBy as keyof User]?.toString().toLowerCase() || b[sortBy as keyof User]?.toString();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const total = filteredUsers.length;

  // Paginate
  const start = pageIndex * pageSize;
  const paginatedUsers = filteredUsers.slice(start, start + pageSize);

  return NextResponse.json({
    data: paginatedUsers,
    total,
  });
}
