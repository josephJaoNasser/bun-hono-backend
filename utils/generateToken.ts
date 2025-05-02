import jwt, { JwtPayload } from "jsonwebtoken";

// Generate JWT token
export default function (id: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  console.log("[AUTH] Generating token for id:", id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = jwt.sign(
    { id },
    jwtSecret as string,
    { expiresIn: "1d" } as any
  );

  console.log("[AUTH] Generated token:", token.substring(0, 20) + "...");

  return token;
}
