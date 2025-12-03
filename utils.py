# utils.py
from slugify import slugify as py_slugify

def slugify(value: str) -> str:
    """
    Обёртка над python-slugify.
    Пример: "Введение в FastAPI" -> "vvedenie-v-fastapi"
    """
    return py_slugify(value)
