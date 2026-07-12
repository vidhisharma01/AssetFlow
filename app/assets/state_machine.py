from app.core.enums import AssetStatus
from app.core.exceptions import BadRequestException

# Allowed transitions from a given state to a new state
ALLOWED_TRANSITIONS = {
    AssetStatus.AVAILABLE: [AssetStatus.ALLOCATED, AssetStatus.RESERVED, AssetStatus.UNDER_MAINTENANCE, AssetStatus.RETIRED],
    AssetStatus.ALLOCATED: [AssetStatus.AVAILABLE, AssetStatus.LOST, AssetStatus.RETIRED],
    AssetStatus.RESERVED: [AssetStatus.ALLOCATED, AssetStatus.AVAILABLE],
    AssetStatus.UNDER_MAINTENANCE: [AssetStatus.AVAILABLE, AssetStatus.RETIRED, AssetStatus.DISPOSED],
    AssetStatus.LOST: [AssetStatus.AVAILABLE, AssetStatus.RETIRED],
    AssetStatus.RETIRED: [AssetStatus.DISPOSED],
    AssetStatus.DISPOSED: []
}

class AssetStateMachine:
    @staticmethod
    def can_transition(current_status: AssetStatus, next_status: AssetStatus) -> bool:
        """Check if a status transition is allowed."""
        if current_status == next_status:
            return True
        
        # Postgres might return a raw string instead of an Enum object
        if isinstance(current_status, str):
            try:
                current_status = AssetStatus(current_status)
            except ValueError:
                return False
                
        return next_status in ALLOWED_TRANSITIONS.get(current_status, [])

    @staticmethod
    def validate_transition(current_status: AssetStatus, next_status: AssetStatus):
        """Validate transition and raise exception if invalid."""
        if not AssetStateMachine.can_transition(current_status, next_status):
            current_val = current_status.value if hasattr(current_status, 'value') else current_status
            next_val = next_status.value if hasattr(next_status, 'value') else next_status
            raise BadRequestException(f"Invalid transition from {current_val} to {next_val}")
