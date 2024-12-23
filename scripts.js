// script.js

document.addEventListener("DOMContentLoaded", () => {
  const templateContainer = document.querySelector("#templates .grid");
  const modal = document.getElementById("scheduleModal");
  const closeBtn = document.querySelector(".close");
  let templatesData = [];
  let currentTemplate = null;
  let isEditMode = false;

  // Load templates
  fetch("templates.json")
    .then((response) => response.json())
    .then((templates) => {
      templatesData = templates;
      templates.forEach((template) => {
        const card = document.createElement("div");
        card.className = "template-card";

        card.innerHTML = `
            <div class="template-content">
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="template-tags">
                    ${template.tags
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                </div>
                <div class="template-actions">
                    <button class="preview-btn" data-id="${
                      template.id
                    }">תצוגה מקדימה</button>
                </div>
            </div>
        `;

        templateContainer.appendChild(card);
      });

      setupEventListeners();
    })
    .catch((error) => console.error("Error loading templates:", error));

  function setupEventListeners() {
    // Preview button handler
    document.querySelectorAll(".preview-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const templateId = parseInt(button.dataset.id);
        showSchedule(templateId);
      });
    });

    // Close modal
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });

    // Download button in modal
    document.getElementById("downloadBtn").addEventListener("click", () => {
      // TODO: Implement PDF download
      console.log("Downloading PDF...");
    });

    // Edit button in modal
    document.getElementById("editBtn").addEventListener("click", () => {
      toggleEditMode();
    });

    // Add save button to modal actions
    const saveBtn = document.createElement("button");
    saveBtn.id = "saveBtn";
    saveBtn.textContent = "שמור שינויים";
    saveBtn.style.display = "none";
    saveBtn.className = "save-btn";
    document.querySelector(".modal-actions").appendChild(saveBtn);

    saveBtn.addEventListener("click", () => {
      saveChanges();
      toggleEditMode();
    });
  }

  function toggleEditMode() {
    isEditMode = !isEditMode;
    const table = document.getElementById("scheduleTable");
    const saveBtn = document.getElementById("saveBtn");
    const editBtn = document.getElementById("editBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    if (isEditMode) {
      // Enable editing
      editBtn.textContent = "בטל עריכה";
      saveBtn.style.display = "inline-block";
      downloadBtn.style.display = "none";

      // Make cells editable
      const cells = table.querySelectorAll("td");
      cells.forEach((cell, index) => {
        cell.contentEditable = "true";
        cell.classList.add("editable");

        // Add data attributes for tracking position
        const rowIndex = cell.parentElement.rowIndex;
        const cellIndex = cell.cellIndex;
        cell.dataset.hour = currentTemplate.schedule.hours[rowIndex - 1];
        cell.dataset.day = currentTemplate.schedule.days[cellIndex - 1];
      });
    } else {
      // Disable editing
      editBtn.textContent = "ערוך";
      saveBtn.style.display = "none";
      downloadBtn.style.display = "inline-block";

      // Make cells non-editable
      const cells = table.querySelectorAll("td");
      cells.forEach((cell) => {
        cell.contentEditable = "false";
        cell.classList.remove("editable");
      });
    }
  }

  function saveChanges() {
    const table = document.getElementById("scheduleTable");
    const cells = table.querySelectorAll("td");

    // Update the tasks object
    cells.forEach((cell) => {
      if (cell.textContent.trim()) {
        const hourIndex = currentTemplate.schedule.hours.indexOf(
          cell.dataset.hour
        );
        const dayIndex = currentTemplate.schedule.days.indexOf(
          cell.dataset.day
        );
        const taskKey = `${dayIndex + 1}-${hourIndex + 1}`;
        currentTemplate.schedule.tasks[taskKey] = cell.textContent.trim();
      }
    });

    // Save to localStorage for persistence
    const savedTemplates = JSON.parse(
      localStorage.getItem("templates") || "{}"
    );
    savedTemplates[currentTemplate.id] = currentTemplate;
    localStorage.setItem("templates", JSON.stringify(savedTemplates));

    // Show success message
    showNotification("השינויים נשמרו בהצלחה!");
  }

  function showSchedule(templateId) {
    const template = templatesData.find((t) => t.id === templateId);
    if (!template) return;

    currentTemplate = template;
    document.getElementById("modalTitle").textContent = template.name;

    const table = document.getElementById("scheduleTable");
    const schedule = template.schedule;

    // Build table HTML
    let tableHTML = `
      <tr>
        <th>שעות</th>
        ${schedule.days.map((day) => `<th>${day}</th>`).join("")}
      </tr>
    `;

    schedule.hours.forEach((hour, hourIndex) => {
      tableHTML += `
        <tr>
          <th>${hour}</th>
          ${schedule.days
            .map((_, dayIndex) => {
              const taskKey = `${dayIndex + 1}-${hourIndex + 1}`;
              const task = schedule.tasks[taskKey] || "";
              return `<td>${task}</td>`;
            })
            .join("")}
        </tr>
      `;
    });

    table.innerHTML = tableHTML;
    modal.style.display = "block";
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
      setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 2000);
    }, 100);
  }
});
