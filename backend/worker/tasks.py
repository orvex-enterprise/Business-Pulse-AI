from celery import Celery
import os

celery_app = Celery(
    "business_pulse_tasks",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
)

@celery_app.task
def send_notification(priority: str, message: str, channels: list):
    print(f"Sending [{priority}] notification via {channels}: {message}")
    return True
