from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

from app.database import engine, get_db, Base
from app.models import (
    Enquiry, TimelineEvent,
    EnquiryCreate, EnquiryResponse,
    FollowUpCreate, EscalateRequest,
    EnquiryHistoryResponse
)
from app.worker import process_enquiry_task
from app.logger import logger

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Closira Inbound Enquiry API",
    description="Closira's core asynchronous pipeline simulating SMB inbound customer enquiry workflows across WhatsApp, Email, and Calls.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.post(
    "/enquiry",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Create Inbound Enquiry",
    description="Accepts an inbound enquiry, saves it to the SQLite database, schedules a background processor task, and returns a job ID instantly without blocking."
)
def create_enquiry(
    payload: EnquiryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Channel validation
    normalized_channel = payload.channel.lower().strip()
    if normalized_channel not in ["whatsapp", "email", "call"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid channel. Must be one of: 'whatsapp', 'email', or 'call'."
        )

    try:
        # Create Enquiry
        enquiry = Enquiry(
            customer_name=payload.customer_name,
            channel=normalized_channel,
            message=payload.message,
            status="New"
        )
        db.add(enquiry)
        db.commit()
        db.refresh(enquiry)

        # Create Initial Timeline Event
        initial_event = TimelineEvent(
            enquiry_id=enquiry.id,
            status_update="New",
            log_message=f"Enquiry received via {normalized_channel.capitalize()}."
        )
        db.add(initial_event)
        db.commit()

        # Emit structured JSON log
        logger.info(
            f"New enquiry created for {enquiry.customer_name} via {enquiry.channel}",
            extra={
                "event": "enquiry_created",
                "enquiry_id": enquiry.id,
                "channel": enquiry.channel,
                "customer_name": enquiry.customer_name
            }
        )

        # Dispatch task to background worker
        background_tasks.add_task(process_enquiry_task, enquiry.id)

        # Return job ID and info instantly
        return {
            "job_id": f"job_enquiry_{enquiry.id}",
            "enquiry_id": enquiry.id,
            "status": enquiry.status,
            "customer_name": enquiry.customer_name,
            "message": "Enquiry queued successfully. Processing in background."
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create enquiry: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database write failure"
        )


@app.post(
    "/enquiry/{id}/follow-up",
    response_model=Dict[str, Any],
    summary="Schedule Follow-up Task",
    description="Schedules a follow-up action for an open enquiry, updating its timeline tracking log."
)
def schedule_follow_up(
    id: int,
    payload: FollowUpCreate,
    db: Session = Depends(get_db)
):
    enquiry = db.query(Enquiry).filter(Enquiry.id == id).first()
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enquiry with ID {id} not found."
        )

    if payload.delay_minutes <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Delay minutes must be a positive integer."
        )

    try:
        template_msg = payload.message_template if payload.message_template else "Follow-up reminder"
        log_message = f"Follow-up scheduled in {payload.delay_minutes} minutes. Template: '{template_msg}'"
        
        # Add Timeline Event
        event = TimelineEvent(
            enquiry_id=enquiry.id,
            status_update="Follow-up Scheduled",
            log_message=log_message
        )
        db.add(event)
        db.commit()

        # Emit structured log
        logger.info(
            f"Follow-up scheduled for Enquiry ID {id}",
            extra={
                "event": "follow_up_scheduled",
                "enquiry_id": id,
                "delay_minutes": payload.delay_minutes
            }
        )

        return {
            "status": "success",
            "enquiry_id": id,
            "message": "Follow-up task scheduled.",
            "details": log_message
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule follow-up: {str(e)}"
        )


@app.post(
    "/enquiry/{id}/escalate",
    response_model=EnquiryResponse,
    summary="Manual Human Escalation",
    description="Flags an enquiry as escalated. Transition is logged inside the status history timeline."
)
def manual_escalate(
    id: int,
    payload: EscalateRequest,
    db: Session = Depends(get_db)
):
    enquiry = db.query(Enquiry).filter(Enquiry.id == id).first()
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enquiry with ID {id} not found."
        )

    try:
        # Update Enquiry Status
        enquiry.status = "Escalated"

        # Log Timeline Event
        event = TimelineEvent(
            enquiry_id=enquiry.id,
            status_update="Escalated",
            log_message=f"Manual escalation triggered by agent. Reason: {payload.reason}"
        )
        db.add(event)
        db.commit()
        db.refresh(enquiry)

        # Emit structured JSON log
        logger.info(
            f"Enquiry ID {id} manually escalated. Reason: {payload.reason}",
            extra={
                "event": "escalation_triggered",
                "enquiry_id": id,
                "reason": payload.reason,
                "channel": enquiry.channel,
                "customer_name": enquiry.customer_name
            }
        )

        return enquiry

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to escalate: {str(e)}"
        )


@app.get(
    "/enquiry/{id}/history",
    response_model=EnquiryHistoryResponse,
    summary="Get Enquiry History & Timeline",
    description="Retrieves the enquiry record details and all chronological status events from the timeline database."
)
def get_enquiry_history(
    id: int,
    db: Session = Depends(get_db)
):
    enquiry = db.query(Enquiry).filter(Enquiry.id == id).first()
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enquiry with ID {id} not found."
        )

    # Fetch chronological events
    events = db.query(TimelineEvent).filter(TimelineEvent.enquiry_id == id).order_by(TimelineEvent.timestamp.asc()).all()

    return {
        "enquiry": enquiry,
        "timeline": events
    }


@app.get(
    "/health",
    response_model=Dict[str, str],
    summary="Service Health Check",
    description="Performs database connectivity and API liveness validation. Returns connection status."
)
def health_check(db: Session = Depends(get_db)):
    try:
        # Executing a simple text query to validate DB pool connection
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service Unhealthy: DB connection failed: {str(e)}"
        )
