
const mongoose = require('mongoose');
mongoose.connect('').then(async () => {
  const Department = mongoose.model('Department', new mongoose.Schema({}, { strict: false }));
  const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
  
  const depts = await Department.find({ $or: [{ slug: 'cst' }] });
  console.log('Matched Depts:', depts.length);
  const matchedIds = depts.map(d => d._id);
  console.log('Matched IDs:', matchedIds);
  
  const filter = {
    isActive: { $ne: false },
    semesterNumber: 3,
    $or: [
      { departmentId: { $in: matchedIds } },
      { departmentId: { $in: depts.map(d => d.slug) } }
    ]
  };
  
  console.log('Filter:', JSON.stringify(filter, null, 2));
  
  const subjects = await Subject.find(filter);
  console.log('Matched Subjects:', subjects.length);
  console.log('Subjects:', subjects.map(s => s.name));
  mongoose.disconnect();
}).catch(console.error);

