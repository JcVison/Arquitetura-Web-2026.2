import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes/index.js';
const app=express();app.use(helmet());app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));app.use(express.json({limit:'20kb'}));
app.get('/api/health',(req,res)=>res.json({status:'ok'}));app.use('/api',router);
app.use((req,res)=>res.status(404).json({message:'Rota não encontrada.'}));
app.use((err,req,res,next)=>{if(err.code===11000)return res.status(409).json({message:err.keyPattern?.email?'E-mail já cadastrado.':'Este horário já foi reservado. Escolha outro.'});if(err.name==='ZodError')return res.status(400).json({message:err.issues.map(i=>i.path.join('.')+': '+i.message).join('; ')});if(err.name==='CastError')return res.status(400).json({message:'Identificador inválido.'});if(['JsonWebTokenError','TokenExpiredError'].includes(err.name))return res.status(401).json({message:'Sessão expirada ou inválida. Entre novamente.'});const status=err.status||500;if(status>=500)console.error(err);res.status(status).json({message:status>=500?'Erro interno no servidor.':err.message});});
export default app;
