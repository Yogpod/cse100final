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
    const type = sample(["master", "tree_count", "tree_size"]);
    const b = sample([2, 3, 4]);
    const k = sample([1, 2, 3]);
    const a = Math.pow(b, k);
    const d = sample([0, 1, 2, 3]);

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

  function genInduction() {
    const type = sample(["steps", "hypothesis"]);

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
    const type = sample(["weight", "kruskal_order", "prim_order", "safeedge"]);

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
    const type = sample(["lcs_matrix", "lcs_string", "knap"]);
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
5) DP table (optional):\n${formatMatrix(dp)}.`,
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
    const type = sample(["maxflow", "mincut", "residual1"]);
    const g = makeReadableFlowNetwork();
    const n = g.nodes.length;
    const s = 0;
    const t = 5;
    const edges = g.edges;

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
          solution: `1) Augment by $\Delta = ${step.add}$ along the first BFS path.
2) For each path edge $(u,v)$: residual forward decreases by $\Delta$, residual backward increases by $\Delta$.
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
5) Here, $S = {${cutS.join(", ")}}$.`,
      };
    }

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
  };

  window.GENERATORS = GENERATORS;
})();
