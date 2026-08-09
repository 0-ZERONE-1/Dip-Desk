export const defaultDepartments = [
  {
    _id: 'dept_cst',
    name: 'Computer Science & Technology',
    slug: 'cst',
    description: 'Programming, databases, networking, and software development',
    icon: '💻',
    color: '#6366f1',
    isActive: true,
  },
  {
    _id: 'dept_ee',
    name: 'Electrical Engineering',
    slug: 'ee',
    description: 'Circuits, power systems, electrical machines, and electronics',
    icon: '⚡',
    color: '#f59e0b',
    isActive: true,
  },
  {
    _id: 'dept_etc',
    name: 'Electronics & Telecommunication',
    slug: 'etc',
    description: 'Communication systems, signal processing, and electronic devices',
    icon: '📡',
    color: '#10b981',
    isActive: true,
  },
];

export const defaultSubjects = [
  // CST Semesters 1-6
  { _id: 'sub_cst_1_1', name: 'Mathematics-I', slug: 'mathematics-i', semesterNumber: 1, departmentId: defaultDepartments[0], description: 'Calculus, matrices, and analytical geometry' },
  { _id: 'sub_cst_1_2', name: 'Physics', slug: 'physics', semesterNumber: 1, departmentId: defaultDepartments[0], description: 'Applied physics fundamentals' },
  { _id: 'sub_cst_1_3', name: 'English Communication', slug: 'english-communication', semesterNumber: 1, departmentId: defaultDepartments[0], description: 'Professional grammar and communication' },
  { _id: 'sub_cst_1_4', name: 'Basic Electronics', slug: 'basic-electronics', semesterNumber: 1, departmentId: defaultDepartments[0], description: 'Semiconductor devices and circuits' },
  { _id: 'sub_cst_1_5', name: 'Computer Fundamentals', slug: 'computer-fundamentals', semesterNumber: 1, departmentId: defaultDepartments[0], description: 'Introduction to hardware and OS' },
  
  { _id: 'sub_cst_2_1', name: 'Mathematics-II', slug: 'mathematics-ii', semesterNumber: 2, departmentId: defaultDepartments[0], description: 'Differential equations and vector calculus' },
  { _id: 'sub_cst_2_2', name: 'Chemistry', slug: 'chemistry', semesterNumber: 2, departmentId: defaultDepartments[0], description: 'Applied chemistry concepts' },
  { _id: 'sub_cst_2_3', name: 'Basic Electrical Engineering', slug: 'basic-electrical-engineering', semesterNumber: 2, departmentId: defaultDepartments[0], description: 'AC & DC circuits' },
  { _id: 'sub_cst_2_4', name: 'C Programming', slug: 'c-programming', semesterNumber: 2, departmentId: defaultDepartments[0], description: 'Fundamentals of C language' },
  { _id: 'sub_cst_2_5', name: 'Workshop Practice', slug: 'workshop-practice', semesterNumber: 2, departmentId: defaultDepartments[0], description: 'Practical engineering lab' },

  { _id: 'sub_cst_3_1', name: 'Data Structures', slug: 'data-structures', semesterNumber: 3, departmentId: defaultDepartments[0], description: 'Arrays, linked lists, trees, graphs' },
  { _id: 'sub_cst_3_2', name: 'Digital Electronics', slug: 'digital-electronics', semesterNumber: 3, departmentId: defaultDepartments[0], description: 'Logic gates, flip-flops, counters' },
  { _id: 'sub_cst_3_3', name: 'Database Management Systems', slug: 'database-management-systems', semesterNumber: 3, departmentId: defaultDepartments[0], description: 'SQL, normalization, indexing' },
  { _id: 'sub_cst_3_4', name: 'Object Oriented Programming', slug: 'object-oriented-programming', semesterNumber: 3, departmentId: defaultDepartments[0], description: 'C++ & OOP principles' },
  { _id: 'sub_cst_3_5', name: 'Computer Networks', slug: 'computer-networks', semesterNumber: 3, departmentId: defaultDepartments[0], description: 'OSI model, TCP/IP, routing' },

  { _id: 'sub_cst_4_1', name: 'Operating Systems', slug: 'operating-systems', semesterNumber: 4, departmentId: defaultDepartments[0], description: 'Processes, memory management, file systems' },
  { _id: 'sub_cst_4_2', name: 'Java Programming', slug: 'java-programming', semesterNumber: 4, departmentId: defaultDepartments[0], description: 'Core Java, multithreading, collections' },
  { _id: 'sub_cst_4_3', name: 'Web Technology', slug: 'web-technology', semesterNumber: 4, departmentId: defaultDepartments[0], description: 'HTML, CSS, JavaScript, DOM' },

  // EE Semesters 1-3
  { _id: 'sub_ee_1_1', name: 'Mathematics-I', slug: 'mathematics-i', semesterNumber: 1, departmentId: defaultDepartments[1], description: 'Calculus and matrices' },
  { _id: 'sub_ee_1_2', name: 'Electrical Engineering Fundamentals', slug: 'electrical-engineering-fundamentals', semesterNumber: 1, departmentId: defaultDepartments[1], description: 'Basic circuits' },
  { _id: 'sub_ee_3_1', name: 'Circuit Theory', slug: 'circuit-theory', semesterNumber: 3, departmentId: defaultDepartments[1], description: 'Network theorems & transient analysis' },
  { _id: 'sub_ee_3_2', name: 'Electrical Machines-I', slug: 'electrical-machines-i', semesterNumber: 3, departmentId: defaultDepartments[1], description: 'Transformers & DC machines' },

  // ETC Semesters 1-3
  { _id: 'sub_etc_1_1', name: 'Mathematics-I', slug: 'mathematics-i', semesterNumber: 1, departmentId: defaultDepartments[2], description: 'Applied mathematics' },
  { _id: 'sub_etc_3_1', name: 'Electronic Devices & Circuits', slug: 'electronic-devices-circuits', semesterNumber: 3, departmentId: defaultDepartments[2], description: 'Diodes, transistors, amplifiers' },
  { _id: 'sub_etc_3_2', name: 'Communication Engineering', slug: 'communication-engineering', semesterNumber: 3, departmentId: defaultDepartments[2], description: 'Analog & digital modulation' },
];

