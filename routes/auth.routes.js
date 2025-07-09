/**
 * @swagger
 * tags:
 *   name: auth
 *   description: Register login

 * @swagger
 * /auth/register:
 *   post:
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: O'tkirbek
 *               email:
 *                 type: string
 *                 example: email@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Muvaffaqiyatli ro'yxatdan o'tdi
 *       400:
 *         description: Email allaqachon mavjud
 *       500:
 *         description: Server xatosi

 * @swagger
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli login va token qaytdi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1...
 *       401:
 *         description: Login yoki parol noto‘g‘ri
 *       403:
 *         description: Akkount aktiv emas
 *       500:
 *         description: Server xatosi

 * @swagger
 * /auth/activate/{token}:
 *   get:
 *     tags: [auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Aktivatsiya uchun JWT token
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli aktivatsiya
 *       400:
 *         description: Token yaroqsiz yoki muddati tugagan
 *       404:
 *         description: Foydalanuvchi topilmadi
 *       500:
 *         description: Server xatosi
 */

import { Router } from "express";
import {
  register,
  login,
  activate
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/activate/:token", activate);

export default router;
