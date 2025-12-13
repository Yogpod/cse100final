// Exercise generators.
// Exposes: window.GENERATORS

(function () {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sample(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  function normalize(str) {
    return String(str).trim().toLowerCase().replace(/\s+/g, " ");
  }

  function asList(str) {
    return Array.isArray(str) ? str : [str];
  }

  function eqAnswer(user, expected) {
    const u = normalize(user);
    return asList(expected).some((e) => normalize(e) === u);
  }

  function formatArray(arr) {
    return `[${arr.join(", ")}]`;
  }

  function formatMatrix(mat) {
    return mat.map((row) => row.join(" ")).join("\n");
  }

  function matrixEq(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let r = 0; r < a.length; r++) {
      if (!Array.isArray(a[r]) || !Array.isArray(b[r]) || a[r].length !== b[r].length) return false;
      for (let c = 0; c < a[r].length; c++) {
        if (normalize(a[r][c]) !== normalize(b[r][c])) return false;
      }
    }
    return true;
  }

  function insertionSortStep(arr, i) {
    const a = arr.slice();
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j -= 1;
    }
    a[j + 1] = key;
    return a;
  }

  function buildAdjList(n, edges, directed) {
    const adj = Array.from({ length: n }, () => []);
    for (const [u, v, w] of edges) {
      adj[u].push([v, w]);
      if (!directed) adj[v].push([u, w]);
    }
    for (const list of adj) list.sort((a, b) => a[0] - b[0]);
    return adj;
  }

  function uniqueEdgeKey(u, v) {
    return `${u}->${v}`;
  }

  function gridPositions(nodes, cols) {
    const pos = {};
    const width = 520;
    const height = 320;
    const padX = 80;
    const padY = 60;
    const usableW = width - 2 * padX;
    const usableH = height - 2 * padY;
    const rows = Math.ceil(nodes.length / cols);
    nodes.forEach((node, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const x = padX + (cols === 1 ? usableW / 2 : (usableW * c) / (cols - 1));
      const y = padY + (rows === 1 ? usableH / 2 : (usableH * r) / (rows - 1));
      pos[String(node)] = { x, y };
    });
    return pos;
  }

  function makeReadableDAG(n) {
    // Acyclic, connected from 0, not too dense. Edges go from lower id -> higher id.
    const nodes = Array.from({ length: n }, (_, i) => i);
    const edges = [];
    const used = new Set();
    // Backbone path ensures reachability
    for (let i = 0; i < n - 1; i++) {
      used.add(uniqueEdgeKey(i, i + 1));
      edges.push([i, i + 1, 1]);
    }
    // Add a few extra forward edges
    const extra = randInt(Math.max(1, Math.floor(n / 2)), n);
    for (let t = 0; t < extra; t++) {
      const u = randInt(0, n - 2);
      const v = randInt(u + 1, n - 1);
      const key = uniqueEdgeKey(u, v);
      if (used.has(key)) continue;
      used.add(key);
      edges.push([u, v, 1]);
    }
    return { nodes, edges, pos: gridPositions(nodes, 3) };
  }

  function makeReadableWeightedDigraph() {
    // 6 nodes on a grid, with edges mostly left-to-right to reduce crossings.
    const nodes = [0, 1, 2, 3, 4, 5];
    const pos = {
      "0": { x: 90, y: 90 },
      "1": { x: 90, y: 230 },
      "2": { x: 260, y: 70 },
      "3": { x: 260, y: 250 },
      "4": { x: 430, y: 110 },
      "5": { x: 430, y: 230 },
    };

    const edges = [];
    const used = new Set();
    function add(u, v, w) {
      const key = uniqueEdgeKey(u, v);
      if (used.has(key)) return;
      used.add(key);
      edges.push([u, v, w]);
    }

    // Ensure reachability from 0 to 5
    add(0, 2, randInt(1, 9));
    add(2, 4, randInt(1, 9));
    add(4, 5, randInt(1, 9));

    // Add a few alternative routes
    add(0, 1, randInt(1, 9));
    add(1, 3, randInt(1, 9));
    add(3, 5, randInt(1, 9));
    add(2, 3, randInt(1, 9));
    add(1, 2, randInt(1, 9));
    add(2, 5, randInt(1, 9));

    // Maybe one back/side edge (still nonnegative)
    if (Math.random() < 0.4) add(3, 4, randInt(1, 9));

    return { nodes, edges, pos };
  }

  function makeReadableUndirectedWeightedGraph() {
    const nodes = [0, 1, 2, 3, 4];
    const pos = {
      "0": { x: 120, y: 80 },
      "1": { x: 120, y: 240 },
      "2": { x: 260, y: 60 },
      "3": { x: 260, y: 260 },
      "4": { x: 420, y: 160 },
    };
    const edges = [];
    const used = new Set();
    function add(u, v, w) {
      const a = Math.min(u, v);
      const b = Math.max(u, v);
      const key = `${a}-${b}`;
      if (used.has(key)) return;
      used.add(key);
      edges.push([u, v, w]);
    }

    // Connected base
    add(0, 2, randInt(1, 9));
    add(2, 4, randInt(1, 9));
    add(4, 3, randInt(1, 9));
    add(3, 1, randInt(1, 9));

    // Extra edges
    add(0, 1, randInt(1, 9));
    add(2, 3, randInt(1, 9));
    add(1, 4, randInt(1, 9));

    return { nodes, edges, pos };
  }

  function makeReadableFlowNetwork() {
    // 0=s, 5=t
    const nodes = [0, 1, 2, 3, 4, 5];
    const pos = {
      "0": { x: 80, y: 160 },
      "1": { x: 200, y: 90 },
      "2": { x: 200, y: 230 },
      "3": { x: 340, y: 90 },
      "4": { x: 340, y: 230 },
      "5": { x: 460, y: 160 },
    };
    const edges = [
      [0, 1, randInt(3, 10)],
      [0, 2, randInt(3, 10)],
      [1, 3, randInt(2, 10)],
      [2, 4, randInt(2, 10)],
      [3, 5, randInt(3, 10)],
      [4, 5, randInt(3, 10)],
      // Cross edges (make it interesting)
      [1, 4, randInt(1, 7)],
      [2, 3, randInt(1, 7)],
    ];
    return { nodes, edges, pos };
  }

  function bfsOrder(n, edges, start) {
    const adj = buildAdjList(n, edges, true).map((lst) => lst.map(([v]) => v));
    const q = [start];
    const seen = Array(n).fill(false);
    seen[start] = true;
    const order = [];
    while (q.length) {
      const u = q.shift();
      order.push(u);
      for (const v of adj[u]) {
        if (!seen[v]) {
          seen[v] = true;
          q.push(v);
        }
      }
    }
    return order;
  }

  function dfsOrder(n, edges, start) {
    const adj = buildAdjList(n, edges, true).map((lst) => lst.map(([v]) => v));
    const seen = Array(n).fill(false);
    const order = [];
    function dfs(u) {
      seen[u] = true;
      order.push(u);
      for (const v of adj[u]) if (!seen[v]) dfs(v);
    }
    dfs(start);
    return order;
  }

  function dijkstra(n, edges, start) {
    const adj = buildAdjList(n, edges, true);
    const dist = Array(n).fill(Infinity);
    dist[start] = 0;
    const used = Array(n).fill(false);
    for (let iter = 0; iter < n; iter++) {
      let u = -1;
      let best = Infinity;
      for (let i = 0; i < n; i++) {
        if (!used[i] && dist[i] < best) {
          best = dist[i];
          u = i;
        }
      }
      if (u === -1) break;
      used[u] = true;
      for (const [v, w] of adj[u]) {
        if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
      }
    }
    return dist;
  }

  function kruskalMST(n, edges) {
    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = Array(n).fill(0);
    function find(x) {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    }
    function union(a, b) {
      a = find(a);
      b = find(b);
      if (a === b) return false;
      if (rank[a] < rank[b]) [a, b] = [b, a];
      parent[b] = a;
      if (rank[a] === rank[b]) rank[a]++;
      return true;
    }
    let weight = 0;
    let usedEdges = 0;
    const sorted = edges.slice().sort((x, y) => x[2] - y[2]);
    for (const [u, v, w] of sorted) {
      if (union(u, v)) {
        weight += w;
        usedEdges += 1;
        if (usedEdges === n - 1) break;
      }
    }
    return weight;
  }

  function lcsLen(a, b) {
    const n = a.length;
    const m = b.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[n][m];
  }

  function knapsack01(items, cap) {
    const dp = Array(cap + 1).fill(0);
    for (const { w, v } of items) {
      for (let c = cap; c >= w; c--) {
        dp[c] = Math.max(dp[c], dp[c - w] + v);
      }
    }
    return dp[cap];
  }

  function edmondsKarp(n, edges, s, t) {
    const cap = Array.from({ length: n }, () => Array(n).fill(0));
    for (const [u, v, c] of edges) cap[u][v] += c;

    let flow = 0;
    while (true) {
      const parent = Array(n).fill(-1);
      parent[s] = s;
      const q = [s];
      while (q.length && parent[t] === -1) {
        const u = q.shift();
        for (let v = 0; v < n; v++) {
          if (parent[v] === -1 && cap[u][v] > 0) {
            parent[v] = u;
            q.push(v);
          }
        }
      }
      if (parent[t] === -1) break;
      let add = Infinity;
      for (let v = t; v !== s; v = parent[v]) {
        add = Math.min(add, cap[parent[v]][v]);
      }
      for (let v = t; v !== s; v = parent[v]) {
        const u = parent[v];
        cap[u][v] -= add;
        cap[v][u] += add;
      }
      flow += add;
    }
    return flow;
  }

  // ===== Topic generators =====

  function genAsymptotic() {
    const kind = sample(["O", "Omega", "Theta"]);

    if (kind === "O") {
      const a = randInt(1, 5);
      const b = randInt(0, 6);
      const c0 = randInt(0, 20);
      const g = "n log n";
      const prompt = `Find constants c and n0 to prove: T(n) = ${a}n log n + ${b}n + ${c0} is O(${g}). Use base-2 log and give one valid (c, n0).`;

      // For n>=2: n <= n log n, and 1 <= (n log n)/2.
      // So T(n) <= (a + b + c0/2) n log n.
      const c = a + b + Math.ceil(c0 / 2);
      const n0 = 2;

      return {
        prompt,
        answer: [`c=${c}, n0=${n0}`, `${c} ${n0}`, `${c},${n0}`],
        check: (user) => {
          const u = normalize(user);
          const nums = u.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
          if (nums.length < 2) return false;
          const cUser = nums[0];
          const n0User = nums[1];
          return Number.isFinite(cUser) && Number.isFinite(n0User) && cUser >= c && n0User >= n0;
        },
        solution: `1) Choose $n_0=${n0}$ so $\log_2 n \ge 1$ for all $n\ge n_0$.\n2) For $n\ge n_0$: $n \le n\log_2 n$.\n3) Also for $n\ge n_0$: $1 \le (n\log_2 n)/2$.\n4) Bound terms by $n\log_2 n$:\n\u00a0\u00a0$T(n)=${a}n\log_2 n + ${b}n + ${c0} \le (${a}+${b}+${Math.ceil(c0 / 2)})\,n\log_2 n$.\n5) So one valid proof uses $c=${c}$ and $n_0=${n0}$.`,
      };
    }

    if (kind === "Omega") {
      const a = randInt(1, 6);
      const b = randInt(1, 10);
      const prompt = `Find constants c and n0 to prove: T(n) = ${a}n^2 - ${b}n is Ω(n^2). Give one valid (c, n0).`;

      // For n >= 2b/a: a n^2 - b n >= (a/2) n^2.
      const n0 = Math.max(1, Math.ceil((2 * b) / a));
      const cExact = a / 2;

      return {
        prompt,
        answer: [`c=${cExact}, n0=${n0}`, `${cExact} ${n0}`, `${cExact},${n0}`],
        check: (user) => {
          const u = normalize(user);
          const nums = u.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
          if (nums.length < 2) return false;
          const cUser = nums[0];
          const n0User = nums[1];
          return (
            Number.isFinite(cUser) &&
            Number.isFinite(n0User) &&
            cUser > 0 &&
            cUser <= cExact &&
            n0User >= n0
          );
        },
        solution: `1) Want $a n^2 - b n \ge c\,n^2$ for $n\ge n_0$.\n2) Pick $c=a/2=${cExact}$.\n3) Choose $n_0=\lceil 2b/a \rceil = \lceil ${2 * b}/${a} \rceil = ${n0}$.\n4) For $n\ge n_0$, $bn \le (a/2)n^2$.\n5) Then $T(n)=a n^2-bn \ge a n^2-(a/2)n^2 = (a/2)n^2 = c\,n^2$.`,
      };
    }

    // Theta classification
    const a = randInt(1, 6);
    const b = randInt(0, 10);
    const prompt = `Is T(n) = ${a}n^2 + ${b}n Θ(n^2)? Answer "yes" or "no".`;
    return {
      prompt,
      answer: ["yes"],
      check: (user) => eqAnswer(user, "yes"),
      solution: `1) Lower bound: for $n\ge1$, $T(n)=${a}n^2+${b}n \ge ${a}n^2$.\n2) Upper bound: for $n\ge1$, ${b}n \le ${b}n^2$, so $T(n) \le (${a}+${b})n^2$.\n3) So $T(n)$ is both $O(n^2)$ and $\u03a9(n^2)$ \u2192 $\u0398(n^2)$.`,
    };
  }

  function genRecurrences() {
    const b = sample([2, 3, 4]);
    const k = sample([1, 2, 3]);
    const a = Math.pow(b, k);
    const d = sample([0, 1, 2, 3]);

    const prompt = `Use the Master Theorem on: T(n) = ${a} T(n/${b}) + Θ(n^${d}). Give the asymptotic bound as either "n^k", "n^d log n", or "n^d".`;

    const bd = Math.pow(b, d);
    let ans;
    let sol;
    if (a > bd) {
      ans = `n^${k}`;
      sol = `1) Identify $a=${a}$, $b=${b}$, $f(n)=\u0398(n^${d})$.\n2) Compute $n^{\log_b a}$: $\log_${b}(${a})=${k}$ so $n^{\log_b a}=n^${k}$.\n3) Compare exponents: $a=${a} > b^d=${bd}$ (equivalently $n^{\log_b a}$ dominates).\n4) Master case 1 \u2192 $T(n)=\u0398(n^{\log_b a})=\u0398(n^${k})$.`;
    } else if (a === bd) {
      ans = d === 0 ? "log n" : `n^${d} log n`;
      sol = `1) Identify $a=${a}$, $b=${b}$, $f(n)=\u0398(n^${d})$.\n2) Compute $\log_${b}(${a})=${k}$, so $n^{\log_b a}=n^${k}$.\n3) Here $a=b^d$ (balanced case).\n4) Master case 2 \u2192 $T(n)=\u0398(n^d\log n)${d === 0 ? ", i.e., $\u0398(\log n)$." : "."}`;
    } else {
      ans = d === 0 ? "1" : `n^${d}`;
      sol = `1) Identify $a=${a}$, $b=${b}$, $f(n)=\u0398(n^${d})$.\n2) Compare: $a=${a} < b^d=${bd}$ so $f(n)$ dominates.\n3) Master case 3 \u2192 $T(n)=\u0398(n^${d})${d === 0 ? ", i.e., $\u0398(1)$." : "."}`;
    }

    return {
      prompt,
      answer: [ans, ans.replace(/\s+/g, "")],
      check: (user) => {
        const u0 = normalize(user)
          .replace(/^theta\(|^\u0398\(/, "")
          .replace(/^o\(|^\u03b8\(/, "")
          .replace(/\)$/, "")
          .replace(/\s+/g, " ");
        const u = u0.replace(/\s+/g, "");
        const a1 = normalize(ans).replace(/\s+/g, "");
        return u === a1;
      },
      solution: sol,
    };
  }

  function genInsertion() {
    const n = 6;
    const arr = Array.from({ length: n }, () => randInt(0, 20));
    const i = randInt(1, n - 1);
    const after = insertionSortStep(arr, i);

    const prompt = `Insertion sort: start with A=${formatArray(arr)}. After finishing iteration i=${i} (0-based), what is the full array? (Answer as comma-separated values.)`;

    const expected = after.map(String);
    return {
      prompt,
      ui: { type: "sequence", length: n },
      answer: expected,
      check: (user) => Array.isArray(user) && user.join(",") === expected.join(","),
      solution: `1) Consider iteration $i=${i}$ with key=$A[${i}]$.\n2) Shift elements in the sorted prefix $A[0..${i - 1}]$ that are $>key$ one position to the right.\n3) Insert key into the created gap.\n4) Resulting array: ${formatArray(after)}.`,
    };
  }

  function genMergesort() {
    const type = sample(["mergecount", "levels", "stable"]);
    if (type === "mergecount") {
      const m = randInt(1, 8);
      const n = randInt(1, 8);
      const prompt = `In the worst case, how many comparisons are needed to merge two sorted lists of lengths ${m} and ${n}?`;
      const ans = m + n - 1;
      return {
        prompt,
        answer: [String(ans)],
        check: (user) => normalize(user) === String(ans),
        solution: `1) In the worst case, you compare until one list becomes empty.\n2) Each comparison places exactly one element into the output.\n3) You can place $m+n-1$ elements before one side empties, so comparisons = $m+n-1=${m}+${n}-1=${ans}$.`,
      };
    }
    if (type === "levels") {
      const p = sample([3, 4, 5]);
      const N = Math.pow(2, p);
      const prompt = `MergeSort recursion depth for n=${N} (power of 2). How many levels of splitting until subproblems of size 1?`;
      const ans = p;
      return {
        prompt,
        answer: [String(ans)],
        check: (user) => normalize(user) === String(ans),
        solution: `1) Each recursion level halves the subproblem size: ${N} \u2192 ${N / 2} \u2192 ${N / 4} \u2192 \u2026 \u2192 1.\n2) After $L$ levels, size is ${N}/2^L$.\n3) Set ${N}/2^L = 1 \u2192 2^L=${N} \u2192 $L=\log_2 ${N}=${p}$.`,
      };
    }
    return {
      prompt: `Is MergeSort stable? Answer yes/no.`,
      answer: ["yes"],
      check: (user) => eqAnswer(user, "yes"),
      solution: `1) Stability means equal keys keep their relative order.\n2) During merge, when keys tie, take from the left half first.\n3) That preserves relative order \u2192 MergeSort is stable (with the standard merge).`,
    };
  }

  function genQuicksort() {
    const arr = Array.from({ length: 7 }, () => randInt(0, 15));
    const pivot = sample(arr);
    const L = arr.filter((x) => x <= pivot).length;
    const R = arr.filter((x) => x > pivot).length;
    const prompt = `QuickSort partition: A=${formatArray(arr)} with pivot=${pivot}. If we split into L (<= pivot) and R (> pivot), what are the sizes |L| and |R|? Answer like "L=__, R=__".`;
    return {
      prompt,
      ui: { type: "sequence", length: 2 },
      answer: [String(L), String(R)],
      check: (user) => {
        if (!Array.isArray(user) || user.length < 2) return false;
        return normalize(user[0]) === String(L) && normalize(user[1]) === String(R);
      },
      solution: `1) Build $L$ by counting elements $\le ${pivot}$.\n2) Build $R$ by counting elements $> ${pivot}$.\n3) So $|L|=${L}$ and $|R|=${R}$.`,
    };
  }

  function genRadix() {
    const base = 10;
    const n = randInt(5, 10);
    const maxVal = randInt(50, 9999);
    const nums = Array.from({ length: n }, () => randInt(0, maxVal));
    const d = String(maxVal).length;
    const prompt = `Radix sort (base ${base}): for the list ${formatArray(nums)}, how many digit-passes d are required (using the max value ${maxVal})?`;
    return {
      prompt,
      answer: [String(d)],
      check: (user) => normalize(user) === String(d),
      solution: `1) LSD radix does one stable pass per digit.\n2) The number of passes $d$ equals the number of digits of the maximum key.\n3) max=${maxVal} has ${d} digits \u2192 $d=${d}$ passes.`,
    };
  }

  function genKselect() {
    const arr = Array.from({ length: 10 }, () => randInt(0, 30));
    const groups = [arr.slice(0, 5), arr.slice(5, 10)];
    const meds = groups.map((g) => {
      const s = g.slice().sort((x, y) => x - y);
      return s[2];
    });
    const prompt = `Median-of-medians warmup: A=${formatArray(arr)}. Split into groups of 5 and take each group median. What are the two medians (group1, group2)? Answer like "m1, m2".`;
    const expected = [String(meds[0]), String(meds[1])];
    return {
      prompt,
      ui: { type: "sequence", length: 2 },
      answer: expected,
      check: (user) => Array.isArray(user) && normalize(user[0]) === expected[0] && normalize(user[1]) === expected[1],
      solution: `1) Split into two groups of 5: $G_1$ and $G_2$.\n2) Sort each group individually.\n3) The median of 5 elements is the 3rd smallest.\n4) So medians are $m_1=${meds[0]}$ and $m_2=${meds[1]}$.`,
    };
  }

  function genHeaps() {
    const type = sample(["indices", "heapify"]);
    if (type === "indices") {
      const i = randInt(2, 20);
      const prompt = `Heap indices (1-based). For i=${i}, what are parent, left child, right child indices? Answer "p,l,r".`;
      const p = Math.floor(i / 2);
      const l = 2 * i;
      const r = 2 * i + 1;
      const expected = [String(p), String(l), String(r)];
      return {
        prompt,
        ui: { type: "sequence", length: 3 },
        answer: expected,
        check: (user) => Array.isArray(user) && normalize(user[0]) === expected[0] && normalize(user[1]) === expected[1] && normalize(user[2]) === expected[2],
        solution: `1) In 1-based indexing: parent=$\u230a i/2\u230b$, left=$2i$, right=$2i+1$.\n2) With $i=${i}$: parent=${p}, left=${l}, right=${r}.`,
      };
    }

    const arr = Array.from({ length: 7 }, () => randInt(0, 30));
    // heapify at index 0 for 0-based representation (simplified)
    function heapify0(a, idx, heapSize) {
      const res = a.slice();
      while (true) {
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        let largest = idx;
        if (left < heapSize && res[left] > res[largest]) largest = left;
        if (right < heapSize && res[right] > res[largest]) largest = right;
        if (largest === idx) break;
        [res[idx], res[largest]] = [res[largest], res[idx]];
        idx = largest;
      }
      return res;
    }
    const after = heapify0(arr, 0, arr.length);
    const expected = after.map(String);
    const prompt = `Max-Heapify (0-based array representation). Apply heapify at index 0 to A=${formatArray(arr)}. What is the resulting array? (comma-separated)`;
    return {
      prompt,
      ui: { type: "sequence", length: arr.length },
      answer: expected,
      check: (user) => Array.isArray(user) && user.join(",") === expected.join(","),
      solution: `1) Compare the root with its children; swap with the larger child if the heap property is violated.\n2) Continue bubbling the swapped element down until the property holds.\n3) After heapify at index 0, the array is ${formatArray(after)}.`,
    };
  }

  function genGraphReps() {
    const V = sample([10, 50, 100, 1000]);
    const E = sample([V - 1, V, 2 * V, V * 10]);
    const prompt = `Graph storage: for V=${V}, E=${E} (sparse), which representation is usually better for space? Answer "matrix" or "list".`;
    const ans = E <= V * V / 4 ? "list" : "matrix";
    return {
      prompt,
      answer: [ans],
      check: (user) => eqAnswer(user, ans),
      solution: `1) Matrix uses $\u0398(V^2)$ space regardless of $E$.\n2) List uses $\u0398(V+E)$ space.\n3) For sparse graphs ($E\ll V^2$), $V+E \ll V^2$ \u2192 adjacency lists use less space.`,
    };
  }

  function genTraversals() {
    const n = 7;
    const dag = makeReadableDAG(n);
    const nodes = dag.nodes;
    const edges = dag.edges;

    const mode = sample(["bfs", "dfs"]);
    const start = 0;
    const prompt = `${mode.toUpperCase()} order (neighbors visited in increasing numeric order). Starting at ${start}, enter the visitation order.`;

    const order = mode === "bfs" ? bfsOrder(n, edges, start) : dfsOrder(n, edges, start);
    const expected = order.map(String);
    return {
      prompt,
      ui: { type: "sequence", length: order.length },
      visual: {
        graph: {
          directed: true,
          start,
          nodes,
          pos: dag.pos,
          edges: edges.map(([u, v]) => ({ u, v })),
        },
      },
      answer: expected,
      check: (user) => Array.isArray(user) && user.join(",") === expected.join(","),
      solution: `1) Visit neighbors in increasing numeric order.\n2) ${mode.toUpperCase()} from start=${start} yields the visitation sequence.\n3) Order: ${order.join(" ")}.`,
    };
  }

  function genDFSApps() {
    // Keep this as a quick conceptual check to avoid heavy graph parsing.
    const type = sample(["topo", "scc"]);
    if (type === "topo") {
      const prompt = `Topological sort works only on which kind of graph? Answer "DAG" or "has cycles".`;
      return {
        prompt,
        answer: ["dag"],
        check: (user) => eqAnswer(user, "dag"),
        solution: `1) If a directed cycle exists, no linear order can place every edge forward.\n2) If the graph is acyclic, DFS/Kahn produces an order.\n3) Therefore topo sort works only for a DAG.`,
      };
    }

    const prompt = `Kosaraju SCC algorithm: how many full DFS passes are performed (over the graph / transpose)? Answer with a number.`;
    return {
      prompt,
      answer: ["2"],
      check: (user) => normalize(user) === "2",
      solution: `1) First DFS pass on $G$ to compute finish times (ordering).\n2) Second DFS pass on $G^T$ in decreasing finish-time order to extract SCCs.\n3) Total DFS passes = 2.`,
    };
  }

  function genShortestPaths() {
    const type = sample(["dijkstra", "neg"]);
    if (type === "neg") {
      const prompt = `Can Dijkstra's algorithm be used if the graph has a negative-weight edge? Answer yes/no.`;
      return {
        prompt,
        answer: ["no"],
        check: (user) => eqAnswer(user, "no"),
        solution: `1) Dijkstra assumes once a node is extracted (smallest tentative distance), its distance is final.\n2) A negative edge can later reduce a "final" distance via an alternate path.\n3) So Dijkstra is not valid with negative-weight edges.`,
      };
    }

    const g = makeReadableWeightedDigraph();
    const n = g.nodes.length;
    const edges = g.edges;
    const s = 0;
    const t = 5;
    const dist = dijkstra(n, edges, s)[t];
    const prompt = `Shortest path distance from ${s} to ${t} (Dijkstra; all weights nonnegative).`;
    return {
      prompt,
      visual: {
        graph: {
          directed: true,
          start: s,
          target: t,
          nodes: g.nodes,
          pos: g.pos,
          edges: edges.map(([u, v, w]) => ({ u, v, label: w })),
        },
      },
      answer: [String(dist)],
      check: (user) => normalize(user) === String(dist),
      solution: `1) Initialize $d[${s}]=0$ and all other $d[v]=\infty$.\n2) Repeatedly pick the unvisited vertex with smallest tentative distance.\n3) Relax all outgoing edges $(u,v)$: if $d[v] > d[u] + w(u,v)$, update it.\n4) When finished, the shortest distance to ${t} is $d[${t}]=${dist}$.`,
    };
  }

  function genMST() {
    const g = makeReadableUndirectedWeightedGraph();
    const n = g.nodes.length;
    const edges = g.edges;
    const mstWeight = kruskalMST(n, edges);
    const prompt = `Find the MST total weight (Kruskal).`;
    return {
      prompt,
      visual: {
        graph: {
          directed: false,
          nodes: g.nodes,
          pos: g.pos,
          edges: edges.map(([u, v, w]) => ({ u, v, label: w })),
        },
      },
      answer: [String(mstWeight)],
      check: (user) => normalize(user) === String(mstWeight),
      solution: `1) Sort edges by increasing weight.\n2) Scan edges: add an edge if it connects two different components (doesn't create a cycle).\n3) Stop after selecting $V-1$ edges.\n4) Total MST weight = ${mstWeight}.`,
    };
  }

  function genDP() {
    const type = sample(["lcs_matrix", "knap"]);
    if (type === "lcs_matrix") {
      const alphabet = ["A", "B", "C", "D"]; 
      const a = Array.from({ length: randInt(2, 3) }, () => sample(alphabet)).join("");
      const b = Array.from({ length: randInt(2, 3) }, () => sample(alphabet)).join("");

      const n = a.length;
      const m = b.length;
      const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
          else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }

      const prompt = `Fill the LCS DP table entries for S="${a}" (rows) and T="${b}" (cols). Enter the full (|S|+1)×(|T|+1) matrix.`;
      return {
        prompt,
        ui: { type: "matrix", rows: n + 1, cols: m + 1 },
        answer: dp.map((row) => row.map(String)),
        check: (user) => matrixEq(user, dp.map((row) => row.map(String))),
        solution: `1) Define $dp[i][j]$ = LCS length of $S[0..i)$ and $T[0..j)$.\n2) Base cases: $dp[0][*]=0$ and $dp[*][0]=0$.\n3) Transition: if chars match, $dp[i][j]=dp[i-1][j-1]+1$; else $dp[i][j]=\max(dp[i-1][j],dp[i][j-1])$.\n4) Fill row-by-row (or col-by-col).\n5) Final table (rows $i=0..${n}$, cols $j=0..${m}$):\n${formatMatrix(dp)}\n6) LCS length = $dp[${n}][${m}]=${dp[n][m]}$.`,
      };
    }

    const cap = randInt(6, 12);
    const items = Array.from({ length: 4 }, () => ({ w: randInt(1, 6), v: randInt(1, 12) }));
    const ans = knapsack01(items, cap);
    const prompt = `0/1 Knapsack: capacity=${cap}. Items (w,v)=${items.map((it) => `(${it.w},${it.v})`).join(" ")}. What is the optimal total value?`;
    return {
      prompt,
      answer: [String(ans)],
      check: (user) => normalize(user) === String(ans),
      solution: `1) Let $dp[c]$ be the best value achievable with capacity $c$.\n2) For each item $(w,v)$, update capacities from high\u2192low: $dp[c]=\max(dp[c], dp[c-w]+v)$.\n3) After processing all items, answer is $dp[${cap}]=${ans}$.`,
    };
  }

  function genGreedy() {
    const type = sample(["activity", "huffman"]);
    if (type === "activity") {
      const intervals = Array.from({ length: 6 }, () => {
        const s = randInt(0, 9);
        const f = randInt(s + 1, 12);
        return [s, f];
      }).sort((a, b) => a[1] - b[1]);

      let count = 0;
      let last = -Infinity;
      for (const [s, f] of intervals) {
        if (s >= last) {
          count += 1;
          last = f;
        }
      }

      const prompt = `Activity selection: intervals (start,finish) sorted by finish time: ${intervals
        .map(([s, f]) => `(${s},${f})`)
        .join(" ")}. Using the greedy algorithm, how many activities are selected?`;
      return {
        prompt,
        answer: [String(count)],
        check: (user) => normalize(user) === String(count),
        solution: `1) Sort intervals by finish time (already sorted here).\n2) Greedily take the earliest-finishing interval compatible with the last chosen finish.\n3) Repeat until done.\n4) Total selected = ${count}.`,
      };
    }

    const freqs = Array.from({ length: 5 }, () => randInt(1, 20)).sort((a, b) => a - b);
    const prompt = `Huffman coding: given frequencies ${freqs.join(", ")}, what are the two smallest frequencies combined first? Answer "x+y".`;
    const ans = `${freqs[0]}+${freqs[1]}`;
    return {
      prompt,
      answer: [ans, `${freqs[0]} + ${freqs[1]}`],
      check: (user) => normalize(user).replace(/\s+/g, "") === ans,
      solution: `1) Huffman builds a tree by repeatedly merging the two smallest frequencies.\n2) The two smallest here are ${freqs[0]} and ${freqs[1]}.\n3) First merge: ${freqs[0]}+${freqs[1]}.`,
    };
  }

  function genFlow() {
    const g = makeReadableFlowNetwork();
    const n = g.nodes.length;
    const s = 0;
    const t = 5;
    const edges = g.edges;
    const ans = edmondsKarp(n, edges, s, t);
    const prompt = `Max flow value from s=${s} to t=${t}.`;
    return {
      prompt,
      visual: {
        graph: {
          directed: true,
          start: s,
          target: t,
          nodes: g.nodes,
          pos: g.pos,
          edges: edges.map(([u, v, c]) => ({ u, v, label: c })),
        },
      },
      answer: [String(ans)],
      check: (user) => normalize(user) === String(ans),
      solution: `1) Build the residual graph with remaining capacities and back edges.\n2) Find an augmenting path from $s$ to $t$ (Edmonds\u2013Karp uses BFS).\n3) Augment by the bottleneck residual capacity on that path; update residual capacities.\n4) Repeat until no augmenting path exists.\n5) The resulting max flow value is ${ans}.`,
    };
  }

  const GENERATORS = {
    asymptotic: genAsymptotic,
    recurrences: genRecurrences,
    insertion: genInsertion,
    mergesort: genMergesort,
    quicksort: genQuicksort,
    radix: genRadix,
    kselect: genKselect,
    heaps: genHeaps,
    graphreps: genGraphReps,
    traversals: genTraversals,
    dfsapps: genDFSApps,
    shortestpaths: genShortestPaths,
    mst: genMST,
    dp: genDP,
    greedy: genGreedy,
    flow: genFlow,
  };

  window.GENERATORS = GENERATORS;
})();
