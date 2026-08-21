import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from './dbConnect';
import Developer from './models/Developer';
import Department from './models/Department';
import Subject from './models/Subject';
import Resource from './models/Resource';
import Notice from './models/Notice';
import User from './models/User';
import ResourceRequest from './models/ResourceRequest';
import {
  defaultDevelopers,
  defaultDepartments,
  defaultSubjects,
  defaultResources,
  defaultNotices,
} from './defaultData';

const DATA_DIR = process.env.VERCEL || process.env.NODE_ENV === 'production'
  ? '/tmp'
  : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  developers: any[];
  departments: any[];
  subjects: any[];
  resources: any[];
  notices?: any[];
  deletedIds?: string[];
  users?: any[];
}

function getInitialStore(): StoreData {
  return {
    developers: [...defaultDevelopers],
    departments: [...defaultDepartments],
    subjects: [...defaultSubjects],
    resources: [...defaultResources],
    notices: [...defaultNotices],
    deletedIds: [],
    users: [],
  };
}

declare global {
  var _inMemoryStore: StoreData | undefined;
}

function readLocalStore(): StoreData {
  if (global._inMemoryStore) {
    return global._inMemoryStore;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial = getInitialStore();
      try { fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8'); } catch {}
      global._inMemoryStore = initial;
      return initial;
    }
    const content = fs.readFileSync(STORE_FILE, 'utf-8');
    const data = JSON.parse(content);
    const store = {
      developers: Array.isArray(data.developers) ? data.developers : defaultDevelopers,
      departments: Array.isArray(data.departments) ? data.departments : defaultDepartments,
      subjects: Array.isArray(data.subjects) ? data.subjects : defaultSubjects,
      resources: Array.isArray(data.resources) ? data.resources : defaultResources,
      notices: Array.isArray(data.notices) ? data.notices : defaultNotices,
      deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : [],
      users: Array.isArray(data.users) ? data.users : [],
    };
    global._inMemoryStore = store;
    return store;
  } catch {
    const initial = getInitialStore();
    global._inMemoryStore = initial;
    return initial;
  }
}

function saveLocalStore(data: StoreData) {
  global._inMemoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Local file write skipped (using in-memory store):', e);
  }
}

export async function isDbConnected(): Promise<boolean> {
  if ((mongoose.connection.readyState as number) === 1) return true;
  try {
    await dbConnect();
    return (mongoose.connection.readyState as number) === 1;
  } catch (e) {
    console.error('MongoDB connection attempt error:', e);
    return false;
  }
}

