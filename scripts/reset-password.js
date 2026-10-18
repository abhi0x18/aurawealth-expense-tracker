const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("\nUsage: node scripts/reset-password.js <email> <new-password>\n");
    console.log("Example: node scripts/reset-password.js myemail@example.com MyNewSecret123\n");
    process.exit(1);
  }

  const [email, newPassword] = args;
  console.log(`\n[PaisaPilot] Resetting password for: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    console.error(`[Error] No account found with email: ${email}`);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Invalidate any existing sessions
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  console.log(`[Success] Password successfully updated for ${user.name} (${user.email}).`);
  console.log(`Existing sessions have been invalidated. You can now log in with your new password.\n`);
}

main()
  .catch((e) => {
    console.error("[Error]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
