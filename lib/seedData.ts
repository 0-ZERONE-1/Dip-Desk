import bcrypt from 'bcryptjs';
import Admin from './models/Admin';

export async function seedInitialData() {
  try {
    // Ensure Admin account exists for admin login
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD env vars not set — skipping admin seed.');
      return;
    }
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await Admin.create({ email: adminEmail, hashedPassword, name: 'Administrator' });
      console.log('✅ Default admin user created');
    }
  } catch (err) {
    console.error('Error during initial admin seeding:', err);
  }
}