// --- DEVELOPERS ---
export async function getDevelopersStore(includeInactive = false) {
  try {
    await dbConnect();
    const query = includeInactive ? {} : { isActive: { $ne: false } };
    const devs = await Developer.find(query).sort({ order: 1, createdAt: 1 });
    return devs;
  } catch (err) {
    console.error('Failed to fetch developers from DB:', err);
  }
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  let list = (store.developers || []).filter((dev) => !deleted.includes(dev._id));
  if (!includeInactive) {
    list = list.filter((dev: any) => dev.isActive !== false);
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function createDeveloperStore(data: any) {
  try {
    await dbConnect();
    const created = await Developer.create({ ...data, isActive: data.isActive !== undefined ? data.isActive : true });
    return created;
  } catch (err) {
    console.error('Failed to create developer in DB:', err);
  }

  const store = readLocalStore();
  const newDev = {
    _id: `dev_${Date.now()}`,
    ...data,
    order: data.order || store.developers.length + 1,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.developers.push(newDev);
  saveLocalStore(store);
  return newDev;
}

export async function updateDeveloperStore(id: string, data: any) {
  try {
    await dbConnect();
    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Developer.findByIdAndUpdate(id, data, { new: true });
    }
    if (!updated) {
      updated = await Developer.findOneAndUpdate({ _id: id }, data, { new: true });
    }
    if (updated) return updated;
  } catch (err) {
    console.error('Failed to update developer in DB:', err);
  }

  const store = readLocalStore();
  const index = store.developers.findIndex((d) => d._id === id);
  if (index !== -1) {
    store.developers[index] = {
      ...store.developers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return store.developers[index];
  }

  const updatedDev = { _id: id, ...data, updatedAt: new Date().toISOString() };
  store.developers.push(updatedDev);
  saveLocalStore(store);
  return updatedDev;
}

export async function deleteDeveloperStore(id: string) {
  try {
    await dbConnect();
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Developer.findByIdAndDelete(id);
    }
    await Developer.deleteOne({ _id: id });
  } catch (err) {
    console.error('Failed to delete developer from DB:', err);
  }

  const store = readLocalStore();
  if (!store.deletedIds) store.deletedIds = [];
  if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
  store.developers = store.developers.filter((d) => d._id !== id);
  saveLocalStore(store);
  return true;
}

// --- DEPARTMENTS ---
export async function getDepartmentsStore(includeInactive = false) {
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  try {
    await dbConnect();
    const query = includeInactive ? {} : { isActive: { $ne: false } };
    const depts = await Department.find(query).sort({ name: 1 });
    return depts.filter((d: any) => !deleted.includes(d._id.toString()) && !deleted.includes(d.slug));
  } catch (err) {
    console.error('Failed to fetch departments from DB:', err);
  }
  let list = (store.departments || []).filter((d) => !deleted.includes(d._id) && !deleted.includes(d.slug));
  if (!includeInactive) {
    list = list.filter((d: any) => d.isActive !== false);
  }
  return list;
}

export async function createDepartmentStore(data: any) {
  const slug = data.slug || data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
  const cleanData = {
    ...data,
    slug,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  try {
    await dbConnect();
    const created = await Department.create(cleanData);
    return created;
  } catch (err) {
    console.error('Failed to create department in MongoDB:', err);
  }

  const store = readLocalStore();
  const newDept = {
    _id: `dept_${Date.now()}`,
    ...cleanData,
  };
  store.departments.push(newDept);
  saveLocalStore(store);
  return newDept;
}

export async function updateDepartmentStore(id: string, data: any) {
  try {
    await dbConnect();
    const updateData = { ...data };
    if (data.slug || data.name) {
      updateData.slug = (data.slug || data.name).toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
    }
    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Department.findByIdAndUpdate(id, updateData, { new: true });
    }
    if (!updated) {
      updated = await Department.findOneAndUpdate({ $or: [{ _id: id }, { slug: id }] }, updateData, { new: true });
    }
    if (updated) return updated;
  } catch (err) {
    console.error('Failed to update department in MongoDB:', err);
  }

  const store = readLocalStore();
  const index = store.departments.findIndex((d) => d._id === id || d.slug === id);
  if (index !== -1) {
    store.departments[index] = {
      ...store.departments[index],
      ...data,
    };
    saveLocalStore(store);
    return store.departments[index];
  }

  const updatedDept = { _id: id, ...data };
  store.departments.push(updatedDept);
  saveLocalStore(store);
  return updatedDept;
}

export async function deleteDepartmentStore(id: string) {
  try {
    await dbConnect();
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Department.findByIdAndDelete(id);
    }
    await Department.deleteOne({ $or: [{ _id: id }, { slug: id }] });
  } catch (err) {
    console.error('Failed to delete department from DB:', err);
  }

  const store = readLocalStore();
  if (!store.deletedIds) store.deletedIds = [];
  if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
  store.departments = store.departments.filter((d) => d._id !== id && d.slug !== id);
  saveLocalStore(store);
  return true;
}

// --- SUBJECTS ---
export async function getSubjectsStore(departmentSlug?: string, semesterNumber?: number, includeInactive = false) {
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  try {
    await dbConnect();
    const filter: any = {};
    if (!includeInactive) filter.isActive = { $ne: false };
    if (semesterNumber) filter.semesterNumber = semesterNumber;
    if (departmentSlug) {
      const dept = await Department.findOne({ $or: [{ slug: departmentSlug }, { _id: mongoose.Types.ObjectId.isValid(departmentSlug) ? departmentSlug : undefined }] });
      if (dept) {
        filter.$or = [{ departmentId: dept._id }, { departmentId: 'all' }, { departmentSlug: 'all' }];
      }
    }
    const subjects = await Subject.find(filter).populate('departmentId', 'name slug').sort({ name: 1 });
    return subjects.filter((s: any) => !deleted.includes(s._id.toString()) && !deleted.includes(s.slug));
  } catch (err) {
    console.error('Failed to fetch subjects from DB:', err);
  }

  let list = (store.subjects || []).filter((s) => !deleted.includes(s._id) && !deleted.includes(s.slug));
  if (!includeInactive) {
    list = list.filter((s: any) => s.isActive !== false);
  }
  if (departmentSlug) {
    list = list.filter((s) => {
      const deptSlug = s.departmentSlug || s.departmentId?.slug || (typeof s.departmentId === 'string' ? s.departmentId.replace(/^dept_/, '') : '');
      if (deptSlug === 'all' || s.departmentId === 'all' || s.departmentSlug === 'all') return true;
      return deptSlug === departmentSlug || s.departmentId === departmentSlug;
    });
  }
  if (semesterNumber) {
    list = list.filter((s) => s.semesterNumber === semesterNumber);
  }
  return list;
}

export async function createSubjectStore(data: any) {
  const slug = data.slug || data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
  let deptId = data.departmentId;
  if (typeof deptId === 'object' && deptId?._id) deptId = deptId._id;

  try {
    await dbConnect();
    if (typeof deptId === 'string' && !mongoose.Types.ObjectId.isValid(deptId)) {
      const foundDept = await Department.findOne({ $or: [{ slug: deptId }, { name: deptId }] });
      if (foundDept) deptId = foundDept._id;
    }

    const created = await Subject.create({
      ...data,
      slug,
      departmentId: deptId,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    return created;
  } catch (err) {
    console.error('Failed to create subject in MongoDB:', err);
  }

  const store = readLocalStore();
  const newSub = {
    _id: `sub_${Date.now()}`,
    slug,
    isActive: true,
    ...data,
    departmentId: deptId,
  };
  store.subjects.push(newSub);
  saveLocalStore(store);
  return newSub;
}

export async function updateSubjectStore(id: string, data: any) {
  let deptId = data.departmentId;
  if (typeof deptId === 'object' && deptId?._id) deptId = deptId._id;

  try {
    await dbConnect();
    if (deptId && typeof deptId === 'string' && !mongoose.Types.ObjectId.isValid(deptId)) {
      const foundDept = await Department.findOne({ $or: [{ slug: deptId }, { name: deptId }] });
      if (foundDept) deptId = foundDept._id;
    }
    const updateData = { ...data };
    if (data.slug || data.name) {
      updateData.slug = (data.slug || data.name).toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
    }
    if (deptId) updateData.departmentId = deptId;

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Subject.findByIdAndUpdate(id, updateData, { new: true });
    }
    if (!updated) {
      updated = await Subject.findOneAndUpdate({ $or: [{ _id: id }, { slug: id }] }, updateData, { new: true });
    }
    if (updated) return updated;
  } catch (err) {
    console.error('Failed to update subject in MongoDB:', err);
  }

  const store = readLocalStore();
  const index = store.subjects.findIndex((s) => s._id === id || s.slug === id);
  if (index !== -1) {
    store.subjects[index] = { ...store.subjects[index], ...data };
    saveLocalStore(store);
    return store.subjects[index];
  }
  const updatedSub = { _id: id, ...data };
  store.subjects.push(updatedSub);
  saveLocalStore(store);
  return updatedSub;
}

export async function deleteSubjectStore(id: string) {
  try {
    await dbConnect();
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Subject.findByIdAndDelete(id);
    }
    await Subject.deleteOne({ $or: [{ _id: id }, { slug: id }] });
  } catch (err) {
    console.error('Failed to delete subject from DB:', err);
  }

  const store = readLocalStore();
  if (!store.deletedIds) store.deletedIds = [];
  if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
  store.subjects = store.subjects.filter((s) => s._id !== id && s.slug !== id);
  saveLocalStore(store);
  return true;
}

// --- RESOURCES ---
export async function getResourcesStore(category?: string, subjectId?: string) {
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  try {
    await dbConnect();
    const filter: any = {};
    if (category) filter.category = category;
    if (subjectId) {
      filter.$or = [
        { subjectId: mongoose.Types.ObjectId.isValid(subjectId) ? subjectId : undefined },
      ].filter((c) => c.subjectId !== undefined);
      if (!filter.$or.length) {
        const foundSub = await Subject.findOne({ slug: subjectId });
        if (foundSub) filter.subjectId = foundSub._id;
      }
    }
    const resList = await Resource.find(filter)
      .populate({
        path: 'subjectId',
        select: 'name slug semesterNumber',
        populate: { path: 'departmentId', select: 'name slug' },
      })
      .sort({ createdAt: -1 });
    return resList.filter((r: any) => !deleted.includes(r._id.toString()));
  } catch (err) {
    console.error('Failed to fetch resources from DB:', err);
  }

  let list = (store.resources || []).filter((r) => !deleted.includes(r._id));
  if (category) list = list.filter((r) => r.category === category);
  if (subjectId) list = list.filter((r) => r.subjectId?._id === subjectId || r.subjectId === subjectId || r.subjectId?.slug === subjectId);
  return list;
}

export async function createResourceStore(data: any) {
  const isDb = await isDbConnected();
  let subId = data.subjectId;
  if (typeof subId === 'object' && subId?._id) subId = subId._id;

  if (isDb) {
    try {
      if (typeof subId === 'string' && !mongoose.Types.ObjectId.isValid(subId)) {
        const foundSub = await Subject.findOne({ $or: [{ slug: subId }, { name: subId }] });
        if (foundSub) subId = foundSub._id;
      }

      const defaultUploaderId = new mongoose.Types.ObjectId();
      const created = await Resource.create({
        ...data,
        subjectId: subId,
        uploaderId: data.uploaderId || defaultUploaderId,
        isActive: true,
        upvotes: 0,
        downvotes: 0,
      });
      const populated = await Resource.findById(created._id).populate({
        path: 'subjectId',
        select: 'name slug semesterNumber',
        populate: { path: 'departmentId', select: 'name slug' },
      });
      return populated || created;
    } catch (err) {
      console.error('Failed to create resource in MongoDB:', err);
    }
  }

  const store = readLocalStore();
  const newRes = {
    _id: `res_${Date.now()}`,
    upvotes: 0,
    downvotes: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...data,
    subjectId: subId,
  };
  store.resources.unshift(newRes);
  saveLocalStore(store);
  return newRes;
}

export async function updateResourceStore(id: string, data: any) {
  const isDb = await isDbConnected();
  let subId = data.subjectId;
  if (typeof subId === 'object' && subId?._id) subId = subId._id;

  if (isDb) {
    try {
      if (subId && typeof subId === 'string' && !mongoose.Types.ObjectId.isValid(subId)) {
        const foundSub = await Subject.findOne({ $or: [{ slug: subId }, { name: subId }] });
        if (foundSub) subId = foundSub._id;
      }
      const updateData = { ...data };
      if (subId) updateData.subjectId = subId;

      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Resource.findByIdAndUpdate(id, updateData, { new: true }).populate({
          path: 'subjectId',
          select: 'name slug semesterNumber',
          populate: { path: 'departmentId', select: 'name slug' },
        });
      }
      if (!updated) {
        updated = await Resource.findOneAndUpdate({ _id: id }, updateData, { new: true });
      }
      if (updated) return updated;
    } catch (err) {
      console.error('Failed to update resource in MongoDB:', err);
    }
  }

  const store = readLocalStore();
  const index = store.resources.findIndex((r) => r._id === id);
  if (index !== -1) {
    store.resources[index] = { ...store.resources[index], ...data };
    saveLocalStore(store);
    return store.resources[index];
  }
  const updatedRes = { _id: id, ...data };
  store.resources.unshift(updatedRes);
  saveLocalStore(store);
  return updatedRes;
}

