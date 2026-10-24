import {put} from '@vercel/blob';import {db,isAdmin,mail,audit,J} from '@/lib';export const dynamic='force-dynamic';
const M={requests:'request',enquiries:'enquiry',subscribers:'subscriber',posts:'post',media:'media',audit:'auditLog'};
const guard=async(p)=>{if(!(await isAdmin()))return J({error:'Unauthorised'},401);if(!M[p.t]&&p.t!=='export')return J({error:'Not found'},404)};
export async function GET(_,{params}){const g=await guard(params);if(g)return g;
if(params.t==='export'){const rs=await db.request.findMany({orderBy:{createdAt:'desc'}});const q=v=>`"${String(v??'').replace(/"/g,'""').replace(/^([=+\-@])/,"'$1")}"`;
const c=['ref','name','email','phone','service','title','deadline','status','quote','createdAt'];await audit('export','requests csv');
return new Response([c.join(','),...rs.map(r=>c.map(k=>q(r[k])).join(','))].join('\n'),{headers:{'content-type':'text/csv','content-disposition':'attachment; filename=requests.csv'}})}
return J(await db[M[params.t]].findMany({orderBy:{createdAt:'desc'},take:300,...(params.t==='requests'?{include:{files:true}}:{})}))}
export async function PATCH(req,{params}){const g=await guard(params);if(g||params.t!=='requests')return g||J({error:'Not allowed'},405);const b=await req.json();
const r=await db.request.update({where:{id:b.id},data:{status:b.status,quote:b.quote,notes:b.notes}});await audit('request_update',`${r.ref} -> ${r.status}`);
if(b.notify)await mail(r.email,`Update on ${r.ref}`,`Hello ${r.name},\n\nThe status of your request ${r.ref} is now: ${r.status}.${r.quote?`\nQuotation: ${r.quote}`:''}\n\nPrimeIndex Research & Analytics`);return J(r)}
export async function POST(req,{params}){const g=await guard(params);if(g)return g;
if(params.t==='posts'){const b=await req.json();const p=await db.post.create({data:{title:b.title,category:b.category||'General',body:b.body,published:!!b.published,publishAt:b.publishAt?new Date(b.publishAt):new Date()}});await audit('post_create',p.title);return J(p)}
if(params.t==='media'){const f=(await req.formData()).get('file');const b=await put('media/'+f.name.replace(/[^\w.-]/g,'_'),f,{access:'public',addRandomSuffix:true});const m=await db.media.create({data:{name:f.name,url:b.url}});await audit('media_upload',f.name);return J(m)}
return J({error:'Not allowed'},405)}
export async function DELETE(req,{params}){const g=await guard(params);if(g)return g;const {id}=await req.json();await db[M[params.t]].delete({where:{id}});await audit('delete_'+params.t,id);return J({ok:1})}
