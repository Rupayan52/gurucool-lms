import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function verifyServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) return null;

  try {
    // Cryptographically verify the token signature using the server's private secret
    // This makes it mathematically impossible for a user to forge their role
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