export async function deleteResourceStore(id: string) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Resource.findByIdAndDelete(id);
      }
      await Resource.deleteOne({ _id: id });
    } catch {}
  }

  const store = readLocalStore();
  if (!store.deletedIds) store.deletedIds = [];
  if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
  store.resources = store.resources.filter((r) => r._id !== id);
  saveLocalStore(store);
  return true;
}

// --- USERS ---
export async function getUsersStore() {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    if (users && users.length > 0) return users;
  } catch (err) {
    console.error('Failed to fetch users from DB:', err);
  }
  const store = readLocalStore();
  return store.users || [];
}

export async function findUserByEmailStore(email: string) {
  if (!email) return null;
  try {
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) return user;
  } catch {}
  const store = readLocalStore();
  const lower = email.toLowerCase();
  const found = (store.users || []).find((u: any) => u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === lower);
  if (found) return found;

  return null;
}

export async function findUserByIdStore(id: string) {
  if (!id) return null;
  try {
    await dbConnect();
    if (mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findById(id);
      if (user) return user;
    }
  } catch {}
  const store = readLocalStore();
  const lower = id.toLowerCase();
  const found = (store.users || []).find(
    (u: any) => u && (u._id === id || (u.email && typeof u.email === 'string' && u.email.toLowerCase() === lower))
  );
  if (found) return found;

  return null;
}

