document.addEventListener('DOMContentLoaded', function () {
  const taskTitle = document.getElementById('taskTitle');
  const taskDescription = document.getElementById('taskDescription');
  const taskDueDate = document.getElementById('taskDueDate');
  const taskPriority = document.getElementById('taskPriority');
  const taskCategory = document.getElementById('taskCategory');
  const taskRecurring = document.getElementById('taskRecurring');
  const addTaskButton = document.getElementById('addTask');
  const taskList = document.getElementById('taskList');
  const searchTask = document.getElementById('searchTask');
  const sortTasks = document.getElementById('sortTasks');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const closeModal = document.getElementById('closeModal');

  addTaskButton.addEventListener('click', (e) => {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const dueDate = taskDueDate.value;
    const priority = taskPriority.value;
    const category = taskCategory.value.trim();
    const recurring = taskRecurring.value;

    if (title !== '') {
      addTask(title, description, dueDate, priority, category, recurring);
      saveTasks();
      clearFields()

    } else {
      e.preventDefault()
      alert("please enter title")
    }
  });
  const clearFields = () => {
    taskTitle.value = '';
    taskDescription.value = '';
    taskDueDate.value = '';
    taskPriority.value = 'low';
    taskCategory.value = '';
    taskRecurring.value = 'none';
  }
  function addTask(title, description, dueDate, priority, category, recurring, completed = false) {
    const tr = document.createElement('tr');
    if (completed) {
      tr.classList.add('completed');
    }

    const titleTd = document.createElement('td');
    titleTd.textContent = title;
    tr.appendChild(titleTd);

    const descriptionTd = document.createElement('td');
    descriptionTd.textContent = description;
    tr.appendChild(descriptionTd);

    const dueDateTd = document.createElement('td');
    dueDateTd.textContent = dueDate;
    tr.appendChild(dueDateTd);

    const priorityTd = document.createElement('td');
    priorityTd.textContent = priority;
    tr.appendChild(priorityTd);

    const categoryTd = document.createElement('td');
    categoryTd.textContent = category;
    tr.appendChild(categoryTd);

    const actionsTd = document.createElement('td');
    const completeButton = document.createElement('button');
    completeButton.textContent = completed ? 'Undo' : 'Complete';
    completeButton.addEventListener('click', function () {
      tr.classList.toggle('completed');
      completeButton.textContent = tr.classList.contains('completed') ? 'Undo' : 'Complete';
      saveTasks();
      updateProgress();
      if (tr.classList.contains('completed')) {
        showNotification(title);
      }
    });
    actionsTd.appendChild(completeButton);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('btn', 'btn-primary');  // Adding classes

    editButton.setAttribute('data-toggle', 'modal');  // Setting data-toggle attribute
    editButton.setAttribute('data-target', '#exampleModal');  // Setting data-target attribute

    editButton.addEventListener('click', function () {
      editTask(tr, title, description, dueDate, priority, category, recurring);
    });

    actionsTd.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
      taskList.removeChild(tr);
      saveTasks();
      updateProgress();
    });
    actionsTd.appendChild(deleteButton);

    tr.appendChild(actionsTd);
    taskList.appendChild(tr);

    // handleRecurringTask(title, description, dueDate, priority, category, recurring);
  }
  closeModal.addEventListener('click', function () {
    clearFields()
  });
  function saveTasks(mode=0) {
    const tasks = [];
    taskList.querySelectorAll('tr').forEach(tr => {
      tasks.push({
        title: tr.children[0].textContent,
        description: tr.children[1].textContent,
        dueDate: tr.children[2].textContent,
        priority: tr.children[3].textContent,
        category: tr.children[4].textContent,
        recurring: tr.children[5] ? tr.children[5].textContent : 'none',
        completed: tr.classList.contains('completed')
      });
    });
    chrome.storage.local.set({ tasks });
    updateProgress();

  }

  function loadTasks() {
    chrome.storage.local.get('tasks', function (data) {
      if (data.tasks) {
        data.tasks.forEach(task => {
          addTask(task.title, task.description, task.dueDate, task.priority, task.category, task.recurring, task.completed);
        });
      }
      updateProgress();
    });
    chrome.storage.local.get('darkMode', function (data) {
      if (data.darkMode) {
        document.body.classList.add('dark-mode')
      }
      else {
        document.body.classList.remove('dark-mode')

      }
      updateProgress();
    });
  }


  function updateProgress() {
    const totalTasks = taskList.querySelectorAll('tr').length;
    const completedTasks = taskList.querySelectorAll('.completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    progressBar.value = progress;
    progressText.textContent = `${Math.round(progress)}% Complete`;
  }


  function editTask(tr, oldTitle, oldDescription, oldDueDate, oldPriority, oldCategory, oldRecurring) {
    // const newTitle = prompt('Edit Task Title:', oldTitle);
    // const newDescription = prompt('Edit Task Description:', oldDescription);
    // const newDueDate = prompt('Edit Task Due Date:', oldDueDate);
    // const newPriority = prompt('Edit Task Priority:', oldPriority);
    // const newCategory = prompt('Edit Task Category:', oldCategory);
    // const newRecurring = prompt('Edit Task Recurring:', oldRecurring);

    taskTitle.value = oldTitle
    taskDescription.value = oldDescription
    taskDueDate.value = oldDueDate
    taskPriority.value = oldPriority
    taskCategory.value = oldCategory
    taskRecurring.value = oldRecurring


    if (taskTitle.value !== null && taskTitle.value.trim() !== '') {
      tr.children[0].textContent = taskTitle.value;
      tr.children[1].textContent = taskDescription.value || '';
      tr.children[2].textContent = taskDueDate.value || '';
      tr.children[3].textContent =  taskPriority.value || '';
      tr.children[4].textContent = taskCategory.value|| '';
      saveTasks(1);
    }
  }
  searchTask.addEventListener('input', function () {
    const searchTerm = searchTask.value.trim().toLowerCase();
    filterTasks(searchTerm);
  });

  sortTasks.addEventListener('change', function () {
    const sortBy = sortTasks.value;
    sortTaskList(sortBy);
  });



  // function handleRecurringTask(title, description, dueDate, priority, category, recurring) {
  //   if (recurring !== 'none') {
  //     const taskDate = new Date(dueDate);
  //     let nextDate;
  //     if (recurring === 'daily') {
  //       nextDate = new Date(taskDate.setDate(taskDate.getDate() + 1));
  //     } else if (recurring === 'weekly') {
  //       nextDate = new Date(taskDate.setDate(taskDate.getDate() + 7));
  //     } else if (recurring === 'monthly') {
  //       nextDate = new Date(taskDate.setMonth(taskDate.getMonth() + 1));
  //     }
  //     addTask(title, description, nextDate.toISOString().slice(0, 16), priority, category, recurring);
  //     saveTasks();
  //   }
  // }



  function showNotification(title) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon.png',
      title: 'Task Completed',
      message: `You have completed: ${title}`
    });
  }


  function filterTasks(searchTerm) {
    taskList.querySelectorAll('tr').forEach(tr => {
      const title = tr.children[0].textContent.toLowerCase();
      const description = tr.children[1].textContent.toLowerCase();
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
  }

  function sortTaskList(sortBy) {
    const rows = Array.from(taskList.querySelectorAll('tr'));
    rows.sort((a, b) => {
      let aValue = a.children[0].textContent;
      let bValue = b.children[0].textContent;

      if (sortBy === 'dueDate') {
        aValue = new Date(a.children[2].textContent).getTime();
        bValue = new Date(b.children[2].textContent).getTime();
      } else if (sortBy === 'priority') {
        aValue = a.children[3].textContent;
        bValue = b.children[3].textContent;
      }

      if (aValue > bValue) {
        return 1;
      } else if (aValue < bValue) {
        return -1;
      } else {
        return 0;
      }
    });

    taskList.innerHTML = '';
    rows.forEach(row => taskList.appendChild(row));
  }



  darkModeToggle.addEventListener('click', toggleDarkMode);

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    chrome.storage.local.set({ darkMode: document.body.classList.contains('dark-mode') });

  }

  loadTasks();
});
