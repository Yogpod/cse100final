# CSE100 Algorithm Study Portal

An interactive web-based study tool for practicing algorithms and data structures concepts. Features randomized practice questions with instant feedback and detailed solutions.

## 🚀 Getting Started

Simply open `index.html` in a web browser. No build step or server required.

```bash
# Or use a local server for development
npx serve .
```

## 📚 Course Structure

The portal is organized into 6 parts covering the full algorithms curriculum:

### Part 1: Foundations
- **Asymptotic Analysis** - Big-O, Big-Ω, Big-Θ notation
- **Recurrences** - Master Theorem, recursion trees, common patterns
- **Induction** - Proof techniques, base cases, inductive steps

### Part 2: Sorting
- **Insertion Sort** - Step traces, complexity, stability, loop invariants
- **Merge Sort** - Merge operation, recurrence, space complexity
- **Quicksort** - Partitioning, pivot selection, best/worst cases
- **Radix Sort** - Digit passes, counting sort, stability requirements

### Part 3: Selection & Heaps
- **K-Select** - Median-of-medians algorithm
- **Heaps** - Index formulas, heapify, build-heap, extract-max

### Part 4: Graphs
- **Graph Representations** - Adjacency matrix vs list, space complexity
- **BFS/DFS Traversals** - Visit order, discovery/finish times
- **DFS Applications** - Topological sort, SCCs, edge classification
- **Shortest Paths** - Dijkstra, Bellman-Ford, relaxation
- **Minimum Spanning Trees** - Kruskal, Prim, cut property

### Part 5: Advanced Topics
- **Dynamic Programming** - LCS, knapsack, recurrence relations, memoization
- **Matrix Chain Multiplication** - Optimal parenthesization
- **Greedy Algorithms** - Activity selection, Huffman coding, fractional knapsack
- **Network Flow** - Ford-Fulkerson, max-flow min-cut, bipartite matching

### Part 6: Exam Preparation
- **True/False Drills** - 55+ exam-style questions across all topics
- **Conceptual Questions** - Short answer questions on algorithms, proofs, and theory
- **Pseudocode Reading** - Code tracing, invariants, algorithm identification
- **Algorithm Proofs** - Induction, loop invariants, exchange arguments, cut-and-paste
- **Complexity Reference** - Time/space complexity drills for all algorithms

## ✨ Features

### Interactive Practice
- **Randomized Questions** - Each refresh generates new problem instances
- **Multiple Input Types** - Text, sequences, and matrix inputs
- **Graph Visualizations** - Interactive graph diagrams for traversal/path problems
- **Instant Feedback** - Check answers immediately with detailed solutions
- **KaTeX Math Rendering** - Beautiful mathematical notation

### Question Types by Topic

| Generator | Question Varieties |
|-----------|-------------------|
| Insertion Sort | 6 types (traces, complexity, stability, invariants) |
| Merge Sort | 7 types (merge count, levels, recurrence, space) |
| Quicksort | 7 types (partition, complexity, stability, pivots) |
| Heaps | 7 types (indices, heapify, build-heap, height) |
| Radix Sort | 4 types (passes, complexity, stability, counting) |
| Recurrences | 6 types (Master theorem, tree analysis, common forms) |
| Shortest Paths | 7 types (Dijkstra, Bellman-Ford, relaxation) |
| MST | 7 types (Kruskal, Prim, cut property, complexity) |
| DP | 7 types (LCS, knapsack, recurrence, memoization) |
| Greedy | 5 types (activity, Huffman, fractional knapsack) |
| Flow | 6 types (max-flow, min-cut, bipartite matching) |
| Exam Prep | 55+ True/False questions |
| Conceptual | 15+ short answer questions |
| Pseudocode | 8 types (tracing, invariants, complexity, identification) |
| Proofs | 8 types (induction, exchange, cut-paste, invariants) |
| Complexities | 7 types (time, space, stability, comparisons) |

## 🗂️ Project Structure

```
cse100/
├── index.html              # Landing page
├── README.md               # This file
├── assets/
│   ├── css/
│   │   └── style.css       # Main styles
│   └── js/
│       ├── app.js          # Application logic, navigation, UI
│       ├── generators.js   # Question generation functions
│       └── syllabus.js     # Course structure configuration
├── lib/
│   └── AnimationLibrary/   # Graph visualization library
├── parts/
│   ├── part1.html          # Foundations
│   ├── part2.html          # Sorting
│   ├── part3.html          # Selection & Heaps
│   ├── part4.html          # Graphs
│   ├── part5.html          # Advanced Topics
│   └── part6.html          # Exam Preparation
├── topics/
│   ├── asymptotic.html     # Individual topic pages
│   ├── recurrences.html
│   ├── induction.html
│   ├── insertion.html
│   ├── mergesort.html
│   ├── quicksort.html
│   ├── radix.html
│   ├── kselect.html
│   ├── heaps.html
│   ├── graphreps.html
│   ├── traversals.html
│   ├── dfsapps.html
│   ├── shortestpaths.html
│   ├── mst.html
│   ├── dp.html
│   ├── matrixchain.html
│   ├── greedy.html
│   ├── flow.html
│   ├── examprep.html
│   ├── conceptual.html
│   ├── pseudocode.html
│   ├── proofs.html
│   └── complexities.html
├── tools/                  # Utility pages
└── alg/                    # Algorithm visualizations
    └── JavascriptVisualRelease/
```

## 🛠️ Technical Details

### Dependencies
- **KaTeX 0.16.11** - LaTeX math rendering (CDN)
- No other external dependencies

### Browser Support
- Chrome, Firefox, Safari, Edge (modern versions)
- JavaScript ES6+ required

### Adding New Questions

Questions are generated in `assets/js/generators.js`. Each generator returns:

```javascript
{
  prompt: "Question text with $LaTeX$ support",
  answer: ["correct", "answers"],
  check: (userInput) => boolean,  // Validation function
  solution: "Detailed solution with $math$",
  ui: { type: "text" | "sequence" | "matrix", ... },  // Optional
  visual: { graph: { ... } }  // Optional graph visualization
}
```

### Adding New Topics

1. Add topic to `TOPICS` object in `syllabus.js`
2. Create corresponding HTML file in `topics/`
3. Add generator function in `generators.js`
4. Update navigation in part HTML files

## 📖 Algorithm Visualizations

The `/alg/JavascriptVisualRelease/` directory contains interactive algorithm visualizations including:

- Binary Search Trees (BST, AVL, Red-Black, Splay)
- Heaps (Binary, Binomial, Fibonacci)
- Sorting Algorithms (Comparison, Bucket, Radix, Heap)
- Graph Algorithms (BFS, DFS, Dijkstra, Kruskal, Prim)
- Dynamic Programming visualizations
- And more...

## 📝 License

Educational use. Algorithm visualizations adapted from [David Galles' visualization tool](https://www.cs.usfca.edu/~galles/visualization/).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your questions/topics
4. Submit a pull request

---

*Built for CSE100 - Algorithms and Data Structures*
