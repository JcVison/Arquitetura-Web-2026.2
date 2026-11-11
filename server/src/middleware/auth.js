import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';
export async function auth(req,res,next){
 try{const token=req.headers.authorization?.split(' ');if(token?.[0]!=='Bearer')return res.status(401).json({message:'Faça login para continuar.'});const payload=jwt.verify(token[1],process.env.JWT_SECRET,{algorithms:['HS256']});req.user=await User.findById(payload.sub);if(!req.user)return res.status(401).json({message:'Sessão inválida.'});next();}catch(e){next(e);}
}
export function admin(req,res,next){if(req.user.role!=='admin')return res.status(403).json({message:'Acesso exclusivo de administrador.'});next();}
export const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
