// ---------- Data (same content as your PDF) ----------
const matchData = [
  { sentence: "I’m going to the zoo to run and play", answer: "zoo" },
  { sentence: "She’s going to the bakery to see animals", answer: "bakery" },
  { sentence: "We’re going to the playground to read books", answer: "playground" },
  { sentence: "He’s going to the library to do sport", answer: "library" },
  { sentence: "They’re going to the sports centre to buy bread", answer: "sports centre" },
];

const qaData = [
  { text: "I ______ ______ the park after school.", answer: "am going to" },
  { text: "She ______ ______ the library this afternoon.", answer: "is going to" },
  { text: "We ______ ______ the cinema tomorrow.", answer: "are going to" },
  { text: "He ______ ______ the swimming pool today.", answer: "is going to" },
  { text: "They ______ ______ the shop later.", answer: "are going to" },
  { text: "My friend ______ ______ the playground.", answer: "is going to" },
];

const verbBank = ["eat", "read", "play", "swim", "buy", "watch"];
const verbData = [
  { text: "I’m going to the park to ________ football.", answer: "play" },
  { text: "She’s going to the library to ________ a book.", answer: "read" },
  { text: "We’re going to the cinema to ________ a film.", answer: "watch" },
  { text: "He’s going to the pool to ________.", answer: "swim" },
  { text: "They’re going to the shop to ________ food.", answer: "buy" },
  { text: "I’m going to the kitchen to ________ lunch.", answer: "eat" },
];

const mcqData = [
  { q: "I’m going to the park to _______________ with my friends.", options: ["plays","playing","play"], answer: "play" },
  { q: "She’s going to the library to _______________ comics.", options: ["reads","read","reading"], answer: "read" },
  { q: "We’re going to the shop to _______________ apples.", options: ["buys","buying","buy"], answer: "buy" },
  { q: "He’s going to the playground to _______________", options: ["run","runs","running"], answer: "run" },
  { q: "They’re going to the cinema to _______________ a film.", options: ["watch","watches","watching"], answer: "watch" },
];

const tfData = [
  { s: "I’m going to the pool to swim.", answer: true },
  { s: "She’s going to the library to eat pizza.", answer: false },
  { s: "We’re going to the park to play.", answer: true },
  { s: "He’s going to the shop to buy food.", answer: true },
  { s: "They’re going to the cinema to read books.", answer: false },
  { s: "I’m going to the playground to run.", answer: true },
];

const orderData = [
  { words: ["going","the","zoo","to","I’m","see","animals"], answer: "I’m going to the zoo to see animals" },
  { words: ["she’s","bakery","the","to","going","buy","bread"], answer: "she’s going to the bakery to buy bread" },
  { words: ["we’re","park","the","to","play","going"], answer: "we’re going to the park to play" },
  { words: ["he’s","library","the","to","going","read"], answer: "he’s going to the library to read" },
  { words: ["they’re","cinema","the","to","going","watch"], answer: "they’re going to the cinema to watch" },
];

// ---------- Helpers ----------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  children.forEach(c => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return node;
}
function markNode(isGood) {
  return el("span", { class: `mark ${isGood ? "good" : "bad"}` }, [isGood ? "✓" : "✕"]);
}

// ---------- Pointer-based drag (tablet friendly) ----------
function makeDraggable(node) {
  node.style.touchAction = "none";
  node.dataset.homeParent = "";
  node.dataset.homeNext = "";

  node.addEventListener("pointerdown", (e) => {
    node.setPointerCapture(e.pointerId);
    node.classList.add("dragging");
    node.dataset.startX = e.clientX;
    node.dataset.startY = e.clientY;

    const rect = node.getBoundingClientRect();
    node.dataset.offsetX = e.clientX - rect.left;
    node.dataset.offsetY = e.clientY - rect.top;

    node.dataset.homeParent = node.parentElement.id || "";
    node.dataset.homeNext = node.nextSibling ? "1" : "0";

    node.style.position = "fixed";
    node.style.zIndex = "9999";
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
  });

  node.addEventListener("pointermove", (e) => {
    if (!node.hasPointerCapture(e.pointerId)) return;
    const x = e.clientX - Number(node.dataset.offsetX);
    const y = e.clientY - Number(node.dataset.offsetY);
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  });

  node.addEventListener("pointerup", (e) => {
    node.releasePointerCapture(e.pointerId);
    node.classList.remove("dragging");

    // detect drop target under pointer
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const drop = target?.closest?.("[data-drop='1']");
    if (drop) {
      // put draggable inside drop zone
      node.style.position = "static";
      node.style.zIndex = "auto";
      node.style.left = "";
      node.style.top = "";
      node.style.width = "";
      drop.querySelector(".blank").replaceChildren(node);
    } else {
      // snap back (best effort)
      snapBack(node);
    }
  });
}

