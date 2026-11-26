
// ==========================================
// DATA SPACE - ORGANIZER & ANALYTICS SYSTEM
// ==========================================

// GET HTML ELEMENTS
const recordForm = document.getElementById("recordForm");
const recordsList = document.getElementById("recordsList");
const totalRecords = document.getElementById("totalRecords");
const clearRecords = document.getElementById("clearRecords");

const recordTitle = document.getElementById("recordTitle");
const recordCategory = document.getElementById("recordCategory");
const recordDetails = document.getElementById("recordDetails");

const categories = ["Personal", "Work", "School", "Other"];

// ==========================================
// LOAD SAVED RECORDS
// ==========================================

let records = [];

try {
    records = JSON.parse(
        localStorage.getItem("dataspaceRecords")
    ) || [];
} catch (error) {
    console.error("Unable to load records:", error);
}

records = records.map(record => ({
    ...record,
    createdAt: record.createdAt || new Date().toISOString()
}));

// ==========================================
// SEARCH AND FILTER
// ==========================================

const recordsCard = document.querySelector(".records-card");

const recordsToolbar = document.createElement("div");
recordsToolbar.className = "records-toolbar";

recordsToolbar.innerHTML = `
    <input
        type="search"
        id="searchRecords"
        placeholder="Search your records..."
        aria-label="Search records"
    >

    <select id="filterCategory" aria-label="Filter by category">
        <option value="All">All Categories</option>
        <option value="Personal">Personal</option>
        <option value="Work">Work</option>
        <option value="School">School</option>
        <option value="Other">Other</option>
    </select>
`;

if (recordsList && recordsList.parentNode) {
    recordsList.parentNode.insertBefore(
        recordsToolbar,
        recordsList
    );
}

const searchRecords = document.getElementById("searchRecords");
const filterCategory = document.getElementById("filterCategory");

// ==========================================
// SAVE RECORDS
// ==========================================

function saveRecords() {
    localStorage.setItem(
        "dataspaceRecords",
        JSON.stringify(records)
    );
}

// ==========================================
// NOTIFICATION
// ==========================================

