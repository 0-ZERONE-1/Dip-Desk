import bcrypt from 'bcryptjs';
import Department from './models/Department';
import Subject from './models/Subject';
import Admin from './models/Admin';

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

const subjectsBySemester: Record<string, Record<number, string[]>> = {
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

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function seedInitialData() {
  try {
    const count = await Department.countDocuments();
    if (count > 0) return;

    console.log('🌱 Seeding initial departments and subjects...');

    // Create Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@diplomahub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await Admin.create({ email: adminEmail, hashedPassword, name: 'Administrator' });
    }

    // Create Departments & Subjects
    for (const dept of departments) {
      const created = await Department.create(dept);
      const subjects = subjectsBySemester[dept.slug];
      if (subjects) {
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
        }
      }
    }
    console.log('✅ Initial database seed complete!');
  } catch (err) {
    console.error('Error during auto-seeding:', err);
  }
}
