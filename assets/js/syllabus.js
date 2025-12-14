// Syllabus + topic metadata for the study site.
// Exposes: window.SYLLABUS

(function () {
  const PARTS = [
    {
      id: "part1",
      title: "Foundations & Analysis",
      topics: ["asymptotic", "recurrences", "induction"],
    },
    {
      id: "part2",
      title: "Sorting & Selection",
      topics: ["insertion", "mergesort", "quicksort", "radix", "kselect"],
    },
    {
      id: "part3",
      title: "Data Structures",
      topics: ["heaps", "graphreps"],
    },
    {
      id: "part4",
      title: "Graph Algorithms",
      topics: ["traversals", "dfsapps", "shortestpaths", "mst"],
    },
    {
      id: "part5",
      title: "Advanced Design Paradigms",
      topics: ["dp", "matrixchain", "greedy", "flow"],
    },
  ];

  const TOPICS = {
    asymptotic: {
      id: "asymptotic",
      title: "Asymptotic Notation",
      part: "part1",
      keyPoints: [
        "Big-O (upper bound): show $\\exists\\,c>0,\\,n_0$ s.t. $T(n) \\le c\\,g(n)$ for all $n\\ge n_0$.",
        "Big-\\Omega (lower bound): show $\\exists\\,c>0,\\,n_0$ s.t. $T(n) \\ge c\\,g(n)$ for all $n\\ge n_0$.",
        "Big-\\Theta (tight bound): show both $T(n)=O(g(n))$ and $T(n)=\\Omega(g(n))$ (equivalently $T(n)=\\Theta(g(n))$).",
        "Ignore constant factors and lower-order terms (eventually-dominating behavior).",
        "Log bases differ by constants: $\\log_a n = \\log_b n / \\log_b a$.",
        "Useful dominance: $n^a \\ll n^b$ for $a<b$; $\\log^k n \\ll n^\\epsilon$ for any $\\epsilon>0$.",
        "For sums, the largest-order term dominates: e.g. $n^2 + n\\log n = \\Theta(n^2)$.",
        "Proof habit: pick a simple $n_0$ (often 1 or 2), then bound each term by a multiple of $g(n)$.",
      ],
      generator: "asymptotic",
    },
    recurrences: {
      id: "recurrences",
      title: "Solving Recurrences",
      part: "part1",
      keyPoints: [
        "Master theorem (typical form): $T(n)=aT(n/b)+\\Theta(n^d)$ with $a\\ge 1$, $b>1$.",
        "Compute the critical exponent: $n^{\\log_b a}$ and compare $n^d$ vs $n^{\\log_b a}$.",
        "Case 1 ($a>b^d$): $T(n)=\\Theta(n^{\\log_b a})$ (leaf-dominated).",
        "Case 2 ($a=b^d$): $T(n)=\\Theta(n^d\\log n)$ (balanced).",
        "Case 3 ($a<b^d$): $T(n)=\\Theta(n^d)$ (root-dominated).",
        "Recursion-tree method: write work per level, recognize geometric series, watch the depth ($\\log_b n$).",
        "Substitution/induction: guess a bound, plug in, choose constants, and verify base case.",
        "When Master doesn't apply (non-polynomial $f(n)$, uneven splits), use recursion tree or other methods (e.g., Akra\u2013Bazzi).",
      ],
      generator: "recurrences",
    },

    induction: {
      id: "induction",
      title: "Proof by Induction",
      part: "part1",
      keyPoints: [
        "Standard 4 steps: (1) Base case, (2) Inductive hypothesis, (3) Inductive step, (4) Conclusion.",
        "Inductive hypothesis typically assumes $P(k)$ for an arbitrary $k\\ge n_0$.",
        "Inductive step proves $P(k)\\Rightarrow P(k+1)$ using the hypothesis.",
        "Be explicit about constants/starting index ($n_0$) and what is being assumed.",
        "Common pattern: rewrite $P(k+1)$, separate the last term, then apply the hypothesis.",
      ],
      generator: "induction",
    },

    insertion: {
      id: "insertion",
      title: "Insertion Sort",
      part: "part2",
      keyPoints: [
          "Loop invariant: after iteration $i$, prefix $A[0..i]$ is sorted.",
          "Mechanics: take key=$A[i]$, shift elements $> key$ to the right, then place key into the gap.",
          "Stable (with strict \"$>$\" in the while-condition) and in-place (O(1) extra space).",
          "Worst-case comparisons/shifts: $\\Theta(n^2)$ (reverse-sorted).",
          "Best-case: $\\Theta(n)$ (already sorted; inner loop does ~0 shifts).",
          "Good for small $n$ and nearly-sorted inputs; often used as a base case in hybrid sorts.",
      ],
      generator: "insertion",
    },
    mergesort: {
      id: "mergesort",
      title: "MergeSort",
      part: "part2",
      keyPoints: [
          "Divide-and-conquer: split into halves, recursively sort, then merge in linear time.",
          "Recurrence: $T(n)=2T(n/2)+\\Theta(n)$ ⇒ $\\Theta(n\\log n)$ (all inputs).",
          "Stable when merge breaks ties by taking from the left half first.",
          "Not in-place in the standard implementation (needs O(n) auxiliary array).",
          "Merge step comparisons: worst-case $m+n-1$ to merge lengths $m$ and $n$.",
          "Great for linked lists / external sorting; predictable runtime.",
      ],
      generator: "mergesort",
    },
    quicksort: {
      id: "quicksort",
      title: "QuickSort",
      part: "part2",
      keyPoints: [
          "Partition step puts pivot into its final position and divides array into \"\u2264 pivot\" and \"> pivot\" sides.",
          "Expected runtime (random pivot / random input): $\\Theta(n\\log n)$; worst case: $\\Theta(n^2)$.",
          "In-place partition is typical; QuickSort is usually not stable.",
          "Bad pivots happen on already-sorted input with naive pivot choices; randomization avoids adversarial cases.",
          "Recurrence intuition: work per level is $\\Theta(n)$, depth depends on partition balance.",
      ],
      generator: "quicksort",
    },
    radix: {
      id: "radix",
      title: "Radix Sort",
      part: "part2",
      keyPoints: [
          "LSD radix: stable-sort by least-significant digit, then next digit, etc.",
          "Stability is required: later passes must preserve earlier digit order.",
          "For base $k$ and $d$ digits: time $\\Theta(d(n+k))$ using counting sort per digit.",
          "Works for fixed-length keys (integers / strings) when digit extraction is O(1).",
          "Choose base $k$ to trade passes ($d$) vs per-pass overhead ($k$).",
      ],
      generator: "radix",
    },
    kselect: {
      id: "kselect",
      title: "k-SELECT (Median of Medians)",
      part: "part2",
      keyPoints: [
          "Goal: find the $k$-th smallest without fully sorting.",
          "Median-of-medians: group elements in 5s, take each group median, recursively select the median of these medians.",
          "Use that pivot to partition; recurse only into the side containing the $k$-th element.",
          "Guarantee: pivot is \"good\" (constant-fraction split) ⇒ worst-case $\\Theta(n)$.",
          "Classic recurrence: $T(n)\\le T(\\lceil n/5\\rceil)+T(7n/10)+\\Theta(n)$.",
      ],
      generator: "kselect",
    },

    heaps: {
      id: "heaps",
      title: "Heaps & Heapsort",
      part: "part3",
      keyPoints: [
          "Heap property: in a max-heap, each parent key ≥ its children; shape is a complete binary tree.",
          "Array indexing: 1-based parent=$\\lfloor i/2\\rfloor$, left=$2i$, right=$2i+1$ (0-based: parent=$\\lfloor(i-1)/2\\rfloor$).",
          "Max-Heapify fixes one violation by bubbling a node down; runs in $\\Theta(\\log n)$.",
          "Build-Max-Heap: heapify from the last internal node down to the root; total time $\\Theta(n)$.",
          "Heapsort: build heap then repeatedly extract max; time $\\Theta(n\\log n)$, in-place, not stable.",
      ],
      generator: "heaps",
    },
    graphreps: {
      id: "graphreps",
      title: "Graph Representations",
      part: "part3",
      keyPoints: [
          "Adjacency matrix: space $\\Theta(V^2)$; edge lookup is O(1).",
          "Adjacency list: space $\\Theta(V+E)$; iterating neighbors of $u$ costs $\\Theta(\\deg(u))$.",
          "Dense graphs (E close to $V^2$) can favor matrices; sparse graphs favor lists.",
          "BFS/DFS on lists run in $\\Theta(V+E)$; on matrices they can degrade to $\\Theta(V^2)$.",
          "Directed graphs: store outgoing edges; undirected graphs: store both directions.",
      ],
      generator: "graphreps",
    },

    traversals: {
      id: "traversals",
      title: "BFS & DFS",
      part: "part4",
      keyPoints: [
          "BFS (queue): explores in layers by distance from source; gives shortest path lengths in unweighted graphs.",
          "BFS outputs: parent[] tree and dist[] where dist[v] is #edges from source.",
          "DFS (stack/recursion): explores deep, then backtracks; produces discovery/finish times.",
          "DFS colors idea: white=unseen, gray=in recursion stack, black=finished.",
          "Directed DFS edge types: tree/back/forward/cross; back edge implies a cycle.",
          "Both BFS and DFS are $\\Theta(V+E)$ with adjacency lists.",
      ],
      generator: "traversals",
    },
    dfsapps: {
      id: "dfsapps",
      title: "Topological Sort & SCCs",
      part: "part4",
      keyPoints: [
          "Topological sort exists iff the directed graph is a DAG (no directed cycles).",
          "DFS-based topo: run DFS; output vertices by decreasing finish time.",
          "Kahn's topo: repeatedly remove zero-indegree vertices (queue).",
          "SCC definition: maximal set where every pair is mutually reachable.",
          "Kosaraju: (1) DFS on $G$ to compute finish order, (2) DFS on $G^T$ in decreasing finish order.",
          "SCCs also via Tarjan in one DFS (stack + lowlink).",
      ],
      generator: "dfsapps",
    },
    shortestpaths: {
      id: "shortestpaths",
      title: "Weighted Shortest Paths",
      part: "part4",
      keyPoints: [
          "Relaxation: if $d[v] > d[u] + w(u,v)$, update $d[v] \\leftarrow d[u]+w(u,v)$ (and parent[v]).",
          "Dijkstra: requires all edge weights $\\ge 0$; extract-min repeatedly; once settled, a node's distance is final.",
          "Dijkstra complexity: $O((V+E)\\log V)$ with a binary heap (typical).",
          "Bellman–Ford: relax all edges $V-1$ times; works with negative edges.",
          "Negative-cycle detection: a further improvement on pass $V$ implies a reachable negative cycle.",
      ],
      generator: "shortestpaths",
    },
    mst: {
      id: "mst",
      title: "Minimum Spanning Trees",
      part: "part4",
      keyPoints: [
          "MST: spans all vertices with minimum total weight (undirected, connected graph).",
          "Cut property: for any cut, the lightest edge crossing it is safe to add.",
          "Kruskal: sort edges by weight; add an edge if it connects two different components (Union-Find).",
          "Prim: start at a root; repeatedly add the cheapest edge leaving the current tree (min-PQ).",
          "Distinct edge weights ⇒ MST is unique.",
          "Typical time: Kruskal $O(E\\log E)$; Prim $O((V+E)\\log V)$ with heap.",
      ],
      generator: "mst",
    },

    dp: {
      id: "dp",
      title: "Dynamic Programming",
      part: "part5",
      keyPoints: [
          "DP recipe: define subproblem state, write recurrence, set base cases, choose fill order, then reconstruct.",
          "DP works when: optimal substructure + overlapping subproblems.",
          "Memoization (top-down) vs tabulation (bottom-up) are equivalent in results.",
          "LCS: $dp[i][j]$ = LCS length of prefixes $S[0..i)$ and $T[0..j)$.",
          "LCS recurrence: if match → $1+dp[i-1][j-1]$, else $\\max(dp[i-1][j], dp[i][j-1])$.",
          "0/1 Knapsack: $dp[c]$ update from high→low capacity to avoid reusing an item.",
      ],
      generator: "dp",
    },

    matrixchain: {
      id: "matrixchain",
      title: "Matrix Chain Multiplication",
      part: "part5",
      keyPoints: [
        "Given matrices $A_1\\cdots A_n$ with dimensions $(p_0\\times p_1), (p_1\\times p_2),\\dots,(p_{n-1}\\times p_n)$.",
        "Goal: parenthesize to minimize scalar multiplications (not to change result).",
        "DP state: $m[i][j]$ = min cost to multiply $A_i\\cdots A_j$.",
        "Transition: $m[i][j]=\\min_{i\\le k<j} (m[i][k]+m[k+1][j]+p_{i-1}p_k p_j)$.",
        "Fill by increasing chain length.",
      ],
      generator: "matrixchain",
    },
    greedy: {
      id: "greedy",
      title: "Greedy Algorithms",
      part: "part5",
      keyPoints: [
          "Greedy = make locally optimal choices; must be proven correct (not just fast).",
          "Common proof tools: exchange argument, cut property, greedy-choice property, matroid structure.",
          "Activity selection: sort by earliest finish time; take next compatible.",
          "Huffman: repeatedly combine two least frequent symbols; yields optimal prefix code.",
          "Know counterexamples: a greedy idea can fail without the right structure (e.g., knapsack by value/weight for 0/1).",
      ],
      generator: "greedy",
    },
    flow: {
      id: "flow",
      title: "Network Flow",
      part: "part5",
      keyPoints: [
          "Flow constraints: capacity ($0\\le f(e)\\le c(e)$) and conservation (except at s,t).",
          "Residual graph encodes remaining capacity + canceling via back edges.",
          "Augmenting path: an s→t path in residual graph; push bottleneck amount.",
          "Ford–Fulkerson repeats augmentation until no augmenting path remains (then optimal).",
          "Edmonds–Karp uses BFS for shortest (in edges) augmenting paths; runs in O(VE^2).",
          "Max-Flow Min-Cut theorem: value of max flow equals capacity of min s-t cut.",
      ],
      generator: "flow",
    },
  };

  window.SYLLABUS = { PARTS, TOPICS };
})();