export const defaultResources = [
  {
    _id: 'res_1',
    title: 'Data Structures Complete Lecture Notes (PDF)',
    description: 'Comprehensive chapter-wise handwritten notes covering Stacks, Queues, Trees, and Sorting algorithms.',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    category: 'Notes',
    upvotes: 42,
    downvotes: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    subjectId: defaultSubjects[10],
  },
  {
    _id: 'res_2',
    title: '2023 DBMS Model Question Paper with Answers',
    description: 'Official board model question paper with detailed solved answers.',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    category: 'Model Question Papers',
    upvotes: 28,
    downvotes: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    subjectId: defaultSubjects[12],
  },
  {
    _id: 'res_3',
    title: 'C Programming Lab Manual & Solution Codes',
    description: 'All 15 required lab experiment programs with output screenshots.',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    category: 'Lab Manuals',
    upvotes: 35,
    downvotes: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    subjectId: defaultSubjects[8],
  },
];

export const defaultDevelopers = [
  {
    _id: 'dev_1',
    name: 'Lead Developer & Architect',
    role: 'Full-Stack Developer',
    bio: 'Creator & Lead Engineer of Dip-Desk. Passionate about empowering engineering diploma students with accessible study materials.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
    instagramUrl: 'https://instagram.com',
    emailUrl: 'mailto:developer@diplomahub.com',
    portfolioUrl: 'https://diplomahub.com',
    order: 1,
    isActive: true,
  },
  {
    _id: 'dev_2',
    name: 'UI/UX Specialist',
    role: 'Product & Frontend Designer',
    bio: 'Crafts intuitive, responsive user interfaces and modern visual experiences for diploma students across all devices.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
    instagramUrl: 'https://instagram.com',
    emailUrl: 'mailto:design@diplomahub.com',
    portfolioUrl: 'https://diplomahub.com',
    order: 2,
    isActive: true,
  },
];

export const defaultNotices = [
  {
    _id: 'notice_1',
    title: 'Upcoming Diploma Semester Final Examination Schedule 2026',
    content: 'The official end-semester diploma examination schedule has been published for CST, EE, and ETC branches. Check model question papers for revision.',
    badge: 'Exam',
    isPinned: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'notice_2',
    title: 'New Lab Manuals & Solution Codes Uploaded',
    content: 'Updated C Programming & Data Structures practical lab manuals with verified output screenshots are now available under 2nd and 3rd semester subjects.',
    badge: 'Update',
    isPinned: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];
