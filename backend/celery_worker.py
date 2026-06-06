from celery import Celery
import os

redis_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")

celery_app = Celery(
    "taxpro_tasks",
    broker=redis_url,
    backend=redis_url
)

@celery_app.task
def sample_task(word: str):
    return f"Processed: {word}"
