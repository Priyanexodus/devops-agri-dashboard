from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import controllers

router = APIRouter()

@router.get("/api/yields")
def read_yields(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    yields = controllers.get_crop_yields(db, skip=skip, limit=limit)
    return yields

@router.get("/api/consumption")
def read_consumption(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    consumption = controllers.get_domestic_consumption(db, skip=skip, limit=limit)
    return consumption

@router.get("/api/ethanol-targets")
def read_ethanol_targets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    targets = controllers.get_ethanol_targets(db, skip=skip, limit=limit)
    return targets
