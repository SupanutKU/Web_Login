document.addEventListener("DOMContentLoaded", () => {

  /* ===== USER LIST (ของเดิมคุณ) ===== */
  fetch("/users")
    .then(res => res.json())
    .then(users => {
      const box = document.getElementById("user-list");
      if (!box) return;

      box.innerHTML = "";
      users.forEach(u => {
        const div = document.createElement("div");
        div.className = "user-card";
        div.innerHTML = `
          <b>${u.name}</b><br>
          สถานะ : ${u.onDuty ? "🟢 เข้าเวร" : "🔴 ออกเวร"}
        `;
        box.appendChild(div);
      });
    });

  /* ===== DASHBOARD STATS (แก้ตรงนี้) ===== */
  fetch("/api/dashboard")
    .then(res => res.json())
    .then(data => {
      const online = document.getElementById("stat-online");
      const offline = document.getElementById("stat-offline");
      const duty = document.getElementById("stat-duty");
      const total = document.getElementById("stat-total");

      if (!online || !offline || !duty || !total) return;

      online.innerText = data.online;
      offline.innerText = data.offline;
      total.innerText = data.total;

      const hours = Math.floor(data.totalMinutes / 60);
      duty.innerText = hours.toLocaleString();
    });

});
