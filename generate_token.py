from datetime import timedelta
from app.identity.service import create_access_token
from app.config import settings

token = create_access_token({"sub": "1"}, expires_delta=timedelta(days=365))
print(token)
