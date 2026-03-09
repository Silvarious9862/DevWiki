# routers/dashboard_stats.py
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app import models  
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardStats(BaseModel):
    articles_total: int
    articles_delta_week: int

    visitors_total: int | None = None
    visitors_delta_week: float | None = None

    comments_total: int
    comments_delta_week: int

    avg_edit_interval_hours: float | None = None


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStats:
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # всего статей
    articles_total = db.query(models.Article).count()

    # сколько статей создано за последние 7 дней
    articles_week = (
        db.query(models.Article)
        .filter(models.Article.created_at >= week_ago)
        .count()
    )

    # всего комментариев
    comments_total = db.query(models.Comment).count()

    comments_week = (
        db.query(models.Comment)
        .filter(models.Comment.created_at >= week_ago)
        .count()
    )

    # заглушки для посетителей, пока не подключена метрика
    visitors_total = None
    visitors_delta_week = None

    # пример вычисления среднего интервала между изменениями статьи
    # (опционально, можно реализовать позже)
    avg_edit_interval_hours = None

    return DashboardStats(
        articles_total=articles_total,
        articles_delta_week=articles_week,
        visitors_total=visitors_total,
        visitors_delta_week=visitors_delta_week,
        comments_total=comments_total,
        comments_delta_week=comments_week,
        avg_edit_interval_hours=avg_edit_interval_hours,
    )
