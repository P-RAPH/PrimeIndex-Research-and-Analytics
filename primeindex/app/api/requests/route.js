import {z} from 'zod';import {put} from '@vercel/blob';import {db,mail,limited,audit,J} from '@/lib';
const S=z.object({name:z.string().trim().min(2).max(120),email:z.string().trim().email().max(160),phone:z.string().trim().min(6).max(30),org:z.string().trim().min(2).max(160),field:z.string().max(160).optional(),level:z.string().max(40),cat:z.string().max(80),svc:z.string().max(160),title:z.string().trim().min(3).max(200),desc:z.string().trim().min(10).max(5000),tools:z.string().max(200).optional(),deadline:z.string().min(8).max(20),via:z.string().max(20),budget:z.string().max(80).optional()});
const OK=/\.(pdf|docx?|xlsx?|csv|sav|pptx|png|jpe?g|txt)$/i;
export async function POST(req){if(limited(req,5))return J({error:'Too many requests'},429);
const f=await req.formData();if(f.get('website'))return J({ref:'PI-OK'});
const p=S.safeParse(Object.fromEntries([...f.entries()].filter(([,v])=>typeof v==='string')));if(!p.success)return J({error:'Invalid data'},400);const d=p.data;
const files=f.getAll('files').filter(x=>x&&x.size);if(files.length>3||files.reduce((t,x)=>t+x.size,0)>4*1024*1024||files.some(x=>!OK.test(x.name)))return J({error:'Files: max 3 files, 4 MB in total, common document types only'},400);
const r=await db.request.create({data:{name:d.name,email:d.email,phone:d.phone,org:d.org,field:d.field,level:d.level,category:d.cat,service:d.svc,title:d.title,description:d.desc,tools:d.tools,deadline:d.deadline,via:d.via,budget:d.budget}});
const ref=`PI-${new Date().getFullYear()}-${String(r.seq).padStart(4,'0')}`;await db.request.update({where:{id:r.id},data:{ref}});
let failed=0,why='';
for(const x of files){try{const b=await put(`requests/${ref}/${x.name.replace(/[^\w.-]/g,'_')}`,x,{access:'public',addRandomSuffix:true});await db.attachment.create({data:{requestId:r.id,name:x.name,url:b.url,size:x.size}})}catch(e){failed++;why=String(e&&e.message||e).slice(0,200);console.error('upload failed:',why)}}
if(failed)await audit('upload_failed',`${ref}: ${failed} file(s) - ${why}`);
await mail(process.env.NOTIFY_EMAIL,`New request ${ref}`,`${d.name} (${d.email}) requested ${d.svc}: ${d.title}${failed?` (WARNING: ${failed} attachment(s) failed to upload)`:''}`);
await mail(d.email,`PrimeIndex request ${ref} received`,`Hello ${d.name},\n\nWe received your request (${ref}). We will review it and reply with next steps. Submission does not mean the request has been accepted.\n\nPrimeIndex Research & Analytics`);
return J({ref,failed})}
