import {db,J} from '@/lib';export const dynamic='force-dynamic';
export async function GET(){return J(await db.post.findMany({where:{published:true,publishAt:{lte:new Date()}},orderBy:{publishAt:'desc'},take:50,select:{id:true,title:true,category:true,body:true,publishAt:true}}))}
