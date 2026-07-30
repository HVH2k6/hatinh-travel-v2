import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { headers, cookies } from "next/headers";

export async function checkAdmin() {
  try {
    const supabase = await createClient();

    // Lấy token từ header hoặc cookie do Frontend tự quản lý
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("access_token")?.value || "";
    }

    if (!token) {
      return false;
    }

    // Lấy user từ Supabase Auth bằng JWT token một cách thủ công
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    // Tìm role trong DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!dbUser || !dbUser.role || dbUser.role.name?.toLowerCase() !== "admin") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền admin:", error);
    return false;
  }
}

export async function checkUser(): Promise<string | null> {
  try {
    const supabase = await createClient();

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("access_token")?.value || "";
    }

    if (!token) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Lỗi khi xác thực user:", error);
    return null;
  }
}
