import {z} from 'zod';
import {Lab,Reservation} from '../models/index.js';
const schema=z.object({lab:z.string().regex(/^[a-f0-9]{24}$/i),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s,'Data inválida'),hour:z.number().int().min(8).max(21),purpose:z.string().trim().min(3).max(300)});
async function validate(body){const data=schema.parse(body);if(new Date(data.date+'T'+String(data.hour).padStart(2,'0')+':00:00-04:00')<=new Date())throw Object.assign(new Error('Escolha um horário futuro.'),{status:400});if(!await Lab.exists({_id:data.lab}))throw Object.assign(new Error('Laboratório não encontrado.'),{status:404});return data;}
async function owned(req){const item=await Reservation.findById(req.params.id);if(!item)throw Object.assign(new Error('Reserva não encontrada.'),{status:404});if(req.user.role!=='admin'&&String(item.user)!==req.user.id)throw Object.assign(new Error('Você não tem permissão para alterar esta reserva.'),{status:403});return item;}
export async function list(req,res){res.json(await Reservation.find(req.user.role==='admin'?{}:{user:req.user.id}).populate('lab').populate('user','name email').sort({date:1,hour:1}));}
export async function availability(req,res){const {lab,date}=z.object({lab:z.string().regex(/^[a-f0-9]{24}$/i),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)}).parse(req.query);const rows=await Reservation.find({lab,date}).select('hour -_id');res.json({occupied:rows.map(r=>r.hour)});}
export async function create(req,res){const data=await validate(req.body);res.status(201).json(await Reservation.create({...data,user:req.user.id}));}
export async function update(req,res){const item=await owned(req);Object.assign(item,await validate(req.body));await item.save();res.json(item);}
export async function remove(req,res){const item=await owned(req);await item.deleteOne();res.status(204).end();}
