const PAGE_SIZE = 10;
const API_URL = 'https://awarely-be-flask-app.onrender.com/api/reports';

let currentPage = 0;
let totalPages = 0;
let reportData = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchReports(1);

  const prevBtn = document.getElementById("prevPage-report");
  const nextBtn = document.getElementById("nextPage-report");

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      fetchReports(currentPage - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      fetchReports(currentPage + 1);
    }
  });
});

function fetchReports(page = 1) {
  showLoader();

  fetch(`${API_URL}?page=${page}&limit=${PAGE_SIZE}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      console.log("Data dari API:", data);

      if (Array.isArray(data.data)) {
        reportData = data.data;
      } else {
        console.error("Format data tidak sesuai. Diharapkan array.");
        return;
      }

      currentPage = data.page;
      totalPages = Math.ceil(data.total / PAGE_SIZE);
      renderReportsPage();
    })
    .catch(err => console.error("Failed to fetch reports:", err))
    .finally(() => {
      hideLoader();
    });
}

function renderReportsPage() {
  const tbody = document.getElementById("report-table-body");
  tbody.innerHTML = "";

  reportData.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${(currentPage - 1) * PAGE_SIZE + i + 1}</td>
      <td>${item.contact || "-"}</td>
      <td>${item.incident || "-"}</td>
      <td>${item.assistance_needed ? "Perlu" : "Tidak"}</td>
      <td>${item.schedule_date ? `${item.schedule_date} - ${item.schedule_time}` : "-"}</td>
    `;
    tbody.appendChild(tr);
  });

  updatePageIndicator();
  updatePaginationButtons();
}

function updatePageIndicator() {
  const indicator = document.getElementById("pageIndicator-report");
  indicator.textContent = `Page ${currentPage} of ${totalPages}`;
}

function updatePaginationButtons() {
  document.getElementById("prevPage-report").disabled = currentPage === 1;
  document.getElementById("nextPage-report").disabled = currentPage >= totalPages;
}

// Optional loader control (if you have loader overlay)
function showLoader() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "flex";
}

function hideLoader() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "none";
}
