// App wiring for navigation + per-topic exercise runner.

(function () {
  const KATEX_VERSION = "0.16.11";
  const KATEX_CSS_URL = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;
  const KATEX_JS_URL = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`;
  const KATEX_AUTORENDER_URL = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/contrib/auto-render.min.js`;
  let katexLoadPromise = null;

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function normalize(str) {
    return String(str).trim().toLowerCase().replace(/\s+/g, " ");
  }

  function ensureEl(id, tagName, parent, beforeEl = null) {
    let el = qs(`#${id}`);
    if (el) return el;
    el = document.createElement(tagName);
    el.id = id;
    if (beforeEl) parent.insertBefore(el, beforeEl);
    else parent.appendChild(el);
    return el;
  }

  function clearEl(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function ensureKatexLoaded() {
    if (typeof window.renderMathInElement === "function") return Promise.resolve();
    if (katexLoadPromise) return katexLoadPromise;

    function ensureCss() {
      if (document.querySelector(`link[href="${KATEX_CSS_URL}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = KATEX_CSS_URL;
      document.head.appendChild(link);
    }

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });
    }

    katexLoadPromise = (async () => {
      ensureCss();
      await loadScript(KATEX_JS_URL);
      await loadScript(KATEX_AUTORENDER_URL);
    })();

    return katexLoadPromise;
  }

  function renderMath(rootEl) {
    if (!rootEl) return;
    ensureKatexLoaded()
      .then(() => {
        if (typeof window.renderMathInElement !== "function") return;
        window.renderMathInElement(rootEl, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      })
      .catch(() => {
        // If KaTeX fails to load (offline), just keep plain text.
      });
  }

  function formatExpectedAnswer(current) {
    if (!current) return "";
    const expected = current.answer;
    const uiType = current.ui?.type ?? "text";

    if (uiType === "matrix" && Array.isArray(expected) && Array.isArray(expected[0])) {
      return expected.map((row) => (Array.isArray(row) ? row.join(" ") : String(row))).join("\n");
    }

    if (uiType === "sequence" && Array.isArray(expected)) {
      return expected.join(", ");
    }

    if (Array.isArray(expected)) return expected[0] ?? "";
    if (expected == null) return "";
    return String(expected);
  }

  function renderSolutionInto(solEl, current) {
    clearEl(solEl);
    if (!current) return;

    const expl = document.createElement("div");
    expl.className = "solution-expl";
    expl.textContent = current.solution ?? "";
    solEl.appendChild(expl);

    const expectedText = formatExpectedAnswer(current);
    if (expectedText) {
      const wrap = document.createElement("div");
      wrap.className = "solution-expected";

      const label = document.createElement("div");
      label.className = "expected-label";
      label.textContent = "Expected answer (what Check validates):";
      wrap.appendChild(label);

      if (expectedText.includes("\n")) {
        const pre = document.createElement("pre");
        pre.className = "expected-block";
        pre.textContent = expectedText;
        wrap.appendChild(pre);
      } else {
        const chip = document.createElement("span");
        chip.className = "expected-chip";
        chip.textContent = expectedText;
        wrap.appendChild(chip);
      }

      solEl.appendChild(wrap);
    }

    renderMath(solEl);
  }

  function renderGraphSVG(container, graph) {
    // Prefer the bundled visualization library (canvas) when available.
    // Falls back to the existing SVG renderer if load/init fails.
    if (graph && window.USE_GALLES_FOR_GRAPHS !== false) {
      try {
        renderGraphGalles(container, graph);
        return;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Galles graph renderer failed; falling back to SVG", e);
      }
    }

    clearEl(container);
    if (!graph) return;

    const width = 520;
    const height = 320;
    const padding = 40;
    const cx = width / 2;
    const cy = height / 2;
    const ringR = Math.min(width, height) / 2 - padding;
    const nodeR = 16;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "graph");

    const defs = document.createElementNS(svgNS, "defs");
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute("id", "arrow");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "8");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("orient", "auto-start-reverse");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("class", "graph-arrow");
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const nodes = graph.nodes;
    const pos = new Map();
    const providedPos = graph.pos || {};
    nodes.forEach((node, idx) => {
      const key = String(node);
      const p = providedPos[key];
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        pos.set(node, { x: p.x, y: p.y });
        return;
      }
      const theta = (2 * Math.PI * idx) / nodes.length - Math.PI / 2;
      const x = cx + ringR * Math.cos(theta);
      const y = cy + ringR * Math.sin(theta);
      pos.set(node, { x, y });
    });

    // Determine which edges should be curved (bidirectional pairs / overlaps)
    const pairCounts = new Map();
    const directedPairs = new Set();
    for (const e of graph.edges) {
      const a = String(e.u);
      const b = String(e.v);
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      directedPairs.add(`${a}->${b}`);
    }

    function edgeCurve(u, v) {
      const a = String(u);
      const b = String(v);
      const undKey = a < b ? `${a}|${b}` : `${b}|${a}`;
      const count = pairCounts.get(undKey) ?? 1;
      const opposite = directedPairs.has(`${b}->${a}`);
      if (!opposite && count <= 1) return 0;
      // Curve opposite directions in opposite signs.
      const sign = a < b ? 1 : -1;
      return (opposite ? 18 : 10) * sign;
    }

    function shorten(p1, p2, amount) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: p2.x - (dx / len) * amount, y: p2.y - (dy / len) * amount };
    }

    function midPointOnQuad(p0, p1, p2, t) {
      // Quadratic Bezier: (1-t)^2 p0 + 2(1-t)t p1 + t^2 p2
      const mt = 1 - t;
      return {
        x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
        y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
      };
    }

    const placedLabels = [];

    // Edges
    for (const e of graph.edges) {
      const u = e.u;
      const v = e.v;
      const pu = pos.get(u);
      const pv = pos.get(v);
      if (!pu || !pv) continue;

      const start = shorten(pv, pu, nodeR + 2);
      const end = shorten(pu, pv, nodeR + 6);
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const curve = edgeCurve(u, v);
      const ctrl = {
        x: (start.x + end.x) / 2 + nx * curve,
        y: (start.y + end.y) / 2 + ny * curve,
      };

      const pathEl = document.createElementNS(svgNS, "path");
      pathEl.setAttribute("d", `M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`);
      pathEl.setAttribute("class", "graph-edge");
      if (graph.directed) pathEl.setAttribute("marker-end", "url(#arrow)");
      svg.appendChild(pathEl);

      if (e.label != null) {
        const mid = midPointOnQuad(start, ctrl, end, 0.5);
        // Avoid overlapping labels (common for crossing/near-parallel edges) by
        // shifting along the edge's normal vector so it stays associated to the edge.
        const minDist = 16;
        let lx = mid.x;
        let ly = mid.y;
        for (let attempt = 0; attempt < 9; attempt++) {
          const collides = placedLabels.some((p) => Math.hypot(p.x - lx, p.y - ly) < minDist);
          if (!collides) break;

          // Offsets: 0, +12, -12, +24, -24, ... along the edge normal.
          const step = 12 * Math.ceil(attempt / 2);
          const sign = attempt % 2 === 1 ? 1 : -1;
          lx = mid.x + nx * step * sign;
          ly = mid.y + ny * step * sign;
        }
        placedLabels.push({ x: lx, y: ly });

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", lx);
        text.setAttribute("y", ly);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("class", "graph-label");
        text.textContent = String(e.label);
        svg.appendChild(text);
      }
    }

    // Nodes (on top)
    for (const node of nodes) {
      const p = pos.get(node);
      const g = document.createElementNS(svgNS, "g");
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", p.x);
      c.setAttribute("cy", p.y);
      c.setAttribute("r", String(nodeR));

      const classes = ["graph-node"];
      if (graph.start != null && String(node) === String(graph.start)) classes.push("start");
      if (graph.target != null && String(node) === String(graph.target)) classes.push("target");
      c.setAttribute("class", classes.join(" "));

      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", p.x);
      t.setAttribute("y", p.y);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("class", "graph-node-label");
      t.textContent = String(node);
      g.appendChild(c);
      g.appendChild(t);
      svg.appendChild(g);
    }

    container.appendChild(svg);
  }

  function getGallesBase() {
    const path = (location.pathname || "").replace(/\\/g, "/");
    const nested = /\/(parts|topics)\//.test(path);
    return `${nested ? "../" : ""}lib/`;
  }

  function loadScriptOnce(src) {
    window.__loadedScripts = window.__loadedScripts || new Set();
    if (window.__loadedScripts.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => {
        window.__loadedScripts.add(src);
        resolve();
      };
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  async function ensureGallesLoaded() {
    if (window.__gallesReady) return;
    const base = getGallesBase();

    // Minimal dependency set for drawing circles + edges with labels.
    const scripts = [
      "AnimationLibrary/CustomEvents.js",
      "AnimationLibrary/UndoFunctions.js",
      "AnimationLibrary/AnimatedObject.js",
      "AnimationLibrary/AnimatedLabel.js",
      "AnimationLibrary/AnimatedCircle.js",
      "AnimationLibrary/Line.js",
      "AnimationLibrary/ObjectManager.js",
      "AnimationLibrary/AnimationMain.js",
    ].map((p) => base + p);

    for (const src of scripts) {
      // eslint-disable-next-line no-await-in-loop
      await loadScriptOnce(src);
    }

    // Patch the library's global timeout loop so our static renders don't
    // keep a permanent 30ms timer running.
    if (!window.__gallesTimeoutPatched && typeof window.timeout === "function") {
      window.__gallesTimeoutPatched = true;
      window.__gallesTimeoutOriginal = window.timeout;
      window.timeout = function timeoutOnce() {
        try {
          if (window.animationManager) window.animationManager.update();
          if (window.objectManager) window.objectManager.draw();
        } catch (e) {
          // swallow
        }
      };
    }

    window.__gallesReady = true;
  }

  function renderGraphGalles(container, graph) {
    clearEl(container);
    if (!graph) return;

    // Build the DOM surface the library expects.
    const controls = document.createElement("table");
    controls.id = "AlgorithmSpecificControls";
    controls.style.display = "none";

    const generalControlsWrap = document.createElement("div");
    generalControlsWrap.id = "generalAnimationControlSection";
    generalControlsWrap.style.display = "none";
    const generalControls = document.createElement("table");
    generalControls.id = "GeneralAnimationControls";
    generalControlsWrap.appendChild(generalControls);

    const canvasEl = document.createElement("canvas");
    canvasEl.id = "canvas";
    canvasEl.width = 520;
    canvasEl.height = 320;
    canvasEl.style.width = "100%";
    canvasEl.style.maxWidth = "520px";
    canvasEl.style.height = "auto";
    canvasEl.style.display = "block";
    canvasEl.style.margin = "0 auto";
    // Match the SVG graph panel styling so labels remain readable.
    canvasEl.style.background = "rgba(255, 255, 255, 1)";
    canvasEl.style.border = "1px solid rgba(255,255,255,0.08)";
    canvasEl.style.borderRadius = "12px";

    container.appendChild(controls);
    container.appendChild(canvasEl);
    container.appendChild(generalControlsWrap);

    // Load library scripts (async). When ready, render using its drawing engine.
    ensureGallesLoaded()
      .then(() => {
        // Initialize globals the library uses.
        window.canvas = canvasEl;
        window.objectManager = new window.ObjectManager();
        window.animationManager = new window.AnimationManager(window.objectManager);
        window.objectManager.width = canvasEl.width;
        window.objectManager.height = canvasEl.height;

        const width = canvasEl.width;
        const height = canvasEl.height;
        const padding = 40;
        const cx = width / 2;
        const cy = height / 2;
        const ringR = Math.min(width, height) / 2 - padding;

        const nodes = graph.nodes || [];
        const pos = new Map();
        const providedPos = graph.pos || {};
        nodes.forEach((node, idx) => {
          const key = String(node);
          const p = providedPos[key];
          if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
            pos.set(node, { x: p.x, y: p.y });
            return;
          }
          const theta = (2 * Math.PI * idx) / nodes.length - Math.PI / 2;
          pos.set(node, { x: cx + ringR * Math.cos(theta), y: cy + ringR * Math.sin(theta) });
        });

        const idOf = new Map(nodes.map((n, i) => [n, i]));

        // Curves for bidirectional edges to avoid overlap.
        const directedPairs = new Set();
        for (const e of graph.edges || []) directedPairs.add(`${String(e.u)}->${String(e.v)}`);

        function curveFor(u, v) {
          if (!graph.directed) return 0;
          const a = String(u);
          const b = String(v);
          const opposite = directedPairs.has(`${b}->${a}`);
          if (!opposite) return 0;
          return a < b ? 0.12 : -0.12;
        }

        const cmds = [];
        for (const node of nodes) {
          const p = pos.get(node);
          const id = idOf.get(node);
          cmds.push(`CreateCircle<;>${id}<;>${String(node)}<;>${p.x}<;>${p.y}`);
        }

        const directedFlag = graph.directed ? 1 : 0;
        const edgeColor = "rgba(226, 232, 240, 0.55)";
        for (const e of graph.edges || []) {
          const uId = idOf.get(e.u);
          const vId = idOf.get(e.v);
          if (uId == null || vId == null) continue;
          const label = e.label == null ? "" : String(e.label);
          const curve = curveFor(e.u, e.v);
          cmds.push(`Connect<;>${uId}<;>${vId}<;>${edgeColor}<;>${curve}<;>${directedFlag}<;>${label}`);
        }

        window.animationManager.StartNewAnimation(cmds);
        // Fast-forward to the end state and draw once.
        if (typeof window.animationManager.skipForward === "function") window.animationManager.skipForward();
        if (window.objectManager) window.objectManager.draw();
        if (window.timer) clearTimeout(window.timer);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("Failed to initialize Galles renderer", e);
      });
  }

  function renderAnswerWidget(container, legacyInput, ui) {
    clearEl(container);
    legacyInput.classList.add("hidden");
    legacyInput.value = "";

    const type = ui?.type ?? "text";
    if (type === "text") {
      legacyInput.classList.remove("hidden");
      return { read: () => legacyInput.value };
    }

    if (type === "sequence") {
      const n = ui.length ?? 6;
      const row = document.createElement("div");
      row.className = "seq";
      const inputs = [];
      for (let i = 0; i < n; i++) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.autocomplete = "off";
        inp.className = "seq-input";
        inp.inputMode = "numeric";
        inp.placeholder = String(i + 1);
        inputs.push(inp);
        row.appendChild(inp);
      }
      container.appendChild(row);
      return {
        read: () => inputs.map((x) => x.value.trim()).filter((x) => x !== ""),
        focus: () => inputs[0]?.focus(),
      };
    }

    if (type === "matrix") {
      const rows = ui.rows ?? 4;
      const cols = ui.cols ?? 4;
      const table = document.createElement("table");
      table.className = "matrix";
      const inputs = Array.from({ length: rows }, () => Array(cols).fill(null));
      for (let r = 0; r < rows; r++) {
        const tr = document.createElement("tr");
        for (let c = 0; c < cols; c++) {
          const td = document.createElement("td");
          const inp = document.createElement("input");
          inp.type = "text";
          inp.autocomplete = "off";
          inp.className = "matrix-input";
          inp.inputMode = "numeric";
          inputs[r][c] = inp;
          td.appendChild(inp);
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      container.appendChild(table);
      return {
        read: () => inputs.map((row) => row.map((x) => x.value.trim())),
        focus: () => inputs[0]?.[0]?.focus(),
      };
    }

    legacyInput.classList.remove("hidden");
    return { read: () => legacyInput.value };
  }

  function wireNav() {
    const toggle = qs("#nav-toggle");
    const links = qs("#nav-links");
    if (!toggle || !links) return;

    // Add a single consistent entry-point to the bundled visualization library.
    const existingViz = Array.from(links.querySelectorAll("a")).some((a) => {
      const href = a.getAttribute("href") || "";
      return href.includes("alg/") && href.includes("Algorithms.html");
    });
    if (!existingViz) {
      const path = (location.pathname || "").replace(/\\/g, "/");
      const nested = /\/(parts|topics)\//.test(path);
      const a = document.createElement("a");
      a.textContent = "Visualizations";
      a.href = `${nested ? "../" : ""}alg/release1.4/Algorithms.html`;
      links.appendChild(a);
    }

    toggle.addEventListener("click", () => links.classList.toggle("open"));
    qsa("a", links).forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
  }

  function renderKeyPoints(topic) {
    const mount = qs("#keypoints");
    if (!mount) return;
    mount.innerHTML = "";
    const ul = document.createElement("ul");
    for (const item of topic.keyPoints) {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    }
    mount.appendChild(ul);
    renderMath(mount);
  }

  function setStatus(text, ok) {
    const el = qs("#status");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("ok", !!ok);
    el.classList.toggle("err", ok === false);
  }

  function runTopicPage() {
    const topicId = document.body.dataset.topic;
    if (!topicId) return;

    const meta = window.SYLLABUS?.TOPICS?.[topicId];
    const gen = window.GENERATORS?.[meta?.generator];

    if (!meta || !gen) {
      setStatus("Missing topic generator.", false);
      return;
    }

    qs("#topic-title").textContent = meta.title;
    qs("#topic-part").textContent = `Module: ${window.SYLLABUS.PARTS.find(p => p.id === meta.part)?.title ?? meta.part}`;
    renderKeyPoints(meta);

    let current = null;
    let reader = null;

    const runner = qs(".runner") ?? document.body;
    const actions = qs(".actions") ?? qs("#btn-new")?.parentElement;
    const legacyAnswer = qs("#answer");
    const answerArea = ensureEl("answer-area", "div", runner, actions);
    answerArea.classList.add("answer-area");
    const viz = ensureEl("viz", "div", runner, qs("#prompt"));
    viz.classList.add("viz");

    function newExercise() {
      current = gen();
      renderGraphSVG(viz, current.visual?.graph);
      const promptEl = qs("#prompt");
      promptEl.textContent = current.prompt;
      renderMath(promptEl);
      reader = renderAnswerWidget(answerArea, legacyAnswer, current.ui);
      const solEl = qs("#solution");
      clearEl(solEl);
      solEl.classList.add("hidden");
      setStatus("", null);
      if (typeof reader?.focus === "function") reader.focus();
      else legacyAnswer?.focus();
    }

    function reveal() {
      if (!current) return;
      const solEl = qs("#solution");
      renderSolutionInto(solEl, current);
      solEl.classList.remove("hidden");
    }

    function check() {
      if (!current) return;
      const user = reader?.read ? reader.read() : qs("#answer")?.value;
      let ok;
      if (typeof current.check === "function") ok = !!current.check(user);
      else ok = normalize(user) === normalize(current.answer);
      setStatus(ok ? "Correct" : "Not quite", ok);
      if (!ok) reveal();
    }

    qs("#btn-new").addEventListener("click", () => newExercise());
    qs("#btn-check").addEventListener("click", () => check());
    qs("#btn-reveal").addEventListener("click", () => reveal());
    legacyAnswer?.addEventListener("keydown", (e) => {
      // For input elements, Enter submits; for textarea, Ctrl+Enter submits
      const isTextarea = legacyAnswer.tagName.toLowerCase() === "textarea";
      if (e.key === "Enter" && (!isTextarea || e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        check();
      }
    });

    newExercise();
  }

  function runPartPage() {
    const partId = document.body.dataset.part;
    if (!partId) return;
    const part = window.SYLLABUS?.PARTS?.find((p) => p.id === partId);
    if (!part) return;

    qs("#part-title").textContent = part.title;

    const list = qs("#topic-list");
    list.innerHTML = "";
    for (const topicId of part.topics) {
      const t = window.SYLLABUS.TOPICS[topicId];
      const a = document.createElement("a");
      a.className = "card link-card";
      a.href = `../topics/${t.id}.html`;
      a.innerHTML = `<h3>${t.title}</h3><p>Open drills + key points.</p>`;
      list.appendChild(a);
    }
  }

  function runHomePage() {
    const mount = qs("#part-list");
    if (!mount) return;
    mount.innerHTML = "";
    for (const p of window.SYLLABUS.PARTS) {
      const a = document.createElement("a");
      a.className = "card link-card";
      a.href = `parts/${p.id}.html`;
      a.innerHTML = `<h3>${p.title}</h3><p>${p.topics.length} topic pages with infinite drills.</p>`;
      mount.appendChild(a);
    }
  }

  function main() {
    wireNav();
    runHomePage();
    runPartPage();
    runTopicPage();
  }

  main();
})();
