import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'admin-users.json');

export type AdminUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
};

type Store = { users: AdminUserRecord[] };

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw) as Store;
  } catch {
    return { users: [] };
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function findAdminByEmail(
  email: string
): Promise<AdminUserRecord | undefined> {
  const store = await readStore();
  const e = email.trim().toLowerCase();
  return store.users.find((u) => u.email === e);
}

export async function findAdminById(
  id: string
): Promise<AdminUserRecord | undefined> {
  const store = await readStore();
  return store.users.find((u) => u.id === id);
}

export async function createAdminUser(data: {
  email: string;
  passwordHash: string;
  name: string;
}): Promise<AdminUserRecord> {
  const store = await readStore();
  const email = data.email.trim().toLowerCase();
  if (store.users.some((u) => u.email === email)) {
    throw new Error('EMAIL_EXISTS');
  }
  const user: AdminUserRecord = {
    id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    email,
    passwordHash: data.passwordHash,
    name: data.name.trim() || email.split('@')[0] || 'Admin',
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  await writeStore(store);
  return user;
}
