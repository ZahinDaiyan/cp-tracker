let allProblems = [];
let selectedTags = [];

const tagList = [
  "greedy", "dp", "math", "brute force", "binary search", "dfs and similar",
  "graphs", "data structures", "implementation", "sortings", "two pointers"
];

// Render tag dropdown for filtering by tags
function createTagDropdown() {
  const container = document.getElementById("tagDropdown");
  tagList.forEach(tag => {
    const div = document.createElement("div");
    div.className = "tag-option";
    div.innerText = tag;
    div.onclick = () => toggleTag(tag, div);
    container.appendChild(div);
  });
}

// Toggle tag selection and apply filters
function toggleTag(tag, element) {
  if (selectedTags.includes(tag)) {
    selectedTags = selectedTags.filter(t => t !== tag);
    element.classList.remove("selected");
  } else {
    selectedTags.push(tag);
    element.classList.add("selected");
  }
  applyFilters();
}

// Fetch solved problems from backend API
async function fetchProblems() {
  const handle = document.getElementById("handleInput").value.trim();
  if (!handle) {
    alert("Please enter a Codeforces handle.");
    return;
  }

  try {
    // Use full backend URL with port and correct route (/solved)
    const res = await fetch(`http://localhost:3000/api/codeforces/${handle}/solved`);
    if (!res.ok) throw new Error("Failed to fetch data.");

    const data = await res.json();
    allProblems = data.problems;  // backend returns { handle, solvedCount, problems }
    renderTable(allProblems);
  } catch (err) {
    alert("Error fetching data: " + err.message);
  }
}

// Render the problems table with given problems array
function renderTable(problems) {
  const table = document.getElementById("problemsTable");
  const tbody = document.getElementById("problemsBody");
  tbody.innerHTML = "";

  problems.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="https://codeforces.com/contest/${p.contestId}/problem/${p.index}" target="_blank">${p.name}</a></td>
      <td>${p.contestId}</td>
      <td>${p.rating || "—"}</td>
      <td>${p.tags.join(", ")}</td>
    `;
    tbody.appendChild(row);
  });

  table.style.display = "table";
}

// Apply filters by rating and selected tags
function applyFilters() {
  const rating = document.getElementById("ratingFilter").value;

  const filtered = allProblems.filter(p => {
    const matchRating = rating ? p.rating == rating : true;
    const matchTags = selectedTags.length
      ? selectedTags.every(tag => p.tags.includes(tag))
      : true;
    return matchRating && matchTags;
  });

  renderTable(filtered);
}

// Initialize tag dropdown on page load
createTagDropdown();
