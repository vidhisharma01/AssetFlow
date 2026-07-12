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
        return next_status in ALLOWED_TRANSITIONS.get(current_status, [])

    @staticmethod
    def validate_transition(current_status: AssetStatus, next_status: AssetStatus):
        """Validate transition and raise exception if invalid."""
        if not AssetStateMachine.can_transition(current_status, next_status):
            raise BadRequestException(f"Invalid transition from {current_status.value} to {next_status.value}")
