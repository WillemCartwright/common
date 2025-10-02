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

// Inputs
const questionTitle = document.getElementById('questionTitle');
const questionTopic = document.getElementById('questionTopic');
const newTopicInputQ = document.getElementById('newTopicInputQ');

const infoTitle = document.getElementById('infoTitle');
const infoText = document.getElementById('infoText');
const infoTopic = document.getElementById('infoTopic');
const newTopicInputI = document.getElementById('newTopicInputI');

// State
let mode = 'questions';
let page = 0;
let topics = {
  "Unity": 3,
  "Blender": 2,
  "Coding": 5
};
let questions = [];
let info = [];

// Helpers
function makeQuestion(id, topic, author, title){
  return { id, topic, author, age: "just now", title, answers: [] };
}
function makeInfo(id, topic, author, title, text){
  return { id, topic, author, age: "just now", title, text };
}

// Seed
questions = [
  makeQuestion(1, "Unity", "Mila", "How do I fix physics jittering in Unity?"),
  makeQuestion(2, "Blender", "Andrei", "Best way to bake textures for export?"),
  makeQuestion(3, "Coding", "Lina", "How to implement infinite scroll in vanilla JS?")
];
info = [
  makeInfo(1, "Unity", "Sam", "Physics Update", "Use FixedUpdate for physics code to ensure stability."),
  makeInfo(2, "Blender", "Alex", "Export Tips", "Always check scale and normals before exporting models.")
];

// Render
function render(resetCount=true){
  const q=(searchInput.value||'').toLowerCase();
  let list = mode === 'questions' ? questions : info;
  list = list.filter(p => !q || (p.title + p.topic + p.author).toLowerCase().includes(q));

  if (resetCount) resultCount.textContent = `${list.length} result${list.length!==1?'s':''}`;
  feedEl.innerHTML = list.map(Post).join('');
  bindHandlers();
  renderTopics();
}

function Post(p){
  if(mode==='questions'){
    return `
    <article class="post" data-id="${p.id}">
      <div class="post-head">
        <span class="community">${p.topic}</span>
        <span class="meta">Asked by ${p.author} • ${p.age}</span>
      </div>
      <h2 class="post-title">${p.title}</h2>
      <div class="actions">
        <button class="action answer">Answer</button>
        <span class="score-chip">${p.answers.length} answers</span>
      </div>
      <div class="answers">
        ${p.answers.map(a=>`<div class="answer"><b>${a.author}:</b> ${a.text}</div>`).join('')}
      </div>
    </article>`;
  } else {
    return `
    <article class="post">
      <div class="post-head">
        <span class="community">${p.topic}</span>
        <span class="meta">Contributed by ${p.author} • ${p.age}</span>
      </div>
      <h2 class="post-title">${p.title}</h2>
      <div class="post-content">${p.text}</div>
    </article>`;
  }
}

function bindHandlers(){
  document.querySelectorAll('.action.answer').forEach(btn=>{
    btn.onclick = (e)=>{
      const post = e.currentTarget.closest('.post');
      const id = +post.dataset.id;
      const q = questions.find(x=>x.id===id);
      const answer = prompt("Your answer:");
      if(answer){
        q.answers.push({author:"You", text:answer});
        render(false);
      }
    };
  });
}

/* Tabs */
tabs.forEach(t=>{
  t.onclick = ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    mode = t.dataset.mode;
    render();
  };
});

/* Search */
searchInput.addEventListener('input', ()=>render());

/* Modals open/close */
function openModal(m){ m.classList.remove('hidden'); }
function closeModal(m){ m.classList.add('hidden'); }
document.getElementById('newQuestionBtn').onclick=()=>openModal(questionModal);
document.getElementById('newInfoBtn').onclick=()=>openModal(infoModal);
document.getElementById('newTopicBtn').onclick=()=>openModal(topicModal);
document.getElementById('closeQuestionModal').onclick=()=>closeModal(questionModal);
document.getElementById('closeInfoModal').onclick=()=>closeModal(infoModal);
document.getElementById('closeTopicModal').onclick=()=>closeModal(topicModal);

/* Submit Question */
document.getElementById('submitQuestion').onclick=()=>{
  const title = questionTitle.value.trim();
  let topic = questionTopic.value;
  const newTopic = newTopicInputQ.value.trim();
  if(newTopic) topic = newTopic;
  if(!title || !topic) return alert("Please fill in all fields.");
  if(!topics[topic]) topics[topic]=0;
  topics[topic]++;
  const id=Date.now();
  questions.unshift(makeQuestion(id, topic, "You", title));
  closeModal(questionModal);
  questionTitle.value="";
  newTopicInputQ.value="";
  render();
};

/* Submit Info */
document.getElementById('submitInfo').onclick=()=>{
  const title = infoTitle.value.trim();
  const text = infoText.value.trim();
  let topic = infoTopic.value;
  const newTopic = newTopicInputI.value.trim();
  if(newTopic) topic = newTopic;
  if(!title || !text || !topic) return alert("Please fill in all fields.");
  if(!topics[topic]) topics[topic]=0;
  topics[topic]++;
  const id=Date.now();
  info.unshift(makeInfo(id, topic, "You", title, text));
  closeModal(infoModal);
  infoTitle.value="";
  infoText.value="";
  newTopicInputI.value="";
  render();
};

/* Submit Topic */
document.getElementById('submitTopic').onclick=()=>{
  const topic=document.getElementById('topicName').value.trim();
  if(!topic) return;
  if(!topics[topic]) topics[topic]=0;
  closeModal(topicModal);
  renderTopics();
};

/* Render topics as tag cloud */
function renderTopics(){
  questionTopic.innerHTML = Object.keys(topics).map(t=>`<option value="${t}">${t}</option>`).join('');
  infoTopic.innerHTML = questionTopic.innerHTML;
  topicList.innerHTML = Object.entries(topics)
    .sort((a,b)=>b[1]-a[1])
    .map(([t,c])=>`<li style="font-size:${14+c*4}px">${t}</li>`).join('');
}

/* Infinite scroll stub */
function loadNextPage(){ page++; render(); }
const io = new IntersectionObserver((entries)=>{ if(entries[0].isIntersecting) loadNextPage(); });
io.observe(sentinel);

/* Boot */
function init(){ render(); }
init();
