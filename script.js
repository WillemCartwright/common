// Elements
const feedEl = document.getElementById('feed');
const resultCount = document.getElementById('resultCount');
const tabs = [...document.querySelectorAll('.tab')];
const searchInput = document.getElementById('searchInput');
const sentinel = document.getElementById('sentinel');
const topicList = document.getElementById('topicList');

// Modals
const questionModal = document.getElementById('questionModal');
const infoModal = document.getElementById('infoModal');
const topicModal = document.getElementById('topicModal');
const answerModal = document.getElementById('answerModal');

// Inputs
const questionTitle = document.getElementById('questionTitle');
const questionTopic = document.getElementById('questionTopic');
const newTopicInputQ = document.getElementById('newTopicInputQ');
const infoTitle = document.getElementById('infoTitle');
const infoText = document.getElementById('infoText');
const infoTopic = document.getElementById('infoTopic');
const newTopicInputI = document.getElementById('newTopicInputI');
const answerText = document.getElementById('answerText');

// Credits
let credits = 3;
const creditDisplay = document.getElementById('creditCount');

// State
let mode = 'questions';
let page = 0;
let topics = {};
let questions = [];
let info = [];
let currentAnswerId = null;

// Helpers
function makeQuestion(id, topic, author, title) {
  return { id, topic, author, age: "zojuist", title, answers: [], visible: false, permanentVisible: false };
}
function makeInfo(id, topic, author, title, text) {
  return { id, topic, author, age: "zojuist", title, text };
}

// Local Storage
function saveData() {
  localStorage.setItem('questions', JSON.stringify(questions));
  localStorage.setItem('info', JSON.stringify(info));
  localStorage.setItem('topics', JSON.stringify(topics));
  localStorage.setItem('credits', credits);
}
function loadData() {
  const qs = localStorage.getItem('questions');
  const inf = localStorage.getItem('info');
  const tps = localStorage.getItem('topics');
  const cr = localStorage.getItem('credits');
  questions = qs ? JSON.parse(qs) : [];
  info = inf ? JSON.parse(inf) : [];
  topics = tps ? JSON.parse(tps) : {"Unity":3,"Blender":2,"Coding":5};
  credits = cr ? +cr : 3;
  creditDisplay.textContent = `💰 ${credits}`;
}


// Credit popup
function showCreditPopup() {
  const popup = document.getElementById('credit-popup');
  popup.classList.remove('hidden');
  document.getElementById('popup-ok').onclick = () => popup.classList.add('hidden');
}

// Render
function render(resetCount = true) {
  const q = (searchInput.value || '').toLowerCase();
  let list = mode === 'questions' ? questions : info;
  list = list.filter(p => !q || (p.title + p.topic + p.author).toLowerCase().includes(q));

  if (resetCount)
    resultCount.textContent = `${list.length} onderwerp${list.length !== 1 ? 'en' : ''}`;
  feedEl.innerHTML = list.map(Post).join('');
  bindHandlers();
  renderTopics();
}

function Post(p) {
  if (mode === 'questions') {
    // Disable "Bekijk antwoord" als er geen antwoorden zijn
    const viewDisabled = p.answers.length === 0 || p.permanentVisible ? 'disabled' : '';
    return `
    <article class="post" data-id="${p.id}">
      <div class="post-head">
        <span class="community">${p.topic}</span>
        <span class="meta">Gevraagd door ${p.author} • ${p.age}</span>
      </div>
      <h2 class="post-title">${p.title}</h2>
      <div class="actions">
        <button class="action view" ${viewDisabled}>Bekijk antwoord</button>
        <button class="action answer">Antwoord</button>
        <span class="score-chip">${p.answers.length} antwoorden</span>
      </div>
      <div class="answers ${p.visible ? '' : 'hidden'}">
        ${p.answers.map(a => `<div class="answer"><b>${a.author}:</b> ${a.text}</div>`).join('')}
      </div>
    </article>`;
  } else {
    return `
    <article class="post">
      <div class="post-head">
        <span class="community">${p.topic}</span>
        <span class="meta">Bijgedragen door ${p.author} • ${p.age}</span>
      </div>
      <h2 class="post-title">${p.title}</h2>
      <div class="post-content">${p.text}</div>
    </article>`;
  }
}


