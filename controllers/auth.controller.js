import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

const prisma = new PrismaClient();
const secret = 'secret'; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "keldibekovotkir767@gmail.com",
    pass: "mwnv aayw pxvc vrme",
  },
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.status === 'INACTIVE') {
        const token = jwt.sign({ email }, secret, { expiresIn: '1h' });
        await sendActivationEmail(email, name, token);
        return res.status(200).json({
          message: 'Qayta aktivatsiya linki yuborildi',
          token,
        });
      }
      return res.status(400).json({ message: 'Bu email allaqachon royxatdan otgan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: 'INACTIVE',
      },
    });

    const token = jwt.sign({ email }, secret, { expiresIn: '1h' });

    await sendActivationEmail(email, name, token);

    return res.status(201).json({
      message: "Royxatdan otildi. Emailingizni tekshiring.",
     
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server xatosi' });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = value;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Akkount aktiv emas! Emailni tekshiring.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Parol notogri' });

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });

    return res.status(200).json({ token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server xatosi' });
  }
};

export const activate = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, secret);
    const email = decoded.email;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    if (user.status === 'ACTIVE') {
      return res.status(200).json({ message: 'Akkount allaqachon aktiv' });
    }

    await prisma.user.update({
      where: { email },
      data: { status: 'ACTIVE' },
    });

    return res.status(200).json({ message: 'Akkount faollashtirildi!' });

  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: 'Token yaroqsiz yoki muddati tugagan' });
  }
};

const sendActivationEmail = async (email, name, token) => {
  await transporter.sendMail({
    to: email,
    subject: "Account activation",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7; border-radius: 10px;">
        <h2 style="color: #333;">Salom, ${name}!</h2>
        <p style="font-size: 16px; color: #555;">
          Akkauntingizni faollashtirish uchun quyidagi tugmani bosing:
        </p>
        <a 
          href="http://localhost:3000/auth/activate/${token}" 
          style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;"
        >
          Akkauntni faollashtirish
        </a>
       
      </div>
    `,
  });
};
