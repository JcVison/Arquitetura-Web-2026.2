import {z} from 'zod';
import {Lab,Reservation} from '../models/index.js';
const schema=z.object({name:z.string().trim().min(2).max(100),location:z.string().trim().min(2).max(150),capacity:z.number().int().min(1).max(1000),description:z.string().trim().max(600).default('')});
export async function list(req,res){res.json(await Lab.find().sort({name:1}));}
export async function create(req,res){res.status(201).json(await Lab.create(schema.parse(req.body)));}
export async function update(req,res){const item=await Lab.findByIdAndUpdate(req.params.id,schema.parse(req.body),{new:true,runValidators:true});if(!item)return res.status(404).json({message:'Laboratório não encontrado.'});res.json(item);}
export async function remove(req,res){if(await Reservation.exists({lab:req.params.id}))return res.status(409).json({message:'Exclua as reservas vinculadas antes de remover o laboratório.'});const item=await Lab.findByIdAndDelete(req.params.id);if(!item)return res.status(404).json({message:'Laboratório não encontrado.'});res.status(204).end();}
