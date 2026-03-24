from sqlalchemy import Column, Integer, String, Float
from database import Base

class CropYield(Base):
    __tablename__ = "crop_yields"
    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String, index=True)
    year = Column(Integer)
    yield_amount = Column(Float) # in metric tons

class DomesticConsumption(Base):
    __tablename__ = "domestic_consumption"
    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String, index=True)
    year = Column(Integer)
    consumption_amount = Column(Float) # in metric tons

class EthanolTarget(Base):
    __tablename__ = "ethanol_targets"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer)
    target_blending_percentage = Column(Float)
    achieved_blending_percentage = Column(Float)
