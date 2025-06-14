const PAGE_SIZE_ULTKSP = 10;
const API_URL_ULTKSP = 'https://awarely-be-flask-app.onrender.com/api/ultksp-counselings';

let currentPageULTKSP = 1;
let totalPagesULTKSP = 0;
let ultkspCounselingsData = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchULTKSPCounselings(1);

  const prevBtn = document.getElementById("prevPage-ultksp");
  const nextBtn = document.getElementById("nextPage-ultksp");

  prevBtn.addEventListener("click", () => {
    if (currentPageULTKSP > 1) {
      fetchULTKSPCounselings(currentPageULTKSP - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPageULTKSP < totalPagesULTKSP) {
      fetchULTKSPCounselings(currentPageULTKSP + 1);
    }
  });
});

function fetchULTKSPCounselings(page = 1) {
  showLoader();

  fetch(`${API_URL_ULTKSP}?page=${page}&limit=${PAGE_SIZE_ULTKSP}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      console.log("Data ultksp dari API:", data);
      if (Array.isArray(data.data)) {
        ultkspCounselingsData = data.data;
        currentPageULTKSP = data.page;
        totalPagesULTKSP = Math.ceil(data.total / PAGE_SIZE_ULTKSP);
        renderULTKSPCounselingsTable();
      }
    })
    .catch(err => console.error("Gagal fetch ULTKSP Counselings:", err))
    .finally(() => hideLoader());
}

function renderULTKSPCounselingsTable() {
  const tbody = document.querySelector(".ultksp-table-section tbody");
  tbody.innerHTML = "";

  ultkspCounselingsData.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${(currentPageULTKSP - 1) * PAGE_SIZE_ULTKSP + i + 1}</td>
      <td>${item.contact || "-"}</td>
      <td>${item.incident || "-"}</td>
      <td>${item.counselor_name || "-"}</td>
      <td>${item.schedule_date || "-"}</td>
      <td>${item.schedule_time || "-"}</td>
      <td>${item.availability || "-"}</td>
      <td>${item.status || "pending"}</td>
      <td>
        <button class="btn-approve" onclick="updateStatusULTKSP(${item.id}, 'in_progress')">in_progress</button>
        <button class="btn-deny" onclick="updateStatusULTKSP(${item.id}, 'completed')">completed</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("pageIndicator-ultksp").textContent = `Page ${currentPageULTKSP} of ${totalPagesULTKSP}`;
  document.getElementById("prevPage-ultksp").disabled = currentPageULTKSP === 1;
  document.getElementById("nextPage-ultksp").disabled = currentPageULTKSP >= totalPagesULTKSP;
}

function updateStatusULTKSP(id, status) {
  showLoader();

  fetch(`${API_URL_ULTKSP}/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status })
  })
    .then(res => res.json())
    .then(res => {
      console.log(`Status updated: ${res.message}`);
      fetchULTKSPCounselings(currentPageULTKSP);
    })
    .catch(err => console.error("Update status error:", err))
    .finally(() => hideLoader());
}
