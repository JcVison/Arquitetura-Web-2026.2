import 'dotenv/config';
import mongoose from 'mongoose';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres.');
await mongoose.connect(process.env.MONGODB_URI);
await (await import('./models/index.js')).Reservation.init();
const {default:app}=await import('./app.js');app.listen(process.env.PORT||3001,()=>console.log('API disponível na porta '+(process.env.PORT||3001)));
