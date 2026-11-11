import {z} from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';
const credentials=z.object({email:z.string().email().max(200).transform(s=>s.toLowerCase()),password:z.string().min(8).max(72)});
const safe=u=>({id:u.id,name:u.name,email:u.email,role:u.role});
export async function register(req,res){const data=credentials.extend({name:z.string().trim().min(2).max(100)}).parse(req.body);const user=await User.create({...data,password:await bcrypt.hash(data.password,12),role:'user'});res.status(201).json({user:safe(user)});}
export async function login(req,res){const data=credentials.parse(req.body);const user=await User.findOne({email:data.email}).select('+password');if(!user||!await bcrypt.compare(data.password,user.password))return res.status(401).json({message:'E-mail ou senha incorretos.'});res.json({token:jwt.sign({sub:user.id},process.env.JWT_SECRET,{expiresIn:'2h'}),user:safe(user)});}
export function me(req,res){res.json({user:safe(req.user)});}