export async function createUserStore(data: any) {
  try {
    await dbConnect();
    const created = await User.create({
      designation: data.designation || data.title || 'Student',
      bookmarks: [],
      resourceRequests: [],
      upvotedResources: [],
      downvotedResources: [],
      isBanned: false,
      isProfileComplete: true,
      ...data,
    });
    return created;
  } catch (err) {
    console.error('Failed to create user in DB:', err);
  }
  const store = readLocalStore();
  if (!store.users) store.users = [];
  const newUser = {
    _id: `user_${Date.now()}`,
    designation: data.designation || data.title || 'Student',
    isBanned: false,
    isProfileComplete: true,
    bookmarks: [],
    resourceRequests: [],
    upvotedResources: [],
    downvotedResources: [],
    createdAt: new Date().toISOString(),
    ...data,
  };
  store.users.push(newUser);
  saveLocalStore(store);
  return newUser;
}

export async function updateUserStore(id: string, data: any) {
  if (!id) return null;
  try {
    await dbConnect();
    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await User.findByIdAndUpdate(id, data, { new: true });
    }
    if (!updated) {
      updated = await User.findOneAndUpdate({ email: id.toLowerCase() }, data, { new: true });
    }
    if (updated) return updated;
  } catch (err) {
    console.error('Failed to update user in DB:', err);
  }

  const store = readLocalStore();
  if (!store.users) store.users = [];
  const lower = id.toLowerCase();
  const index = store.users.findIndex(
    (u: any) => u && (u._id === id || (u.email && typeof u.email === 'string' && u.email.toLowerCase() === lower))
  );
  if (index !== -1) {
    store.users[index] = { ...store.users[index], ...data };
    saveLocalStore(store);
    return store.users[index];
  }
  const updated = { _id: id, ...data };
  store.users.push(updated);
  saveLocalStore(store);
  return updated;
}

