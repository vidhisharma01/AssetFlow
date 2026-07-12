from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AssetFlow"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/assetflow"
    
    # JWT Auth
    SECRET_KEY: str = "supersecretkey"  # change in prod
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
