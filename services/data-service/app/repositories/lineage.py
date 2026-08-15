from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Dict, Any

class LineageRepository:
    @staticmethod
    async def get_lineage(db: AsyncSession, entity_id: str) -> Dict[str, Any]:
        """
        Traverses upstream (parents) and downstream (children) lineage relationships
        from a starting batch_id using PostgreSQL Recursive Common Table Expressions (CTEs).
        """
        # 1. Recursive Upstream query (finding parents)
        upstream_query = text("""
            WITH RECURSIVE upstream_lineage AS (
                -- Anchor Member: find direct parent edges of child batch
                SELECT parent_batch_id, child_batch_id, relation_type, quantity
                FROM lineage_edges
                WHERE child_batch_id = :entity_id
                UNION ALL
                -- Recursive Member: join current parents with their parent edges
                SELECT le.parent_batch_id, le.child_batch_id, le.relation_type, le.quantity
                FROM lineage_edges le
                JOIN upstream_lineage ul ON le.child_batch_id = ul.parent_batch_id
            )
            SELECT DISTINCT parent_batch_id, child_batch_id, relation_type, quantity FROM upstream_lineage;
        """)

        # 2. Recursive Downstream query (finding children)
        downstream_query = text("""
            WITH RECURSIVE downstream_lineage AS (
                -- Anchor Member: find direct child edges of parent batch
                SELECT parent_batch_id, child_batch_id, relation_type, quantity
                FROM lineage_edges
                WHERE parent_batch_id = :entity_id
                UNION ALL
                -- Recursive Member: join current children with their child edges
                SELECT le.parent_batch_id, le.child_batch_id, le.relation_type, le.quantity
                FROM lineage_edges le
                JOIN downstream_lineage dl ON le.parent_batch_id = dl.child_batch_id
            )
            SELECT DISTINCT parent_batch_id, child_batch_id, relation_type, quantity FROM downstream_lineage;
        """)

        # Execute Upstream traversal
        up_results = await db.execute(upstream_query, {"entity_id": entity_id})
        upstream_edges = [
            {
                "parent_id": row.parent_batch_id,
                "child_id": row.child_batch_id,
                "relation_type": row.relation_type,
                "quantity": float(row.quantity) if row.quantity is not None else None
            }
            for row in up_results.fetchall()
        ]

        # Execute Downstream traversal
        down_results = await db.execute(downstream_query, {"entity_id": entity_id})
        downstream_edges = [
            {
                "parent_id": row.parent_batch_id,
                "child_id": row.child_batch_id,
                "relation_type": row.relation_type,
                "quantity": float(row.quantity) if row.quantity is not None else None
            }
            for row in down_results.fetchall()
        ]

        # Assemble lists of distinct entity IDs mapped in upstream/downstream paths
        upstream_nodes = list({edge["parent_id"] for edge in upstream_edges})
        downstream_nodes = list({edge["child_id"] for edge in downstream_edges})

        # Combine all traversed edges for full adjacency graph trace
        all_edges = upstream_edges + downstream_edges
        
        # Deduplicate edges
        unique_edges = []
        seen = set()
        for edge in all_edges:
            key = (edge["parent_id"], edge["child_id"])
            if key not in seen:
                seen.add(key)
                unique_edges.append(edge)

        return {
            "entity_id": entity_id,
            "upstream": upstream_nodes,
            "downstream": downstream_nodes,
            "edges": unique_edges
        }

    @staticmethod
    async def create_edge(db: AsyncSession, parent_batch_id: str, child_batch_id: str, relation_type: str = "TRANSFORMATION", quantity = None) -> Dict[str, Any]:
        """
        Inserts a direct lineage adjacency relationship edge between a parent and child batch.
        """
        from app.models.lineage import LineageEdge
        edge = LineageEdge(
            parent_batch_id=parent_batch_id,
            child_batch_id=child_batch_id,
            relation_type=relation_type,
            quantity=quantity
        )
        db.add(edge)
        await db.flush()
        return {
            "parent_batch_id": parent_batch_id,
            "child_batch_id": child_batch_id,
            "relation_type": relation_type,
            "quantity": float(quantity) if quantity is not None else None
        }
