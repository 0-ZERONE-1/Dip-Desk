import fs from 'fs';
import path from 'path';
import dbConnect from './dbConnect';
import Developer from './models/Developer';
import Department from './models/Department';
import Subject from './models/Subject';
import Resource from './models/Resource';
import Notice from './models/Notice';
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

// Cache DB availability — once we know it's unavailable, don't waste time retrying every request
let _dbAvailable: boolean | null = null;
let _dbCheckPromise: Promise<boolean> | null = null;

async function isDbConnected(): Promise<boolean> {
  // Already confirmed available/unavailable — return immediately
  if (_dbAvailable !== null) return _dbAvailable;

  // If a check is already in-flight, reuse it instead of spawning a second one
  if (!_dbCheckPromise) {
    _dbCheckPromise = dbConnect()
      .then(() => { _dbAvailable = true; return true; })
      .catch(() => { _dbAvailable = false; return false; });
  }

  return _dbCheckPromise;
}

// --- DEVELOPERS ---
export async function getDevelopersStore() {
  if (await isDbConnected()) {
    try {
      const devs = await Developer.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
      if (devs.length > 0) return devs;
    } catch {}
  }
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  return (store.developers || [])
    .filter((dev) => !deleted.includes(dev._id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function createDeveloperStore(data: any) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      const created = await Developer.create({ ...data, isActive: true });
      return created;
    } catch {}
  }

  const store = readLocalStore();
  const newDev = {
    _id: `dev_${Date.now()}`,
    ...data,
    order: data.order || store.developers.length + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.developers.push(newDev);
  saveLocalStore(store);
  return newDev;
}

export async function updateDeveloperStore(id: string, data: any) {
  const isDb = await isDbConnected();

  if (isDb && id.length === 24) {
    try {
      const updated = await Developer.findByIdAndUpdate(id, data, { new: true });
      if (updated) return updated;
    } catch {}
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
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      if (id.length === 24) {
        await Developer.findByIdAndDelete(id);
      } else {
        await Developer.deleteOne({ _id: id });
      }
    } catch {}
  }

  const store = readLocalStore();
  if (!store.deletedIds) store.deletedIds = [];
  if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
  store.developers = store.developers.filter((d) => d._id !== id);
  saveLocalStore(store);
  return true;
}

// --- DEPARTMENTS ---
export async function getDepartmentsStore() {
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  if (await isDbConnected()) {
    try {
      const depts = await Department.find({ isActive: true }).sort({ name: 1 });
      if (depts.length > 0) {
        return depts.filter((d: any) => !deleted.includes(d._id.toString()) && !deleted.includes(d.slug));
      }
    } catch {}
  }
  return (store.departments || []).filter((d) => !deleted.includes(d._id) && !deleted.includes(d.slug));
}

export async function createDepartmentStore(data: any) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      const created = await Department.create(data);
      return created;
    } catch {}
  }

  const store = readLocalStore();
  const slug = data.slug || data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
  const newDept = {
    _id: `dept_${Date.now()}`,
    slug,
    isActive: true,
    ...data,
  };
  store.departments.push(newDept);
  saveLocalStore(store);
  return newDept;
}

export async function updateDepartmentStore(id: string, data: any) {
  const isDb = await isDbConnected();
  if (isDb && id.length === 24) {
    try {
      const updated = await Department.findByIdAndUpdate(id, data, { new: true });
      if (updated) return updated;
    } catch {}
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
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      if (id.length === 24) {
        await Department.findByIdAndDelete(id);
      } else {
        await Department.deleteOne({ _id: id });
      }
    } catch {}
  }

  const store = readLocalStore();
  if (!store.deletedIds) store.deletedIds = [];
  if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
  store.departments = store.departments.filter((d) => d._id !== id && d.slug !== id);
  saveLocalStore(store);
  return true;
}

// --- SUBJECTS ---
export async function getSubjectsStore(departmentSlug?: string, semesterNumber?: number) {
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  if (await isDbConnected()) {
    try {
      const filter: any = { isActive: true };
      if (semesterNumber) filter.semesterNumber = semesterNumber;
      if (departmentSlug) {
        const dept = await Department.findOne({ slug: departmentSlug });
        if (dept) filter.departmentId = dept._id;
      }
      const subjects = await Subject.find(filter).populate('departmentId', 'name slug').sort({ name: 1 });
      if (subjects.length > 0) {
        return subjects.filter((s: any) => !deleted.includes(s._id.toString()) && !deleted.includes(s.slug));
      }
    } catch {}
  }

  let list = (store.subjects || []).filter((s) => !deleted.includes(s._id) && !deleted.includes(s.slug));
  if (departmentSlug) {
    list = list.filter((s) => s.departmentId?.slug === departmentSlug || s.departmentSlug === departmentSlug);
  }
  if (semesterNumber) {
    list = list.filter((s) => s.semesterNumber === semesterNumber);
  }
  return list;
}

