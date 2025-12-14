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

  function dijkstraWithParent(n, edges, start) {
    const adj = buildAdjList(n, edges, true);
    const dist = Array(n).fill(Infinity);
    const parent = Array(n).fill(-1);
    dist[start] = 0;
    parent[start] = start;
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
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          parent[v] = u;
        }
      }
    }
    return { dist, parent };
  }

  function topologicalSort(n, edges) {
    const adj = buildAdjList(n, edges, true).map((lst) => lst.map(([v]) => v));
    const visited = new Array(n).fill(false);
    const stack = [];
    function dfs(u) {
      visited[u] = true;
      for (const v of adj[u]) {
        if (!visited[v]) dfs(v);
      }
      stack.push(u);
    }
    for (let i = 0; i < n; i++) {
      if (!visited[i]) dfs(i);
    }
    return stack.reverse();
  }

  function getSCCs(n, edges) {
    const adj = buildAdjList(n, edges, true).map((lst) => lst.map(([v]) => v));
    const revAdj = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) revAdj[v].push(u);

    const visited = new Array(n).fill(false);
    const stack = [];
    function dfs1(u) {
      visited[u] = true;
      for (const v of adj[u]) {
        if (!visited[v]) dfs1(v);
      }
      stack.push(u);
    }
    for (let i = 0; i < n; i++) {
      if (!visited[i]) dfs1(i);
    }

    const sccs = [];
    visited.fill(false);
    function dfs2(u, component) {
      visited[u] = true;
      component.push(u);
      for (const v of revAdj[u]) {
        if (!visited[v]) dfs2(v, component);
      }
    }

    while (stack.length) {
      const u = stack.pop();
      if (!visited[u]) {
        const component = [];
        dfs2(u, component);
        component.sort((a, b) => a - b);
        sccs.push(component);
      }
    }
    sccs.sort((a, b) => a[0] - b[0]);
    return sccs;
  }

  function bellmanFord(n, edges, start, k) {
    const dist = Array(n).fill(Infinity);
    dist[start] = 0;
    for (let i = 0; i < k; i++) {
      for (const [u, v, w] of edges) {
        if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
        }
      }
    }
    return dist;
  }

  function dijkstraDequeueOrder(n, edges, start) {
    const adj = buildAdjList(n, edges, true);
    const dist = Array(n).fill(Infinity);
    dist[start] = 0;
    const used = Array(n).fill(false);
    const order = [];

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
      order.push(u);
      for (const [v, w] of adj[u]) {
        if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
      }
    }
    return order;
  }

  function makeDijkstraRelaxationScenario(n, edges, start) {
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

      // Choose an edge whose relaxation actually improves something.
      const improvable = [];
      for (const [v, w] of adj[u]) {
        if (dist[u] + w < dist[v]) improvable.push([u, v, w]);
      }
      if (improvable.length) {
        const [uu, vv, ww] = sample(improvable);
        return {
          u: uu,
          v: vv,
          w: ww,
          distU: dist[uu],
          distVBefore: dist[vv],
          distVAfter: dist[uu] + ww,
        };
      }

      // Otherwise continue standard Dijkstra relaxation.
      for (const [v, w] of adj[u]) {
        if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
      }
    }

    return null;
  }

  function dfsTimesAndParents(n, edges) {
    const adj = buildAdjList(n, edges, true).map((lst) => lst.map(([v]) => v));
    for (const list of adj) list.sort((a, b) => a - b);

    const color = Array(n).fill(0); // 0=white,1=gray,2=black
    const d = Array(n).fill(-1);
    const f = Array(n).fill(-1);
    const parent = Array(n).fill(-1);
    let time = 0;

    function dfsVisit(u) {
      color[u] = 1;
      d[u] = ++time;
      for (const v of adj[u]) {
        if (color[v] === 0) {
          parent[v] = u;
          dfsVisit(v);
        }
      }
      color[u] = 2;
      f[u] = ++time;
    }

    for (let u = 0; u < n; u++) {
      if (color[u] === 0) {
        parent[u] = u;
        dfsVisit(u);
      }
    }
    return { d, f, parent };
  }

  function classifyDFSEdge(u, v, d, f, parent) {
    if (parent[v] === u) return "tree";
    const uAncV = d[u] < d[v] && f[v] < f[u];
    const vAncU = d[v] < d[u] && f[u] < f[v];
    if (vAncU) return "back";
    if (uAncV) return "forward";
    return "cross";
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

  function kruskalMSTOrder(n, edges) {
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

    const sorted = edges
      .slice()
      .map(([u, v, w]) => [Math.min(u, v), Math.max(u, v), w])
      .sort((x, y) => x[2] - y[2] || x[0] - y[0] || x[1] - y[1]);

    const picked = [];
    for (const [u, v, w] of sorted) {
      if (union(u, v)) {
        picked.push([u, v, w]);
        if (picked.length === n - 1) break;
      }
    }
    return picked;
  }

  function primMSTOrder(n, edges, start) {
    const adj = Array.from({ length: n }, () => []);
    for (const [u0, v0, w] of edges) {
      const u = Math.min(u0, v0);
      const v = Math.max(u0, v0);
      adj[u].push([v, w]);
      adj[v].push([u, w]);
    }
    for (const list of adj) list.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const inTree = Array(n).fill(false);
    inTree[start] = true;
    const picked = [];

    while (picked.length < n - 1) {
      let bestW = Infinity;
      let bestA = Infinity;
      let bestB = Infinity;
      let found = false;

      for (let u = 0; u < n; u++) {
        if (!inTree[u]) continue;
        for (const [v, w] of adj[u]) {
          if (inTree[v]) continue;
          const a = Math.min(u, v);
          const b = Math.max(u, v);
          if (w < bestW || (w === bestW && (a < bestA || (a === bestA && b < bestB)))) {
            bestW = w;
            bestA = a;
            bestB = b;
            found = true;
          }
        }
      }

      if (!found) break;
      // Mark only the vertex not yet in tree
      if (!inTree[bestA]) inTree[bestA] = true;
      if (!inTree[bestB]) inTree[bestB] = true;
      picked.push([bestA, bestB, bestW]);
    }
    return picked;
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

  function lcsOneString(a, b) {
    const n = a.length;
    const m = b.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    // Deterministic backtrack: prefer moving up on ties.
    let i = n;
    let j = m;
    const out = [];
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        out.push(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    out.reverse();
    return { dp, str: out.join("") };
  }

  function isSubsequence(sub, s) {
    let i = 0;
    for (let j = 0; j < s.length && i < sub.length; j++) {
      if (sub[i] === s[j]) i++;
    }
    return i === sub.length;
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

  function edmondsKarpWithMinCut(n, edges, s, t) {
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

    // S side of the min-cut: vertices reachable from s in final residual graph.
    const seen = Array(n).fill(false);
    const q = [s];
    seen[s] = true;
    while (q.length) {
      const u = q.shift();
      for (let v = 0; v < n; v++) {
        if (!seen[v] && cap[u][v] > 0) {
          seen[v] = true;
          q.push(v);
        }
      }
    }
    const cutS = [];
    for (let i = 0; i < n; i++) if (seen[i]) cutS.push(i);

    return { flow, cutS };
  }

  function firstEdmondsKarpAugmentation(n, edges, s, t) {
    const cap = Array.from({ length: n }, () => Array(n).fill(0));
    for (const [u, v, c] of edges) cap[u][v] += c;

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
    if (parent[t] === -1) return null;

    const path = [];
    let add = Infinity;
    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      path.push([u, v]);
      add = Math.min(add, cap[u][v]);
    }
    path.reverse();

    for (const [u, v] of path) {
      cap[u][v] -= add;
      cap[v][u] += add;
    }

    const residuals = path.map(([u, v]) => ({ u, v, fwd: cap[u][v], back: cap[v][u] }));
    return { path, add, residuals };
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
    const type = sample(["master", "tree_count", "tree_size", "identify_case", "substitution", "common_recurrences"]);
    const b = sample([2, 3, 4]);
    const k = sample([1, 2, 3]);
    const a = Math.pow(b, k);
    const d = sample([0, 1, 2, 3]);

    if (type === "identify_case") {
      // Which Master Theorem case applies?
      const bd = Math.pow(b, d);
      let caseNum, caseDesc;
      if (a > bd) {
        caseNum = 1;
        caseDesc = "a > b^d, so work at leaves dominates";
      } else if (a === bd) {
        caseNum = 2;
        caseDesc = "a = b^d, balanced (work at all levels is equal)";
      } else {
        caseNum = 3;
        caseDesc = "a < b^d, so work at root dominates";
      }
      
      const prompt = `Master Theorem: for T(n) = ${a}T(n/${b}) + Θ(n^${d}), which case applies? Answer 1, 2, or 3.`;
      return {
        prompt,
        answer: [String(caseNum)],
        check: (user) => normalize(user) === String(caseNum),
        solution: `1) Compute $b^d = ${b}^{${d}} = ${bd}$.
2) Compare $a = ${a}$ with $b^d = ${bd}$.
3) ${caseDesc}.
4) **Case ${caseNum}** applies.`,
      };
    }

    if (type === "substitution") {
      const prompt = `When the Master Theorem doesn't apply, what method can you use to solve a recurrence?`;
      return {
        prompt,
        answer: ["substitution", "recursion tree", "guess and verify"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("substitution") || u.includes("tree") || u.includes("guess") || u.includes("induction");
        },
        solution: `**Methods for Solving Recurrences:**

1) **Substitution Method:** Guess the form of the solution, then use induction to prove it.

2) **Recursion Tree:** Draw the tree of recursive calls, sum work at each level.

3) **Master Theorem:** When applicable (for $T(n) = aT(n/b) + f(n)$).

**When Master Theorem fails:** Use substitution or recursion tree for:
- Non-polynomial $f(n)$ (e.g., $n \\log n$)
- Non-constant $a$ or $b$
- Boundary cases`,
      };
    }

    if (type === "common_recurrences") {
      const recurrences = [
        { rec: "T(n) = T(n/2) + O(1)", ans: "O(log n)", algo: "Binary Search" },
        { rec: "T(n) = 2T(n/2) + O(n)", ans: "O(n log n)", algo: "Merge Sort" },
        { rec: "T(n) = 2T(n/2) + O(1)", ans: "O(n)", algo: "Tree Traversal" },
        { rec: "T(n) = T(n-1) + O(n)", ans: "O(n^2)", algo: "Selection Sort" },
        { rec: "T(n) = T(n-1) + O(1)", ans: "O(n)", algo: "Linear Scan" },
      ];
      const r = sample(recurrences);
      const prompt = `What is the solution to ${r.rec}?`;
      return {
        prompt,
        answer: [r.ans],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          const e = normalize(r.ans).replace(/\s+/g, "");
          return u.includes(e) || u.includes(e.replace("o(", "").replace(")", ""));
        },
        solution: `**${r.rec} → ${r.ans}**

This is the recurrence for **${r.algo}**.

Apply Master Theorem or unroll the recursion to verify.`,
      };
    }

    if (type === "tree_count") {
      const i = randInt(0, 5);
      const prompt = `Recursion tree: for T(n) = ${a}T(n/${b}) + Θ(n^${d}), how many subproblems are there at level i=${i}?`;
      const ans = Math.pow(a, i);
      return {
        prompt,
        answer: [String(ans)],
        check: (user) => normalize(user) === String(ans),
        solution: `1) Each subproblem branches into $a=${a}$ subproblems.
2) Level 0 has $1=a^0$ subproblem.
3) Therefore level $i$ has $a^i=${a}^${i}=${ans}$ subproblems.`,
      };
    }

    if (type === "tree_size") {
      const i = randInt(0, 6);
      const denom = Math.pow(b, i);
      const ans = i === 0 ? "n" : `n/${denom}`;
      const prompt = `Recursion tree: for T(n) = ${a}T(n/${b}) + Θ(n^${d}), what is the size of each subproblem at level i=${i}? Answer like "${ans}".`;
      return {
        prompt,
        answer: [ans, ans.replace(/\s+/g, "")],
        check: (user) => normalize(user).replace(/\s+/g, "") === ans.replace(/\s+/g, ""),
        solution: `1) Each level divides the input size by $b=${b}$.
2) Level 0 size is $n$.
3) After $i$ levels, size is $n/b^i = n/${denom}$.`,
      };
    }

    // Default: Master Theorem solution
    const prompt = `Use the Master Theorem on: T(n) = ${a} T(n/${b}) + Θ(n^${d}). Give the asymptotic bound as either "n^k", "n^d log n", or "n^d".`;

    const bd = Math.pow(b, d);
    let ans;
    let sol;
    if (a > bd) {
      ans = `n^${k}`;
      sol = `1) Identify $a=${a}$, $b=${b}$, $f(n)=Θ(n^${d})$.
2) Compute $n^{\\log_b a}$: $\\log_${b}(${a})=${k}$ so $n^{\\log_b a}=n^${k}$.
3) Compare exponents: $a=${a} > b^d=${bd}$ (equivalently $n^{\\log_b a}$ dominates).
4) Master case 1 → $T(n)=Θ(n^{\\log_b a})=Θ(n^${k})$.`;
    } else if (a === bd) {
      ans = d === 0 ? "log n" : `n^${d} log n`;
      sol = `1) Identify $a=${a}$, $b=${b}$, $f(n)=Θ(n^${d})$.
2) Compute $\\log_${b}(${a})=${k}$, so $n^{\\log_b a}=n^${k}$.
3) Here $a=b^d$ (balanced case).
4) Master case 2 → $T(n)=Θ(n^d\\log n)${d === 0 ? ", i.e., $Θ(\\log n)$." : "."}`;
    } else {
      ans = d === 0 ? "1" : `n^${d}`;
      sol = `1) Identify $a=${a}$, $b=${b}$, $f(n)=Θ(n^${d})$.
2) Compare: $a=${a} < b^d=${bd}$ so $f(n)$ dominates.
3) Master case 3 → $T(n)=Θ(n^${d})${d === 0 ? ", i.e., $Θ(1)$." : "."}`;
    }

    return {
      prompt,
      answer: [ans, ans.replace(/\s+/g, "")],
      check: (user) => {
        const u0 = normalize(user)
          .replace(/^theta\(|^Θ\(/, "")
          .replace(/^o\(|^θ\(/, "")
          .replace(/\)$/, "")
          .replace(/\s+/g, " ");
        const u = u0.replace(/\s+/g, "");
        const a1 = normalize(ans).replace(/\s+/g, "");
        return u === a1;
      },
      solution: sol,
    };
  }

  function genInduction() {
    const type = sample(["steps", "hypothesis", "basecase", "formula"]);

    if (type === "hypothesis") {
      const prompt = `Induction: what do you assume in the inductive hypothesis? Answer like "Assume P(k) holds".`;
      return {
        prompt,
        answer: ["Assume P(k) holds", "assume p(k)", "p(k)"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("p(k)") && (u.includes("assume") || u.includes("hypothesis"));
        },
        solution: `1) Choose an arbitrary $k\ge n_0$.
2) The inductive hypothesis assumes the statement is true for $n=k$.
3) In symbols: assume $P(k)$ holds.`,
      };
    }

    if (type === "basecase") {
      const n0 = sample([0, 1, 2]);
      const prompt = `Induction: if we want to prove P(n) for all n ≥ ${n0}, what is the first step? Answer briefly.`;
      return {
        prompt,
        answer: ["base case", "prove P(" + n0 + ")", "verify P(" + n0 + ")"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("base") || u.includes("p(" + n0 + ")") || u.includes("n=" + n0) || u.includes("n = " + n0);
        },
        solution: `1) The first step is the **base case**.
2) We verify that $P(${n0})$ holds.
3) This establishes the starting point for the induction.`,
      };
    }

    if (type === "formula") {
      const a = randInt(1, 3);
      const n = randInt(3, 6);
      // Sum of i from 1 to n
      const sum = (n * (n + 1)) / 2;
      const prompt = `Induction practice: Calculate $\\sum_{i=1}^{${n}} i$ using the closed-form formula $n(n+1)/2$.`;
      return {
        prompt,
        answer: [String(sum)],
        check: (user) => normalize(user) === String(sum),
        solution: `1) The formula is $\\frac{n(n+1)}{2}$.
2) Substituting $n = ${n}$: $\\frac{${n} \\cdot ${n + 1}}{2} = \\frac{${n * (n + 1)}}{2} = ${sum}$.`,
      };
    }

    const prompt = `Induction: enter the standard 4 steps in order.`;
    const expected = ["base case", "inductive hypothesis", "inductive step", "conclusion"];
    const allowed = [
      ["base", "base case"],
      ["inductive hypothesis", "hypothesis", "ih"],
      ["inductive step", "step"],
      ["conclusion", "therefore"],
    ];

    return {
      prompt,
      ui: { type: "sequence", length: 4 },
      answer: expected,
      check: (user) => {
        if (!Array.isArray(user) || user.length !== 4) return false;
        for (let i = 0; i < 4; i++) {
          const u = normalize(user[i]);
          if (!allowed[i].some((opt) => u === opt || u.includes(opt))) return false;
        }
        return true;
      },
      solution: `1) Base case: prove $P(n_0)$.
2) Inductive hypothesis: assume $P(k)$ for an arbitrary $k\ge n_0$.
3) Inductive step: prove $P(k)\Rightarrow P(k+1)$.
4) Conclusion: therefore $P(n)$ holds for all $n\ge n_0$.`,
    };
  }

  function matrixChainMinCost(p) {
    const n = p.length - 1;
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        let best = Infinity;
        for (let k = i; k < j; k++) {
          const cost = m[i][k] + m[k + 1][j] + p[i] * p[k + 1] * p[j + 1];
          if (cost < best) best = cost;
        }
        m[i][j] = best;
      }
    }
    return m[0][n - 1];
  }

  function genMatrixChain() {
    const n = sample([3, 4, 5]);
    const p = Array.from({ length: n + 1 }, () => randInt(2, 10));
    const dims = [];
    for (let i = 1; i <= n; i++) dims.push(`A_${i}: ${p[i - 1]}×${p[i]}`);

    const ans = matrixChainMinCost(p);
    const prompt = `Matrix Chain Multiplication: ${dims.join(", ")}. What is the minimum number of scalar multiplications?`;

    return {
      prompt,
      answer: [String(ans)],
      check: (user) => normalize(user) === String(ans),
      solution: `1) Let $m[i][j]$ be the minimum cost to compute $A_i\cdots A_j$.
2) Base: $m[i][i]=0$.
3) Transition: $m[i][j]=\min_{i\le k<j}(m[i][k]+m[k+1][j]+p_{i-1}p_k p_j)$.
4) Fill by increasing chain length.
5) The optimal cost for $A_1\cdots A_${n}$ is ${ans}.`,
    };
  }

  function genInsertion() {
    const type = sample(["step", "comparisons", "bestcase", "worstcase", "stable", "invariant"]);
    
    if (type === "comparisons") {
      // Worst-case comparisons for insertion sort
      const n = randInt(4, 8);
      const worstComparisons = (n * (n - 1)) / 2;
      const prompt = `Insertion sort worst-case: how many comparisons are needed to sort ${n} elements in the worst case (reverse-sorted input)?`;
      return {
        prompt,
        answer: [String(worstComparisons)],
        check: (user) => normalize(user) === String(worstComparisons),
        solution: `1) In the worst case (reverse sorted), element at position $i$ is compared with all $i$ previous elements.
2) Total comparisons = $1 + 2 + 3 + ... + (n-1) = \\frac{n(n-1)}{2}$.
3) For $n = ${n}$: $\\frac{${n} \\cdot ${n - 1}}{2} = ${worstComparisons}$.`,
      };
    }

    if (type === "bestcase") {
      const prompt = `Insertion sort best-case: what is the running time when the input is already sorted? Answer in Big-O.`;
      return {
        prompt,
        answer: ["O(n)", "o(n)", "Θ(n)", "θ(n)", "n"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("o(n)") || u.includes("θ(n)") || u === "n" || u === "linear";
        },
        solution: `1) When already sorted, each element is compared only with its predecessor.
2) The inner while-loop never executes (no shifts needed).
3) This gives exactly $n - 1$ comparisons, hence $O(n)$ time.`,
      };
    }

    if (type === "worstcase") {
      const prompt = `Insertion sort worst-case: what is the running time? Answer in Big-O.`;
      return {
        prompt,
        answer: ["O(n^2)", "o(n^2)", "Θ(n^2)", "n^2", "n squared"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("n^2") || u.includes("n2") || u.includes("nsquared") || u.includes("quadratic");
        },
        solution: `1) Worst case occurs when input is reverse sorted.
2) Each element must be compared with all previous elements.
3) Total comparisons: $1 + 2 + ... + (n-1) = \\frac{n(n-1)}{2} = O(n^2)$.`,
      };
    }

    if (type === "stable") {
      const prompt = `Is Insertion sort stable? Answer yes/no and briefly explain.`;
      return {
        prompt,
        answer: ["yes"],
        check: (user) => eqAnswer(user, "yes"),
        solution: `1) Stability means equal keys preserve their relative order.
2) Insertion sort uses strict "$>$" in the while-condition when shifting.
3) Equal elements are not shifted past each other, preserving relative order.
4) Therefore, **yes**, Insertion sort is stable.`,
      };
    }

    if (type === "invariant") {
      const prompt = `What is the loop invariant for Insertion sort after iteration i?`;
      return {
        prompt,
        answer: ["A[0..i] is sorted", "prefix sorted", "first i+1 sorted"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("sort") && (u.includes("0") || u.includes("prefix") || u.includes("first"))) ||
                 u.includes("a[0..i]") || u.includes("a[0...i]");
        },
        solution: `**Loop Invariant:** After iteration $i$, the prefix $A[0..i]$ is sorted.

1) Initially (before iteration 1), $A[0..0]$ is trivially sorted.
2) Each iteration inserts $A[i]$ into its correct position in $A[0..i-1]$.
3) This maintains the invariant for $A[0..i]$.`,
      };
    }

    // Default: step-by-step trace
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
      solution: `1) Consider iteration $i=${i}$ with key=$A[${i}]=${arr[i]}$.
2) Shift elements in the sorted prefix $A[0..${i - 1}]$ that are $>key$ one position to the right.
3) Insert key into the created gap.
4) Resulting array: ${formatArray(after)}.`,
    };
  }

  function genMergesort() {
    const type = sample(["mergecount", "levels", "stable", "recurrence", "complexity", "space", "mergetrace"]);
    
    if (type === "mergecount") {
      const m = randInt(1, 8);
      const n = randInt(1, 8);
      const prompt = `In the worst case, how many comparisons are needed to merge two sorted lists of lengths ${m} and ${n}?`;
      const ans = m + n - 1;
      return {
        prompt,
        answer: [String(ans)],
        check: (user) => normalize(user) === String(ans),
        solution: `1) In the worst case, you compare until one list becomes empty.
2) Each comparison places exactly one element into the output.
3) You can place $m+n-1$ elements before one side empties, so comparisons = $m+n-1=${m}+${n}-1=${ans}$.`,
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
        solution: `1) Each recursion level halves the subproblem size: ${N} → ${N / 2} → ${N / 4} → … → 1.
2) After $L$ levels, size is ${N}/2^L.
3) Set ${N}/2^L = 1 → 2^L=${N} → $L=\\log_2 ${N}=${p}$.`,
      };
    }

    if (type === "recurrence") {
      const prompt = `What is the recurrence relation for MergeSort's running time?`;
      return {
        prompt,
        answer: ["T(n) = 2T(n/2) + O(n)", "T(n) = 2T(n/2) + n", "2T(n/2) + n"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("2t(n/2)") && (u.includes("+n") || u.includes("+o(n)") || u.includes("+θ(n)"));
        },
        solution: `**MergeSort Recurrence:**
$$T(n) = 2T(n/2) + O(n)$$

1) **2T(n/2)**: Two recursive calls on halves of the array.
2) **O(n)**: Linear time to merge the two sorted halves.
3) By Master Theorem (case 2): $T(n) = O(n \\log n)$.`,
      };
    }

    if (type === "complexity") {
      const cases = sample(["best", "worst", "average"]);
      const prompt = `What is the ${cases}-case time complexity of MergeSort?`;
      return {
        prompt,
        answer: ["O(n log n)", "Θ(n log n)", "n log n", "O(nlogn)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("nlogn") || u.includes("nlog(n)") || (u.includes("n") && u.includes("log"));
        },
        solution: `**MergeSort is always $O(n \\log n)$** for best, worst, and average cases.

1) The array is always split into halves regardless of input order.
2) Merge always takes $O(n)$ time per level.
3) There are $\\log n$ levels.
4) Total: $O(n \\log n)$ in **all cases**.`,
      };
    }

    if (type === "space") {
      const prompt = `What is the auxiliary space complexity of (standard) MergeSort?`;
      return {
        prompt,
        answer: ["O(n)", "Θ(n)", "n", "linear"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("o(n)") || u.includes("θ(n)") || u === "n" || u === "linear";
        },
        solution: `**MergeSort uses $O(n)$ auxiliary space.**

1) Standard implementation allocates a temporary array for merging.
2) At each level, we need $O(n)$ space for the merged output.
3) The recursion stack uses $O(\\log n)$ space.
4) Dominant term: $O(n)$ for the auxiliary array.`,
      };
    }

    if (type === "mergetrace") {
      // Merge two sorted subarrays
      const left = [randInt(1, 5), randInt(6, 10), randInt(11, 15)].sort((a, b) => a - b);
      const right = [randInt(1, 5), randInt(6, 10), randInt(11, 15)].sort((a, b) => a - b);
      const merged = [...left, ...right].sort((a, b) => a - b);
      
      const prompt = `Merge the two sorted arrays: L=${formatArray(left)} and R=${formatArray(right)}. What is the merged result?`;
      const expected = merged.map(String);
      return {
        prompt,
        ui: { type: "sequence", length: 6 },
        answer: expected,
        check: (user) => Array.isArray(user) && user.join(",") === expected.join(","),
        solution: `1) Compare first elements of L and R, take the smaller.
2) Repeat until one array is exhausted.
3) Append remaining elements.
4) Result: ${formatArray(merged)}.`,
      };
    }

    // Default: stable
    return {
      prompt: `Is MergeSort stable? Answer yes/no.`,
      answer: ["yes"],
      check: (user) => eqAnswer(user, "yes"),
      solution: `1) Stability means equal keys keep their relative order.
2) During merge, when keys tie, take from the left half first.
3) That preserves relative order → MergeSort is stable (with the standard merge).`,
    };
  }

  function genQuicksort() {
    const type = sample(["partition", "worstcase", "bestcase", "stable", "inplace", "recurrence", "pivotchoice"]);
    
    if (type === "worstcase") {
      const prompt = `What is the worst-case time complexity of QuickSort?`;
      return {
        prompt,
        answer: ["O(n^2)", "Θ(n^2)", "n^2", "n squared"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("n^2") || u.includes("n2") || u.includes("nsquared") || u.includes("quadratic");
        },
        solution: `**QuickSort worst-case: $O(n^2)$**

1) Worst case occurs when pivot is always the smallest or largest element.
2) This creates partitions of size $0$ and $n-1$.
3) Recurrence: $T(n) = T(n-1) + O(n) = O(n^2)$.
4) Example: Already sorted array with first-element pivot.`,
      };
    }

    if (type === "bestcase") {
      const prompt = `What is the best-case time complexity of QuickSort?`;
      return {
        prompt,
        answer: ["O(n log n)", "Θ(n log n)", "n log n", "O(nlogn)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("nlogn") || u.includes("nlog(n)") || (u.includes("n") && u.includes("log"));
        },
        solution: `**QuickSort best-case: $O(n \\log n)$**

1) Best case: pivot always splits array into two equal halves.
2) Recurrence: $T(n) = 2T(n/2) + O(n)$.
3) By Master Theorem: $T(n) = O(n \\log n)$.`,
      };
    }

    if (type === "stable") {
      const prompt = `Is QuickSort (standard in-place version) stable? Answer yes/no.`;
      return {
        prompt,
        answer: ["no"],
        check: (user) => eqAnswer(user, "no"),
        solution: `**QuickSort is NOT stable.**

1) Partitioning swaps elements across distant positions.
2) Equal elements may be reordered during swaps.
3) Example: [3a, 2, 3b, 1] with pivot=2 → after partition, 3a and 3b may swap order.`,
      };
    }

    if (type === "inplace") {
      const prompt = `Is QuickSort an in-place sorting algorithm? Answer yes/no.`;
      return {
        prompt,
        answer: ["yes"],
        check: (user) => eqAnswer(user, "yes"),
        solution: `**Yes, QuickSort is in-place.**

1) Partitioning is done by swapping elements within the array.
2) No auxiliary array is needed (only recursion stack).
3) Space complexity: $O(\\log n)$ average for recursion stack.`,
      };
    }

    if (type === "recurrence") {
      const caseType = sample(["worst", "best"]);
      if (caseType === "worst") {
        const prompt = `What is the recurrence for QuickSort's WORST-case running time?`;
        return {
          prompt,
          answer: ["T(n) = T(n-1) + O(n)", "T(n) = T(n-1) + n"],
          check: (user) => {
            const u = normalize(user).replace(/\s+/g, "");
            return u.includes("t(n-1)") && (u.includes("+n") || u.includes("+o(n)"));
          },
          solution: `**Worst-case recurrence:**
$$T(n) = T(n-1) + O(n)$$

1) One subproblem of size $n-1$ (pivot at extreme).
2) $O(n)$ work for partitioning.
3) Solves to $T(n) = O(n^2)$.`,
        };
      } else {
        const prompt = `What is the recurrence for QuickSort's BEST-case running time?`;
        return {
          prompt,
          answer: ["T(n) = 2T(n/2) + O(n)", "T(n) = 2T(n/2) + n"],
          check: (user) => {
            const u = normalize(user).replace(/\s+/g, "");
            return u.includes("2t(n/2)") && (u.includes("+n") || u.includes("+o(n)"));
          },
          solution: `**Best-case recurrence:**
$$T(n) = 2T(n/2) + O(n)$$

1) Two subproblems of size $n/2$ (balanced partition).
2) $O(n)$ work for partitioning.
3) Solves to $T(n) = O(n \\log n)$.`,
        };
      }
    }

    if (type === "pivotchoice") {
      const strategies = [
        { name: "first element", problem: "already sorted or reverse sorted arrays" },
        { name: "last element", problem: "already sorted or reverse sorted arrays" },
        { name: "median-of-three", problem: "reduces worst case probability but doesn't eliminate it" },
        { name: "random element", problem: "expected O(n log n) but worst case still possible" },
      ];
      const strat = sample(strategies);
      const prompt = `QuickSort pivot selection: What is a potential problem with using the "${strat.name}" as the pivot?`;
      return {
        prompt,
        answer: [strat.problem],
        check: (user) => {
          const u = normalize(user);
          if (strat.name.includes("first") || strat.name.includes("last")) {
            return u.includes("sorted") || u.includes("worst") || u.includes("n^2") || u.includes("unbalanced");
          }
          return u.includes("worst") || u.includes("still") || u.includes("not eliminate");
        },
        solution: `**Problem with "${strat.name}" pivot:**

${strat.problem}

For first/last element pivots, sorted inputs cause $O(n^2)$ performance.
Randomized pivot gives expected $O(n \\log n)$ but worst case is still possible.`,
      };
    }

    // Default: partition counting
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
      solution: `1) Build $L$ by counting elements $\\le ${pivot}$.
2) Build $R$ by counting elements $> ${pivot}$.
3) So $|L|=${L}$ and $|R|=${R}$.`,
    };
  }

  function genRadix() {
    const type = sample(["passes", "complexity", "stable", "counting"]);
    
    if (type === "complexity") {
      const prompt = `What is the time complexity of Radix Sort for n numbers with d digits in base b?`;
      return {
        prompt,
        answer: ["O(d(n+b))", "O(d*(n+b))", "Θ(d(n+b))", "d(n+b)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return (u.includes("d") && u.includes("n") && u.includes("b")) || u.includes("d(n+b)") || u.includes("d*(n+b)");
        },
        solution: `**Radix Sort: $O(d(n+b))$**

1) $d$ = number of digits (passes).
2) Each pass uses counting sort: $O(n + b)$.
3) Total: $O(d \\cdot (n + b))$.
4) When $d$ and $b$ are constants, this is $O(n)$.`,
      };
    }

    if (type === "stable") {
      const prompt = `Why must Radix Sort use a stable sorting algorithm for each digit pass?`;
      return {
        prompt,
        answer: ["preserve order", "maintain relative order", "previous digits"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("stable") || u.includes("preserve") || u.includes("order") || u.includes("previous");
        },
        solution: `**Radix Sort requires stable digit sorting because:**

1) LSD (Least Significant Digit) Radix Sort processes digits from right to left.
2) When sorting by digit $i$, elements with equal digit $i$ must retain their order from the previous pass.
3) This order reflects the correct sorting by digits $0$ through $i-1$.
4) Without stability, earlier digit orderings would be lost.`,
      };
    }

    if (type === "counting") {
      const prompt = `What sorting algorithm is typically used for each digit pass in Radix Sort?`;
      return {
        prompt,
        answer: ["counting sort", "countingsort", "counting"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("counting");
        },
        solution: `**Counting Sort** is used for each digit pass.

1) Counting sort is stable (required for LSD radix).
2) Counting sort runs in $O(n + k)$ where $k$ is the range.
3) For base $b$, each digit is in range $[0, b-1]$, so $k = b$.
4) This gives $O(n + b)$ per pass.`,
      };
    }

    // Default: number of passes
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
      solution: `1) LSD radix does one stable pass per digit.
2) The number of passes $d$ equals the number of digits of the maximum key.
3) max=${maxVal} has ${d} digits → $d=${d}$ passes.`,
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
    const type = sample(["indices", "heapify", "buildheap", "extractmax", "insert", "heapsort", "height"]);
    
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
        solution: `1) In 1-based indexing: parent=$\\lfloor i/2\\rfloor$, left=$2i$, right=$2i+1$.
2) With $i=${i}$: parent=${p}, left=${l}, right=${r}.`,
      };
    }

    if (type === "buildheap") {
      const n = sample([8, 16, 32, 64]);
      const prompt = `Build-Max-Heap on an array of ${n} elements: how many times is Max-Heapify called?`;
      const ans = Math.floor(n / 2);
      return {
        prompt,
        answer: [String(ans)],
        check: (user) => normalize(user) === String(ans),
        solution: `**Build-Max-Heap calls Max-Heapify $\\lfloor n/2 \\rfloor$ times.**

1) Leaves don't need heapify (they're trivially heaps).
2) Leaves are at indices $\\lfloor n/2 \\rfloor + 1$ through $n$.
3) So we call heapify on indices $\\lfloor n/2 \\rfloor$ down to 1.
4) For $n=${n}$: $\\lfloor ${n}/2 \\rfloor = ${ans}$ calls.`,
      };
    }

    if (type === "extractmax") {
      const prompt = `What is the time complexity of Extract-Max from a max-heap of n elements?`;
      return {
        prompt,
        answer: ["O(log n)", "Θ(log n)", "log n", "O(logn)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("logn") || u.includes("log(n)");
        },
        solution: `**Extract-Max: $O(\\log n)$**

1) Remove root (the max), replace with last element.
2) Heapify at root to restore heap property.
3) Heapify takes $O(\\log n)$ (height of heap).`,
      };
    }

    if (type === "insert") {
      const prompt = `What is the time complexity of inserting an element into a heap of n elements?`;
      return {
        prompt,
        answer: ["O(log n)", "Θ(log n)", "log n", "O(logn)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("logn") || u.includes("log(n)");
        },
        solution: `**Heap Insert: $O(\\log n)$**

1) Add new element at the end (next available position).
2) "Bubble up": compare with parent, swap if larger (for max-heap).
3) At most $O(\\log n)$ swaps (height of heap).`,
      };
    }

    if (type === "heapsort") {
      const prompt = `What is the time complexity of HeapSort?`;
      return {
        prompt,
        answer: ["O(n log n)", "Θ(n log n)", "n log n", "O(nlogn)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("nlogn") || u.includes("nlog(n)") || (u.includes("n") && u.includes("log"));
        },
        solution: `**HeapSort: $O(n \\log n)$**

1) Build-Max-Heap: $O(n)$.
2) Extract-Max $n$ times, each $O(\\log n)$.
3) Total: $O(n) + O(n \\log n) = O(n \\log n)$.`,
      };
    }

    if (type === "height") {
      const n = sample([7, 15, 31, 63, 127]);
      const h = Math.floor(Math.log2(n));
      const prompt = `A heap with ${n} elements has what height? (Height = edges from root to deepest leaf)`;
      return {
        prompt,
        answer: [String(h)],
        check: (user) => normalize(user) === String(h),
        solution: `**Heap height = $\\lfloor \\log_2 n \\rfloor$**

1) A heap is a nearly complete binary tree.
2) Height = $\\lfloor \\log_2 n \\rfloor$.
3) For $n=${n}$: $\\lfloor \\log_2 ${n} \\rfloor = ${h}$.`,
      };
    }

    // Default: heapify trace
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
      solution: `1) Compare the root with its children; swap with the larger child if the heap property is violated.
2) Continue bubbling the swapped element down until the property holds.
3) After heapify at index 0, the array is ${formatArray(after)}.`,
    };
  }

  function genGraphReps() {
    const type = sample(["space", "dir"]);

    if (type === "dir") {
      const isDirected = Math.random() < 0.5;
      const nodes = [0, 1, 2, 3, 4];

      let edges;
      let pos;
      if (isDirected) {
        const dag = makeReadableDAG(5);
        edges = dag.edges.map(([u, v]) => [u, v]);
        pos = dag.pos;
      } else {
        const ug = makeReadableUndirectedWeightedGraph();
        edges = ug.edges.map(([u, v]) => [u, v]);
        pos = ug.pos;
      }

      const prompt = `Is the graph directed or undirected? Answer "directed" or "undirected".`;
      const ans = isDirected ? "directed" : "undirected";
      return {
        prompt,
        visual: {
          graph: {
            directed: isDirected,
            nodes,
            pos,
            edges: edges.map(([u, v]) => ({ u, v })),
          },
        },
        answer: [ans],
        check: (user) => eqAnswer(user, ans),
        solution: `1) Directed graphs have arrows on edges.\n2) Undirected graphs have edges without direction.\n3) This graph is ${ans}.`,
      };
    }

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
    const prompt =
      mode === "bfs"
        ? `BFS traversal: explore outgoing neighbors in increasing numeric order. Starting at ${start}, list vertices in the order they are DEQUEUED (removed from the queue).`
        : `DFS traversal: explore outgoing neighbors in increasing numeric order. Starting at ${start}, list vertices in the order they are FIRST DISCOVERED (preorder).`;

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
    // Mix conceptual + mechanical tracing.
    const type = sample(["topo", "topoproof", "times", "edgetypes", "kosaraju", "toposort", "scc_list"]);
    if (type === "topo") {
      const prompt = `Topological sort works only on which kind of graph? Answer "DAG" or "has cycles".`;
      return {
        prompt,
        answer: ["dag"],
        check: (user) => eqAnswer(user, "dag"),
        solution: `1) If a directed cycle exists, no linear order can place every edge forward.\n2) If the graph is acyclic, DFS/Kahn produces an order.\n3) Therefore topo sort works only for a DAG.`,
      };
    }

    if (type === "topoproof") {
      const prompt = `Topo correctness (DFS finish times): for every directed edge (u,v) in a DAG, which relation holds? Answer "f[u] > f[v]" or "f[u] < f[v]".`;
      return {
        prompt,
        answer: ["f[u] > f[v]", "f[u]>f[v]"],
        check: (user) => normalize(user).replace(/\s+/g, "") === "f[u]>f[v]",
        solution: `1) In a DAG, DFS cannot encounter a back edge.
2) For any edge $(u,v)$, DFS finishes $v$ before finishing $u$.
3) Therefore $f[u] > f[v]$ and sorting by decreasing finish time is a topological order.`,
      };
    }

    if (type === "toposort") {
      const g = makeReadableDAG(6);
      const n = g.nodes.length;
      const edges = g.edges;
      const expected = topologicalSort(n, edges);
      const prompt = `Topological Sort: list the vertices in a valid topological order (comma-separated).`;
      return {
        prompt,
        ui: { type: "sequence", length: n },
        visual: {
          graph: {
            directed: true,
            nodes: g.nodes,
            pos: g.pos,
            edges: edges.map(([u, v]) => ({ u, v })),
          },
        },
        answer: expected.map(String),
        check: (user) => {
          if (!Array.isArray(user) || user.length !== n) return false;
          const uMap = new Map();
          user.forEach((u, i) => uMap.set(normalize(u), i));
          for (let i = 0; i < n; i++) if (!uMap.has(String(i))) return false;
          for (const [u, v] of edges) {
            if (uMap.get(String(u)) > uMap.get(String(v))) return false;
          }
          return true;
        },
        solution: `1) Perform DFS.
2) When a vertex finishes (turns black), push it onto a stack.
3) Pop stack to get topological order.
4) One valid order: ${expected.join(", ")}.`,
      };
    }

    if (type === "scc_list") {
      const nodes = [0, 1, 2, 3, 4, 5];
      const pos = gridPositions(nodes, 3);
      // Create a graph with non-trivial SCCs
      const edges = [
        [0, 1, 1], [1, 3, 1], [3, 0, 1], // SCC {0,1,3}
        [0, 2, 1], [1, 2, 1],            // Cross edges
        [2, 4, 1],                       // Cross edge
        [4, 5, 1], [5, 4, 1]             // SCC {4,5}
      ];
      // Randomize weights
      edges.forEach(e => e[2] = randInt(1, 9));
      
      const n = nodes.length;
      const sccs = getSCCs(n, edges);
      const expected = sccs.map((c) => c.join(",")).join("; ");
      const prompt = `Strongly Connected Components: list the SCCs. Enter each component as comma-separated vertices, and separate components with semicolons (e.g. "0,1,2; 3; 4,5"). Order of components doesn't matter.`;
      
      return {
        prompt,
        visual: {
          graph: {
            directed: true,
            nodes,
            pos,
            edges: edges.map(([u, v, w]) => ({ u, v, label: w })),
          },
        },
        answer: [expected],
        check: (user) => {
          const uStr = normalize(user).replace(/\s+/g, "");
          const uComps = uStr.split(";").map(s => s.split(",").map(Number).sort((a, b) => a - b).join(",")).sort();
          const eComps = sccs.map(c => c.join(",")).sort();
          if (uComps.length !== eComps.length) return false;
          for (let i = 0; i < uComps.length; i++) {
            if (uComps[i] !== eComps[i]) return false;
          }
          return true;
        },
        solution: `1) Run Kosaraju's or Tarjan's algorithm.
2) The SCCs are: ${sccs.map(c => `{${c.join(",")}}`).join(", ")}.`,
      };
    }

    if (type === "times" || type === "edgetypes") {
      const n = 6;
      const nodes = [0, 1, 2, 3, 4, 5];
      const pos = gridPositions(nodes, 3);
      // A small directed graph that produces non-trivial DFS times/edge types.
      const edges = [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
        [3, 1],
        [2, 4],
        [4, 5],
        [5, 2],
      ];

      const { d, f, parent } = dfsTimesAndParents(n, edges);

      if (type === "times") {
        const expected = nodes.map((u) => [String(d[u]), String(f[u])]);
        return {
          prompt: `Run DFS (visit vertices in increasing numeric order; explore neighbors in increasing order). Fill discovery/finish times for each vertex 0..${n - 1} as an ${n}×2 table [d,f].`,
          ui: { type: "matrix", rows: n, cols: 2 },
          visual: {
            graph: {
              directed: true,
              nodes,
              pos,
              edges: edges.map(([u, v]) => ({ u, v })),
            },
          },
          answer: expected,
          check: (user) => matrixEq(user, expected),
          solution: `1) Use global time counter.
2) When a vertex is first discovered: set $d[u]=++time$.
3) After exploring all outgoing edges: set $f[u]=++time$.
4) Times (rows are vertices 0..${n - 1}, cols are [d,f]):
${formatMatrix(expected)}.`,
        };
      }

      const edgeList = edges.map(([u, v]) => ({ u, v }));
      const expectedTypes = edgeList.map(({ u, v }) => classifyDFSEdge(u, v, d, f, parent));
      const expected = expectedTypes.map(String);
      const prompt = `DFS edge labeling (same DFS ordering). For each edge in order: ${edgeList
        .map((e) => `${e.u}->${e.v}`)
        .join(", ")}, label it as tree/back/forward/cross.`;
      return {
        prompt,
        ui: { type: "sequence", length: expected.length },
        visual: {
          graph: {
            directed: true,
            nodes,
            pos,
            edges: edgeList,
          },
        },
        answer: expected,
        check: (user) => {
          if (!Array.isArray(user) || user.length !== expected.length) return false;
          for (let i = 0; i < expected.length; i++) {
            const u = normalize(user[i]);
            const e = expected[i];
            if (u !== e && !u.startsWith(e[0])) return false;
          }
          return true;
        },
        solution: `1) Tree if it discovers a white vertex.
2) Back if it goes to an ancestor.
3) Forward if it goes to a descendant (non-tree).
4) Cross otherwise.
5) Labels for the listed edges: ${expectedTypes.join(", ")}.`,
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
    const type = sample(["distance", "path", "relax", "choose", "neg", "dequeue", "bellman"]);

    if (type === "bellman") {
      const g = makeReadableWeightedDigraph();
      const n = g.nodes.length;
      const edges = g.edges;
      const s = 0;
      const t = 5;
      const k = randInt(2, n - 1);
      const dist = bellmanFord(n, edges, s, k);
      const expected = dist.map((d) => (d === Infinity ? "inf" : String(d)));
      const prompt = `Run Bellman-Ford from s=${s} for ${k} iterations (relax all edges ${k} times). Enter the distance array (use "inf" for infinity).`;
      return {
        prompt,
        ui: { type: "sequence", length: n },
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
        answer: expected,
        check: (user) => {
          if (!Array.isArray(user) || user.length !== n) return false;
          for (let i = 0; i < n; i++) {
            const u = normalize(user[i]);
            const e = expected[i];
            if (u !== e && !(u === "infinity" && e === "inf")) return false;
          }
          return true;
        },
        solution: `1) Initialize $d[${s}]=0$, others $\infty$.
2) In each iteration, relax all edges $(u,v)$ with weight $w$: $d[v] = \min(d[v], d[u] + w)$.
3) After ${k} iterations (note: full Bellman-Ford runs $V-1=${n-1}$ iterations), distances are: ${expected.join(", ")}.
4) These may not be final shortest paths if ${k} < ${n-1}.`,
      };
    }

    if (type === "choose") {
      const hasNegativeEdge = Math.random() < 0.5;
      const prompt = `Single-source shortest paths: choose the correct algorithm. ${
        hasNegativeEdge
          ? "The graph has a negative-weight edge (but no negative cycles)."
          : "All edge weights are nonnegative."
      } Answer "dijkstra" or "bellman-ford".`;
      const ans = hasNegativeEdge ? "bellman-ford" : "dijkstra";
      return {
        prompt,
        answer: [ans, ans.replace(/\s+/g, "")],
        check: (user) => eqAnswer(user, ans),
        solution: `1) Dijkstra requires all edge weights to be nonnegative.
2) Bellman–Ford handles negative edges (and can detect negative cycles).
3) Therefore the correct choice here is ${ans}.`,
      };
    }

    if (type === "neg") {
      const prompt = `Can Dijkstra's algorithm be used if the graph has a negative-weight edge? Answer yes/no.`;
      return {
        prompt,
        answer: ["no"],
        check: (user) => eqAnswer(user, "no"),
        solution: `1) Dijkstra assumes once a node is extracted (smallest tentative distance), its distance is final.
2) A negative edge can later reduce a "final" distance via an alternate path.
3) So Dijkstra is not valid with negative-weight edges.`,
      };
    }

    const g = makeReadableWeightedDigraph();
    const n = g.nodes.length;
    const edges = g.edges;
    const s = 0;
    const t = 5;

    if (type === "dequeue") {
      const order = dijkstraDequeueOrder(n, edges, s);
      const expected = order.map(String);
      const prompt = `Run Dijkstra from s=${s} (visit/dequeue the smallest tentative distance each step). List the order vertices are dequeued/settled.`;
      return {
        prompt,
        ui: { type: "sequence", length: expected.length },
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
        answer: expected,
        check: (user) => Array.isArray(user) && user.map((x) => normalize(x)).join(",") === expected.join(","),
        solution: `1) Initialize $d[${s}]=0$, others $=\infty$.
2) Repeatedly pick the unvisited vertex with smallest $d[\cdot]$ and mark it settled.
3) The dequeue/settle order here is: ${expected.join(" ")}.`,
      };
    }

    if (type === "relax") {
      let scenario = null;
      // A few retries in case the random graph doesn't produce an improvable relaxation.
      for (let tries = 0; tries < 8 && !scenario; tries++) {
        const gg = tries === 0 ? g : makeReadableWeightedDigraph();
        scenario = makeDijkstraRelaxationScenario(gg.nodes.length, gg.edges, s);
        if (scenario) {
          return {
            prompt: `Dijkstra relaxation: suppose currently d[${scenario.u}]=${scenario.distU} and d[${scenario.v}] is ${
              scenario.distVBefore === Infinity ? "∞" : scenario.distVBefore
            }. After relaxing edge (${scenario.u}→${scenario.v}) with weight ${scenario.w}, what is the new d[${scenario.v}]?`,
            visual: {
              graph: {
                directed: true,
                start: s,
                target: t,
                nodes: gg.nodes,
                pos: gg.pos,
                edges: gg.edges.map(([u, v, w]) => ({ u, v, label: w })),
              },
            },
            answer: [String(scenario.distVAfter)],
            check: (user) => normalize(user) === String(scenario.distVAfter),
            solution: `1) Relaxation rule: $d[v] \leftarrow \min(d[v], d[u] + w(u,v))$.
2) Here: $d[${scenario.u}]+w=${scenario.distU}+${scenario.w}=${scenario.distVAfter}$.
3) So the updated value is $d[${scenario.v}]=${scenario.distVAfter}$.`,
          };
        }
      }
      // Fallback (should be rare): use a simple numeric relaxation question.
      const du = randInt(0, 20);
      const dv = randInt(du, du + 30);
      const w = randInt(1, 15);
      const ans = Math.min(dv, du + w);
      const prompt = `Dijkstra relaxation rule: if d[u]=${du}, d[v]=${dv}, and w(u,v)=${w}, what is the new d[v] after relaxing (u,v)?`;
      return {
        prompt,
        answer: [String(ans)],
        check: (user) => normalize(user) === String(ans),
        solution: `1) Compute $d[u]+w=${du}+${w}=${du + w}$.
2) Take $\min(d[v], d[u]+w)=\min(${dv}, ${du + w})=${ans}$.`,
      };
    }

    if (type === "path") {
      const { dist, parent } = dijkstraWithParent(n, edges, s);
      // Reconstruct one shortest path using parent pointers.
      const path = [];
      let cur = t;
      let guard = 0;
      while (cur !== -1 && guard++ < 50) {
        path.push(cur);
        if (cur === s) break;
        cur = parent[cur];
      }
      path.reverse();
      const expected = path.map(String);

      return {
        prompt: `Shortest path (vertices): enter one shortest path from ${s} to ${t} as a vertex sequence.`,
        ui: { type: "sequence", length: expected.length },
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
        answer: expected,
        check: (user) => Array.isArray(user) && user.join(",") === expected.join(","),
        solution: `1) Run Dijkstra from $s=${s}$ (all weights are nonnegative).
2) Store a parent/predecessor when a relaxation improves a distance.
3) Reconstruct by following parents from $t$ back to $s$.
4) One shortest path is: ${path.join(" ")}. (distance = ${dist[t]})`,
      };
    }

    // Default: distance value drill.
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
      solution: `1) Initialize $d[${s}]=0$ and all other $d[v]=\infty$.
2) Repeatedly pick the unvisited vertex with smallest tentative distance.
3) Relax all outgoing edges $(u,v)$: if $d[v] > d[u] + w(u,v)$, update it.
4) When finished, the shortest distance to ${t} is $d[${t}]=${dist}$.`,
    };
  }

  function genMST() {
    const g = makeReadableUndirectedWeightedGraph();
    const n = g.nodes.length;
    const edges = g.edges;
    const type = sample(["weight", "kruskal_order", "prim_order", "safeedge", "cut_property", "complexity", "uniqueness"]);

    if (type === "cut_property") {
      const prompt = `State the Cut Property for MSTs.`;
      return {
        prompt,
        answer: ["minimum weight edge crossing any cut is in some MST"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("minimum") || u.includes("light")) && 
                 (u.includes("cut") || u.includes("cross")) &&
                 (u.includes("mst") || u.includes("safe"));
        },
        solution: `**Cut Property:**

For any cut $(S, V \\setminus S)$ of the graph, the minimum weight edge crossing the cut belongs to some MST.

**Formally:** Let $e = (u, v)$ be a minimum-weight edge with $u \\in S$ and $v \\notin S$. Then $e$ is in some MST.

**Why it works:** If an MST $T$ doesn't contain $e$, adding $e$ creates a cycle. This cycle must cross the cut again, so swapping $e$ for that heavier edge gives an MST with $e$.`,
      };
    }

    if (type === "complexity") {
      const algo = sample(["kruskal", "prim"]);
      if (algo === "kruskal") {
        const prompt = `What is the time complexity of Kruskal's algorithm using union-find with path compression?`;
        return {
          prompt,
          answer: ["O(E log E)", "O(E log V)", "O(|E| log |E|)"],
          check: (user) => {
            const u = normalize(user).replace(/\s+/g, "");
            return u.includes("eloge") || u.includes("elogv") || u.includes("|e|log");
          },
          solution: `**Kruskal's Complexity: $O(E \\log E)$**

1) Sort edges: $O(E \\log E)$.
2) Union-find operations: $O(E \\cdot \\alpha(V))$ where $\\alpha$ is inverse Ackermann.
3) Since $\\alpha(V)$ is nearly constant, total is $O(E \\log E)$.
4) Note: $O(E \\log E) = O(E \\log V)$ since $E \\le V^2$.`,
        };
      } else {
        const prompt = `What is the time complexity of Prim's algorithm using a binary heap?`;
        return {
          prompt,
          answer: ["O(E log V)", "O((E+V) log V)", "O(|E| log |V|)"],
          check: (user) => {
            const u = normalize(user).replace(/\s+/g, "");
            return u.includes("elogv") || u.includes("(e+v)logv") || u.includes("|e|log|v|");
          },
          solution: `**Prim's Complexity (binary heap): $O(E \\log V)$**

1) Each vertex is extracted once: $O(V \\log V)$.
2) Each edge causes at most one decrease-key: $O(E \\log V)$.
3) Total: $O((V + E) \\log V) = O(E \\log V)$ for connected graphs.

**With Fibonacci heap:** $O(E + V \\log V)$.`,
        };
      }
    }

    if (type === "uniqueness") {
      const prompt = `When is the MST unique?`;
      return {
        prompt,
        answer: ["all edge weights are distinct", "no two edges have same weight"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("distinct") || u.includes("unique") || u.includes("different") || u.includes("no tie");
        },
        solution: `**MST Uniqueness:**

The MST is unique if and only if all edge weights are distinct.

**Proof idea:**
- If all weights are distinct, there's a unique minimum-weight edge crossing each cut.
- If two edges have the same weight, they might be interchangeable in different MSTs.

**Example of non-unique MST:** Triangle with edges of weight 1, 1, 2. Two different MSTs exist.`,
      };
    }

    if (type === "safeedge") {
      const prompt = `MST cut property: consider any cut (S, V\\S). The minimum-weight edge crossing the cut is ____ (i.e., belongs to some MST). Answer with one word.`;
      return {
        prompt,
        answer: ["safe"],
        check: (user) => normalize(user).includes("safe"),
        solution: `1) (Cut property) Let $e$ be a light edge crossing a cut.
2) If an MST already contains $e$, done.
3) Otherwise, swapping $e$ into an MST replaces a heavier crossing edge without increasing total weight.
4) Therefore $e$ is safe (in some MST).`,
      };
    }

    if (type === "kruskal_order") {
      const picked = kruskalMSTOrder(n, edges);
      const expected = picked.map(([u, v]) => `${Math.min(u, v)}-${Math.max(u, v)}`);
      const prompt = `Run Kruskal and list the edges added (in order) as "u-v" (ignore weights).`;
      return {
        prompt,
        ui: { type: "sequence", length: expected.length },
        visual: {
          graph: {
            directed: false,
            nodes: g.nodes,
            pos: g.pos,
            edges: edges.map(([u, v, w]) => ({ u, v, label: w })),
          },
        },
        answer: expected,
        check: (user) => {
          if (!Array.isArray(user) || user.length !== expected.length) return false;
          for (let i = 0; i < expected.length; i++) {
            const nums = String(user[i]).match(/\d+/g)?.map(Number) ?? [];
            if (nums.length < 2) return false;
            const a = Math.min(nums[0], nums[1]);
            const b = Math.max(nums[0], nums[1]);
            if (`${a}-${b}` !== expected[i]) return false;
          }
          return true;
        },
        solution: `1) Sort edges by weight; scan and add if it doesn't create a cycle.
2) Edges added in order: ${expected.join(", ")}.`,
      };
    }

    if (type === "prim_order") {
      const start = 0;
      const picked = primMSTOrder(n, edges, start);
      const expected = picked.map(([u, v]) => `${Math.min(u, v)}-${Math.max(u, v)}`);
      const prompt = `Run Prim starting from ${start}. List the edges added (in order) as "u-v" (ignore weights).`;
      return {
        prompt,
        ui: { type: "sequence", length: expected.length },
        visual: {
          graph: {
            directed: false,
            nodes: g.nodes,
            pos: g.pos,
            edges: edges.map(([u, v, w]) => ({ u, v, label: w })),
          },
        },
        answer: expected,
        check: (user) => {
          if (!Array.isArray(user) || user.length !== expected.length) return false;
          for (let i = 0; i < expected.length; i++) {
            const nums = String(user[i]).match(/\d+/g)?.map(Number) ?? [];
            if (nums.length < 2) return false;
            const a = Math.min(nums[0], nums[1]);
            const b = Math.max(nums[0], nums[1]);
            if (`${a}-${b}` !== expected[i]) return false;
          }
          return true;
        },
        solution: `1) Maintain a tree set; repeatedly add the lightest edge from the tree to a new vertex.
2) Edges added in order: ${expected.join(", ")}.`,
      };
    }

    // Default: MST total weight
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
      solution: `1) Sort edges by increasing weight.
2) Scan edges: add an edge if it connects two different components (doesn't create a cycle).
3) Stop after selecting $V-1$ edges.
4) Total MST weight = ${mstWeight}.`,
    };
  }

  function genDP() {
    const type = sample(["lcs_matrix", "lcs_string", "knap", "lcs_recurrence", "optimal_substructure", "memoization", "tabulation"]);
    
    if (type === "lcs_recurrence") {
      const prompt = `Write the recurrence relation for LCS (Longest Common Subsequence) of strings X[1..m] and Y[1..n].`;
      return {
        prompt,
        answer: ["LCS[i][j] = LCS[i-1][j-1] + 1 if X[i]=Y[j], else max(LCS[i-1][j], LCS[i][j-1])"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          const hasMatch = u.includes("+1") || u.includes("1+");
          const hasMax = u.includes("max");
          const hasBase = u.includes("i-1") || u.includes("j-1");
          return hasMatch && hasMax && hasBase;
        },
        solution: `**LCS Recurrence:**

$$
\\text{LCS}[i][j] = \\begin{cases} 
0 & \\text{if } i=0 \\text{ or } j=0 \\\\
\\text{LCS}[i-1][j-1] + 1 & \\text{if } X[i] = Y[j] \\\\
\\max(\\text{LCS}[i-1][j], \\text{LCS}[i][j-1]) & \\text{otherwise}
\\end{cases}
$$

1) Base case: empty prefix has LCS length 0.
2) If characters match, extend the LCS.
3) Otherwise, take the better of dropping from either string.`,
      };
    }

    if (type === "optimal_substructure") {
      const prompt = `What is "optimal substructure" in dynamic programming?`;
      return {
        prompt,
        answer: ["optimal solution contains optimal solutions to subproblems"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("optimal") && u.includes("subproblem")) || 
                 (u.includes("solution") && u.includes("composed")) ||
                 (u.includes("best") && u.includes("sub"));
        },
        solution: `**Optimal Substructure:**

A problem has optimal substructure if an optimal solution can be constructed from optimal solutions of its subproblems.

**Examples:**
- Shortest paths: optimal path A→C through B = optimal A→B + optimal B→C.
- LCS: if last characters match, LCS includes that character + LCS of prefixes.

This property is essential for both greedy and DP algorithms.`,
      };
    }

    if (type === "memoization") {
      const prompt = `What is memoization in dynamic programming? How does it differ from tabulation?`;
      return {
        prompt,
        answer: ["top-down", "cache", "recursive with storage"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("top") || u.includes("cache") || u.includes("memo") || u.includes("recursive");
        },
        solution: `**Memoization (Top-Down DP):**

1) Start with the original problem and recurse.
2) Before computing a subproblem, check if it's already solved (cached).
3) Store results to avoid recomputation.

**vs Tabulation (Bottom-Up):**
- Tabulation fills the DP table iteratively from base cases.
- Memoization computes only needed subproblems lazily.`,
      };
    }

    if (type === "tabulation") {
      const prompt = `In bottom-up (tabulation) DP, in what order must we fill the table?`;
      return {
        prompt,
        answer: ["base cases first", "smaller subproblems first", "topological order"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("base") || u.includes("small") || u.includes("order") || u.includes("depend") || u.includes("topological");
        },
        solution: `**Tabulation Order:**

1) Start with base cases (smallest subproblems).
2) Fill entries in order such that when computing $dp[i][j]$, all its dependencies are already computed.
3) This is essentially a topological order on the subproblem DAG.

**Example (LCS):** Fill row by row, left to right.`,
      };
    }

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
        solution: `1) Define $dp[i][j]$ = LCS length of $S[0..i)$ and $T[0..j)$.
2) Base cases: $dp[0][*]=0$ and $dp[*][0]=0$.
3) Transition: if chars match, $dp[i][j]=dp[i-1][j-1]+1$; else $dp[i][j]=\\max(dp[i-1][j],dp[i][j-1])$.
4) Fill row-by-row (or col-by-col).
5) Final table (rows $i=0..${n}$, cols $j=0..${m}$):
${formatMatrix(dp)}
6) LCS length = $dp[${n}][${m}]=${dp[n][m]}$.`,
      };
    }

    if (type === "lcs_string") {
      const alphabet = ["A", "B", "C", "D"];
      const a = Array.from({ length: randInt(3, 4) }, () => sample(alphabet)).join("");
      const b = Array.from({ length: randInt(3, 4) }, () => sample(alphabet)).join("");
      const res = lcsOneString(a, b);
      const dp = res.dp;
      const optimalLen = dp[a.length][b.length];

      const prompt = `Give any one LCS string for S="${a}" and T="${b}" (length must be optimal).`;
      return {
        prompt,
        answer: [res.str],
        check: (user) => {
          const s = String(user ?? "")
            .toUpperCase()
            .replace(/\s+/g, "");
          if (!s) return optimalLen === 0;
          if (s.length !== optimalLen) return false;
          return isSubsequence(s, a) && isSubsequence(s, b);
        },
        solution: `1) Compute the LCS DP table (same recurrence as the matrix drill).
2) The optimal length is $dp[|S|][|T|]=${optimalLen}$.
3) Any common subsequence of length ${optimalLen} is a valid answer.
4) One valid LCS is: "${res.str}".
5) DP table (optional):
${formatMatrix(dp)}.`,
      };
    }

    // Default: knapsack
    const cap = randInt(6, 12);
    const items = Array.from({ length: 4 }, () => ({ w: randInt(1, 6), v: randInt(1, 12) }));
    const ans = knapsack01(items, cap);
    const prompt = `0/1 Knapsack: capacity=${cap}. Items (w,v)=${items.map((it) => `(${it.w},${it.v})`).join(" ")}. What is the optimal total value?`;
    return {
      prompt,
      answer: [String(ans)],
      check: (user) => normalize(user) === String(ans),
      solution: `1) Let $dp[c]$ be the best value achievable with capacity $c$.
2) For each item $(w,v)$, update capacities from high→low: $dp[c]=\\max(dp[c], dp[c-w]+v)$.
3) After processing all items, answer is $dp[${cap}]=${ans}$.`,
    };
  }

  function genGreedy() {
    const type = sample(["activity", "huffman", "greedy_choice", "fractional_knapsack", "matroid"]);
    
    if (type === "greedy_choice") {
      const prompt = `What is the "greedy choice property" in algorithm design?`;
      return {
        prompt,
        answer: ["locally optimal leads to global optimal", "best immediate choice"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("local") && u.includes("global")) || 
                 (u.includes("best") && u.includes("choice")) ||
                 u.includes("greedy choice");
        },
        solution: `**Greedy Choice Property:**

A problem has the greedy choice property if a globally optimal solution can be reached by making locally optimal (greedy) choices.

**Key points:**
1) At each step, make the choice that looks best right now.
2) This locally optimal choice leads to a globally optimal solution.
3) Unlike DP, we don't need to consider all subproblems.

**Examples:** Activity selection (pick earliest finish time), Huffman (combine smallest frequencies).`,
      };
    }

    if (type === "fractional_knapsack") {
      const cap = 10;
      const items = [
        { w: 4, v: 12 },  // ratio 3
        { w: 6, v: 12 },  // ratio 2
        { w: 2, v: 5 },   // ratio 2.5
      ];
      // Sort by value/weight ratio descending
      const sorted = [...items].sort((a, b) => (b.v / b.w) - (a.v / a.w));
      
      let remaining = cap;
      let total = 0;
      for (const item of sorted) {
        if (remaining >= item.w) {
          total += item.v;
          remaining -= item.w;
        } else {
          total += (remaining / item.w) * item.v;
          remaining = 0;
          break;
        }
      }

      const prompt = `Fractional Knapsack: capacity=${cap}. Items (w,v): (4,12), (6,12), (2,5). What is the optimal value using the greedy algorithm?`;
      return {
        prompt,
        answer: [String(total)],
        check: (user) => {
          const u = Number(normalize(user));
          return Math.abs(u - total) < 0.01;
        },
        solution: `**Greedy Fractional Knapsack:**

1) Compute value/weight ratio for each item:
   - (4,12): ratio = 3
   - (6,12): ratio = 2  
   - (2,5): ratio = 2.5

2) Sort by ratio (descending): (4,12), (2,5), (6,12)

3) Greedily take items:
   - Take all of (4,12): capacity used = 4, value = 12
   - Take all of (2,5): capacity used = 6, value = 17
   - Take 4/6 of (6,12): capacity used = 10, value = 17 + 8 = 25

**Optimal value: ${total}**`,
      };
    }

    if (type === "matroid") {
      const prompt = `What structure must a problem have for a greedy algorithm to be optimal?`;
      return {
        prompt,
        answer: ["greedy choice property and optimal substructure", "matroid"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("greedy") && u.includes("substructure")) || 
                 u.includes("matroid") ||
                 (u.includes("choice") && u.includes("property"));
        },
        solution: `**Conditions for Greedy Optimality:**

1) **Greedy Choice Property:** A locally optimal choice leads to a globally optimal solution.

2) **Optimal Substructure:** After making the greedy choice, the remaining problem is smaller but of the same type.

**Matroid Theory:** Many greedy algorithms can be proven correct using matroid theory, which generalizes when greedy works.

**Examples where greedy works:** MST (Kruskal's/Prim's), Activity Selection, Huffman Coding.`,
      };
    }

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
        solution: `1) Sort intervals by finish time (already sorted here).
2) Greedily take the earliest-finishing interval compatible with the last chosen finish.
3) Repeat until done.
4) Total selected = ${count}.`,
      };
    }

    // Default: Huffman
    const freqs = Array.from({ length: 5 }, () => randInt(1, 20)).sort((a, b) => a - b);
    const prompt = `Huffman coding: given frequencies ${freqs.join(", ")}, what are the two smallest frequencies combined first? Answer "x+y".`;
    const ans = `${freqs[0]}+${freqs[1]}`;
    return {
      prompt,
      answer: [ans, `${freqs[0]} + ${freqs[1]}`],
      check: (user) => normalize(user).replace(/\s+/g, "") === ans,
      solution: `1) Huffman builds a tree by repeatedly merging the two smallest frequencies.
2) The two smallest here are ${freqs[0]} and ${freqs[1]}.
3) First merge: ${freqs[0]}+${freqs[1]}.`,
    };
  }

  function genFlow() {
    const type = sample(["maxflow", "mincut", "residual1", "maxflow_mincut", "bipartite", "ff_complexity"]);
    const g = makeReadableFlowNetwork();
    const n = g.nodes.length;
    const s = 0;
    const t = 5;
    const edges = g.edges;

    if (type === "maxflow_mincut") {
      const prompt = `State the Max-Flow Min-Cut theorem.`;
      return {
        prompt,
        answer: ["max flow equals min cut"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("max") && u.includes("min") && u.includes("equal")) ||
                 (u.includes("flow") && u.includes("cut") && u.includes("="));
        },
        solution: `**Max-Flow Min-Cut Theorem:**

The maximum flow from source $s$ to sink $t$ equals the minimum capacity of any $s$-$t$ cut.

**Formally:** 
$$\\max_{f} |f| = \\min_{(S,T)} c(S,T)$$

Where:
- $|f|$ is the value of flow $f$
- $c(S,T)$ is the capacity of cut $(S,T)$ with $s \\in S$ and $t \\in T$

**Implication:** When Ford-Fulkerson terminates, the resulting cut is minimum.`,
      };
    }

    if (type === "bipartite") {
      const prompt = `How can max-flow be used to find a maximum bipartite matching?`;
      return {
        prompt,
        answer: ["add source and sink", "connect source to left, sink to right, edges capacity 1"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("source") || u.includes("sink")) ||
                 (u.includes("capacity") && u.includes("1")) ||
                 u.includes("bipartite");
        },
        solution: `**Maximum Bipartite Matching via Max-Flow:**

1) **Create super-source $s$:** Connect $s$ to all vertices in left partition with capacity 1.

2) **Create super-sink $t$:** Connect all vertices in right partition to $t$ with capacity 1.

3) **Original edges:** Direct edges from left to right with capacity 1.

4) **Run max-flow:** The max-flow value equals the maximum matching size.

5) **Recover matching:** Edges with flow = 1 form the matching.`,
      };
    }

    if (type === "ff_complexity") {
      const prompt = `What is the time complexity of Edmonds-Karp (BFS-based Ford-Fulkerson)?`;
      return {
        prompt,
        answer: ["O(VE^2)", "O(V*E^2)", "O(|V||E|^2)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("ve^2") || u.includes("ve2") || u.includes("|v||e|^2");
        },
        solution: `**Edmonds-Karp Complexity: $O(VE^2)$**

1) Each BFS takes $O(E)$ time.
2) Each augmentation increases the distance from $s$ to at least one vertex.
3) At most $O(VE)$ augmentations are needed.
4) Total: $O(VE) \\cdot O(E) = O(VE^2)$.

**Note:** Basic Ford-Fulkerson (DFS) can take $O(E \\cdot |f^*|)$ where $f^*$ is max flow value.`,
      };
    }

    if (type === "residual1") {
      const step = firstEdmondsKarpAugmentation(n, edges, s, t);
      if (step) {
        const edgeStr = step.path.map(([u, v]) => `${u}->${v}`).join(", ");
        const expected = step.residuals.map((r) => [String(r.fwd), String(r.back)]);
        const prompt = `Edmonds–Karp (first augmentation): BFS finds path ${edgeStr}. After augmenting by bottleneck Δ=${step.add}, fill a table with 2 columns for each path edge: [forward residual, backward residual].`;
        return {
          prompt,
          ui: { type: "matrix", rows: expected.length, cols: 2 },
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
          answer: expected,
          check: (user) => matrixEq(user, expected),
          solution: `1) Augment by $\\Delta = ${step.add}$ along the first BFS path.
2) For each path edge $(u,v)$: residual forward decreases by $\\Delta$, residual backward increases by $\\Delta$.
3) Residuals [fwd,back] for the path edges in order: ${formatMatrix(expected)}.`,
        };
      }
    }

    if (type === "mincut") {
      const res = edmondsKarpWithMinCut(n, edges, s, t);
      const cutS = res.cutS.slice().sort((x, y) => x - y);
      const expected = cutS.join(",");
      const prompt = `Min-cut (s=${s}, t=${t}): after max flow, let S be the vertices reachable from s in the final residual graph. Enter S as comma-separated ids (example: "0,1,2").`;

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
        answer: [expected],
        check: (user) => {
          const nums = String(user)
            .match(/\d+/g)
            ?.map((x) => Number(x))
            .filter((x) => Number.isFinite(x)) ?? [];
          const set = Array.from(new Set(nums)).sort((a, b) => a - b);
          return set.join(",") === expected;
        },
        solution: `1) Run Edmonds–Karp to compute a max flow.
2) In the final residual graph, do a BFS/DFS from $s$ following only edges with positive residual capacity.
3) The reachable vertices form $S$; the rest form $T$.
4) This $(S,T)$ is an $s$–$t$ minimum cut.
5) Here, $S = \\{${cutS.join(", ")}\\}$.`,
      };
    }

    // Default: max flow value
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
      solution: `1) Build the residual graph with remaining capacities and back edges.
2) Find an augmenting path from $s$ to $t$ (Edmonds–Karp uses BFS).
3) Augment by the bottleneck residual capacity on that path; update residual capacities.
4) Repeat until no augmenting path exists.
5) The resulting max flow value is ${ans}.`,
    };
  }

  // ===== Exam Prep True/False Generator =====
  function genExamPrep() {
    // Comprehensive pool of true/false questions covering typical exam topics
    const questions = [
      // Sorting & Complexity
      {
        statement: "The running time of Insertion sort is $O(n^2)$.",
        answer: true,
        explanation: "Insertion sort has worst-case and average-case $O(n^2)$ due to nested loops. Best case is $O(n)$ when already sorted, but $O(n^2)$ is still a valid upper bound."
      },
      {
        statement: "The running time of Heap sort is $O(n \\log n)$.",
        answer: true,
        explanation: "Heap sort builds a heap in $O(n)$ and performs $n$ extract-max operations each taking $O(\\log n)$, giving $O(n \\log n)$ total."
      },
      {
        statement: "Given two sorted arrays $A[1..n]$ and $B[1..n]$, we can merge them into one sorted array in $O(n)$ time.",
        answer: true,
        explanation: "The merge operation uses two pointers and makes a single pass through both arrays, resulting in $O(n)$ time."
      },
      {
        statement: "For any instance of size $n$, Insertion sort takes $\\Omega(n^2)$ time.",
        answer: false,
        explanation: "This is false. When the input is already sorted, Insertion sort runs in $O(n)$ time (best case). $\\Omega(n^2)$ would mean every input requires $n^2$ time."
      },
      {
        statement: "Insertion sort is stable.",
        answer: true,
        explanation: "Insertion sort preserves the relative order of equal elements because it only shifts elements that are strictly greater than the key."
      },
      {
        statement: "QuickSort is always $O(n \\log n)$.",
        answer: false,
        explanation: "QuickSort has worst-case $O(n^2)$ when pivots are consistently bad (e.g., already sorted input with first element as pivot). Expected time with random pivots is $O(n \\log n)$."
      },
      {
        statement: "For any input of $n$, the running time of randomized QuickSort is $O(n \\log n)$ in expectation.",
        answer: true,
        explanation: "Randomized QuickSort has expected running time $O(n \\log n)$ due to the high probability of balanced partitions."
      },
      {
        statement: "MergeSort is an in-place sorting algorithm.",
        answer: false,
        explanation: "MergeSort requires $O(n)$ auxiliary space for the merge step, so it is not in-place."
      },
      {
        statement: "HeapSort is a stable sorting algorithm.",
        answer: false,
        explanation: "HeapSort is not stable because the heap operations can change the relative order of equal elements."
      },

      // Asymptotic Notation
      {
        statement: "If $f = O(g)$ and $g = O(h)$, then we have $f = O(h)$.",
        answer: true,
        explanation: "Big-O is transitive. If $f \\le c_1 g$ for large $n$ and $g \\le c_2 h$ for large $n$, then $f \\le c_1 c_2 h$."
      },
      {
        statement: "$n \\log n = O(n^2)$.",
        answer: true,
        explanation: "Since $\\log n < n$ for $n > 1$, we have $n \\log n < n \\cdot n = n^2$, so $n \\log n = O(n^2)$."
      },
      {
        statement: "$n^2 = O(n \\log n)$.",
        answer: false,
        explanation: "$n^2$ grows faster than $n \\log n$, so $n^2$ is not $O(n \\log n)$."
      },
      {
        statement: "$2^{n+1} = O(2^n)$.",
        answer: true,
        explanation: "$2^{n+1} = 2 \\cdot 2^n$, which is just a constant factor times $2^n$."
      },
      {
        statement: "$2^{2n} = O(2^n)$.",
        answer: false,
        explanation: "$2^{2n} = (2^n)^2$, which grows much faster than $2^n$."
      },

      // Heaps
      {
        statement: "If we implement the min priority queue using a binary heap, we can implement Extract-Min in $O(1)$ time.",
        answer: false,
        explanation: "Extract-Min requires removing the root and then heapifying down, which takes $O(\\log n)$ time. Only Find-Min is $O(1)$."
      },
      {
        statement: "We can build a max heap in $O(n)$ time.",
        answer: true,
        explanation: "Build-Max-Heap runs heapify from the bottom up. The sum of work is $O(n)$ due to the geometric series where most nodes are near the bottom."
      },
      {
        statement: "In a max-heap, the smallest element must be a leaf.",
        answer: true,
        explanation: "In a max-heap, every parent is larger than its children, so the smallest element cannot have any children—it must be a leaf."
      },
      {
        statement: "Insert operation in a binary heap takes $O(\\log n)$ time.",
        answer: true,
        explanation: "Insert adds an element at the end and bubbles up, which takes at most $O(\\log n)$ swaps along the height of the tree."
      },

      // Selection
      {
        statement: "We can find the median of $n$ integers in $O(n)$ time.",
        answer: true,
        explanation: "The median-of-medians algorithm (k-SELECT) finds any order statistic, including the median, in worst-case $O(n)$ time."
      },
      {
        statement: "Finding the minimum of $n$ elements requires $\\Omega(n)$ comparisons.",
        answer: true,
        explanation: "Every element except the minimum must lose at least one comparison, requiring at least $n-1$ comparisons."
      },

      // Linear-Time Sorting
      {
        statement: "Suppose we are given $n$ integers with values ranging from 0 to 1000. There exist no linear time algorithms for sorting these $n$ numbers.",
        answer: false,
        explanation: "Counting sort can sort $n$ integers in range $[0, k]$ in $O(n + k)$ time. With $k = 1000$, this is $O(n)$."
      },
      {
        statement: "Radix sort requires a stable sorting algorithm for each digit.",
        answer: true,
        explanation: "Radix sort processes digits from least to most significant. Stability ensures that the ordering from previous digits is preserved."
      },
      {
        statement: "Comparison-based sorting algorithms have a lower bound of $\\Omega(n \\log n)$.",
        answer: true,
        explanation: "The decision tree model shows that any comparison-based sort needs at least $\\log_2(n!) = \\Omega(n \\log n)$ comparisons."
      },

      // Decision Trees & Lower Bounds
      {
        statement: "In the decision tree of the MergeSort algorithm on $n$ elements, every path from the root to a leaf node in the tree has at most $O(n \\log n)$ edges.",
        answer: true,
        explanation: "Each comparison is an edge. MergeSort makes at most $O(n \\log n)$ comparisons, so each root-to-leaf path has at most that many edges."
      },

      // Matrix Multiplication
      {
        statement: "Strassen's algorithm can multiply two $n \\times n$ matrices in $O(n^2)$ time.",
        answer: false,
        explanation: "Strassen's algorithm runs in $O(n^{\\log_2 7}) \\approx O(n^{2.81})$, which is better than $O(n^3)$ but not $O(n^2)$."
      },
      {
        statement: "The naive matrix multiplication algorithm runs in $O(n^3)$ time.",
        answer: true,
        explanation: "Naive matrix multiplication uses three nested loops, each iterating $n$ times, giving $O(n^3)$."
      },

      // Recurrences
      {
        statement: "If we solve $T(n) = 4T(n/2) + n$, then we obtain $T(n) = \\Theta(n \\log n)$.",
        answer: false,
        explanation: "Using Master Theorem: $a=4$, $b=2$, $f(n)=n$. Since $n^{\\log_2 4} = n^2 > n$, Case 1 applies: $T(n) = \\Theta(n^2)$."
      },
      {
        statement: "For $T(n) = 2T(n/2) + \\Theta(n^2)$, we get $T(n) = \\Theta(n^2)$.",
        answer: true,
        explanation: "Master Theorem Case 3: $n^{\\log_2 2} = n$, and $n^2$ dominates $n$, so $T(n) = \\Theta(n^2)$."
      },
      {
        statement: "For $T(n) = 2T(n/2) + \\Theta(n)$, we get $T(n) = \\Theta(n \\log n)$.",
        answer: true,
        explanation: "Master Theorem Case 2: $a = b^d$ where $a=2$, $b=2$, $d=1$, so $T(n) = \\Theta(n \\log n)$."
      },

      // Trees & Graphs Basics
      {
        statement: "If we add an edge to a tree, it creates a cycle.",
        answer: true,
        explanation: "A tree on $n$ vertices has exactly $n-1$ edges and is connected. Adding any edge creates a cycle since there's already a path between any two vertices."
      },
      {
        statement: "Any undirected graph $G = (V, E)$ with $|V| = |E|$ must be connected.",
        answer: false,
        explanation: "A graph can have $|V| = |E|$ and still be disconnected. For example: a triangle (3 vertices, 3 edges) plus an isolated vertex (4 vertices, 3 edges)—wait, that's $|V| \\neq |E|$. Actually: 4 vertices forming a cycle (4 edges) vs 3 vertices with 3 edges triangle + 1 isolated = 4V, 3E. Consider: 5 vertices, 5 edges could be a 4-cycle plus an isolated vertex with a self-loop... Simpler: a tree on 4 vertices has 3 edges; adding 1 edge makes a cycle with 4 edges = 4 vertices. But two components with a total of 4 vertices and 4 edges: e.g., two triangles sharing a vertex = 5 vertices, 6 edges. Better example: Consider 4 vertices: one triangle (3V, 3E) + one isolated vertex = 4V, 3E. To get 4V, 4E: one 4-cycle is connected. But a triangle (3E) + one edge elsewhere among 4 vertices... The key insight: a connected graph on $n$ vertices has at least $n-1$ edges. With $|V|=|E|=n$, there's exactly one cycle. But multiple components could also have $|V|=|E|$: two separate components each containing exactly one cycle. Example: two triangles = 6V, 6E, not connected."
      },
      {
        statement: "A tree with $n$ vertices has exactly $n - 1$ edges.",
        answer: true,
        explanation: "By definition, a tree is a connected acyclic graph, and any such graph on $n$ vertices has exactly $n-1$ edges."
      },
      {
        statement: "Every connected undirected graph has a spanning tree.",
        answer: true,
        explanation: "We can construct a spanning tree by running BFS or DFS from any vertex, or by removing edges from cycles until no cycles remain."
      },

      // BFS & DFS
      {
        statement: "We can implement BFS using a stack.",
        answer: false,
        explanation: "BFS uses a queue (FIFO) to explore vertices in order of distance. Using a stack gives DFS behavior, not BFS."
      },
      {
        statement: "BFS can find shortest paths in weighted graphs.",
        answer: false,
        explanation: "BFS finds shortest paths only in unweighted graphs (or graphs with uniform edge weights). For weighted graphs, use Dijkstra or Bellman-Ford."
      },
      {
        statement: "DFS can be used to detect cycles in a directed graph.",
        answer: true,
        explanation: "A directed graph has a cycle if and only if DFS finds a back edge (an edge to a gray/in-progress vertex)."
      },
      {
        statement: "BFS and DFS both run in $O(V + E)$ time using adjacency lists.",
        answer: true,
        explanation: "Both algorithms visit each vertex once and examine each edge once (or twice for undirected graphs), giving $O(V + E)$."
      },

      // Shortest Paths
      {
        statement: "Given a DAG $G = (V, E)$ with weighted edges, we can compute the shortest distance from $s \\in V$ to each vertex in time $O(V + E)$.",
        answer: true,
        explanation: "For a DAG, we can topologically sort in $O(V+E)$, then relax edges in topological order. Each edge is relaxed once, giving $O(V + E)$ total."
      },
      {
        statement: "If we run Bellman-Ford algorithm, for any unreachable vertex $v$, we have $v.d = \\infty$ at the end of the algorithm.",
        answer: true,
        explanation: "Bellman-Ford initializes all distances to $\\infty$ except the source. If a vertex is unreachable, no relaxation will ever update its distance."
      },
      {
        statement: "The running time of Dijkstra's algorithm is $O(V + E)$.",
        answer: false,
        explanation: "Dijkstra's algorithm is $O((V + E) \\log V)$ with a binary heap, or $O(V^2)$ with an array. It cannot be $O(V+E)$ because of the priority queue operations."
      },
      {
        statement: "Dijkstra's algorithm works correctly with negative edge weights.",
        answer: false,
        explanation: "Dijkstra's algorithm assumes non-negative edge weights. With negative edges, a settled vertex might later find a shorter path, violating the algorithm's correctness."
      },
      {
        statement: "Bellman-Ford can detect negative-weight cycles.",
        answer: true,
        explanation: "After $V-1$ relaxation passes, if any edge can still be relaxed, there is a negative-weight cycle reachable from the source."
      },
      {
        statement: "If all edge weights are 1, BFS can compute shortest paths.",
        answer: true,
        explanation: "With unit edge weights, the number of edges equals the path weight. BFS explores by number of edges, so it finds shortest paths."
      },

      // MST
      {
        statement: "Kruskal's algorithm runs in $O(E \\log E)$ time.",
        answer: true,
        explanation: "Kruskal's sorts edges in $O(E \\log E)$ and uses Union-Find operations that are nearly $O(1)$ amortized, giving $O(E \\log E)$ total."
      },
      {
        statement: "If all edge weights in a graph are distinct, the MST is unique.",
        answer: true,
        explanation: "With distinct edge weights, the cut property uniquely determines which edge to add at each step, resulting in a unique MST."
      },
      {
        statement: "Prim's algorithm can start from any vertex and will produce the same MST if edge weights are distinct.",
        answer: true,
        explanation: "With distinct weights, the MST is unique. Prim's algorithm will find this unique MST regardless of the starting vertex."
      },

      // Greedy & Huffman
      {
        statement: "Any fixed-length code is prefix-free.",
        answer: true,
        explanation: "In a fixed-length code, all codewords have the same length, so no codeword can be a prefix of another."
      },
      {
        statement: "Huffman coding produces an optimal prefix-free code.",
        answer: true,
        explanation: "Huffman's greedy algorithm produces a prefix-free code with minimum expected length for the given symbol frequencies."
      },
      {
        statement: "A greedy algorithm always produces an optimal solution.",
        answer: false,
        explanation: "Greedy algorithms only work for problems with the greedy-choice property and optimal substructure. Many problems (like 0/1 knapsack) require DP."
      },

      // Network Flow
      {
        statement: "The max-flow min-cut theorem states that the maximum flow equals the minimum cut capacity.",
        answer: true,
        explanation: "This fundamental theorem shows that the value of a maximum $s$-$t$ flow equals the capacity of a minimum $s$-$t$ cut."
      },
      {
        statement: "Ford-Fulkerson always terminates with integer capacities.",
        answer: true,
        explanation: "With integer capacities, each augmentation increases the flow by at least 1, so the algorithm terminates in at most $|f^*|$ iterations."
      },
      {
        statement: "Edmonds-Karp algorithm runs in $O(VE^2)$ time.",
        answer: true,
        explanation: "Edmonds-Karp uses BFS to find shortest augmenting paths, guaranteeing $O(VE)$ augmentations, each taking $O(E)$ time."
      },

      // Dynamic Programming
      {
        statement: "Dynamic programming is applicable when a problem has optimal substructure and overlapping subproblems.",
        answer: true,
        explanation: "These are the two key properties that make DP effective: optimal solutions contain optimal sub-solutions, and the same subproblems recur."
      },
      {
        statement: "Memoization and tabulation produce the same results.",
        answer: true,
        explanation: "Both are methods to avoid recomputing subproblems. Memoization is top-down with caching; tabulation is bottom-up with a table."
      },
      {
        statement: "The LCS (Longest Common Subsequence) problem can be solved in $O(mn)$ time where $m$ and $n$ are the lengths of the two sequences.",
        answer: true,
        explanation: "The standard DP solution fills an $m \\times n$ table, with each cell computed in $O(1)$ time."
      },

      // Topological Sort
      {
        statement: "A topological ordering exists if and only if the graph is a DAG.",
        answer: true,
        explanation: "A directed graph has a topological order iff it has no directed cycles. DFS or Kahn's algorithm can find this ordering."
      },
      {
        statement: "Running DFS and ordering vertices by decreasing finish time gives a topological sort.",
        answer: true,
        explanation: "In a DAG, if $(u,v)$ is an edge, DFS finishes $v$ before $u$. So decreasing finish time order respects all edges."
      },

      // SCCs
      {
        statement: "The component graph (DAG of SCCs) of any directed graph is always a DAG.",
        answer: true,
        explanation: "If there were a cycle among SCCs, all vertices in those SCCs would be mutually reachable, contradicting that they are separate SCCs."
      },
      {
        statement: "Kosaraju's algorithm finds all strongly connected components in $O(V + E)$ time.",
        answer: true,
        explanation: "Kosaraju's runs two DFS traversals, each taking $O(V + E)$ time, for a total of $O(V + E)$."
      },

      // Edge Classification
      {
        statement: "In DFS of a directed graph, a back edge indicates a cycle.",
        answer: true,
        explanation: "A back edge goes from a vertex to an ancestor in the DFS tree, creating a cycle with the tree path."
      },
      {
        statement: "In an undirected graph DFS, all non-tree edges are back edges.",
        answer: true,
        explanation: "In undirected graphs, when we encounter an already-visited neighbor, it must be an ancestor (back edge). Forward and cross edges don't exist."
      },

      // RAM Model
      {
        statement: "In the RAM (Random Access Machine) model, each basic operation takes $O(1)$ time.",
        answer: true,
        explanation: "The RAM model assumes constant-time arithmetic operations, comparisons, and memory access for analysis purposes."
      },
      {
        statement: "The RAM model allows parallel computation.",
        answer: false,
        explanation: "The basic RAM model assumes a single processor executing instructions sequentially. Parallel models (like PRAM) are extensions."
      }
    ];

    // Select a random question
    const q = sample(questions);
    const correctAnswer = q.answer ? "True" : "False";

    return {
      prompt: `True or False: ${q.statement}`,
      answer: [correctAnswer.toLowerCase(), correctAnswer],
      check: (user) => {
        const u = normalize(user);
        if (q.answer) {
          return u === "true" || u === "t" || u === "yes" || u === "1";
        } else {
          return u === "false" || u === "f" || u === "no" || u === "0";
        }
      },
      solution: `**${correctAnswer}**\n\n${q.explanation}`
    };
  }

  // ===== Conceptual Short Answer Generator =====
  function genConceptual() {
    const questions = [
      // RAM Model
      {
        prompt: "Briefly explain the Random Access Model (RAM). Name at least two key assumptions.",
        acceptableKeywords: ["single processor", "no parallel", "O(1)", "constant time", "basic operation", "random access", "memory"],
        minKeywords: 2,
        answer: "Single processor, O(1) basic operations, random memory access",
        solution: `The RAM (Random Access Machine) model has three key assumptions:

1. **Single processor** - No parallel computing; instructions execute sequentially.
2. **O(1) basic operations** - Each basic operation (arithmetic, comparison, assignment) takes constant time.
3. **Simple memory structure** - Random memory access in O(1) time (can access any memory location directly).

For full credit, explain at least two of these three correctly.`
      },
      // Optimality of Subpaths
      {
        prompt: "Explain the 'optimality of subpaths' lemma used in shortest path algorithms.",
        acceptableKeywords: ["subpath", "shortest path", "optimal", "between", "endpoints"],
        minKeywords: 2,
        answer: "Any subpath of a shortest path is also a shortest path",
        solution: `**Optimality of Subpaths Lemma:**

Any subpath of a shortest path must be a shortest path between the two ending points of the subpath.

**Proof idea:** If there were a shorter subpath, we could substitute it to get a shorter overall path, contradicting that we started with a shortest path.

**Example:** If $s \\to a \\to b \\to c \\to t$ is a shortest path from $s$ to $t$, then $a \\to b \\to c$ must be a shortest path from $a$ to $c$.`
      },
      // Triangle Inequality
      {
        prompt: "Explain why $\\delta(s, v) \\le \\delta(s, u) + w(u, v)$ for any edge $(u, v)$.",
        acceptableKeywords: ["path", "edge", "distance", "shorter", "at most", "followed by"],
        minKeywords: 2,
        answer: "Path to u followed by edge (u,v) is a valid path to v",
        solution: `**Triangle Inequality for Shortest Paths:**

$\\delta(s, v) \\le \\delta(s, u) + w(u, v)$ for any edge $(u, v)$.

**Explanation:** Any path from $s$ to $u$ followed by the edge $(u, v)$ forms a valid path from $s$ to $v$.

Therefore, the shortest distance from $s$ to $v$ is at most the shortest distance from $s$ to $u$ plus the weight $w(u, v)$.

This is the basis for the **relaxation** operation in Dijkstra and Bellman-Ford.`
      },
      // Radix Sort for Vectors
      {
        prompt: "Suppose we want to sort vectors $v_i = \\langle v_i(5), v_i(4), v_i(3), v_i(2), v_i(1) \\rangle$ in $O(n)$ time, where each entry is an integer between 0 and 1000. Explain how.",
        acceptableKeywords: ["radix", "counting sort", "stable", "digit", "right to left", "least significant"],
        minKeywords: 1,
        answer: "Radix sort (or counting sort on each position from right to left)",
        solution: `**Solution: Radix Sort**

Use **Radix Sort** with each vector position as a "digit":

1. Start with the rightmost position $v_i(1)$ (least significant).
2. Apply **Counting Sort** (stable!) on position $v_i(1)$.
3. Then sort by $v_i(2)$, then $v_i(3)$, ..., finally $v_i(5)$.

**Why it works:**
- Counting sort is $O(n + k)$ where $k = 1000$.
- We do this 5 times (constant), so total is $O(5(n + 1000)) = O(n)$.
- Stability ensures earlier sorts are preserved.`
      },
      // Why Prim is Correct
      {
        prompt: "Explain why Prim's algorithm correctly finds a Minimum Spanning Tree. Assume distinct edge weights.",
        acceptableKeywords: ["safe edge", "cheapest", "cut", "tree", "crossing"],
        minKeywords: 2,
        answer: "Each edge added is the cheapest crossing the cut, making it safe",
        solution: `**Why Prim's Algorithm is Correct:**

Let $T$ denote the current tree being built.

At each step, Prim's adds the **cheapest edge** between $T$'s vertices and the remaining vertices.

This edge crosses the **cut** $(T, V - T)$ and is the minimum-weight edge crossing that cut.

By the **Cut Property**, the lightest edge crossing any cut is a **safe edge** — it must be in some MST.

Since we only add safe edges and eventually connect all vertices, we get an MST.`
      },
      // Safe Edge Proof
      {
        prompt: "Prove that a safe edge (the minimum weight edge crossing a cut) must be in every MST, assuming distinct edge weights.",
        acceptableKeywords: ["cycle", "replace", "path", "contradiction", "cost", "decrease", "unique"],
        minKeywords: 2,
        answer: "Adding the safe edge creates a cycle; swapping it with another crossing edge reduces cost",
        solution: `**Proof by Contradiction:**

Suppose there is an MST $T$ that doesn't include a safe edge $(u, v)$ for some cut $(S, V-S)$.

1. Since $T$ is connected, there is a unique path $P$ between $u$ and $v$ in $T$.

2. $P \\cup \\{(u,v)\\}$ forms a **cycle**.

3. Since $u \\in S$ and $v \\in V-S$, path $P$ must cross the cut somewhere via another edge $(x, y)$.

4. **Replace** $(x, y)$ with $(u, v)$: The result is still connected (still a spanning tree).

5. Since $(u, v)$ is the **cheapest** edge crossing the cut: $w(u,v) < w(x,y)$.

6. The new tree has **lower cost** — contradiction!

Therefore, every MST must include all safe edges.`
      },
      // Describe Dijkstra
      {
        prompt: "Describe Dijkstra's algorithm. For full points, include the data structure used.",
        acceptableKeywords: ["priority queue", "min-heap", "extract-min", "relax", "decrease-key", "infinity", "distance"],
        minKeywords: 3,
        answer: "Use min-priority queue; repeatedly extract-min and relax outgoing edges",
        solution: `**Dijkstra's Algorithm:**

1. **Initialize:** Set $v.d = \\infty$ for all vertices; set $s.d = 0$.

2. **Data Structure:** Add all vertices to a **minimum priority queue** using $v.d$ as the key.

3. **Main Loop:** While queue is not empty:
   - **Extract-Min:** Remove vertex $u$ with minimum $d$ value.
   - **Relax** all edges $(u, v)$ leaving $u$:
     - If $u.d + w(u,v) < v.d$, update $v.d$ and use **Decrease-Key** operation.

4. When done, $v.d$ contains the shortest distance from $s$ to $v$.

**Time Complexity:** $O((V + E) \\log V)$ with a binary heap.`
      },
      // Describe Bellman-Ford
      {
        prompt: "Describe the Bellman-Ford algorithm. Include how it detects negative-weight cycles.",
        acceptableKeywords: ["relax", "V-1", "times", "negative cycle", "update", "pass", "edges"],
        minKeywords: 3,
        answer: "Relax all edges V-1 times; if any edge can still be relaxed, there's a negative cycle",
        solution: `**Bellman-Ford Algorithm:**

1. **Initialize:** Set $v.d = \\infty$ for all vertices; set $s.d = 0$.

2. **Main Loop:** Repeat $|V| - 1$ times:
   - For each edge $(u, v) \\in E$: **Relax** the edge.
   - (If $u.d + w(u,v) < v.d$, set $v.d = u.d + w(u,v)$)

3. **Negative Cycle Detection:** Try to relax all edges one more time.
   - If any $v.d$ is updated, return **False** (negative cycle exists).
   - Otherwise return **True** (distances are correct).

**Why $|V| - 1$ iterations?** Any shortest path has at most $|V| - 1$ edges. Each iteration ensures at least one more edge of every shortest path is correctly computed.`
      },
      // Find Min-Cut
      {
        prompt: "Explain how to find an $s$-$t$ minimum cut after computing a maximum flow.",
        acceptableKeywords: ["residual", "reachable", "BFS", "DFS", "capacity", "S", "T", "partition"],
        minKeywords: 2,
        answer: "S = vertices reachable from s in residual graph; T = the rest",
        solution: `**Finding the Minimum Cut:**

After computing a max flow $f$:

1. Build the **residual graph** $G_f$ (edges with remaining capacity > 0).

2. Run **BFS/DFS from $s$** in $G_f$ to find all vertices reachable from $s$.

3. Let $S$ = vertices reachable from $s$ in $G_f$.
   Let $T$ = all other vertices (including $t$).

4. Return the cut $(S, T)$.

**Why it works:** Since $t$ is not reachable from $s$ in $G_f$ (no augmenting path exists), every edge crossing from $S$ to $T$ is fully saturated. The capacity of this cut equals the max flow value.`
      },
      // Bipartite Matching via Max Flow
      {
        prompt: "Explain how to solve Maximum Bipartite Matching using the max flow algorithm.",
        acceptableKeywords: ["source", "sink", "capacity 1", "L", "R", "orient", "edges", "flow"],
        minKeywords: 3,
        answer: "Add source to L, sink to R, capacity 1 on all edges, find max flow",
        solution: `**Maximum Bipartite Matching via Max Flow:**

Given bipartite graph $G = (L \\cup R, E)$:

1. **Create source $s$:** Connect $s$ to every vertex in $L$ with capacity 1.

2. **Create sink $t$:** Connect every vertex in $R$ to $t$ with capacity 1.

3. **Orient edges:** Direct all edges from $L$ to $R$ with capacity 1.

4. **Run max flow** algorithm (e.g., Ford-Fulkerson / Edmonds-Karp).

5. **Extract matching:** Edges between $L$ and $R$ with non-zero flow form the maximum matching.

**Why it works:** Capacity 1 ensures each vertex is matched at most once. Max flow maximizes the number of matched pairs.`
      },
      // Topological Sort Correctness
      {
        prompt: "The topological sort algorithm runs DFS and orders vertices by decreasing finish time. Prove: for every edge $(u, v)$, we have $u.f > v.f$.",
        acceptableKeywords: ["back edge", "DAG", "tree", "forward", "cross", "gray", "white", "black", "parenthesis"],
        minKeywords: 2,
        answer: "No back edges in DAG; tree/forward edges have u.f > v.f; cross edges also have u.f > v.f",
        solution: `**Proof of Topological Sort Correctness:**

For every edge $(u, v)$ in a DAG, we need $u.f > v.f$.

**Key insight:** Since the graph is a DAG, there are **no back edges** (back edges create cycles).

**Case analysis by edge type:**

1. **Tree or Forward edge:** $u$ is an ancestor of $v$ in the DFS tree.
   By the Parenthesis Theorem, $[v.d, v.f] \\subset [u.d, u.f]$, so $v.f < u.f$. ✓

2. **Cross edge:** When exploring $(u, v)$, $v$ is already black (finished).
   Since $v$ finished before we finished $u$: $v.f < u.f$. ✓

**Alternative proof:** When exploring $(u, v)$:
- $v$ gray → back edge → impossible in DAG
- $v$ white → $v$ becomes descendant → $v.f < u.f$ (parenthesis theorem)
- $v$ black → $v$ already finished → $v.f < u.f$`
      },
      // DFS Edge Classification
      {
        prompt: "In DFS of a directed graph, what are the four types of edges? How can you identify each?",
        acceptableKeywords: ["tree", "back", "forward", "cross", "white", "gray", "black", "ancestor", "descendant"],
        minKeywords: 4,
        answer: "Tree (to white), Back (to gray ancestor), Forward (to black descendant), Cross (to black non-descendant)",
        solution: `**Four Types of DFS Edges:**

When exploring edge $(u, v)$, classify by $v$'s color:

1. **Tree Edge:** $v$ is **white** (unvisited)
   - $v$ becomes a child of $u$ in the DFS tree

2. **Back Edge:** $v$ is **gray** (in the recursion stack)
   - $v$ is an ancestor of $u$
   - **Indicates a cycle!**

3. **Forward Edge:** $v$ is **black** AND $v$ is a descendant of $u$
   - We finished $v$ before finishing $u$
   - $u.d < v.d < v.f < u.f$

4. **Cross Edge:** $v$ is **black** AND $v$ is NOT a descendant of $u$
   - Edge goes to a different subtree or earlier-finished branch
   - $v.f < u.d$

**In undirected graphs:** Only tree and back edges exist.`
      },
      // SCC Algorithm
      {
        prompt: "Describe Kosaraju's algorithm for finding strongly connected components.",
        acceptableKeywords: ["DFS", "transpose", "reverse", "finish time", "decreasing", "component", "two"],
        minKeywords: 3,
        answer: "Run DFS for finish times; run DFS on transpose in decreasing finish order",
        solution: `**Kosaraju's Algorithm for SCCs:**

1. **First DFS on $G$:**
   - Run DFS on the original graph $G$.
   - Record vertices by decreasing finish time (or push to stack when finished).

2. **Compute $G^T$:**
   - Create the transpose graph (reverse all edges).

3. **Second DFS on $G^T$:**
   - Process vertices in decreasing finish time order (from step 1).
   - Each DFS tree in this pass is one SCC.

**Time Complexity:** $O(V + E)$ — two DFS passes.

**Why it works:** The first DFS orders components so that in $G^T$, we process "sink" SCCs first. Each DFS in step 3 can only reach vertices in the same SCC.`
      },
      // LCS Recurrence
      {
        prompt: "Write the recurrence for the LCS (Longest Common Subsequence) dynamic programming solution.",
        acceptableKeywords: ["match", "max", "i-1", "j-1", "c[i][j]", "equal", "not equal"],
        minKeywords: 2,
        answer: "c[i,j] = c[i-1,j-1]+1 if match, else max(c[i-1,j], c[i,j-1])",
        solution: `**LCS Recurrence:**

Let $c[i, j]$ = length of LCS of $X[1..i]$ and $Y[1..j]$.

**Base cases:**
$$c[0, j] = 0 \\text{ for all } j$$
$$c[i, 0] = 0 \\text{ for all } i$$

**Recurrence:**
$$c[i, j] = \\begin{cases} 
c[i-1, j-1] + 1 & \\text{if } x_i = y_j \\\\
\\max(c[i-1, j], c[i, j-1]) & \\text{if } x_i \\neq y_j
\\end{cases}$$

**Intuition:**
- If characters match: extend LCS of prefixes by 1.
- If not: take the better of excluding $x_i$ or excluding $y_j$.

**Time:** $O(mn)$ where $m = |X|$, $n = |Y|$.`
      },
      // Unit Weight Shortest Path
      {
        prompt: "If all edge weights are 1 in a directed graph, what is the fastest algorithm to find shortest paths from $s$? What is the running time?",
        acceptableKeywords: ["BFS", "O(V+E)", "queue", "unweighted", "level"],
        minKeywords: 2,
        answer: "BFS in O(V + E) time",
        solution: `**Solution: Breadth-First Search (BFS)**

When all edge weights are 1 (unweighted graph), use **BFS** starting from $s$.

**Running Time:** $O(V + E)$

**Why BFS works:**
- BFS explores vertices level by level (by number of edges from source).
- With unit weights, the number of edges = path weight.
- So BFS naturally finds shortest paths.

**Compare to Dijkstra:** Dijkstra is $O((V+E) \\log V)$, which is slower. BFS is optimal for unweighted graphs.`
      }
    ];

    // Select a random question
    const q = sample(questions);

    return {
      prompt: q.prompt,
      answer: [q.answer],
      check: (user) => {
        // Check if user's answer contains enough key concepts
        const u = normalize(user);
        let matchCount = 0;
        for (const kw of q.acceptableKeywords) {
          if (u.includes(normalize(kw))) {
            matchCount++;
          }
        }
        return matchCount >= q.minKeywords;
      },
      solution: q.solution
    };
  }

  // ===== Pseudocode Reading Generator =====
  function genPseudocode() {
    const questions = [
      // Binary Search trace
      {
        type: "trace",
        code: `def binary_search(A, x):
    lo, hi = 0, len(A) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if A[mid] == x:
            return mid
        elif A[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
        prompt: "Trace binary_search on A = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] searching for x = 23. What values does `mid` take (in order)?",
        answer: ["4, 7, 5", "4,7,5"],
        check: (user) => {
          const nums = String(user).match(/\d+/g)?.map(Number) ?? [];
          return nums.length === 3 && nums[0] === 4 && nums[1] === 7 && nums[2] === 5;
        },
        solution: `**Trace of binary_search(A, 23):**

1) lo=0, hi=9 → mid=(0+9)//2 = **4**, A[4]=16 < 23, so lo=5
2) lo=5, hi=9 → mid=(5+9)//2 = **7**, A[7]=56 > 23, so hi=6
3) lo=5, hi=6 → mid=(5+6)//2 = **5**, A[5]=23 == 23, return 5

