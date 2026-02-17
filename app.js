// =====================
// DATA
// =====================

const matchData = [
  { sentence: "I’m going to the zoo to run and play", answer: "zoo" },
  { sentence: "She’s going to the bakery to see animals", answer: "bakery" },
  { sentence: "We’re going to the playground to read books", answer: "playground" },
  { sentence: "He’s going to the library to do sport", answer: "library" },
  { sentence: "They’re going to the sports centre to buy bread", answer: "sports centre" }
];

const qaData = [
  { text: "I ______ ______ the park after school.", answer: "am going to" },
  { text: "She ______ ______ the library this afternoon.", answer: "is going to" },
  { text: "We ______ ______ the cinema tomorrow.", answer: "are going to" },
  { text: "He ______ ______ the swimming pool today.", answer: "is going to" },
  { text: "They ______ ______ the shop later.", answer: "are going to" },
  { text: "My friend ______ ______ the playground.", answer: "is going to" }
];

const verbBank = ["eat", "read", "play", "swim", "buy", "watch"];

const verbData = [
  { text: "I’m going to the park to ________ football.", answer: "play" },
  { text: "She’s going to the library to ________ a book.", answer: "read" },
  { text: "We’re going to the cinema to ________ a film.", answer: "watch" },
  { text: "He’s going to the pool to ________.", answer: "swim" },
  { text: "They’re going to the shop to ________ food.", answer: "buy" },
  { text: "I’m going to the kitchen to ________ lunch.", answer: "eat" }
];

const mcqData = [
  { q: "I’m going to the park to _______________ with my friends.", options: ["plays","playing","play"], answer: "play" },
  { q: "She’s going to the library to _______________ comics.", options: ["reads","read","reading"], answer: "read" },
  { q: "We’re going to the shop to _______________ apples.", options: ["buys","buying","buy"], answer: "buy" },
  { q: "He’s going to the playground to _______________", options: ["run","runs","running"], answer: "run" },
  { q: "They’re going to the cinema to _______________ a film.", options: ["watch","watches","watching"], answer: "watch" }
];

const tfData = [
  { s: "I’m going to the pool to swim.", answer: true },
  { s: "She’s going to the library to eat pizza.", answer: false },
  { s: "We’re going to the park to play.", answer: true },
  { s: "He’s going to the shop to buy food.", answer: true },
  { s: "They’re going to the cinema to read books.", answer: false },
  { s: "I’m going to the playground to run.", answer: true }
];

const orderData = [
  { words: ["going","the","zoo","to","I’m","see","animals"], answer: "I’m going to the zoo to see animals" },
  { words: ["she’s","bakery","the","to","going","buy","bread"], answer: "she’s going to the bakery to buy bread" },
  { words: ["we’re","park","the","to","play","going"], answer: "we’re going to the park to play" },
  { words: ["he’s","library","the","to","going","read"], answer: "he’s going to the library to read" },
  { words: ["they’re","cinema","the","to","going","watch"], answer: "they’re going to the cinema to watch" }
];

// =====================
// HELPERS
// =====================

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  children.forEach(c => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return node;
}

function mark(ok) {
  return el("span", { class: "mark " + (ok ? "good" : "bad") }, [ok ? "✓" : "✕"]);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalize(s) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

// =====================
// 2. COMPLETE (FIXED POSITION)
// =====================

function renderQA() {
  const root = document.getElementById("goingToQA");
  root.innerHTML = "";
  document.getElementById("qaScore").textContent = "";

  const options = ["am going to", "is going to", "are going to"];
  const hole = "______ ______";

  qaData.forEach((item, i) => {
    const select = el("select", { "data-answer": item.answer }, [
      el("option", { value: "" }, ["— choose —"]),
      ...options.map(o => el("option", { value: o }, [o]))
    ]);

    const [before, after] = item.text.split(hole);

    const line = el("div", { class: "qa-item" }, [
      el("span", {}, [before.trim() + " "]),
      select,
      el("span", {}, [" " + after.trim()])
    ]);

    root.appendChild(line);
  });
}

function checkQA() {
  let correct = 0;
  document.querySelectorAll("#goingToQA select").forEach(sel => {
    sel.parentElement.querySelectorAll(".mark").forEach(m => m.remove());
    const ok = sel.value === sel.dataset.answer;
    sel.parentElement.appendChild(mark(ok));
    if (ok) correct++;
  });
  document.getElementById("qaScore").textContent = `${correct}/${qaData.length} correct`;
}

// =====================
// INIT (only QA shown here)
// =====================

function init() {
  renderQA();
  document.getElementById("checkQA").addEventListener("click", checkQA);
  document.getElementById("resetQA").addEventListener("click", renderQA);
}

init();
