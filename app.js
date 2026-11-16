"use strict";

/* =========================================================
   КОНСТАНТЫ API
   ========================================================= */
const GET_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";
const POST_URL = "https://jsonplaceholder.typicode.com/posts";

/* =========================================================
   ССЫЛКИ НА DOM-ЭЛЕМЕНТЫ
   ========================================================= */
const loadBtn = document.getElementById("loadBtn");
const postsContainer = document.getElementById("posts");
const form = document.getElementById("postForm");
const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const createBtn = document.getElementById("createBtn");
const messageBox = document.getElementById("message");

/* =========================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ========================================================= */

/**
 * Показывает сообщение пользователю.
 * @param {string} text - текст сообщения
 * @param {"info"|"success"|"error"} type - тип сообщения
 */
function showMessage(text, type = "info") {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
}

/** Скрывает область сообщений. */
function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message";
}

/**
 * Отрисовывает одну публикацию в контейнере #posts.
 * @param {{title: string, body: string, id?: number}} post
 */
function renderPost(post) {
  const article = document.createElement("article");
  article.className = "post";

  const h3 = document.createElement("h3");
  h3.textContent = post.title;

  const p = document.createElement("p");
  p.textContent = post.body;

  article.appendChild(h3);
  article.appendChild(p);
  postsContainer.appendChild(article);
}

/** Полностью очищает список публикаций. */
function clearPosts() {
  postsContainer.textContent = "";
}

/* =========================================================
   GET: ЗАГРУЗКА ПУБЛИКАЦИЙ
   ========================================================= */
async function loadPosts() {
  // Блокируем кнопку и показываем состояние загрузки
  loadBtn.disabled = true;
  loadBtn.textContent = "Загрузка…";
  clearMessage();
  clearPosts();
  showMessage("Загрузка публикаций…", "info");

  try {
    const response = await fetch(GET_URL);

    // Проверка HTTP-статуса (404, 500 и т.д. не пройдут)
    if (!response.ok) {
      throw new Error(`HTTP-ошибка: ${response.status}`);
    }

    const data = await response.json();

    // Защита от неожиданного формата ответа
    if (!Array.isArray(data) || data.length === 0) {
      showMessage("Публикации не найдены.", "info");
      return;
    }

    // Динамическое отображение через DOM
    data.forEach(renderPost);
    showMessage(`Загружено публикаций: ${data.length}.`, "success");
  } catch (error) {
    // Сетевые сбои и HTTP-ошибки попадают сюда
    showMessage(
      `Не удалось загрузить публикации: ${error.message}. Попробуйте ещё раз.`,
      "error"
    );
    console.error("GET error:", error);
  } finally {
    // ВСЕГДА возвращаем кнопку в рабочее состояние
    loadBtn.disabled = false;
    loadBtn.textContent = "Загрузить публикации";
  }
}

/* =========================================================
   POST: СОЗДАНИЕ ПУБЛИКАЦИИ
   ========================================================= */
async function createPost(event) {
  event.preventDefault(); // Без перезагрузки страницы
  clearMessage();

  // Берём значения и обрезаем пробелы по краям
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Валидация: поля не пустые и не из одних пробелов
  if (!title) {
    showMessage(
      "Поле «Заголовок» не может быть пустым или состоять из пробелов.",
      "error"
    );
    titleInput.focus();
    return;
  }
  if (!body) {
    showMessage(
      "Поле «Текст» не может быть пустым или состоять из пробелов.",
      "error"
    );
    bodyInput.focus();
    return;
  }

  // Блокируем кнопку отправки
  createBtn.disabled = true;
  createBtn.textContent = "Отправка…";
  showMessage("Отправка публикации…", "info");

  try {
    const response = await fetch(POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP-ошибка: ${response.status}`);
    }

    const created = await response.json();

    // Добавляем созданную публикацию на страницу
    renderPost(created);

    // Выводим заголовок и ID из ответа + сообщение об успехе
    showMessage(
      `Публикация создана! ID: ${created.id}. Заголовок: «${created.title}».`,
      "success"
    );

    form.reset();
  } catch (error) {
    showMessage(
      `Не удалось отправить публикацию: ${error.message}. Попробуйте ещё раз.`,
      "error"
    );
    console.error("POST error:", error);
  } finally {
    createBtn.disabled = false;
    createBtn.textContent = "Создать публикацию";
  }
}

/* =========================================================
   ПОДПИСКА НА СОБЫТИЯ
   ========================================================= */
loadBtn.addEventListener("click", loadPosts);
form.addEventListener("submit", createPost);