function snapBack(node) {
  node.style.position = "static";
  node.style.zIndex = "auto";
  node.style.left = "";
  node.style.top = "";
  node.style.width = "";
  // If it was in a blank, send back to its bank (we set a data-bank id)
  const bankId = node.dataset.bank;
  if (bankId) document.getElementById(bankId).appendChild(node);
}

// ---------- 1) Match ----------
function renderMatch() {
  const drops = document.getElementById("matchDrops");
  const chips = document.getElementById("matchChips");
  drops.innerHTML = "";
  chips.innerHTML = "";
  document.getElementById("matchScore").textContent = "";

  matchData.forEach((item, idx) => {
    const blank = el("span", { class: "blank" }, ["Drop here"]);
    const drop = el("div", { class: "drop", "data-drop": "1", "data-answer": item.answer }, [
      el("div", { class: "label" }, [item.sentence]),
      blank
    ]);
    drops.appendChild(drop);
  });

  // chips
  const places = [...new Set(matchData.map(x => x.answer))];
  shuffle(places).forEach(place => {
    const chip = el("div", { class: "chip", "data-value": place }, [place]);
    chip.dataset.bank = "matchChips";
    makeDraggable(chip);
    chips.appendChild(chip);
  });
}

function checkMatch() {
  let correct = 0;
  document.querySelectorAll("#matchDrops .drop").forEach(drop => {
    // remove old marks
    drop.querySelectorAll(".mark").forEach(m => m.remove());

    const expected = drop.dataset.answer;
    const blank = drop.querySelector(".blank");
    const child = blank.querySelector(".chip");
    const got = child?.dataset?.value;

    const ok = got === expected;
    drop.appendChild(markNode(ok));
    if (ok) correct++;
  });

  document.getElementById("matchScore").textContent = `${correct}/${matchData.length} correct`;
}

// ---------- 2) Dropdown QA ----------
function renderQA() {
  const root = document.getElementById("goingToQA");
  root.innerHTML = "";
  document.getElementById("qaScore").textContent = "";

  const options = ["am going to", "is going to", "are going to"];

  qaData.forEach((item, i) => {
    const sel = el("select", { "data-answer": item.answer, "aria-label": `Question ${i+1}` }, [
      el("option", { value: "" }, ["— choose —"]),
      ...options.map(o => el("option", { value: o }, [o]))
    ]);

    const line = el("div", { class: "qa-item" }, [
      el("div", {}, [item.text.replace("______ ______", "")]),
      sel
    ]);

    root.appendChild(line);
  });
}

function checkQA() {
  let correct = 0;
  const selects = document.querySelectorAll("#goingToQA select");
  selects.forEach(sel => {
    // remove old marks
    sel.parentElement.querySelectorAll(".mark").forEach(m => m.remove());
    const ok = sel.value === sel.dataset.answer;
    sel.parentElement.appendChild(markNode(ok));
    if (ok) correct++;
  });
  document.getElementById("qaScore").textContent = `${correct}/${selects.length} correct`;
}

// ---------- 3) Drag verbs ----------
function renderVerbs() {
  const bank = document.getElementById("verbBank");
  const drops = document.getElementById("verbDrops");
  bank.innerHTML = "";
  drops.innerHTML = "";
  document.getElementById("verbsScore").textContent = "";

  shuffle([...verbBank]).forEach(v => {
    const chip = el("div", { class: "chip", "data-value": v }, [v]);
    chip.dataset.bank = "verbBank";
    makeDraggable(chip);
    bank.appendChild(chip);
  });

  verbData.forEach(item => {
    const blank = el("span", { class: "blank" }, ["Drop verb"]);
    const drop = el("div", { class: "drop", "data-drop": "1", "data-answer": item.answer }, [
      el("div", { class: "label" }, [item.text]),
      blank
    ]);
    drops.appendChild(drop);
  });
}

function checkVerbs() {
  let correct = 0;
  document.querySelectorAll("#verbDrops .drop").forEach(drop => {
    drop.querySelectorAll(".mark").forEach(m => m.remove());

    const expected = drop.dataset.answer;
    const blank = drop.querySelector(".blank");
    const chip = blank.querySelector(".chip");
    const got = chip?.dataset?.value;
    const ok = got === expected;
    drop.appendChild(markNode(ok));
    if (ok) correct++;
  });
  document.getElementById("verbsScore").textContent = `${correct}/${verbData.length} correct`;
}

