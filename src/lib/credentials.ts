import { generateKeyPairSync, randomBytes } from "node:crypto";
import { exportJWK, importPKCS8, importSPKI, SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { credentials, demoSigningKeys } from "@/db/schema";

const KEY_ID = "authwords-demo-ed25519-v1";
const ISSUER = "urn:authwords:synthetic-demo";

let cachedKeys: { id: string; privateKey: string; publicKey: string } | null = null;
export async function getDemoKeys() {
  if (cachedKeys) return cachedKeys;
  const [existing] = await db.select().from(demoSigningKeys).where(eq(demoSigningKeys.id, KEY_ID));
  if (existing) return (cachedKeys = existing);
  const pair = generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  await db.insert(demoSigningKeys).values({ id: KEY_ID, privateKey: pair.privateKey, publicKey: pair.publicKey }).onConflictDoNothing();
  const [stored] = await db.select().from(demoSigningKeys).where(eq(demoSigningKeys.id, KEY_ID));
  if (!stored) throw new Error("Demo signing key unavailable");
  return (cachedKeys = stored);
}

export async function signDemoCredential() {
  const key = await getDemoKeys();
  const id = randomBytes(24).toString("base64url");
  const privateKey = await importPKCS8(key.privateKey, "EdDSA");
  // The claim is authorship only. A grade is a separate, student-controlled disclosure and is
  // deliberately absent so the credential means the same thing for an A and for a B.
  const token = await new SignJWT({ type: "AuthorshipVerificationDemo", demo: true, authorshipVerified: true, gradeDisclosed: false })
    .setProtectedHeader({ alg: "EdDSA", kid: KEY_ID, typ: "JWT" })
    .setIssuer(ISSUER).setAudience("urn:authwords:public-demo-verifier").setJti(id)
    .setIssuedAt().setExpirationTime("365d").sign(privateKey);
  return { id, token };
}

export async function publicJwks() {
  const key = await getDemoKeys();
  const jwk = await exportJWK(await importSPKI(key.publicKey, "EdDSA"));
  return { keys: [{ ...jwk, kid: KEY_ID, alg: "EdDSA", use: "sig" }] };
}

export async function verifyDemoCredential(id: string) {
  if (!/^[A-Za-z0-9_-]{32}$/.test(id)) return null;
  const [credential] = await db.select().from(credentials).where(eq(credentials.id, id));
  if (!credential) return null;
  try {
    const key = await getDemoKeys();
    const { payload, protectedHeader } = await jwtVerify(credential.token, await importSPKI(key.publicKey, "EdDSA"), {
      issuer: ISSUER, audience: "urn:authwords:public-demo-verifier", algorithms: ["EdDSA"],
      requiredClaims: ["jti", "iat", "exp"],
    });
    if (payload.jti !== id || protectedHeader.kid !== KEY_ID || payload.demo !== true || payload.authorshipVerified !== true || payload.type !== "AuthorshipVerificationDemo") return null;
    return { id, valid: !credential.revoked, revoked: credential.revoked, expired: false, issuedAt: new Date(Number(payload.iat) * 1000).toISOString(), expiresAt: new Date(Number(payload.exp) * 1000).toISOString(), authorshipVerified: true, gradeDisclosed: false, algorithm: "Ed25519", demo: true, token: credential.token };
  } catch (failure) {
    const expired = failure instanceof Error && failure.name === "JWTExpired";
    return { id, valid: false, revoked: credential.revoked, expired, demo: true };
  }
}