export async function createSubjectStore(data: any) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      const created = await Subject.create(data);
      return created;
    } catch {}
  }

  const store = readLocalStore();
  const slug = data.slug || data.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
  const newSub = {
    _id: `sub_${Date.now()}`,
    slug,
    isActive: true,
    ...data,
  };
  store.subjects.push(newSub);
  saveLocalStore(store);
  return newSub;
}

export async function updateSubjectStore(id: string, data: any) {
  const isDb = await isDbConnected();
  if (isDb && id.length === 24) {
    try {
      const updated = await Subject.findByIdAndUpdate(id, data, { new: true });
      if (updated) return updated;
    } catch {}
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
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      if (id.length === 24) {
        await Subject.findByIdAndDelete(id);
      } else {
        await Subject.deleteOne({ _id: id });
      }
    } catch {}
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
  if (await isDbConnected()) {
    try {
      const filter: any = {};
      if (category) filter.category = category;
      if (subjectId) filter.subjectId = subjectId;
      const resList = await Resource.find(filter)
        .populate({
          path: 'subjectId',
          select: 'name slug semesterNumber',
          populate: { path: 'departmentId', select: 'name slug' },
        })
        .sort({ createdAt: -1 });
      if (resList.length > 0) {
        return resList.filter((r: any) => !deleted.includes(r._id.toString()));
      }
    } catch {}
  }

  let list = (store.resources || []).filter((r) => !deleted.includes(r._id));
  if (category) list = list.filter((r) => r.category === category);
  if (subjectId) list = list.filter((r) => r.subjectId?._id === subjectId || r.subjectId === subjectId);
  return list;
}

export async function createResourceStore(data: any) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      const created = await Resource.create(data);
      return created;
    } catch {}
  }

  const store = readLocalStore();
  const newRes = {
    _id: `res_${Date.now()}`,
    upvotes: 0,
    downvotes: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...data,
  };
  store.resources.unshift(newRes);
  saveLocalStore(store);
  return newRes;
}

export async function updateResourceStore(id: string, data: any) {
  const isDb = await isDbConnected();
  if (isDb && id.length === 24) {
    try {
      const updated = await Resource.findByIdAndUpdate(id, data, { new: true });
      if (updated) return updated;
    } catch {}
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
      if (id.length === 24) {
        await Resource.findByIdAndDelete(id);
      } else {
        await Resource.deleteOne({ _id: id });
      }
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
  const store = readLocalStore();
  return store.users || [];
}

export async function findUserByEmailStore(email: string) {
  if (!email) return null;
  const store = readLocalStore();
  const lower = email.toLowerCase();
  const found = (store.users || []).find((u: any) => u && u.email && typeof u.email === 'string' && u.email.toLowerCase() === lower);
  if (found) return found;

  return null;
}

export async function findUserByIdStore(id: string) {
  if (!id) return null;
  const store = readLocalStore();
  const lower = id.toLowerCase();
  const found = (store.users || []).find(
    (u: any) => u && (u._id === id || (u.email && typeof u.email === 'string' && u.email.toLowerCase() === lower))
  );
  if (found) return found;

  return null;
}

export async function createUserStore(data: any) {
  const store = readLocalStore();
  if (!store.users) store.users = [];
  const newUser = {
    _id: `user_${Date.now()}`,
    role: 'student',
    isProfileComplete: true,
    createdAt: new Date().toISOString(),
    ...data,
  };
  store.users.push(newUser);
  saveLocalStore(store);
  return newUser;
}

export async function updateUserStore(id: string, data: any) {
  if (!id) return null;
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
export async function getNoticesStore() {
  if (await isDbConnected()) {
    try {
      const notices = await Notice.find({ isActive: true }).sort({ isPinned: -1, createdAt: -1 });
      if (notices.length > 0) return notices;
    } catch {}
  }
  const store = readLocalStore();
  const deleted = store.deletedIds || [];
  return (store.notices || defaultNotices).filter((n) => !deleted.includes(n._id));
}

export async function createNoticeStore(data: any) {
  const isDb = await isDbConnected();
  if (isDb) {
    try {
      const created = await Notice.create(data);
      return created;
    } catch {}
  }

  const store = readLocalStore();
  if (!store.notices) store.notices = [];
  const newNotice = {
    _id: `notice_${Date.now()}`,
    badge: data.badge || 'Important',
    isPinned: data.isPinned || false,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...data,
  };
  store.notices.unshift(newNotice);
  saveLocalStore(store);
  return newNotice;
}

export async function updateNoticeStore(id: string, data: any) {
  const isDb = await isDbConnected();
  if (isDb && id.length === 24) {
    try {
      const updated = await Notice.findByIdAndUpdate(id, data, { new: true });
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
  if (isDb && id.length === 24) {
    try {
      await Notice.findByIdAndDelete(id);
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
  const store = readLocalStore();
  return (store as any).requests || [];
}

export async function createRequestStore(data: any) {
  const store = readLocalStore();
  if (!(store as any).requests) (store as any).requests = [];
  const newReq = {
    _id: `req_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...data,
  };
  (store as any).requests.unshift(newReq);
  saveLocalStore(store);
  return newReq;
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
