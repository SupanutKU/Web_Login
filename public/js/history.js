let allData = [];
let currentUnit = "all";

/* ===== โหลดข้อมูล ===== */
fetch("/api/duty/history")
  .then(res => res.json())
  .then(data => {
    allData = data;
    renderTable();
  })
  .catch(err => {
    console.error("โหลดประวัติล้มเหลว:", err);
  });

/* ===== ปุ่มเลือก POLICE / MEDIC ===== */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    currentUnit = btn.dataset.unit; // all | POLICE | MEDIC
    renderTable();
  });
});

/* ===== แสดงตาราง + สรุป ===== */
function renderTable() {
  const tbody = document.getElementById("list");
  const summary = document.getElementById("summary");

  let todayMinutes = 0;
  let weekMinutes = 0;

  const now = new Date();
  const today = now.toDateString();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  tbody.innerHTML = "";

// ✅ filter ตามหน่วยงาน
  const filtered = allData.filter(d => {
    if (currentUnit === "all") return true;

    // รองรับ unit หาย / ตัวเล็ก
    return (d.unit || "POLICE").toUpperCase() === currentUnit;
  });


  filtered.forEach(d => {
    const start = new Date(d.start);
    const end = new Date(d.end);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.name}</td>
      <td>${start.toLocaleString("th-TH")}</td>
      <td>${end.toLocaleString("th-TH")}</td>
      <td>${formatDuration(d.durationMinutes)}</td>
    `;
    tbody.appendChild(tr);

    if (start.toDateString() === today) {
      todayMinutes += d.durationMinutes;
    }

    if (start >= startOfWeek) {
      weekMinutes += d.durationMinutes;
    }
  });

  summary.innerHTML = `
    <div>🕒 วันนี้: <b>${formatDuration(todayMinutes)}</b></div>
    <div>📅 สัปดาห์นี้: <b>${formatDuration(weekMinutes)}</b></div>
  `;
}

/* ===== นาที → ชั่วโมง:นาที ===== */
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}
