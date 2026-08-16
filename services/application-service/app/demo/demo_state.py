from typing import Any, Dict, List
import datetime
import uuid

# UUIDs for the 6 application-level participants
# We use deterministic UUIDs so they remain consistent across restarts
ORG_GREEN_VALLEY_ID = "11111111-1111-4111-a111-111111111111"  # Producer
ORG_FRESH_HARVEST_ID = "22222222-2222-4222-a222-222222222222" # Processor
ORG_FAST_LOGISTICS_ID = "33333333-3333-4333-a333-333333333333" # Transporter
ORG_FRESH_MART_ID = "44444444-4444-4444-a444-444444444444"    # Retailer
ORG_FSA_ID = "55555555-5555-4555-a555-555555555555"          # Regulator
USR_CONSUMER_ID = "66666666-6666-4666-a666-666666666666"      # Consumer

class SharedDemoState:
    """
    Canonical demo state for MOCK_MODE=true.
    This provides a unified simulation dataset for both DataServiceMock and BlockchainServiceMock.
    """
    def __init__(self):
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # --- ORGANIZATIONS ---
        self.organizations: Dict[str, Dict[str, Any]] = {
            ORG_GREEN_VALLEY_ID: {
                "org_id": ORG_GREEN_VALLEY_ID,
                "name": "Green Valley Citrus Farms",
                "type": "PRODUCER",
                "fabric_msp_id": "Org1MSP",
                "created_at": now
            },
            ORG_FRESH_HARVEST_ID: {
                "org_id": ORG_FRESH_HARVEST_ID,
                "name": "FreshHarvest Processing",
                "type": "PROCESSOR",
                "fabric_msp_id": "Org1MSP",
                "created_at": now
            },
            ORG_FAST_LOGISTICS_ID: {
                "org_id": ORG_FAST_LOGISTICS_ID,
                "name": "FastLogistics",
                "type": "TRANSPORTER",
                "fabric_msp_id": "Org2MSP",
                "created_at": now
            },
            ORG_FRESH_MART_ID: {
                "org_id": ORG_FRESH_MART_ID,
                "name": "FreshMart",
                "type": "RETAILER",
                "fabric_msp_id": "Org2MSP",
                "created_at": now
            },
            ORG_FSA_ID: {
                "org_id": ORG_FSA_ID,
                "name": "Food Safety Authority",
                "type": "REGULATOR",
                "fabric_msp_id": "SystemMSP",
                "created_at": now
            }
        }

        # --- USERS ---
        self.users: Dict[str, Dict[str, Any]] = {
            USR_CONSUMER_ID: {
                "user_id": USR_CONSUMER_ID,
                "auth_subject": "demo_consumer",
                "organization_id": None,
                "role_id": "role_consumer",
                "created_at": now
            }
        }

        # --- PRODUCTS ---
        self.products: Dict[str, Dict[str, Any]] = {
            "prd-orange-001": {
                "product_id": "prd-orange-001",
                "name": "Organic Valencia Orange",
                "sku": "SKU-ORG-VAL-01",
                "category": "PRODUCE",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "created_at": now
            },
            "prd-mango-001": {
                "product_id": "prd-mango-001",
                "name": "Alphonso Mango",
                "sku": "SKU-MNG-ALPH-01",
                "category": "PRODUCE",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "created_at": now
            },
            "prd-apple-001": {
                "product_id": "prd-apple-001",
                "name": "Fuji Apple",
                "sku": "SKU-APL-FUJI-01",
                "category": "PRODUCE",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "created_at": now
            }
        }

        # --- BATCHES (Canonical Traceability Journey) ---
        # The Journey: Producer -> Processor -> Transporter -> Retailer
        
        self.batches: Dict[str, Dict[str, Any]] = {
            # 1. Harvested Batch (Producer)
            "batch-orange-001-raw": {
                "batch_id": "batch-orange-001-raw",
                "product_id": "prd-orange-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_GREEN_VALLEY_ID,
                "lifecycle_state": "REGISTERED",
                "quantity": 5000.0,
                "unit_of_measure": "KG",
                "created_at": now
            },
            # 2. Processed/Packaged Batch (Processor)
            "batch-orange-001-packaged": {
                "batch_id": "batch-orange-001-packaged",
                "product_id": "prd-orange-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_FRESH_MART_ID,  # Has reached Retailer!
                "lifecycle_state": "RECEIVED", 
                "quantity": 1000.0,
                "unit_of_measure": "BOXES",
                "created_at": now
            }
        }

        # --- LINEAGE (Parents / Children) ---
        self.lineage_edges: List[Dict[str, Any]] = [
            {
                "edge_id": "edge-orange-proc-1",
                "parent_batch_id": "batch-orange-001-raw",
                "child_batch_id": "batch-orange-001-packaged",
                "metadata": {"operation": "Packaging and Washing"},
                "created_at": now
            }
        ]

        # --- UNITS & QR ---
        # QR Resolution: QR-ORANGE-001 resolves to batch-orange-001-packaged
        self.units: Dict[str, Dict[str, Any]] = {
            "unit-orange-1": {
                "unit_id": "unit-orange-1",
                "batch_id": "batch-orange-001-packaged",
                "qr_identifier": "QR-ORANGE-001",
                "created_at": now
            },
            "unit-mango-1": {
                "unit_id": "unit-mango-1",
                "batch_id": "batch-mango-001", # Unused in full flow but queryable
                "qr_identifier": "QR-MANGO-001",
                "created_at": now
            },
            "unit-apple-1": {
                "unit_id": "unit-apple-1",
                "batch_id": "batch-apple-001", # Unused in full flow but queryable
                "qr_identifier": "QR-APPLE-001",
                "created_at": now
            }
        }
        
        self.qr_to_entity: Dict[str, Dict[str, str]] = {
            "QR-ORANGE-001": {"type": "BATCH", "id": "batch-orange-001-packaged"},
            "QR-MANGO-001": {"type": "BATCH", "id": "batch-mango-001"},
            "QR-APPLE-001": {"type": "BATCH", "id": "batch-apple-001"}
        }

        # --- EVENTS & AUDIT TRAIL ---
        self.events: List[Dict[str, Any]] = [
            {"event_id": "evt-1", "reference_id": "batch-orange-001-raw", "event_type": "BATCH_REGISTERED", "actor_org_id": ORG_GREEN_VALLEY_ID, "timestamp": now},
            {"event_id": "evt-2", "reference_id": "batch-orange-001-packaged", "event_type": "BATCH_PROCESSED", "actor_org_id": ORG_FRESH_HARVEST_ID, "timestamp": now},
            {"event_id": "evt-3", "reference_id": "batch-orange-001-packaged", "event_type": "CUSTODY_TRANSFERRED", "actor_org_id": ORG_FAST_LOGISTICS_ID, "timestamp": now},
            {"event_id": "evt-4", "reference_id": "batch-orange-001-packaged", "event_type": "CUSTODY_RECEIVED", "actor_org_id": ORG_FRESH_MART_ID, "timestamp": now},
        ]
        
        self.scan_events: List[Dict[str, Any]] = [
            {"scan_id": "scan-1", "reference_id": "batch-orange-001-packaged", "scan_type": "CONSUMER_QR", "timestamp": now}
        ]

        # --- IPFS EVIDENCE ---
        self.ipfs_storage: Dict[str, Dict[str, Any]] = {
            "QmDemoOrangeQualityReport": {
                "cid": "QmDemoOrangeQualityReport",
                "filename": "Orange_Quality_Report.pdf",
                "size_bytes": 1048576,
                "created_at": now
            },
            "QmDemoTransportManifest": {
                "cid": "QmDemoTransportManifest",
                "filename": "Transport_Manifest.pdf",
                "size_bytes": 512000,
                "created_at": now
            }
        }

        # --- INCIDENTS & RECALLS ---
        self.incidents: Dict[str, Dict[str, Any]] = {
            "inc-demo-1": {
                "incident_id": "inc-demo-1",
                "batch_id": "batch-orange-001-packaged",
                "status": "OPEN",
                "description": "Consumer reported illness after consuming product.",
                "created_at": now
            }
        }
        
        self.recalls: Dict[str, Dict[str, Any]] = {}
        
        # --- BLOCKCHAIN COMMITTED TRANSACTIONS ---
        self.committed_transactions: List[Dict[str, Any]] = [
            {
                "tx_id": f"tx-demo-1",
                "block_number": 1,
                "contract": "TraceabilityContract",
                "function": "registerBatch",
                "args": {"batch_id": "batch-orange-001-raw"},
                "status": "COMMITTED",
                "timestamp": now
            }
        ]

# Global Singleton for Mock Mode
demo_state = SharedDemoState()
