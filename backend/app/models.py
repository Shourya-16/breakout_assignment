from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict, Field

from app.database import Base

# ==========================================
# SQLAlchemy Models
# ==========================================

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(100), nullable=False)
    channel = Column(String(50), nullable=False)  # whatsapp, email, call
    message = Column(Text, nullable=False)
    status = Column(String(50), default="New")  # New, Qualified, Escalated
    sop_label = Column(String(100), nullable=True)
    suggested_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    timeline_events = relationship("TimelineEvent", back_populates="enquiry", cascade="all, delete-orphan")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status_update = Column(String(100), nullable=False)  # e.g., "New", "Qualified", "Escalated", "Follow-up Scheduled"
    log_message = Column(Text, nullable=False)

    # Relationships
    enquiry = relationship("Enquiry", back_populates="timeline_events")


# ==========================================
# Pydantic Schemas (V2 compliant)
# ==========================================

class EnquiryCreate(BaseModel):
    customer_name: str = Field(..., description="Name of the customer sending the enquiry", example="John Doe")
    channel: str = Field(..., description="Inbound channel: whatsapp, email, or call", example="whatsapp")
    message: str = Field(..., description="Contents of the customer's enquiry message", example="How much does the enterprise plan cost?")

class EnquiryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    channel: str
    message: str
    status: str
    sop_label: Optional[str] = None
    suggested_response: Optional[str] = None
    created_at: datetime

class FollowUpCreate(BaseModel):
    delay_minutes: int = Field(..., description="Delay in minutes for scheduling the follow-up", example=30)
    message_template: Optional[str] = Field(None, description="Optional custom template to send during follow-up", example="Hi John, checking in on your pricing request.")

class EscalateRequest(BaseModel):
    reason: str = Field(..., description="Reason for manual escalation to a human agent", example="Customer requested a live agent")

class TimelineEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    enquiry_id: int
    timestamp: datetime
    status_update: str
    log_message: str

class EnquiryHistoryResponse(BaseModel):
    enquiry: EnquiryResponse
    timeline: List[TimelineEventResponse]