**Mid values in order: 4, 7, 5**`
      },
      // Insertion sort invariant
      {
        type: "invariant",
        code: `def insertion_sort(A):
    for i in range(1, len(A)):
        key = A[i]
        j = i - 1
        while j >= 0 and A[j] > key:
            A[j + 1] = A[j]
            j -= 1
        A[j + 1] = key`,
        prompt: "What is the loop invariant for the outer `for` loop in insertion_sort?",
        answer: ["A[0..i-1] is sorted", "prefix sorted"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("sort") && (u.includes("0") || u.includes("prefix") || u.includes("first"))) ||
                 u.includes("a[0..i") || u.includes("a[0...i");
        },
        solution: `**Loop Invariant:** At the start of each iteration of the for loop, the subarray A[0..i-1] is sorted.

**Initialization:** Before the first iteration (i=1), A[0..0] contains one element, which is trivially sorted.

**Maintenance:** The inner while loop inserts A[i] into its correct position within A[0..i-1], resulting in A[0..i] being sorted.

**Termination:** When i = len(A), the entire array A[0..n-1] is sorted.`
      },
      // Count operations
      {
        type: "complexity",
        code: `def mystery(n):
    count = 0
    i = 1
    while i < n:
        j = 1
        while j < n:
            count += 1
            j *= 2
        i += 1
    return count`,
        prompt: "What is the time complexity of mystery(n)? Express in Big-O.",
        answer: ["O(n log n)", "O(nlogn)"],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          return u.includes("nlogn") || u.includes("nlog(n)");
        },
        solution: `**Analysis of mystery(n):**

