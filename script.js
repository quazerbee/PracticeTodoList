document.addEventListener("DOMContentLoaded", function() {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const modal = document.getElementById("modal");
    const closeModal = document.getElementById("closeModal");
    const saveTaskBtn = document.getElementById("saveTaskBtn");
    const taskTitle = document.getElementById("taskTitle");
    const taskDescription = document.getElementById("taskDescription");
    const taskList = document.getElementById("taskList");
    const allBtn = document.getElementById("allBtn");
    const activeBtn = document.getElementById("activeBtn");
    const completedBtn = document.getElementById("completedBtn");
    const searchBtn = document.getElementById("searchBtn");
    const searchModal = document.getElementById("searchModal");
    const closeSearchModal = document.getElementById("closeSearchModal");
    const searchInput = document.getElementById("searchInput");
    const searchHistoryList = document.getElementById("searchHistoryList");
    const searchExecuteBtn = document.getElementById("searchExecuteBtn");
    const deleteConfirmationModal = document.getElementById("deleteConfirmationModal");
    const closeDeleteConfirmationModal = document.getElementById("closeDeleteConfirmationModal");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const taskModal = document.getElementById("taskModal");
    const taskModalTitle = document.getElementById("taskModalTitle");
    const taskModalDescription = document.getElementById("taskModalDescription");
    const taskComment = document.getElementById("taskComment");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    let taskToDeleteIndex = -1;
    let currentFilter = 'all'; // Хранение текущего фильтра (активные, завершенные, все)

    // Функция для обновления списка задач
    function updateTaskList(filter = currentFilter, searchQuery = "") {
        // Скрываем все вкладки и показываем нужную
        document.getElementById("allTasks").style.display = 'none';
        document.getElementById("activeTasks").style.display = 'none';
        document.getElementById("completedTasks").style.display = 'none';

        let filteredTasks;

        if (filter === "active") {
            filteredTasks = tasks.filter(task => !task.completed);
            document.getElementById("activeTasks").style.display = 'block';
        } else if (filter === "completed") {
            filteredTasks = tasks.filter(task => task.completed);
            document.getElementById("completedTasks").style.display = 'block';
        } else {
            filteredTasks = tasks;
            document.getElementById("allTasks").style.display = 'block';
        }

        let taskListElement = document.getElementById(filter + "TaskList");
        taskListElement.innerHTML = ''; // Очищаем текущий список задач

        if (searchQuery) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filteredTasks.length === 0) {
            taskListElement.innerHTML = '<p>Нет задач для отображения.</p>';
        } else {
            filteredTasks.forEach((task, index) => {
                const li = document.createElement("li");
                li.classList.toggle("completed", task.completed);
                li.innerHTML = `
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-description">${task.description}</div>
                    </div>
                    <div class="task-buttons">
                        <button class="delete-btn" onclick="deleteTask(${index})">Удалить</button>
                        <button class="toggle-btn" onclick="toggleTask(${index})">${task.completed ? 'Не выполнено' : 'Выполнено'}</button>
                    </div>
                `;
                li.addEventListener("click", (event) => {
                    // Открываем модальное окно только если клик был не по кнопке "Удалить" или "Выполнить"
                    if (!event.target.classList.contains('delete-btn') && !event.target.classList.contains('toggle-btn')) {
                        openTaskModal(index);
                    }
                });

                taskListElement.appendChild(li);
            });
        }

        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Открытие модального окна для добавления задачи
    addTaskBtn.addEventListener("click", function() {
        modal.style.display = "block";
    });

    // Закрытие модального окна
    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // Сохранение новой задачи
    saveTaskBtn.addEventListener("click", function() {
        const title = taskTitle.value.trim();
        const description = taskDescription.value.trim();

        if (title) {
            tasks.push({ title: title, description: description, completed: false, comment: "" });
            taskTitle.value = '';
            taskDescription.value = '';
            modal.style.display = "none";
            updateTaskList(currentFilter);  // Обновляем список задач после добавления новой
        } else {
            alert("Название задачи обязательно!"); // Выводим предупреждение, если название пустое
        }
    });

    // Переключение состояния задачи
    window.toggleTask = function(index) {
        tasks[index].completed = !tasks[index].completed;
        updateTaskList(currentFilter);  // Обновляем после переключения состояния
    };

    // Удаление задачи
    window.deleteTask = function(index) {
        taskToDeleteIndex = index;  // Сохраняем индекс задачи для удаления
        deleteConfirmationModal.style.display = "block";  // Показываем окно подтверждения
    };

    closeDeleteConfirmationModal.addEventListener("click", function() {
        deleteConfirmationModal.style.display = "none";  // Закрываем окно
    });

    confirmDeleteBtn.addEventListener("click", function() {
        if (taskToDeleteIndex >= 0) {
            tasks.splice(taskToDeleteIndex, 1);  // Удаляем задачу
            updateTaskList(currentFilter);  // Обновляем после удаления задачи
            deleteConfirmationModal.style.display = "none";  // Закрываем окно подтверждения
        }
    });

    cancelDeleteBtn.addEventListener("click", function() {
        deleteConfirmationModal.style.display = "none";  // Закрываем окно, если пользователь отменил
    });

    // Открытие модального окна для просмотра задачи
    function openTaskModal(index) {
        const task = tasks[index];
        taskModalTitle.textContent = task.title;
        taskModalDescription.textContent = task.description;
        taskComment.value = task.comment;

        // Делаем название и описание только для чтения
        taskModalTitle.setAttribute("readonly", true);
        taskModalDescription.setAttribute("readonly", true);

        // Динамическое сохранение комментария
        taskComment.addEventListener("input", function() {
            task.comment = this.value.trim();
            localStorage.setItem("tasks", JSON.stringify(tasks));
        });

        taskModal.style.display = "block";
    }

    closeTaskModal.addEventListener("click", function() {
        taskModal.style.display = "none";  // Закрываем окно
    });

    // Фильтрация задач по кнопкам
    allBtn.addEventListener("click", function() {
        currentFilter = "all"; // Сохраняем текущий фильтр
        updateTaskList(currentFilter);  // Обновляем список задач с фильтром "Все"
    });

    activeBtn.addEventListener("click", function() {
        currentFilter = "active"; // Сохраняем текущий фильтр
        updateTaskList(currentFilter);  // Обновляем список задач с фильтром "Активные"
    });

    completedBtn.addEventListener("click", function() {
        currentFilter = "completed"; // Сохраняем текущий фильтр
        updateTaskList(currentFilter);  // Обновляем список задач с фильтром "Завершенные"
    });

    // Поиск задач
    searchBtn.addEventListener("click", function() {
        searchModal.style.display = "block";  // Показываем модальное окно
    });

    closeSearchModal.addEventListener("click", function() {
        searchModal.style.display = "none";  // Закрываем модальное окно
    });

    searchExecuteBtn.addEventListener("click", function() {
        const query = searchInput.value.trim();
        if (query) {
            // Добавляем запрос в историю
            searchHistory.unshift(query);
            if (searchHistory.length > 5) searchHistory.pop();
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

            updateSearchHistory();  // Обновляем список истории поиска
            updateTaskList(currentFilter, query); // Обновляем список задач с результатами поиска
        }
    });

    // Обновление истории поиска
    function updateSearchHistory() {
        searchHistoryList.innerHTML = "";
        searchHistory.forEach(query => {
            const li = document.createElement("li");
            li.textContent = query;
            li.addEventListener("click", function() {
                searchInput.value = query;  // При клике на запрос, ставим его в поле ввода
                updateTaskList(currentFilter, query); // Выполняем поиск по выбранному запросу
            });
            searchHistoryList.appendChild(li);
        });
    }

    // Инициализация поиска
    if (searchHistory.length > 0) {
        updateSearchHistory();
    }

    // Инициализация при загрузке страницы
    if (tasks.length > 0) {
        updateTaskList("all");
    }
});
