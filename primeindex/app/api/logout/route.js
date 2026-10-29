import {J} from '@/lib';
export async function POST(){const r=J({ok:1});r.headers.set('Set-Cookie','pi=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return r}
