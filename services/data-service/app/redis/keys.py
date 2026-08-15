class CacheKeys:
    @staticmethod
    def trace(entity: str, entity_id: str) -> str:
        """Key format: trace:{entity}:{entity_id}:v1"""
        return f"trace:{entity}:{entity_id}:v1"

    @staticmethod
    def batch(batch_id: str) -> str:
        """Key format: batch:{batch_id}:v1"""
        return f"batch:{batch_id}:v1"

    @staticmethod
    def unit(unit_id: str) -> str:
        """Key format: unit:{unit_id}:v1"""
        return f"unit:{unit_id}:v1"

    @staticmethod
    def qr(ref: str) -> str:
        """Key format: qr:{ref}:v1"""
        return f"qr:{ref}:v1"

    @staticmethod
    def risk(incident_id: str) -> str:
        """Key format: risk:{incident_id}:v1"""
        return f"risk:{incident_id}:v1"
