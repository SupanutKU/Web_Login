/* ===== CLOCK ===== */
const clock = document.getElementById("clock");
function updateClock() {
  clock.innerText = new Date().toLocaleTimeString("th-TH");
}
setInterval(updateClock, 1000);
updateClock();

/* ===== ELEMENTS ===== */
const departmentSelect = document.getElementById("departmentSelect");
const nameSelect = document.getElementById("nameSelect");
const status = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const profileBtn = document.getElementById("profileBtn");

let onDuty = false;
let allUsers = [];

/* ===== LOAD USERS + DEPARTMENTS ===== */
fetch("/api/users")
  .then(res => res.json())
  .then(users => {
    allUsers = users;

    // ดึงหน่วยงานไม่ซ้ำจาก role
    const departments = [...new Set(users.map(u => u.role))];

    departments.forEach(dep => {
      if (!dep) return;
      const opt = document.createElement("option");
      opt.value = dep;
      opt.textContent = dep;
      departmentSelect.appendChild(opt);
    });
  });

/* ===== เลือกหน่วยงาน ===== */
departmentSelect.addEventListener("change", () => {
  const dep = departmentSelect.value;

  nameSelect.innerHTML = `<option value="">-- เลือกชื่อ --</option>`;

  if (!dep) {
    nameSelect.disabled = true;
    return;
  }

  const filtered = allUsers.filter(u => u.role === dep);

  filtered.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    nameSelect.appendChild(opt);
  });

  nameSelect.disabled = false;
});

/* ===== CHECK IN ===== */
function checkIn() {
  const name = nameSelect.value;
  if (!name) return alert("กรุณาเลือกชื่อ");

  fetch("/api/duty/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || "เข้าเวรไม่สำเร็จ");
        return;
      }
      onDuty = true;
      status.innerText = "🟢 อยู่ระหว่างเข้าเวร";
      status.className = "status on";
    });
}

/* ===== CHECK OUT ===== */
function checkOut() {
  const name = nameSelect.value;
  if (!onDuty) return alert("ยังไม่ได้เข้าเวร");

  fetch("/api/duty/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || "ออกเวรไม่สำเร็จ");
        return;
      }
      onDuty = false;
      status.innerText = "🔴 ออกเวรแล้ว";
      status.className = "status off";
    });
}

/* ===== ผูกปุ่ม ===== */
if (checkInBtn) checkInBtn.addEventListener("click", checkIn);
if (checkOutBtn) checkOutBtn.addEventListener("click", checkOut);

/* ===== PROFILE ===== */
if (profileBtn) {
  profileBtn.onclick = e => {
    e.stopPropagation();
    document.querySelector(".user-menu")?.classList.toggle("active");
  };

  document.addEventListener("click", () => {
    document.querySelector(".user-menu")?.classList.remove("active");
  });
}
