import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

// Convert prisma+postgresql:// to postgresql:// for CLI operations
let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.startsWith('prisma+postgresql://')) {
  dbUrl = dbUrl.replace('prisma+postgresql://', 'postgresql://');
}

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: dbUrl
  }
});

