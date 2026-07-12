"""Merge multiple module migrations

Revision ID: 69b0e837dc93
Revises: 08a526b42823, 7df2588902d2
Create Date: 2026-07-12 15:45:48.496310

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '69b0e837dc93'
down_revision: Union[str, None] = ('08a526b42823', '7df2588902d2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