- Outer loop: i goes from 1 to n-1 → **O(n)** iterations
- Inner loop: j = 1, 2, 4, 8, ... until j ≥ n → **O(log n)** iterations
- Total: O(n) × O(log n) = **O(n log n)**`
      },
      // Recursive function output
      {
        type: "trace",
        code: `def rec(n):
    if n <= 1:
        return n
    return rec(n-1) + rec(n-2)`,
        prompt: "What does rec(6) return?",
        answer: ["8"],
        check: (user) => normalize(user) === "8",
        solution: `**This is the Fibonacci sequence!**

rec(0) = 0
rec(1) = 1
rec(2) = rec(1) + rec(0) = 1 + 0 = 1
rec(3) = rec(2) + rec(1) = 1 + 1 = 2
rec(4) = rec(3) + rec(2) = 2 + 1 = 3
rec(5) = rec(4) + rec(3) = 3 + 2 = 5
rec(6) = rec(5) + rec(4) = 5 + 3 = **8**`
      },
      // Identify algorithm
      {
        type: "identify",
        code: `def algo(A, lo, hi):
    if lo >= hi:
        return
    pivot = A[hi]
    i = lo - 1
    for j in range(lo, hi):
        if A[j] <= pivot:
            i += 1
            A[i], A[j] = A[j], A[i]
    A[i+1], A[hi] = A[hi], A[i+1]
    algo(A, lo, i)
    algo(A, i+2, hi)`,
        prompt: "What algorithm is this? What is its average-case time complexity?",
        answer: ["QuickSort", "quicksort O(n log n)"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("quick") && (u.includes("sort") || u.includes("nlogn") || u.includes("n log n"));
        },
        solution: `**This is QuickSort (Lomuto partition scheme)**

