from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://taskforge:taskforge_secret@db:5432/taskforge"
    SECRET_KEY: str = "taskforge-super-secret-key-2024"
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
