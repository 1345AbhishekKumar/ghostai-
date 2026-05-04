import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/app/generated/prisma/client";

const rawDatabaseUrl = process.env["DATABASE_URL"];

if (!rawDatabaseUrl) {
  throw new Error("DATABASE_URL is not set.");
}

const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

const normalizeDatabaseUrl = (connectionString: string) => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(connectionString);
  } catch (error) {
    throw new Error("DATABASE_URL is not a valid URL.", { cause: error });
  }

  if (
    parsedUrl.protocol !== "postgres:" &&
    parsedUrl.protocol !== "postgresql:" &&
    parsedUrl.protocol !== "prisma+postgres:"
  ) {
    return connectionString;
  }

  const isLibpqCompat = parsedUrl.searchParams.get("uselibpqcompat") === "true";

  if (isLibpqCompat) {
    return connectionString;
  }

  const sslMode = parsedUrl.searchParams.get("sslmode");

  if (!sslMode || LEGACY_SSL_MODES.has(sslMode)) {
    parsedUrl.searchParams.set("sslmode", "verify-full");
    return parsedUrl.toString();
  }

  return connectionString;
};

const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const createPrismaClient = () => {
  if (databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    });
  }

  return new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
