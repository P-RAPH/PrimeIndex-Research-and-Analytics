import {z} from 'zod';import {db,mail,limited,J} from '@/lib';
export async function POST(req){if(limited(req))return J({error:'Too many requests'},429);const p=z.object({email:z.string().trim().email(),consent:z.literal(true)}).safeParse(await req.json().catch(()=>({})));if(!p.success)return J({error:'Invalid'},400);
const s=await db.subscriber.upsert({where:{email:p.data.email},update:{},create:{email:p.data.email}});const u=process.env.SITE_URL+'/api/subscribe?';
await mail(s.email,'Confirm your PrimeIndex subscription',`Confirm: ${u}c=${s.token}\nUnsubscribe any time: ${u}u=${s.token}`);return J({ok:1})}
export async function GET(req){const q=new URL(req.url).searchParams;
if(q.get('c'))await db.subscriber.updateMany({where:{token:q.get('c')},data:{confirmed:true}});if(q.get('u'))await db.subscriber.deleteMany({where:{token:q.get('u')}});
return new Response('Done. You can close this page.',{headers:{'content-type':'text/plain'}})}