function bindHandlers() {
  document.querySelectorAll('.action.answer').forEach(btn => {
    btn.onclick = (e) => {
      const post = e.currentTarget.closest('.post');
      currentAnswerId = +post.dataset.id;
      openModal(answerModal);
    };
  });

  document.querySelectorAll('.action.view').forEach(btn => {
    btn.onclick = (e) => {
      const post = e.currentTarget.closest('.post');
      const id = +post.dataset.id;
      const q = questions.find(x => x.id === id);
      if (!q) return;

      // Alleen uitvoeren als er antwoorden zijn
      if (q.answers.length === 0 || q.permanentVisible) return;

      // Credit check
      if (!q.visible && credits < 1) {
        showCreditPopup();
        return;
      }

      if (!q.visible) {
        credits--;
        q.visible = true;
        q.permanentVisible = true;
      }

      creditDisplay.textContent = `💰 ${credits}`;
      saveData();
      render(false);
    };
  });
}

/* Tabs */
tabs.forEach(t => {
  t.onclick = () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    mode = t.dataset.mode;
    render();
  };
});

/* Search */
searchInput.addEventListener('input', () => render());

/* Modals open/close */
function openModal(m) { m.classList.remove('hidden'); }
function closeModal(m) { m.classList.add('hidden'); }
document.getElementById('newQuestionBtn').onclick = () => openModal(questionModal);
document.getElementById('newInfoBtn').onclick = () => openModal(infoModal);
document.getElementById('newTopicBtn').onclick = () => openModal(topicModal);
document.getElementById('closeQuestionModal').onclick = () => closeModal(questionModal);
document.getElementById('closeInfoModal').onclick = () => closeModal(infoModal);
document.getElementById('closeTopicModal').onclick = () => closeModal(topicModal);
document.getElementById('closeAnswerModal').onclick = () => closeModal(answerModal);

/* Submit Question (+1 credit) */
document.getElementById('submitQuestion').onclick = () => {
  const title = questionTitle.value.trim();
  let topic = questionTopic.value;
  const newTopic = newTopicInputQ.value.trim();
  if (newTopic) topic = newTopic;
  if (!title || !topic) return;
  if (!topics[topic]) topics[topic] = 0;
  topics[topic]++;
  const id = Date.now();
  questions.unshift(makeQuestion(id, topic, "You", title));

  credits += 1; // Beloning voor vraag
  creditDisplay.textContent = `💰 ${credits}`;

  saveData();
  closeModal(questionModal);
  questionTitle.value = "";
  newTopicInputQ.value = "";
  render();
};

/* Submit Info (+1 credits) */
document.getElementById('submitInfo').onclick = () => {
  const title = infoTitle.value.trim();
  const text = infoText.value.trim();
  let topic = infoTopic.value;
  const newTopic = newTopicInputI.value.trim();
  if (newTopic) topic = newTopic;
  if (!title || !text || !topic) return;
  if (!topics[topic]) topics[topic] = 0;
  topics[topic]++;
  const id = Date.now();
  info.unshift(makeInfo(id, topic, "You", title, text));

  credits += 1; // Beloning voor info
  creditDisplay.textContent = `💰 ${credits}`;

  saveData();
  closeModal(infoModal);
  infoTitle.value = "";
  infoText.value = "";
  newTopicInputI.value = "";
  render();
};

/* Submit Topic */
document.getElementById('submitTopic').onclick = () => {
  const topic = document.getElementById('topicName').value.trim();
  if (!topic) return;
  if (!topics[topic]) topics[topic] = 0;
  saveData();
  closeModal(topicModal);
  renderTopics();
};

/* Submit Answer (+1 credit) */
document.getElementById('submitAnswer').onclick = () => {
  const text = answerText.value.trim();
  if (!text) return;
  const q = questions.find(x => x.id === currentAnswerId);
  if (q) {
    q.answers.push({ author: "You", text });
    credits += 1; // Beloning voor antwoorden
    creditDisplay.textContent = `💰 ${credits}`;
    saveData();
    render(false);
  }
  answerText.value = "";
  closeModal(answerModal);
};

/* Render topics */
function renderTopics() {
  questionTopic.innerHTML = Object.keys(topics)
    .map(t => `<option value="${t}">${t}</option>`).join('');
  infoTopic.innerHTML = questionTopic.innerHTML;
  topicList.innerHTML = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .map(([t, c]) => `<li style="font-size:${14 + c * 4}px" data-topic="${t}">${t}</li>`)
    .join('');
  document.querySelectorAll('#topicList li').forEach(li => {
    li.onclick = () => {
      searchInput.value = li.dataset.topic;
      render();
    };
  });
}

/* Infinite scroll */
function loadNextPage() { page++; render(); }
const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) loadNextPage(); });
io.observe(sentinel);

/* Init */
function init() {
  loadData();
  render();
}
init();
