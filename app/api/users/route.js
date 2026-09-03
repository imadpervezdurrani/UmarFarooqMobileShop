import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  const safeUsers = (store.users || []).map(({ password, ...rest }) => rest);
  return NextResponse.json({ success: true, data: safeUsers });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, role = 'staff', title = 'Sales Staff' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email, and password required' }, { status: 400 });
    }

    const existing = (store.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role,
      title,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (!store.users) store.users = [];
    store.users.push(newUser);
    await saveDB();

    const { password: p, ...safe } = newUser;
    return NextResponse.json({ success: true, data: safe, message: 'User created' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
