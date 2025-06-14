const PAGE_SIZE_RM = 10;
const API_URL_RM = 'https://awarely-be-flask-app.onrender.com/api/rm-counselings';

let currentPageRM = 1;
let totalPagesRM = 0;
let rmCounselingsData = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchRMCounselings(1);

  const prevBtn = document.getElementById("prevPage-rm");
  const nextBtn = document.getElementById("nextPage-rm");

  prevBtn.addEventListener("click", () => {
    if (currentPageRM > 1) {
      fetchRMCounselings(currentPageRM - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPageRM < totalPagesRM) {
      fetchRMCounselings(currentPageRM + 1);
    }
  });
});

function fetchRMCounselings(page = 1) {
  showLoader();

  fetch(`${API_URL_RM}?page=${page}&limit=${PAGE_SIZE_RM}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      console.log("Data rm dari API:", data);

      if (Array.isArray(data.data)) {
        rmCounselingsData = data.data;
        currentPageRM = data.page;
        totalPagesRM = Math.ceil(data.total / PAGE_SIZE_RM);
        renderRMCounselingsTable();
      }
    })
    .catch(err => console.error("Gagal fetch RM Counselings:", err))
    .finally(() => hideLoader());
}

function renderRMCounselingsTable() {
  const tbody = document.querySelector(".rm-table-section tbody");
  tbody.innerHTML = "";

  rmCounselingsData.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${(currentPageRM - 1) * PAGE_SIZE_RM + i + 1}</td>
      <td>${item.contact || "-"}</td>
      <td>${item.incident || "-"}</td>
      <td>${item.counselor_name || "-"}</td>
      <td>${item.schedule_date || "-"}</td>
      <td>${item.schedule_time || "-"}</td>
      <td>${item.availability || "-"}</td>
      <td>${item.status || "pending"}</td>
      <td>
        <button onclick="updateStatusRM(${item.id}, 'in_progress')">Yes</button>
        <button onclick="updateStatusRM(${item.id}, 'completed')">No</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("pageIndicator-rm").textContent = `Page ${currentPageRM} of ${totalPagesRM}`;
  document.getElementById("prevPage-rm").disabled = currentPageRM === 1;
  document.getElementById("nextPage-rm").disabled = currentPageRM >= totalPagesRM;
}

function updateStatusRM(id, status) {
  showLoader();

  fetch(`${API_URL_RM}/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status })
  })
    .then(res => res.json())
    .then(res => {
      console.log(`Status updated: ${res.message}`);
      fetchRMCounselings(currentPageRM); // Refresh table
    })
    .catch(err => console.error("Update status error:", err))
    .finally(() => hideLoader());
}
