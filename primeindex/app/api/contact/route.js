import {z} from 'zod';import {db,mail,limited,J} from '@/lib';
const S=z.object({name:z.string().trim().min(2).max(120),email:z.string().trim().email(),phone:z.string().max(30).optional(),subject:z.string().trim().min(2).max(200),message:z.string().trim().min(5).max(4000)});
export async function POST(req){if(limited(req))return J({error:'Too many requests'},429);const p=S.safeParse(await req.json().catch(()=>({})));if(!p.success)return J({error:'Invalid data'},400);
await db.enquiry.create({data:p.data});await mail(process.env.NOTIFY_EMAIL,`Enquiry: ${p.data.subject}`,`${p.data.name} <${p.data.email}>\n\n${p.data.message}`);return J({ok:1})}