// ---------- 4) MCQ (instant feedback) ----------
function renderMCQ() {
  const root = document.getElementById("mcq");
  root.innerHTML = "";
  mcqData.forEach((item, idx) => {
    const card = el("div", { class: "mcq-item" }, [
      el("div", {}, [item.q])
    ]);

    const opts = el("div", { class: "opts" });
    item.options.forEach(opt => {
      const b = el("button", {
        class: "opt",
        type: "button",
        onclick: () => {
          // lock to one try per item unless you want retries
          opts.querySelectorAll(".opt").forEach(x => x.disabled = true);

          if (opt === item.answer) {
            b.classList.add("good");
            b.appendChild(markNode(true));
          } else {
            b.classList.add("bad");
            b.appendChild(markNode(false));
            // also highlight correct
            const goodBtn = [...opts.querySelectorAll(".opt")].find(x => x.textContent.trim() === item.answer);
            if (goodBtn) goodBtn.classList.add("good");
          }
        }
      }, [opt]);
      opts.appendChild(b);
    });

    card.appendChild(opts);
    root.appendChild(card);
  });
}

// ---------- 6) True/False ----------
function renderTF() {
  const root = document.getElementById("tf");
  root.innerHTML = "";
  tfData.forEach(item => {
    const wrap = el("div", { class: "tf-item" }, [el("div", {}, [item.s])]);
    const opts = el("div", { class: "opts" });

    const mkBtn = (label, val) => el("button", {
      class: "opt",
      type: "button",
      onclick: (e) => {
        opts.querySelectorAll(".opt").forEach(x => x.disabled = true);
        const ok = val === item.answer;
        e.currentTarget.classList.add(ok ? "good" : "bad");
        e.currentTarget.appendChild(markNode(ok));
        if (!ok) {
          // highlight correct choice
          const correctLabel = item.answer ? "True" : "False";
          const goodBtn = [...opts.querySelectorAll(".opt")].find(x => x.textContent.trim() === correctLabel);
          if (goodBtn) goodBtn.classList.add("good");
        }
      }
    }, [label]);

    opts.appendChild(mkBtn("True", true));
    opts.appendChild(mkBtn("False", false));
    wrap.appendChild(opts);
    root.appendChild(wrap);
  });
}

// ---------- 7) Order (tap to build, easiest on tablet) ----------
function renderOrder() {
  const root = document.getElementById("order");
  root.innerHTML = "";

  orderData.forEach((item, idx) => {
    const wrap = el("div", { class: "order-item" });

    const answerLine = el("div", { class: "answerline", "data-answer": item.answer }, []);
    const bank = el("div", { class: "wordbank" }, []);
    const feedback = el("div", { class: "row" }, []);

    const checkBtn = el("button", {
      class: "btn",
      type: "button",
      onclick: () => {
        // clear previous marks
        wrap.querySelectorAll(".mark").forEach(m => m.remove());

        const built = [...answerLine.querySelectorAll(".word")].map(w => w.textContent).join(" ");
        const ok = normalize(built) === normalize(item.answer);
        feedback.appendChild(markNode(ok));
      }
    }, ["Check"]);

    const resetBtn = el("button", {
      class: "btn ghost",
      type: "button",
      onclick: () => {
        // move all words back
        [...answerLine.querySelectorAll(".word")].forEach(w => bank.appendChild(w));
        wrap.querySelectorAll(".mark").forEach(m => m.remove());
      }
    }, ["Reset"]);

    feedback.appendChild(checkBtn);
    feedback.appendChild(resetBtn);

    shuffle([...item.words]).forEach(w => {
      const word = el("div", { class: "word" }, [w]);
      word.addEventListener("click", () => {
        // toggle between bank and answer
        if (word.parentElement === bank) answerLine.appendChild(word);
        else bank.appendChild(word);
      });
      bank.appendChild(word);
    });

    wrap.appendChild(el("div", { class: "label" }, ["Tap words to build the sentence:"]));
    wrap.appendChild(answerLine);
    wrap.appendChild(bank);
    wrap.appendChild(feedback);
    root.appendChild(wrap);
  });
}

function normalize(s){ return (s || "").trim().replace(/\s+/g, " ").toLowerCase(); }
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- Wire up ----------
function init() {
  renderMatch();
  renderQA();
  renderVerbs();
  renderMCQ();
  renderTF();
  renderOrder();

  document.getElementById("checkMatch").addEventListener("click", checkMatch);
  document.getElementById("resetMatch").addEventListener("click", renderMatch);

  document.getElementById("checkQA").addEventListener("click", checkQA);
  document.getElementById("resetQA").addEventListener("click", renderQA);

  document.getElementById("checkVerbs").addEventListener("click", checkVerbs);
  document.getElementById("resetVerbs").addEventListener("click", renderVerbs);
}
init();
