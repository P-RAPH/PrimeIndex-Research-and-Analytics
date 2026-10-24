import {PrismaClient} from '@prisma/client';import {SignJWT,jwtVerify} from 'jose';import {cookies} from 'next/headers';import {Resend} from 'resend';
export const db=globalThis.__p||(globalThis.__p=new PrismaClient());
const key=()=>new TextEncoder().encode(process.env.AUTH_SECRET);
export const sign=()=>new SignJWT({r:'admin'}).setProtectedHeader({alg:'HS256'}).setExpirationTime('8h').sign(key());
export async function isAdmin(){try{await jwtVerify(cookies().get('pi')?.value,key());return true}catch{return false}}
export async function mail(to,subject,text){if(!process.env.RESEND_API_KEY)return;try{await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.MAIL_FROM,to,subject,text})}catch{console.error('mail failed')}}
const hits=new Map();export function limited(req,max=8){const ip=(req.headers.get('x-forwarded-for')||'x').split(',')[0],n=Date.now(),a=(hits.get(ip)||[]).filter(t=>n-t<6e5);a.push(n);hits.set(ip,a);return a.length>max}
export const audit=(a,d='')=>db.auditLog.create({data:{action:a,detail:String(d).slice(0,300)}});
export const J=(o,s=200)=>Response.json(o,{status:s});
