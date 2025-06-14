import {showLoader, hideLoader} from './script.js';

const PAGE_SIZE = 10;
const API_URL = 'https://awarely-be-flask-app.onrender.com/api/reports'; // Ganti sesuai endpoint

let currentPage = 0;
let totalPages = 0;
let reportData = [];

document.addEventListener("DOMContentLoaded", () => {
  showLoader(); // Tampilkan loading indicator

  fetch(API_URL,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'credentials': 'include'
    }
  }
  )
    .then(res => res.json())
    .then(data => {
      reportData = data;
      totalPages = Math.ceil(data.length / PAGE_SIZE);
      renderReportsPage(0);
    })
    .catch(err => console.error("Failed to fetch reports:", err))
    .finally(() => {
      hideLoader(); // Sembunyikan loading indicator
    });
});

function renderReportsPage(pageIndex) {
  currentPage = pageIndex;
  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const sliced = reportData.slice(start, end);
  const tbody = document.getElementById("report-table-body");
  tbody.innerHTML = "";

  sliced.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${start + i + 1}</td>
      <td>${item.contact}</td>
      <td>${item.incident}</td>
      <td>${item.assistance_needed ? "Perlu" : "Tidak"}</td>
      <td>${item.schedule_date ? `${item.schedule_date} - ${item.schedule_time}` : "-"}</td>
    `;
    tbody.appendChild(tr);
});

  renderPaginationControls();
}

function renderPaginationControls() {
  const container = document.getElementById("pagination-reports");
  container.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "←";
  prevBtn.disabled = currentPage === 0;
  prevBtn.onclick = () => renderReportsPage(currentPage - 1);
  container.appendChild(prevBtn);

  for (let i = 0; i < totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = (i + 1);
    pageBtn.className = i === currentPage ? "active" : "";
    pageBtn.onclick = () => renderReportsPage(i);
    container.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "→";
  nextBtn.disabled = currentPage === totalPages - 1;
  nextBtn.onclick = () => renderReportsPage(currentPage + 1);
  container.appendChild(nextBtn);
}