// --- NOTICES ---
export async function getNoticesStore(includeInactive = false) {
  try {
    await dbConnect();
    const query = includeInactive ? {} : { isActive: { $ne: false } };
    const notices = await Notice.find(query).sort({ isPinned: -1, createdAt: -1 });
    return notices;
  } catch (err) {
    console.error('Failed to fetch notices from DB:', err);
  }
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  let list = (store.notices || []).filter((n) => !deleted.includes(n._id));
  if (!includeInactive) {
    list = list.filter((n: any) => n.isActive !== false);
  }
  return list;
}

export async function createNoticeStore(data: any) {
  try {
    await dbConnect();
    const created = await Notice.create({
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    return created;
  } catch (err) {
    console.error('Failed to create notice in DB:', err);
  }

  const store = readLocalStore();
  if (!store.notices) store.notices = [];
  const newNotice = {
    _id: `notice_${Date.now()}`,
    badge: data.badge || 'Important',
    isPinned: data.isPinned || false,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date().toISOString(),
    ...data,
  };
  store.notices.unshift(newNotice);
  saveLocalStore(store);
  return newNotice;
}

export async function updateNoticeStore(id: string, data: any) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Notice.findByIdAndUpdate(id, data, { new: true });
      }
      if (!updated) {
        updated = await Notice.findOneAndUpdate({ _id: id }, data, { new: true });
      }
      if (updated) return updated;
    } catch {}
  }

  const store = readLocalStore();
  if (!store.notices) store.notices = [...defaultNotices];
  const index = store.notices.findIndex((n) => n._id === id);
  if (index !== -1) {
    store.notices[index] = { ...store.notices[index], ...data };
    saveLocalStore(store);
    return store.notices[index];
  }
  const updatedNotice = { _id: id, ...data };
  store.notices.unshift(updatedNotice);
  saveLocalStore(store);
  return updatedNotice;
}

export async function deleteNoticeStore(id: string) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Notice.findByIdAndDelete(id);
      }
      await Notice.deleteOne({ _id: id });
    } catch {}
  }

  const store = readLocalStore();
  if (!store.notices) store.notices = [...defaultNotices];
  if (!store.deletedIds) store.deletedIds = [];
  if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
  store.notices = store.notices.filter((n) => n._id !== id);
  saveLocalStore(store);
  return true;
}

// --- REQUESTS ---
export async function getRequestsStore() {
  let mongoRequests: any[] = [];
  try {
    await dbConnect();
    mongoRequests = await ResourceRequest.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error('Failed to fetch requests from DB:', err);
  }
  const store = readLocalStore();
  const localRequests = (store as any).requests || [];

  const combined = [...mongoRequests];
  for (const r of localRequests) {
    if (r._id && !combined.some((m: any) => m._id?.toString() === r._id || m.id === r._id)) {
      combined.push(r);
    }
  }

  return combined;
}