function showMessage(message) {
    let toast = document.getElementById("dataspaceToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "dataspaceToast";
        toast.className = "dataspace-toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.dataSpaceToastTimer);

    window.dataSpaceToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ==========================================
// CREATE ANALYTICS SECTION
// ==========================================

const analyticsSection = document.createElement("section");
analyticsSection.className = "analytics-section";

analyticsSection.innerHTML = `
    <div class="analytics-heading">
        <div>
            <span class="analytics-eyebrow">DATA INSIGHTS</span>
            <h2>Workspace Analytics</h2>
            <p>An overview of your organized information.</p>
        </div>

        <span class="analytics-status">
            ● LIVE OVERVIEW
        </span>
    </div>

    <div class="analytics-summary">

        <div class="analytics-card">
            <span>TOTAL RECORDS</span>
            <strong id="analyticsTotal">0</strong>
            <small>Information stored</small>
        </div>

        <div class="analytics-card">
            <span>ACTIVE CATEGORIES</span>
            <strong id="analyticsCategories">00</strong>
            <small>Categories in use</small>
        </div>

        <div class="analytics-card">
            <span>MOST USED CATEGORY</span>
            <strong id="analyticsTopCategory">—</strong>
            <small id="analyticsTopCount">No records yet</small>
        </div>

    </div>

    <div class="analytics-grid">

        <div class="analytics-panel">
            <div class="analytics-panel-heading">
                <div>
                    <span class="analytics-eyebrow">DISTRIBUTION</span>
                    <h3>Category Breakdown</h3>
                </div>
            </div>

            <div id="categoryBreakdown"></div>
        </div>

        <div class="analytics-panel">
            <div class="analytics-panel-heading">
                <div>
                    <span class="analytics-eyebrow">ACTIVITY</span>
                    <h3>Weekly Overview</h3>
                </div>
            </div>

            <div id="weeklyActivity"></div>
        </div>

    </div>

    <div class="analytics-storage">
        <div>
            <span class="analytics-eyebrow">STORAGE OVERVIEW</span>
            <h3>Your Information Collection</h3>
            <p id="storageDescription">
                Your saved information is stored locally in this browser.
            </p>
        </div>

        <div class="storage-number">
            <strong id="storageCount">0</strong>
            <span>RECORDS STORED</span>
        </div>
    </div>
`;

// Place analytics before the organizer form and records
const organizerContainer = document.querySelector(".organizer-container");

if (organizerContainer) {
    organizerContainer.parentNode.insertBefore(
        analyticsSection,
        organizerContainer
    );
}

// ==========================================
// ANALYTICS: CATEGORY BREAKDOWN
// ==========================================

function updateCategoryAnalytics() {
    const container = document.getElementById("categoryBreakdown");

    const categoryCounts = {};

    categories.forEach(category => {
        categoryCounts[category] = records.filter(
            record => record.category === category
        ).length;
    });

    container.innerHTML = "";

    categories.forEach(category => {
        const count = categoryCounts[category];

        const percentage = records.length > 0
            ? Math.round((count / records.length) * 100)
            : 0;

        const row = document.createElement("div");
        row.className = "category-analytics-row";

        const heading = document.createElement("div");
        heading.className = "category-analytics-info";

        const name = document.createElement("span");
        name.textContent = category;

        const amount = document.createElement("span");
        amount.textContent = `${count} (${percentage}%)`;

        heading.append(name, amount);

        const track = document.createElement("div");
        track.className = "analytics-progress";

        const fill = document.createElement("div");
        fill.className = "analytics-progress-fill";
        fill.style.width = `${percentage}%`;

        track.appendChild(fill);

        row.append(heading, track);
        container.appendChild(row);
    });
}

// ==========================================
// ANALYTICS: WEEKLY ACTIVITY
// ==========================================

function updateWeeklyActivity() {
    const container = document.getElementById("weeklyActivity");

    container.innerHTML = "";

    const today = new Date();
    const days = [];

    // Get the last seven calendar days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const count = records.filter(record => {
            const recordDate = new Date(record.createdAt);

            return !isNaN(recordDate.getTime()) &&
                recordDate.getFullYear() === date.getFullYear() &&
                recordDate.getMonth() === date.getMonth() &&
                recordDate.getDate() === date.getDate();
        }).length;

        days.push({
            label: date.toLocaleDateString("en-US", {
                weekday: "short"
            }),
            count
        });
    }

    const maximum = Math.max(
        1,
        ...days.map(day => day.count)
    );

    const chart = document.createElement("div");
    chart.className = "weekly-chart";

    days.forEach(day => {
        const column = document.createElement("div");
        column.className = "weekly-chart-column";

        const barArea = document.createElement("div");
        barArea.className = "weekly-bar-area";

        const bar = document.createElement("div");
        bar.className = "weekly-bar";

        const height = day.count > 0
            ? Math.max(8, (day.count / maximum) * 100)
            : 3;

        bar.style.height = `${height}%`;

        const value = document.createElement("span");
        value.className = "weekly-bar-value";
        value.textContent = day.count;

        const label = document.createElement("small");
        label.textContent = day.label;

        barArea.append(bar);
        column.append(value, barArea, label);

        chart.appendChild(column);
    });

    container.appendChild(chart);
}

// ==========================================
// UPDATE ALL DASHBOARD ANALYTICS
// ==========================================

function updateStatistics() {
    totalRecords.textContent = records.length;

    const usedCategories = new Set(
        records.map(record => record.category)
    );

    // Update existing dashboard cards if present
    const categoryCards = document.querySelectorAll(
        ".dashboard-stat"
    );

    if (categoryCards.length > 1) {
        const categoryNumber = categoryCards[1].querySelector("strong");

        if (categoryNumber) {
            categoryNumber.textContent = String(
                usedCategories.size
            ).padStart(2, "0");
        }
    }

    // Update analytics summary
    document.getElementById("analyticsTotal").textContent =
        records.length;

    document.getElementById("analyticsCategories").textContent =
        String(usedCategories.size).padStart(2, "0");

    document.getElementById("storageCount").textContent =
        records.length;

    const counts = categories.map(category => ({
        name: category,
        count: records.filter(
            record => record.category === category
        ).length
    }));

    const topCategory = counts.sort(
        (a, b) => b.count - a.count
    )[0];

    if (records.length > 0 && topCategory.count > 0) {
        document.getElementById("analyticsTopCategory").textContent =
            topCategory.name;

        document.getElementById("analyticsTopCount").textContent =
            `${topCategory.count} saved record(s)`;
    } else {
        document.getElementById("analyticsTopCategory").textContent =
            "—";

        document.getElementById("analyticsTopCount").textContent =
            "No records yet";
    }

    document.getElementById("storageDescription").textContent =
        records.length === 0
            ? "Start adding information to build your collection."
            : `${records.length} record(s) currently stored in this browser.`;

    updateCategoryAnalytics();
    updateWeeklyActivity();
}

