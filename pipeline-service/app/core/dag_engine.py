"""
DAG (Directed Acyclic Graph) Engine

Provides validation, topological sorting, and execution ordering for workflow DAGs.
"""
from typing import List, Dict, Set, Tuple
from collections import defaultdict, deque


class DAGValidationError(Exception):
    """Raised when DAG validation fails"""
    pass


class DAGEngine:
    """
    Engine for validating and executing workflow DAGs.
    """

    def __init__(self, nodes: List[Dict], edges: List[Dict]):
        """
        Initialize DAG engine with nodes and edges.

        Args:
            nodes: List of node dicts with 'node_id' field
            edges: List of edge dicts with 'source_node_id' and 'target_node_id' fields
        """
        self.nodes = {node['node_id']: node for node in nodes}
        self.edges = edges
        self.adjacency_list = self._build_adjacency_list()
        self.reverse_adjacency_list = self._build_reverse_adjacency_list()

    def _build_adjacency_list(self) -> Dict[str, List[str]]:
        """Build adjacency list representation (node -> [children])"""
        adj_list = defaultdict(list)
        for edge in self.edges:
            source = edge['source_node_id']
            target = edge['target_node_id']
            adj_list[source].append(target)
        # Ensure all nodes are in adjacency list
        for node_id in self.nodes:
            if node_id not in adj_list:
                adj_list[node_id] = []
        return adj_list

    def _build_reverse_adjacency_list(self) -> Dict[str, List[str]]:
        """Build reverse adjacency list (node -> [parents])"""
        reverse_adj = defaultdict(list)
        for edge in self.edges:
            source = edge['source_node_id']
            target = edge['target_node_id']
            reverse_adj[target].append(source)
        # Ensure all nodes are in reverse adjacency list
        for node_id in self.nodes:
            if node_id not in reverse_adj:
                reverse_adj[node_id] = []
        return reverse_adj

    def validate(self) -> Tuple[bool, str]:
        """
        Validate the DAG structure.

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check for empty graph
        if not self.nodes:
            return False, "Workflow has no nodes"

        # Check for orphaned edges (edges pointing to non-existent nodes)
        node_ids = set(self.nodes.keys())
        for edge in self.edges:
            source = edge['source_node_id']
            target = edge['target_node_id']
            if source not in node_ids:
                return False, f"Edge references non-existent source node: {source}"
            if target not in node_ids:
                return False, f"Edge references non-existent target node: {target}"

        # Check for cycles using DFS
        has_cycle, cycle_path = self._detect_cycle()
        if has_cycle:
            cycle_str = " -> ".join(cycle_path)
            return False, f"Workflow contains a cycle: {cycle_str}"

        # Check for multiple root nodes (nodes with no incoming edges)
        root_nodes = self.get_root_nodes()
        if len(root_nodes) > 1:
            return False, f"Workflow has multiple root nodes: {', '.join(root_nodes)}"

        if len(root_nodes) == 0:
            return False, "Workflow has no root node (all nodes have incoming edges)"

        return True, ""

    def _detect_cycle(self) -> Tuple[bool, List[str]]:
        """
        Detect if the graph contains a cycle using DFS.

        Returns:
            Tuple of (has_cycle, cycle_path)
        """
        WHITE, GRAY, BLACK = 0, 1, 2
        color = {node_id: WHITE for node_id in self.nodes}
        parent = {node_id: None for node_id in self.nodes}

        def dfs(node: str) -> Tuple[bool, List[str]]:
            color[node] = GRAY
            for neighbor in self.adjacency_list[node]:
                if color[neighbor] == GRAY:
                    # Found a cycle, reconstruct path
                    cycle = [neighbor, node]
                    current = node
                    while parent[current] != neighbor and parent[current] is not None:
                        current = parent[current]
                        cycle.append(current)
                    cycle.reverse()
                    return True, cycle
                elif color[neighbor] == WHITE:
                    parent[neighbor] = node
                    has_cycle, cycle_path = dfs(neighbor)
                    if has_cycle:
                        return True, cycle_path
            color[node] = BLACK
            return False, []

        for node_id in self.nodes:
            if color[node_id] == WHITE:
                has_cycle, cycle_path = dfs(node_id)
                if has_cycle:
                    return True, cycle_path

        return False, []

    def get_root_nodes(self) -> List[str]:
        """Get all root nodes (nodes with no incoming edges)"""
        nodes_with_incoming = set()
        for edge in self.edges:
            nodes_with_incoming.add(edge['target_node_id'])

        root_nodes = [
            node_id for node_id in self.nodes
            if node_id not in nodes_with_incoming
        ]
        return root_nodes

    def get_leaf_nodes(self) -> List[str]:
        """Get all leaf nodes (nodes with no outgoing edges)"""
        nodes_with_outgoing = set()
        for edge in self.edges:
            nodes_with_outgoing.add(edge['source_node_id'])

        leaf_nodes = [
            node_id for node_id in self.nodes
            if node_id not in nodes_with_outgoing
        ]
        return leaf_nodes

    def topological_sort(self) -> List[str]:
        """
        Perform topological sort using Kahn's algorithm.

        Returns:
            List of node IDs in topologically sorted order.

        Raises:
            DAGValidationError: If the graph contains a cycle.
        """
        # Calculate in-degree for each node
        in_degree = {node_id: 0 for node_id in self.nodes}
        for edge in self.edges:
            in_degree[edge['target_node_id']] += 1

        # Queue of nodes with in-degree 0
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        sorted_order = []

        while queue:
            node = queue.popleft()
            sorted_order.append(node)

            # Reduce in-degree for neighbors
            for neighbor in self.adjacency_list[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # If not all nodes were processed, there's a cycle
        if len(sorted_order) != len(self.nodes):
            raise DAGValidationError("Cannot perform topological sort: graph contains a cycle")

        return sorted_order

    def get_execution_levels(self) -> List[List[str]]:
        """
        Get nodes grouped by execution level for parallel execution.
        Nodes in the same level can be executed in parallel.

        Returns:
            List of levels, where each level is a list of node IDs.
        """
        # Calculate in-degree for each node
        in_degree = {node_id: 0 for node_id in self.nodes}
        for edge in self.edges:
            in_degree[edge['target_node_id']] += 1

        # Start with root nodes (level 0)
        current_level = [node_id for node_id, degree in in_degree.items() if degree == 0]
        levels = []

        while current_level:
            levels.append(current_level[:])
            next_level = []

            for node in current_level:
                for neighbor in self.adjacency_list[node]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        next_level.append(neighbor)

            current_level = next_level

        return levels

    def get_node_dependencies(self, node_id: str) -> List[str]:
        """
        Get all direct dependencies (parent nodes) for a given node.

        Args:
            node_id: Node ID to get dependencies for

        Returns:
            List of parent node IDs
        """
        return self.reverse_adjacency_list[node_id]

    def get_node_dependents(self, node_id: str) -> List[str]:
        """
        Get all direct dependents (child nodes) for a given node.

        Args:
            node_id: Node ID to get dependents for

        Returns:
            List of child node IDs
        """
        return self.adjacency_list[node_id]

    def can_execute_node(self, node_id: str, completed_nodes: Set[str]) -> bool:
        """
        Check if a node can be executed based on completed dependencies.

        Args:
            node_id: Node ID to check
            completed_nodes: Set of node IDs that have completed

        Returns:
            True if all dependencies are completed, False otherwise
        """
        dependencies = self.get_node_dependencies(node_id)
        return all(dep in completed_nodes for dep in dependencies)

    def get_next_executable_nodes(self, completed_nodes: Set[str], running_nodes: Set[str]) -> List[str]:
        """
        Get all nodes that can be executed next (all dependencies completed).

        Args:
            completed_nodes: Set of node IDs that have completed
            running_nodes: Set of node IDs currently running

        Returns:
            List of node IDs that can be executed
        """
        executable = []
        for node_id in self.nodes:
            if node_id not in completed_nodes and node_id not in running_nodes:
                if self.can_execute_node(node_id, completed_nodes):
                    executable.append(node_id)
        return executable