Key features:
- Pivot is the last element A[hi]
- Partitions array so elements ≤ pivot are on the left
- Recursively sorts both partitions

**Time Complexity:**
- Average case: O(n log n)
- Worst case: O(n²) when pivot is always min or max`
      },
      // BFS identification
      {
        type: "identify",
        code: `def algo(graph, start):
    visited = set()
    queue = [start]
    visited.add(start)
    result = []
    while queue:
        v = queue.pop(0)
        result.append(v)
        for neighbor in graph[v]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result`,
        prompt: "What graph algorithm is this? What data structure does it use?",
        answer: ["BFS", "breadth-first search queue"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("bfs") || u.includes("breadth")) && u.includes("queue");
        },
        solution: `**This is Breadth-First Search (BFS)**

Key features:
- Uses a **queue** (FIFO) data structure
- Visits vertices level by level
- Tracks visited vertices to avoid revisiting

**Time Complexity:** O(V + E) with adjacency list`
      },
      // Merge operation
      {
        type: "trace",
        code: `def merge(L, R):
    result = []
    i = j = 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:
            result.append(L[i])
            i += 1
        else:
            result.append(R[j])
            j += 1
    result.extend(L[i:])
    result.extend(R[j:])
    return result`,
        prompt: "What is merge([1, 4, 7], [2, 5, 6])?",
        answer: ["[1, 2, 4, 5, 6, 7]", "1,2,4,5,6,7", "1 2 4 5 6 7"],
        check: (user) => {
          const nums = String(user).match(/\d+/g)?.map(Number) ?? [];
          return nums.join(",") === "1,2,4,5,6,7";
        },
        solution: `**Trace of merge([1, 4, 7], [2, 5, 6]):**

