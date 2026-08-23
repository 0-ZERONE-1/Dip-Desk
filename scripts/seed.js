#!/usr/bin/env node
/**
 * ZERONE - Database seed script for initial admin, departments, and subjects
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// ZERONE - Load .env.local configuration file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env.local');
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local — refusing to seed with default credentials.');
  process.exit(1);
}

// ZERONE - Inline Mongoose schemas for seeding script
const AdminSchema = new mongoose.Schema({ email: String, hashedPassword: String, name: String });
const DepartmentSchema = new mongoose.Schema({ name: String, slug: String, description: String, icon: String, color: String, isActive: { type: Boolean, default: true } });
const SubjectSchema = new mongoose.Schema({ name: String, slug: String, semesterNumber: Number, departmentId: mongoose.Schema.Types.ObjectId, description: String, isActive: { type: Boolean, default: true } });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

const departments = [
  {
    name: 'Computer Science & Technology',
    slug: 'cst',
    description: 'Programming, databases, networking, and software development',
    icon: '💻',
    color: '#6366f1',
  },
  {
    name: 'Electrical Engineering',
    slug: 'ee',
    description: 'Circuits, power systems, electrical machines, and electronics',
    icon: '⚡',
    color: '#f59e0b',
  },
  {
    name: 'Electronics & Telecommunication',
    slug: 'etc',
    description: 'Communication systems, signal processing, and electronic devices',
    icon: '📡',
    color: '#10b981',
  },
];

const subjectsBySemester = {
  cst: {
    1: ['Mathematics-I', 'Physics', 'English Communication', 'Basic Electronics', 'Computer Fundamentals'],
    2: ['Mathematics-II', 'Chemistry', 'Basic Electrical Engineering', 'C Programming', 'Workshop Practice'],
    3: ['Data Structures', 'Digital Electronics', 'Database Management Systems', 'Object Oriented Programming', 'Computer Networks'],
    4: ['Operating Systems', 'Java Programming', 'Web Technology', 'Software Engineering', 'Microprocessor'],
    5: ['Compiler Design', 'Computer Graphics', 'Mobile Computing', 'Cloud Computing', 'Information Security'],
    6: ['Machine Learning', 'Big Data Analytics', 'IoT', 'Project Work', 'Professional Ethics'],
  },
  ee: {
    1: ['Mathematics-I', 'Physics', 'English Communication', 'Basic Electronics', 'Engineering Drawing'],
    2: ['Mathematics-II', 'Chemistry', 'Electrical Engineering Fundamentals', 'Workshop Practice', 'C Programming'],
    3: ['Circuit Theory', 'Electrical Machines-I', 'Digital Electronics', 'Electromagnetic Theory', 'Measurement & Instrumentation'],
    4: ['Electrical Machines-II', 'Power Systems', 'Control Systems', 'Microcontroller', 'Power Electronics'],
    5: ['Switchgear & Protection', 'High Voltage Engineering', 'Renewable Energy', 'Electric Drives', 'Industrial Electronics'],
    6: ['Power System Stability', 'Electrical Installation', 'Project Work', 'Professional Ethics', 'Entrepreneurship'],
  },
  etc: {
    1: ['Mathematics-I', 'Physics', 'English Communication', 'Basic Electronics', 'Engineering Drawing'],
    2: ['Mathematics-II', 'Chemistry', 'Network Theory', 'Workshop Practice', 'C Programming'],
    3: ['Electronic Devices & Circuits', 'Digital Electronics', 'Signals & Systems', 'Communication Engineering', 'Electromagnetic Fields'],
    4: ['Analog Communication', 'Digital Communication', 'Microprocessor', 'Antenna & Wave Propagation', 'Control Systems'],
    5: ['Mobile Communication', 'Optical Fiber Communication', 'VLSI Design', 'Digital Signal Processing', 'Satellite Communication'],
    6: ['Wireless Networks', 'Embedded Systems', 'Project Work', 'Professional Ethics', 'Entrepreneurship'],
  },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  // ZERONE - Seed default admin account
  const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await Admin.create({ email: ADMIN_EMAIL, hashedPassword, name: 'Administrator' });
    console.log(`✅ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
  }

  // ZERONE - Seed departments and subjects
  for (const dept of departments) {
    const existing = await Department.findOne({ slug: dept.slug });
    if (!existing) {
      const created = await Department.create(dept);
      console.log(`✅ Department: ${dept.name}`);

      // ZERONE - Seed subjects for current department
      const subjects = subjectsBySemester[dept.slug];
      for (const [sem, subjectNames] of Object.entries(subjects)) {
        for (const name of subjectNames) {
          await Subject.create({
            name,
            slug: slugify(name),
            semesterNumber: parseInt(sem),
            departmentId: created._id,
            description: '',
          });
        }
        console.log(`  ✅ Semester ${sem} subjects for ${dept.name}`);
      }
    } else {
      console.log(`ℹ️  Department already exists: ${dept.name}`);
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Add your MONGODB_URI to .env.local');
  console.log('   2. Add your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  console.log('   3. Run: npm run dev');
  console.log(`   4. Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
