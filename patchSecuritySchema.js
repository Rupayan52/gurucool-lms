const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const securityModel = `
model SecurityAuditLog {
  id        String   @id @default(uuid())
  userId    String?
  role      String?
  action    String
  resource  String?
  severity  String   @default("INFO") // INFO, WARN, CRITICAL
  metadata  String?
  createdAt DateTime @default(now())
}
`;

if (!schema.includes('model SecurityAuditLog')) {
  schema += `\n${securityModel}\n`;
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ SecurityAuditLog model added to Prisma schema.");
} else {
  console.log("✅ SecurityAuditLog model already exists.");
}