1) Compare 1 vs 2: append 1, i=1
2) Compare 4 vs 2: append 2, j=1
3) Compare 4 vs 5: append 4, i=2
4) Compare 7 vs 5: append 5, j=2
5) Compare 7 vs 6: append 6, j=3
6) R exhausted, extend with L[2:] = [7]

**Result: [1, 2, 4, 5, 6, 7]**`
      },
      // Heapify identification
      {
        type: "identify",
        code: `def algo(A, i, n):
    largest = i
    left = 2*i + 1
    right = 2*i + 2
    if left < n and A[left] > A[largest]:
        largest = left
    if right < n and A[right] > A[largest]:
        largest = right
    if largest != i:
        A[i], A[largest] = A[largest], A[i]
        algo(A, largest, n)`,
        prompt: "What heap operation is this? Is it for a min-heap or max-heap?",
        answer: ["max-heapify", "heapify max-heap", "max heap heapify"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("heapify") && u.includes("max");
        },
        solution: `**This is Max-Heapify (also called "sift-down")**

Key features:
- Compares node with children, finds the **largest**
- Swaps with largest child if heap property violated
- Recursively fixes the subtree
- Uses **max-heap** property (parent ≥ children)

**Time Complexity:** O(log n) - height of heap`
      }
    ];

    const q = sample(questions);

    return {
      prompt: `\`\`\`python
${q.code}
\`\`\`

${q.prompt}`,
      answer: q.answer,
      check: q.check,
      solution: q.solution
    };
  }

  // ===== Algorithm Proofs Generator =====
  function genProofs() {
    const questions = [
      // Loop invariant proof
      {
        type: "invariant",
        prompt: "To prove an algorithm correct using a loop invariant, what three things must you show?",
        answer: ["initialization, maintenance, termination"],
        check: (user) => {
          const u = normalize(user);
          const hasInit = u.includes("init");
          const hasMaint = u.includes("maint") || u.includes("preserv");
          const hasTerm = u.includes("termin");
          return (hasInit && hasMaint && hasTerm) || (u.includes("three") && u.includes("step"));
        },
        solution: `**Three parts of a loop invariant proof:**

1. **Initialization:** The invariant is true before the first iteration.

2. **Maintenance:** If the invariant is true before an iteration, it remains true after the iteration.

3. **Termination:** When the loop terminates, the invariant (along with the termination condition) implies the desired postcondition.`
      },
      // Exchange argument
      {
        type: "technique",
        prompt: "What proof technique shows that swapping a greedy choice into an optimal solution doesn't make it worse?",
        answer: ["exchange argument", "exchange"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("exchange");
        },
        solution: `**Exchange Argument**

Used to prove greedy algorithms correct:

1. Assume an optimal solution OPT that differs from the greedy solution.
2. Find the first place where OPT makes a different choice than greedy.
3. Show that "exchanging" OPT's choice for the greedy choice produces a solution that is at least as good.
4. Repeat until OPT matches the greedy solution.

**Example:** Activity selection - if OPT doesn't pick the earliest-finishing activity, swapping it in leaves room for at least as many activities.`
      },
      // Cut-and-paste for DP
      {
        type: "technique",
        prompt: "In proving optimal substructure for dynamic programming, what technique assumes a subproblem solution is not optimal and derives a contradiction?",
        answer: ["cut-and-paste", "cut and paste", "contradiction"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("cut") || u.includes("paste") || u.includes("contradiction");
        },
        solution: `**Cut-and-Paste Argument**

Used to prove optimal substructure:

1. Assume an optimal solution to the main problem.
2. Suppose (for contradiction) that a subproblem within this solution is not solved optimally.
3. "Cut out" the suboptimal part and "paste in" the optimal subproblem solution.
4. Show this produces a better overall solution - contradiction!

**Example (Shortest Paths):** If path $s \\to v$ is optimal and goes through $u$, then $s \\to u$ must also be optimal. If not, replacing $s \\to u$ with a shorter path gives a shorter $s \\to v$, contradiction.`
      },
      // MST safe edge proof
      {
        type: "proof",
        prompt: "Prove: For any cut (S, V-S), the minimum-weight crossing edge is in some MST. What happens if an MST doesn't contain this edge?",
        answer: ["cycle", "swap", "exchange"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("cycle") || u.includes("swap") || u.includes("exchange") || u.includes("replace");
        },
        solution: `**Proof of MST Cut Property:**

Let $e = (u, v)$ be the minimum-weight edge crossing cut $(S, V-S)$.

**Suppose** MST $T$ does not contain $e$.

1. Adding $e$ to $T$ creates a **cycle** $C$.
2. This cycle must cross the cut at least twice (since $u \\in S, v \\notin S$).
3. Let $e' \\neq e$ be another edge in $C$ crossing the cut.
4. Since $e$ is minimum-weight crossing edge: $w(e) \\le w(e')$.
5. **Swap:** $T' = T - e' + e$ is a spanning tree with $w(T') \\le w(T)$.
6. Since $T$ is an MST, $w(T') = w(T)$, so $T'$ is also an MST containing $e$. ∎`
      },
      // Dijkstra correctness
      {
        type: "proof",
        prompt: "What key property must hold for Dijkstra's algorithm to be correct? What breaks if this property is violated?",
        answer: ["non-negative weights", "nonnegative", "no negative"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("non") && u.includes("negative") || u.includes("positive") || u.includes(">= 0") || u.includes("≥ 0");
        },
        solution: `**Dijkstra requires non-negative edge weights.**

**Why it's needed:**

Dijkstra assumes: once a vertex $v$ is extracted from the priority queue, $d[v]$ is final.

**If negative edges exist:**
- A later path through a negative edge could reduce $d[v]$.
- But $v$ is already "settled" and won't be updated.

**Counterexample:**
- Edges: A→B (weight 1), A→C (weight 5), C→B (weight -10)
- Dijkstra from A: extracts B with d[B]=1
- But A→C→B has weight 5 + (-10) = -5 < 1
- Dijkstra gives wrong answer!`
      },
      // DFS back edge implies cycle
      {
        type: "proof",
        prompt: "Prove: A directed graph has a cycle if and only if DFS discovers a back edge.",
        answer: ["back edge", "gray", "ancestor"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("back") && u.includes("edge")) || u.includes("gray") || u.includes("ancestor");
        },
        solution: `**Proof: Cycle ↔ Back Edge**

**(⇒) If there's a cycle, DFS finds a back edge:**
- Let $v_1 \\to v_2 \\to \\cdots \\to v_k \\to v_1$ be a cycle.
- Let $v_i$ be the first vertex discovered by DFS.
- DFS will explore path $v_i \\to v_{i+1} \\to \\cdots$
- Eventually reaches $v_{i-1}$ (or cycles back to $v_i$).
- Edge $v_{i-1} \\to v_i$ goes to an ancestor (gray vertex) → back edge!

**(⇐) If DFS finds back edge, there's a cycle:**
- Back edge $(u, v)$ goes from $u$ to an ancestor $v$.
- $v$ is gray, so there's a path $v \\leadsto u$ in the DFS tree.
- Combined with edge $u \\to v$: cycle $v \\leadsto u \\to v$. ∎`
      },
      // Induction structure
      {
        type: "structure",
        prompt: "In a proof by induction, what do you assume in the inductive hypothesis, and what do you prove in the inductive step?",
        answer: ["assume P(k), prove P(k+1)", "P(k) implies P(k+1)"],
        check: (user) => {
          const u = normalize(user);
          return (u.includes("p(k)") || u.includes("assume")) && (u.includes("p(k+1)") || u.includes("k+1") || u.includes("implies"));
        },
        solution: `**Structure of Proof by Induction:**

**Inductive Hypothesis:** Assume $P(k)$ holds for an arbitrary $k \\ge n_0$.

**Inductive Step:** Prove $P(k) \\Rightarrow P(k+1)$.

**Process:**
1. Start with what you want to prove: $P(k+1)$
2. Manipulate/decompose to involve the case $k$
3. Apply the inductive hypothesis $P(k)$
4. Complete the proof of $P(k+1)$

**Note:** Don't forget the base case $P(n_0)$!`
      },
      // Comparison sort lower bound
      {
        type: "proof",
        prompt: "How do you prove that any comparison-based sorting algorithm requires Ω(n log n) comparisons?",
        answer: ["decision tree", "n! leaves", "log(n!)"],
        check: (user) => {
          const u = normalize(user);
          return u.includes("decision tree") || u.includes("n!") || u.includes("factorial") || u.includes("log(n!)");
        },
        solution: `**Lower Bound Proof via Decision Trees:**

1. Model any comparison sort as a **decision tree**.
2. Each internal node is a comparison.
3. Each leaf represents a unique permutation output.
4. There are $n!$ permutations, so at least $n!$ leaves.

**Height Analysis:**
- A binary tree with $L$ leaves has height $\\ge \\log_2 L$.
- Height $\\ge \\log_2(n!)$.
- By Stirling: $\\log_2(n!) = \\Theta(n \\log n)$.

**Conclusion:** Any comparison sort needs $\\Omega(n \\log n)$ comparisons in the worst case.`
      }
    ];

    const q = sample(questions);

    return {
      prompt: q.prompt,
      answer: q.answer,
      check: q.check,
      solution: q.solution
    };
  }

  // ===== Complexity Reference Generator =====
  function genComplexities() {
    const algorithms = [
      // Sorting
      { name: "Insertion Sort", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true },
      { name: "Merge Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: true },
      { name: "Quick Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: false },
      { name: "Heap Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)", stable: false },
      { name: "Counting Sort", best: "O(n+k)", avg: "O(n+k)", worst: "O(n+k)", space: "O(k)", stable: true },
      { name: "Radix Sort", best: "O(dn)", avg: "O(dn)", worst: "O(dn)", space: "O(n+k)", stable: true },
      // Searching
      { name: "Binary Search", best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)", stable: null },
      { name: "Linear Search", best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)", stable: null },
      // Graph
      { name: "BFS", best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)", space: "O(V)", stable: null },
      { name: "DFS", best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)", space: "O(V)", stable: null },
      { name: "Dijkstra (binary heap)", best: "O((V+E) log V)", avg: "O((V+E) log V)", worst: "O((V+E) log V)", space: "O(V)", stable: null },
      { name: "Bellman-Ford", best: "O(VE)", avg: "O(VE)", worst: "O(VE)", space: "O(V)", stable: null },
      { name: "Kruskal", best: "O(E log E)", avg: "O(E log E)", worst: "O(E log E)", space: "O(V)", stable: null },
      { name: "Prim (binary heap)", best: "O((V+E) log V)", avg: "O((V+E) log V)", worst: "O((V+E) log V)", space: "O(V)", stable: null },
      // Heap operations
      { name: "Build-Heap", best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)", stable: null },
      { name: "Heap Insert", best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)", stable: null },
      { name: "Heap Extract-Max", best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(1)", stable: null },
    ];

    const type = sample(["worst", "best", "avg", "space", "stable", "compare", "identify"]);

    if (type === "compare") {
      const sorts = algorithms.filter(a => a.stable !== null);
      const a1 = sample(sorts);
      let a2 = sample(sorts);
      while (a2.name === a1.name) a2 = sample(sorts);
      
      const prompt = `Compare ${a1.name} and ${a2.name}: which has better worst-case time complexity?`;
      // Parse complexity for comparison (simplified)
      const parseOrder = (s) => {
        if (s.includes("n²")) return 2;
        if (s.includes("n log n")) return 1.5;
        if (s.includes("log n")) return 0.5;
        if (s.includes("n+k") || s.includes("dn")) return 1;
        if (s.includes("n")) return 1;
        return 0;
      };
      const o1 = parseOrder(a1.worst);
      const o2 = parseOrder(a2.worst);
      const better = o1 < o2 ? a1.name : (o2 < o1 ? a2.name : "equal");
      
      return {
        prompt,
        answer: [better],
        check: (user) => {
          const u = normalize(user);
          if (better === "equal") return u.includes("same") || u.includes("equal");
          return u.includes(normalize(better));
        },
        solution: `**Comparison:**
- ${a1.name} worst-case: ${a1.worst}
- ${a2.name} worst-case: ${a2.worst}

**Answer:** ${better === "equal" ? "They are equal" : better + " is better"}`
      };
    }

    if (type === "identify") {
      const complexities = ["O(n²)", "O(n log n)", "O(n)", "O(log n)", "O(V+E)", "O(VE)"];
      const c = sample(complexities);
      const matching = algorithms.filter(a => a.worst === c || a.avg === c);
      
      if (matching.length > 0) {
        const prompt = `Name an algorithm with ${c} time complexity.`;
        return {
          prompt,
          answer: matching.map(a => a.name),
          check: (user) => {
            const u = normalize(user);
            return matching.some(a => u.includes(normalize(a.name).split(" ")[0]));
          },
          solution: `**Algorithms with ${c} complexity:**
${matching.map(a => `- ${a.name}`).join("\n")}`
        };
      }
    }

    if (type === "stable") {
      const sorts = algorithms.filter(a => a.stable !== null);
      const algo = sample(sorts);
      const prompt = `Is ${algo.name} stable? Answer yes or no.`;
      return {
        prompt,
        answer: [algo.stable ? "yes" : "no"],
        check: (user) => eqAnswer(user, algo.stable ? "yes" : "no"),
        solution: `**${algo.name} is ${algo.stable ? "stable" : "NOT stable"}.**

${algo.stable 
  ? "Equal elements maintain their relative order from the input." 
  : "Equal elements may be reordered during the sorting process."}`
      };
    }

    if (type === "space") {
      const algo = sample(algorithms);
      const prompt = `What is the auxiliary space complexity of ${algo.name}?`;
      return {
        prompt,
        answer: [algo.space],
        check: (user) => {
          const u = normalize(user).replace(/\s+/g, "");
          const e = normalize(algo.space).replace(/\s+/g, "");
          return u.includes(e) || u === e.replace("o(", "").replace(")", "");
        },
        solution: `**${algo.name} Space Complexity: ${algo.space}**`
      };
    }

    // Default: time complexity question
    const algo = sample(algorithms);
    const caseType = sample(["worst", "best", "avg"]);
    const caseLabel = caseType === "worst" ? "worst-case" : (caseType === "best" ? "best-case" : "average-case");
    const ans = algo[caseType];
    
    const prompt = `What is the ${caseLabel} time complexity of ${algo.name}?`;
    return {
      prompt,
      answer: [ans],
      check: (user) => {
        const u = normalize(user).replace(/\s+/g, "");
        const e = normalize(ans).replace(/\s+/g, "");
        return u.includes(e) || u === e.replace("o(", "").replace(")", "");
      },
      solution: `**${algo.name} Time Complexity:**
- Best: ${algo.best}
- Average: ${algo.avg}
- Worst: ${algo.worst}
- Space: ${algo.space}${algo.stable !== null ? `\n- Stable: ${algo.stable ? "Yes" : "No"}` : ""}`
    };
  }

  const GENERATORS = {
    asymptotic: genAsymptotic,
    recurrences: genRecurrences,
    induction: genInduction,
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
    matrixchain: genMatrixChain,
    greedy: genGreedy,
    flow: genFlow,
    examprep: genExamPrep,
    conceptual: genConceptual,
    pseudocode: genPseudocode,
    proofs: genProofs,
    complexities: genComplexities,
  };

  window.GENERATORS = GENERATORS;
})();
