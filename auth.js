const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Usuário já existe' });
    const u = new User({ email: email.toLowerCase().trim(), password, name });
    await u.save();
    const secret = process.env.JWT_SECRET || 'troque_para_uma_chave_secreta';
    const token = jwt.sign({ id: u._id.toString(), email: u.email }, secret, { expiresIn: '7d' });
    res.json({ token, user: { id: u._id, email: u.email, name: u.name } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    const u = await User.findOne({ email: email.toLowerCase().trim() });
    if (!u) return res.status(401).json({ error: 'Credenciais inválidas' });
    const ok = await u.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });
    const secret = process.env.JWT_SECRET || 'troque_para_uma_chave_secreta';
    const token = jwt.sign({ id: u._id.toString(), email: u.email }, secret, { expiresIn: '7d' });
    res.json({ token, user: { id: u._id, email: u.email, name: u.name } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
