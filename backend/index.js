const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── CHANGE THESE TO YOUR OWN DETAILS ──────────────────────────────────────────
const USER_ID = "Himani_25072006";          // fullname_ddmmyyyy
const EMAIL_ID = "himani0521.be23@chitkara.edu.in";
const COLLEGE_ROLL = "2310990521";
// ─────────────────────────────────────────────────────────────────────────────

// Regex: single uppercase letter -> single uppercase letter
const VALID_EDGE = /^([A-Z])->([A-Z])$/;

function parseAndValidate(data) {
  const validEdges = [];     // [{from, to, raw}]
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();

  for (let raw of data) {
    const trimmed = (typeof raw === "string") ? raw.trim() : String(raw);

    // Self-loop A->A, or invalid format
    const match = trimmed.match(VALID_EDGE);
    if (!match || match[1] === match[2]) {
      invalidEntries.push(raw);
      continue;
    }

    const key = `${match[1]}->${match[2]}`;
    if (seenEdges.has(key)) {
      // Only push once to duplicate_edges
      if (!duplicateEdges.includes(key)) duplicateEdges.push(key);
    } else {
      seenEdges.add(key);
      validEdges.push({ from: match[1], to: match[2] });
    }
  }

  return { validEdges, invalidEntries, duplicateEdges };
}

function buildHierarchies(validEdges) {
  // Build adjacency: parent -> Set of children (first-parent-wins for multi-parent)
  const childToParent = {}; // child -> parent (first encountered wins)
  const parentToChildren = {}; // parent -> [children]
  const allNodes = new Set();

  for (const { from, to } of validEdges) {
    allNodes.add(from);
    allNodes.add(to);

    if (childToParent[to] === undefined) {
      childToParent[to] = from;
      if (!parentToChildren[from]) parentToChildren[from] = [];
      parentToChildren[from].push(to);
    }
    // else: silently discard (multi-parent, non-first)
  }

  // Find groups via Union-Find
  const parent = {};
  function find(x) {
    if (parent[x] === undefined) parent[x] = x;
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a, b) {
    parent[find(a)] = find(b);
  }

  for (const { from, to } of validEdges) union(from, to);

  const groups = {};
  for (const node of allNodes) {
    const root = find(node);
    if (!groups[root]) groups[root] = new Set();
    groups[root].add(node);
  }

  const hierarchies = [];

  for (const groupNodes of Object.values(groups)) {
    // Detect cycle using DFS
    const visited = new Set();
    const stack = new Set();
    let hasCycle = false;

    function dfs(node) {
      if (hasCycle) return;
      visited.add(node);
      stack.add(node);
      for (const child of (parentToChildren[node] || [])) {
        if (!visited.has(child)) dfs(child);
        else if (stack.has(child)) { hasCycle = true; return; }
      }
      stack.delete(node);
    }

    for (const node of groupNodes) {
      if (!visited.has(node)) dfs(node);
    }

    // Find roots: nodes not appearing as any child
    const childNodes = new Set(Object.keys(childToParent).filter(k => groupNodes.has(k)));
    const roots = [...groupNodes].filter(n => !childNodes.has(n)).sort();

    // If no root (pure cycle), pick lexicographically smallest
    const treeRoot = roots.length > 0 ? roots[0] : [...groupNodes].sort()[0];

    if (hasCycle) {
      hierarchies.push({ root: treeRoot, tree: {}, has_cycle: true });
    } else {
      // Build nested tree recursively
      function buildTree(node) {
        const children = (parentToChildren[node] || []).sort();
        const obj = {};
        for (const child of children) obj[child] = buildTree(child);
        return obj;
      }

      function calcDepth(node) {
        const children = parentToChildren[node] || [];
        if (children.length === 0) return 1;
        return 1 + Math.max(...children.map(calcDepth));
      }

      const tree = { [treeRoot]: buildTree(treeRoot) };
      const depth = calcDepth(treeRoot);
      hierarchies.push({ root: treeRoot, tree, depth });
    }
  }

  // Sort hierarchies: non-cyclic first (by depth desc, then root asc), then cyclic
  hierarchies.sort((a, b) => {
    if (!a.has_cycle && !b.has_cycle) return (b.depth - a.depth) || a.root.localeCompare(b.root);
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root.localeCompare(b.root);
  });

  return hierarchies;
}

function buildSummary(hierarchies) {
  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);

  let largestRoot = "";
  let maxDepth = -1;
  for (const h of nonCyclic) {
    if (h.depth > maxDepth || (h.depth === maxDepth && h.root < largestRoot)) {
      maxDepth = h.depth;
      largestRoot = h.root;
    }
  }

  return {
    total_trees: nonCyclic.length,
    total_cycles: cyclic.length,
    largest_tree_root: largestRoot,
  };
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an array" });
  }

  const { validEdges, invalidEntries, duplicateEdges } = parseAndValidate(data);
  const hierarchies = validEdges.length > 0 ? buildHierarchies(validEdges) : [];
  const summary = buildSummary(hierarchies);

  res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BFHL API running on port ${PORT}`));
