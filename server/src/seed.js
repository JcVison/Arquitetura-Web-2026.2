import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Lab, Reservation } from './models/index.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const senha = process.env.ADMIN_PASSWORD;

if (!email || !senha || senha.length < 8) {
  throw new Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 8 caracteres).');
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User.init(), Lab.init(), Reservation.init()]);

  const conta = await User.findOne({ email }).select('role');

  if (conta && conta.role !== 'admin') {
    throw new Error('Esse e-mail pertence a um usuário comum. Use o e-mail do administrador.');
  }

  const password = await bcrypt.hash(senha, 12);

  await User.updateOne(
    { email, role: 'admin' },
    {
      $set: { password },
      $setOnInsert: { name: 'Administrador', email, role: 'admin' }
    },
    { upsert: true }
  );

  if (!(await Lab.exists({}))) {
    await Lab.insertMany([
      {
        name: 'Laboratório de Programação',
        location: 'Bloco de Computação · Sala 01',
        capacity: 30,
        description: 'Computadores para aulas práticas e projetos de software.'
      },
      {
        name: 'Laboratório de Redes',
        location: 'Bloco de Computação · Sala 02',
        capacity: 20,
        description: 'Ambiente para redes, infraestrutura e segurança.'
      },
      {
        name: 'Laboratório de Pesquisa',
        location: 'Bloco de Computação · Sala 03',
        capacity: 12,
        description: 'Espaço colaborativo para grupos de pesquisa.'
      }
    ]);
  }

  console.log('Senha do administrador configurada com sucesso.');
} finally {
  await mongoose.disconnect();
}