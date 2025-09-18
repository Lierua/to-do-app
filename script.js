 
// INITIAL SETUP
 
let todoArray = JSON.parse(localStorage.getItem("taskList")) || [
  { "Task List": [] }
];

let doneArray = JSON.parse(localStorage.getItem("done")) || [];

// GLOBAL COOLDOWN FLAG
let isCooldown = false;

function startCooldown() {
  isCooldown = true;
  setTimeout(() => {
    isCooldown = false;
  }, 600);
}
 
// LOCALSTORAGE FUNCTIONS
 
function saveTodos() {
  localStorage.setItem("taskList", JSON.stringify(todoArray));
}
function loadTodos() {
  const saved = localStorage.getItem("taskList");
  if (saved) todoArray = JSON.parse(saved);
}

function saveDone() {
  localStorage.setItem("done", JSON.stringify(doneArray));
}
function loadDone() {
  const saved = localStorage.getItem("done");
  if (saved) doneArray = JSON.parse(saved);
}

 
// RENDER FUNCTION

const todoList = document.querySelector("#todo");
function renderTodo() {
  // Get the latest from localStorage
  loadTodos();

  todoList.innerHTML = todoArray.map((todo, listIndex) => {
    const key = Object.keys(todo)[0];

    return `
      <ul>
        <div class="task-list-header">
          <h1>${key}</h1>
          <div class="taskHeaderOption">
            <!-- cross for removing the whole list -->
            <div class="cross remove-list" data-list="${listIndex}">&#10005;</div>
            <button class="toggle-add-task" data-listnumber="${listIndex}">＋</button>
            <div class="add-task hidden">
              <input type="text" class="new-task" data-listnumber="${listIndex}" placeholder="New task">
              <button class="add-task-btn" data-listnumber="${listIndex}">Add</button>
            </div>
          </div>
        </div>
        ${todo[key].map((item, taskIndex) => `
          <li>
            ${item}
            <div class="flex">
              <div class="circle" data-list="${listIndex}" data-task="${taskIndex}"></div>
              <!-- cross for removing a single task -->
              <div class="cross remove-task" data-list="${listIndex}" data-task="${taskIndex}">&#10005;</div>
            </div>
          </li>
        `).join("")}
      </ul>
    `;
  }).join("");

  attachListeners();
}


const doneList = document.querySelector("#done");
function renderDone() {
  loadDone();

  doneList.innerHTML = `
    <ul>
      <div class="task-list-header"><h1>Done</h1>
          <div id="clear-all">
              <button id="clear-done-btn">Clear</button>
          </div>
      </div>
      ${doneArray.map((item, taskIndex) => `
        <li>
          ${item}
          <div class="flex">
            <div class="cross" data-task="${taskIndex}">&#10005;</div>
          </div>
        </li>
      `).join("")}
    </ul>
  `;

  const clearDoneBtn = document.querySelector("#clear-done-btn");
  if (clearDoneBtn) {
    clearDoneBtn.addEventListener("mousedown", () => {
      doneArray = [];
      saveDone();
      renderDone();
    });
  }


  // Attach delete listeners for done tasks
  const doneCrossBtns = doneList.querySelectorAll(".cross");
  doneCrossBtns.forEach(btn => {
    btn.addEventListener("mousedown", () => {
      const taskIndex = parseInt(btn.dataset.task, 10);
      doneArray.splice(taskIndex, 1);
      saveDone();
      renderDone();
    });
  });
}


 
// ATTACH EVENT LISTENERS
 
function attachListeners() {

  // Add list button
  const addListBtn = document.querySelector("#add-taskList-btn")
  const newListInput = document.querySelector("#new-tasklist")
  addListBtn.addEventListener("mousedown", () => {
    const listName = newListInput.value.trim();
    if (!listName) return; // prevent empty list name

    // Add new list object with empty task array
    todoArray.push({ [listName]: [] });

    saveTodos();
    renderTodo();

    newListInput.value = ""; // clear input
  });

  // Add buttons
  const addTaskBtns = document.querySelectorAll(".add-task-btn");
  addTaskBtns.forEach(btn => {
    btn.addEventListener("mousedown", () => {
      const input = btn.previousElementSibling;
      const listNumber = parseInt(btn.dataset.listnumber, 10);
      addTodo(listNumber, input);
    });
  });

  // Toggle add-task inputs
  const toggleBtns = document.querySelectorAll(".toggle-add-task");
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const wrapper = btn.nextElementSibling;
      wrapper.classList.toggle("hidden");
      btn.textContent = wrapper.classList.contains("hidden") ? "＋" : "−";
    });
  });

  // Delete single tasks
const clearTaskBtns = document.querySelectorAll(".remove-task");
clearTaskBtns.forEach(btn => {
  btn.addEventListener("mousedown", () => {
    if (isCooldown) return; // block if cooldown is active
    startCooldown();

    const listIndex = parseInt(btn.dataset.list, 10);
    const taskIndex = parseInt(btn.dataset.task, 10);

    const li = btn.closest("li");
    li.classList.add("moveout-left");

    li.addEventListener("animationend", () => {
      const key = Object.keys(todoArray[listIndex])[0];
      todoArray[listIndex][key].splice(taskIndex, 1);

      saveTodos();
      renderTodo();
    });
  });
});

// Done single task
const doneTaskBtns = document.querySelectorAll(".circle");
doneTaskBtns.forEach(btn => {
  btn.addEventListener("mousedown", () => {
    if (isCooldown) return; // block if cooldown is active
    startCooldown();

    const listIndex = parseInt(btn.dataset.list, 10);
    const taskIndex = parseInt(btn.dataset.task, 10);

    const li = btn.closest("li");
    li.classList.add("moveout-right");

    li.addEventListener("animationend", () => {
      const key = Object.keys(todoArray[listIndex])[0];
      const task = todoArray[listIndex][key].splice(taskIndex, 1)[0]; 

      doneArray.push(task); 
      saveTodos();
      saveDone();

      renderTodo();
      renderDone();

      const doneItems = doneList.querySelectorAll("li");
      const newDoneLi = doneItems[doneItems.length - 1];
      newDoneLi.classList.add("comein-left");
    });
  });
});

// Remove a whole list
const removeListBtns = document.querySelectorAll(".remove-list");
removeListBtns.forEach(btn => {
  btn.addEventListener("mousedown", () => {
    if (isCooldown) return; // block if cooldown is active
    startCooldown();

    const listIndex = parseInt(btn.dataset.list, 10);
    todoArray.splice(listIndex, 1); 
    saveTodos();
    renderTodo();
  });
});

}
 
// ADD TODO

function addTodo(listIndex, input) {
  const task = input.value
  if (!task) return;

  const key = Object.keys(todoArray[listIndex])[0];
  todoArray[listIndex][key].push(task);

  input.value = "";
  saveTodos();
  renderTodo();
}

 
// CLEAR ALL TASKS

const clearAllBtn = document.querySelector("#clear-all-btn");
clearAllBtn.addEventListener("mousedown", () => {
  todoArray = [
    { "Task List": [] },
  ];
  saveTodos();
  renderTodo();
});


// INITIAL RENDER

renderTodo();
renderDone();