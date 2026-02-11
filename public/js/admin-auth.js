async function login() {
  const password = document.getElementById("password").value;

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  if (data.success) {
    location.href = "/admin";
  } else {
    alert("รหัสไม่ถูกต้อง");
  }
}
