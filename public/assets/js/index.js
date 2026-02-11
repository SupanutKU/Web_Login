require("dotenv").config();
const express = require("express");
const app = express();

/* ================= BASIC ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= MOCK LOGIN ================= */
app.use((req, res, next) => {
  req.user = {
    id: "123456",
    username: "Blaze Sekroleplay",
    onDuty: false,
    dutyStart: null
  };
  next();
});

/* ================= USERS ================= */
let users = [
  { name: "Blaze Sekroleplay", onDuty: false }
];

app.get("/api/users", (req, res) => {
  res.json(users);
});

/* ================= ME ================= */
app.get("/api/me", (req, res) => {
  res.json(req.user);
});

/* ================= DUTY CHECK IN ================= */
app.post("/api/duty/checkin", (req, res) => {
  console.log("CHECKIN BODY:", req.body);

  const { name } = req.body;
  if (!name) {
    return res.json({ success: false, message: "ไม่มีชื่อ" });
  }

  if (req.user.onDuty) {
    return res.json({ success: false, message: "คุณเข้าเวรอยู่แล้ว" });
  }

  req.user.onDuty = true;
  req.user.dutyStart = Date.now();

  const u = users.find(u => u.name === name);
  if (u) u.onDuty = true;

  res.json({ success: true });
});

/* ================= STATIC ================= */
app.use(express.static(__dirname));
fetch("/api/users")
  .then(res => res.json())
  .then(users => {
    const policeList = document.getElementById("policeList");
    const medicList = document.getElementById("medicList");

    policeList.innerHTML = "";
    medicList.innerHTML = "";

    users
      .filter(u => u.onDuty) // แสดงเฉพาะคนที่เข้าเวร
      .forEach(u => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="duty-dot"></span> ${u.name}`;

        if (u.rank === "MEDIC") {
          medicList.appendChild(li);
        } else if (u.rank === "POLICE") {
          policeList.appendChild(li);
        }
      });
  });

/* ================= START ================= */
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
