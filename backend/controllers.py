from sqlalchemy.orm import Session
from models import CropYield, DomesticConsumption, EthanolTarget

def get_crop_yields(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CropYield).offset(skip).limit(limit).all()

def get_domestic_consumption(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DomesticConsumption).offset(skip).limit(limit).all()

def get_ethanol_targets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(EthanolTarget).offset(skip).limit(limit).all()

def get_dashboard_summary(db: Session):
    # This would aggregate data for the dashboard.
    # For now, it could just return a mocked summary if requested.
    pass
