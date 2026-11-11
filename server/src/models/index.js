import mongoose from 'mongoose';
const {Schema,model}=mongoose;
export const User=model('User',new Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true},password:{type:String,required:true,select:false},role:{type:String,enum:['admin','user'],default:'user'}},{timestamps:true}));
export const Lab=model('Lab',new Schema({name:{type:String,required:true},location:{type:String,required:true},capacity:{type:Number,min:1,required:true},description:{type:String,default:''}},{timestamps:true}));
const reservation=new Schema({lab:{type:Schema.Types.ObjectId,ref:'Lab',required:true},user:{type:Schema.Types.ObjectId,ref:'User',required:true},date:{type:String,required:true},hour:{type:Number,min:8,max:21,required:true},purpose:{type:String,required:true}},{timestamps:true});
reservation.index({lab:1,date:1,hour:1},{unique:true});
export const Reservation=model('Reservation',reservation);
