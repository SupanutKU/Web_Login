require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const HISTORY_FILE = path.join(__dirname, "data", "history.json");
const app = express();
const DATA_FILE = path.join(__dirname, "data", "users.json");


function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
}

function saveHistory(data) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}
/* ===== BASIC ===== */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===== SESSION ===== */
app.use(session({
  secret: process.env.SESSION_SECRET || "center-city-secret",
  resave: false,
  saveUninitialized: false
}));

/* ===== UTIL ===== */
function saveUsers(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function formatMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
// 👉 เพิ่มตรงนี้
function loadUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
}

// ===== LOGIN GUARD =====
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin-auth.html");
  }
  next();
}

/* ================= ADMIN USERS ================= */

// ใช้กับ admin panel
app.get("/users", (req, res) => {
  res.json(loadUsers());
});

app.post("/admin/users", requireAdmin, (req, res) => {
  const { name, discord, rank } = req.body;

  if (!name || !discord || !rank) {
    return res.status(400).json({ success: false });
  }

  const users = loadUsers();

  if (users.find(u => u.name === name)) {
    return res.json({ success: false, message: "มีชื่อนี้แล้ว" });
  }

users.push({
  name,
  discord,
  role: req.body.rank,   // ⭐ เพิ่ม
  onDuty: false
});

  saveUsers(users);
  res.json({ success: true });
});

app.delete("/admin/users/:discord", requireAdmin, (req, res) => {
  const users = loadUsers().filter(
    u => u.discord !== req.params.discord
  );
  saveUsers(users);
  res.json({ success: true });
});

/* ======================== */
/* ===== DISCORD LOGIN ===== */
/* ======================== */

app.get("/auth/discord", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify"
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect("/");

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    });

    const token = await tokenRes.json();
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });

    req.session.user = await userRes.json();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) return res.status(401).end();
  res.json(req.session.user);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* ======================== */
/* ===== DUTY SYSTEM ===== */
/* ======================== */

// เข้าเวร
app.post("/api/duty/checkin", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.json({ success: false, message: "ไม่พบชื่อ" });
  }

  const users = loadUsers();
  const user = users.find(u => u.name === name);

  if (!user) {
    return res.json({ success: false, message: "ไม่พบชื่อในระบบ" });
  }

  if (user.onDuty) {
    return res.json({ success: false, message: "เข้าเวรอยู่แล้ว" });
  }

  user.onDuty = true;
  user.dutyStart = Date.now();
  saveUsers(users);

  res.json({ success: true });
});

// ออกเวร
app.post("/api/duty/checkout", async (req, res) => {
  const { name } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.name === name);
  if (!user || !user.dutyStart) {
    return res.json({ success: false, message: "ยังไม่ได้เข้าเวร" });
  }

  const end = Date.now();
  const start = user.dutyStart;

  // ✅ นาทีล้วน ปัดวินาทีทิ้ง
  const durationMinutes = Math.floor((end - start) / 1000 / 60);

  const history = loadHistory();

history.push({
  name: user.name,
  start,
  end,
  durationMinutes,
  unit: user.role || "POLICE"
});

saveHistory(history);
// 🔥 ใส่ Google Sheets ตรงนี้
  user.dutyStart = null;
  user.onDuty = false;
  saveUsers(users);
  res.json({ success: true });
});

/* ===== API USERS (หน้า duty ใช้) ===== */
app.get("/api/users", (req, res) => {
  res.json(loadUsers());
});
/* ===== DASHBOARD STATS ===== */
app.get("/api/dashboard", (req, res) => {
  const users = loadUsers();
  const history = loadHistory();

  const online = users.filter(u => u.onDuty).length;
  const offline = users.filter(u => !u.onDuty).length;
  const total = users.length;

  const totalMinutes = history.reduce(
    (sum, h) => sum + (h.durationMinutes || 0),
    0
  );

  res.json({
    online,
    offline,
    total,
    totalMinutes
  });
});

/* ===== DUTY HISTORY API (FIXED) ===== */
app.get("/api/duty/history", (req, res) => {
  const history = loadHistory();
  res.json(history);
});
/* LOGIN ADMIN*/
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }

  res.json({ success: false });
});
// ===== ADMIN PAGE (GUARD) =====
app.get("/admin", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Server running on port " + PORT);
});
