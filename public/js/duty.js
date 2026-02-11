/* ===== CLOCK ===== */
const clock = document.getElementById("clock");
function updateClock() {
  clock.innerText = new Date().toLocaleTimeString("th-TH");
}
setInterval(updateClock, 1000);
updateClock();

/* ===== ELEMENTS ===== */
const nameSelect = document.getElementById("nameSelect");
const status = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const profileBtn = document.getElementById("profileBtn");

let onDuty = false;

/* ===== LOAD USERS ===== */
function loadNames() {
  fetch("/api/users")
    .then(res => res.json())
    .then(users => {
      nameSelect.innerHTML = `<option value="">-- เลือกชื่อ --</option>`;
      users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.name;
        opt.textContent = u.name;
        nameSelect.appendChild(opt);
      });
    });
}
loadNames();

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

/* ✅⭐ ผูกปุ่ม (ตัวที่ขาด) */
checkInBtn.addEventListener("click", checkIn);
checkOutBtn.addEventListener("click", checkOut);

/* ===== PROFILE ===== */
profileBtn.onclick = e => {
  e.stopPropagation();
  document.querySelector(".user-menu").classList.toggle("active");
};
document.addEventListener("click", () => {
  document.querySelector(".user-menu").classList.remove("active");
});