export async function createRequestStore(data: any) {
  let createdDb = null;
  try {
    await dbConnect();
    createdDb = await ResourceRequest.create({
      status: 'Pending',
      ...data,
    });
  } catch (err) {
    console.error('Failed to create request in DB:', err);
  }

  const store = readLocalStore();
  if (!(store as any).requests) (store as any).requests = [];
  const newReq = {
    _id: createdDb?._id?.toString() || `req_${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    ...data,
  };
  (store as any).requests.unshift(newReq);
  saveLocalStore(store);
  return createdDb || newReq;
}

export async function updateRequestStore(id: string, data: any) {
  try {
    await dbConnect();
    if (mongoose.Types.ObjectId.isValid(id)) {
      await ResourceRequest.findByIdAndUpdate(id, data, { new: true });
    }
    await ResourceRequest.findOneAndUpdate({ _id: id }, data, { new: true });
  } catch (err) {
    console.error('Failed to update request in DB:', err);
  }

  const store = readLocalStore();
  if (!(store as any).requests) (store as any).requests = [];
  const index = (store as any).requests.findIndex((r: any) => r._id === id);
  if (index !== -1) {
    (store as any).requests[index] = { ...(store as any).requests[index], ...data };
    saveLocalStore(store);
    return (store as any).requests[index];
  }
  return { _id: id, ...data };
}

export async function deleteRequestStore(id: string) {
  try {
    await dbConnect();
    if (mongoose.Types.ObjectId.isValid(id)) {
      await ResourceRequest.findByIdAndDelete(id);
    }
    await ResourceRequest.deleteOne({ _id: id });
  } catch (err) {
    console.error('Failed to delete request in DB:', err);
  }

  const store = readLocalStore();
  if ((store as any).requests) {
    (store as any).requests = (store as any).requests.filter((r: any) => r._id !== id);
    saveLocalStore(store);
  }
  return true;
}

// --- BOOKMARKS & VOTES ---
export async function toggleBookmarkStore(userId: string, resourceId: string) {
  const store = readLocalStore();
  if (!store.users) store.users = [];
  const lower = userId ? userId.toLowerCase() : '';
  let user = store.users.find(
    (u: any) => u && (u._id === userId || (u.email && typeof u.email === 'string' && u.email.toLowerCase() === lower))
  );
  if (!user) {
    user = { _id: userId, email: userId, bookmarks: [] };
    store.users.push(user);
  }
  if (!user.bookmarks) user.bookmarks = [];

  const index = user.bookmarks.indexOf(resourceId);
  let isBookmarked = false;
  if (index !== -1) {
    user.bookmarks.splice(index, 1);
    isBookmarked = false;
  } else {
    user.bookmarks.push(resourceId);
    isBookmarked = true;
  }
  saveLocalStore(store);
  return isBookmarked;
}

export async function toggleVoteStore(userId: string, resourceId: string, vote: 'up' | 'down') {
  const store = readLocalStore();
  if (!store.resources) store.resources = defaultResources;
  const resIndex = store.resources.findIndex((r) => r._id === resourceId);
  if (resIndex !== -1) {
    const resource = store.resources[resIndex];
    if (!resource.ratings) resource.ratings = [];

    const existingIndex = resource.ratings.findIndex((r: any) => r.userId === userId);
    if (existingIndex !== -1) {
      const existing = resource.ratings[existingIndex];
      if (existing.vote === vote) {
        if (vote === 'up') resource.upvotes = Math.max(0, (resource.upvotes || 1) - 1);
        else resource.downvotes = Math.max(0, (resource.downvotes || 1) - 1);
        resource.ratings.splice(existingIndex, 1);
      } else {
        if (vote === 'up') {
          resource.upvotes = (resource.upvotes || 0) + 1;
          resource.downvotes = Math.max(0, (resource.downvotes || 1) - 1);
        } else {
          resource.downvotes = (resource.downvotes || 0) + 1;
          resource.upvotes = Math.max(0, (resource.upvotes || 1) - 1);
        }
        resource.ratings[existingIndex].vote = vote;
      }
    } else {
      resource.ratings.push({ userId, vote });
      if (vote === 'up') resource.upvotes = (resource.upvotes || 0) + 1;
      else resource.downvotes = (resource.downvotes || 0) + 1;
    }
    saveLocalStore(store);
    return { upvotes: resource.upvotes, downvotes: resource.downvotes };
  }
  return { upvotes: 0, downvotes: 0 };
}
