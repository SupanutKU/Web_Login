function load() {
  fetch("/users")
    .then(res => res.json())
    .then(users => {
      const policeBox = document.getElementById("policeList");
      const medicBox = document.getElementById("medicList");

      policeBox.innerHTML = "<h3>👮 POLICE</h3>";
      medicBox.innerHTML = "<h3>🚑 MEDIC</h3>";

      users.forEach(u => {
        const div = document.createElement("div");
        div.className = "rank-user";

        const roleClass = u.role.toLowerCase(); // police / medic

        div.innerHTML = `
          <div class="rank-top">
            <div>
              <div class="rank-name">${u.name}</div>
              <span class="rank-badge ${roleClass}">
                ${u.role}
              </span>
            </div>

            <button class="delete-btn"
              onclick="delUser('${u.discord}')">
              ลบ
            </button>
          </div>

          <div class="rank-id">${u.discord}</div>
        `;

        // ✅ แยกตาม ROLE (แก้จาก rank → role)
        if (u.role === "MEDIC") {
          medicBox.appendChild(div);
        } else {
          policeBox.appendChild(div);
        }
      });
    });
}

function addUser() {
  const name = document.getElementById('name').value;
  const steamHex = document.getElementById('steam').value;
  const rank = document.getElementById('rank').value;

  if (!name || !steamHex || !rank) {
    alert('กรอกข้อมูลให้ครบ');
    return;
  }

  fetch("/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      discord: steamHex,   // ✅ ส่งให้ตรงกับ server
      rank: rank           // ✅ ส่งยศไปด้วย
    })
  })
    .then(res => res.json())
    .then(result => {
      if (result.success === false) {
        alert(result.message || "เพิ่มไม่สำเร็จ");
        return;
      }

      document.getElementById("name").value = "";
      document.getElementById("steam").value = "";
      document.getElementById("rank").value = "";

      load();
    });
}

function delUser(discord) {
  if (!confirm("ต้องการลบใช่หรือไม่?")) return;

  fetch("/admin/users/" + discord, {
    method: "DELETE"
  }).then(load);
}

load();