// ==========================================
// DISPLAY RECORDS
// ==========================================

function displayRecords() {
    recordsList.innerHTML = "";

    updateStatistics();

    const searchText = searchRecords.value.toLowerCase().trim();
    const selectedCategory = filterCategory.value;

    const filteredRecords = records
        .filter(record => {
            const matchesSearch =
                record.title.toLowerCase().includes(searchText) ||
                (record.details || "").toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "All" ||
                record.category === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

    if (filteredRecords.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const icon = document.createElement("div");
        icon.className = "empty-icon";
        icon.textContent = "▤";

        const heading = document.createElement("h3");
        heading.textContent = records.length === 0
            ? "No records yet"
            : "No matching records";

        const description = document.createElement("p");
        description.textContent = records.length === 0
            ? "Your saved information will appear here."
            : "Try another search or category.";

        emptyState.append(icon, heading, description);
        recordsList.appendChild(emptyState);

        return;
    }

    filteredRecords.forEach(record => {
        const recordElement = document.createElement("div");
        recordElement.className = "record-item";

        const title = document.createElement("h4");
        title.textContent = record.title;

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = record.category;

        const description = document.createElement("p");
        description.textContent =
            record.details || "No description provided.";

        const date = document.createElement("small");
        date.className = "record-date";
        date.textContent = new Date(
            record.createdAt
        ).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const actions = document.createElement("div");
        actions.className = "record-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editRecord(record.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteRecord(record.id);
        });

        actions.append(editButton, deleteButton);

        recordElement.append(
            title,
            category,
            description,
            date,
            actions
        );

        recordsList.appendChild(recordElement);
    });
}

// ==========================================
// ADD NEW RECORD
// ==========================================

recordForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = recordTitle.value.trim();
    const category = recordCategory.value;
    const details = recordDetails.value.trim();

    if (!title || !category) {
        showMessage("Please complete the required fields.");
        return;
    }

    const newRecord = {
        id: Date.now(),
        title,
        category,
        details,
        createdAt: new Date().toISOString()
    };

    records.push(newRecord);

    saveRecords();
    displayRecords();

    recordForm.reset();

    showMessage("Record successfully saved!");
});

// ==========================================
// EDIT RECORD
// ==========================================

function editRecord(id) {
    const record = records.find(item => item.id === id);

    if (!record) return;

    const updatedTitle = prompt(
        "Edit record title:",
        record.title
    );

    if (updatedTitle === null) return;

    const updatedCategory = prompt(
        "Enter category (Personal, Work, School, Other):",
        record.category
    );

    if (updatedCategory === null) return;

    const updatedDetails = prompt(
        "Edit record description:",
        record.details || ""
    );

    if (updatedDetails === null) return;

    const category = categories.find(
        item => item.toLowerCase() ===
        updatedCategory.trim().toLowerCase()
    );

    if (!updatedTitle.trim() || !category) {
        showMessage("Please enter a valid title and category.");
        return;
    }

    record.title = updatedTitle.trim();
    record.category = category;
    record.details = updatedDetails.trim();

    saveRecords();
    displayRecords();

    showMessage("Record successfully updated!");
}

// ==========================================
// DELETE RECORD
// ==========================================

function deleteRecord(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this record?"
    );

    if (!confirmed) return;

    records = records.filter(record => record.id !== id);

    saveRecords();
    displayRecords();

    showMessage("Record deleted successfully.");
}

// ==========================================
// CLEAR ALL RECORDS
// ==========================================

clearRecords.addEventListener("click", function() {
    if (records.length === 0) {
        showMessage("There are no records to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete ALL records?"
    );

    if (!confirmed) return;

    records = [];

    saveRecords();
    displayRecords();

    showMessage("All records have been cleared.");
});

// ==========================================
// SEARCH AND FILTER EVENTS
// ==========================================

searchRecords.addEventListener("input", displayRecords);
filterCategory.addEventListener("change", displayRecords);

// ==========================================
// INITIALIZE DATA SPACE
// ==========================================

saveRecords();
displayRecords();

console.log("DATA SPACE Organizer and Analytics are ready!");
