import bcrypt from 'bcryptjs';import {sign,audit,limited,J} from '@/lib';
export async function POST(req){if(limited(req,6))return J({error:'Too many attempts'},429);const {email,password}=await req.json().catch(()=>({}));
if(email!==process.env.ADMIN_EMAIL||!(await bcrypt.compare(String(password||''),process.env.ADMIN_PASSWORD_HASH||'x'))){await audit('login_failed',email);return J({error:'Invalid credentials'},401)}
await audit('login',email);const r=J({ok:1});r.headers.set('Set-Cookie',`pi=${await sign()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);return r}
