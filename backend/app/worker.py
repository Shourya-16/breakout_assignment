from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Enquiry, TimelineEvent
from app.logger import logger

# Hardcoded SOP definition
SOP_RULES = [
    {
        "label": "Pricing Enquiry",
        "keywords": ["price", "cost", "how much", "pricing", "rate", "quote", "charge", "payment"],
        "suggested_response": "Hi! Thanks for reaching out. Our standard package starts at $49/month, and our premium plan is $99/month. You can find our full pricing details at https://closira.com/pricing. Let me know if you would like to book a demo!"
    },
    {
        "label": "Booking Enquiry",
        "keywords": ["book", "reserve", "booking", "appointment", "schedule", "slot", "meeting", "call"],
        "suggested_response": "Hello! We would be happy to schedule a session for you. You can select a convenient time slot directly on our calendar: https://calendar.closira.com/booking. Looking forward to speaking with you!"
    },
    {
        "label": "Support Request",
        "keywords": ["help", "support", "broken", "issue", "error", "problem", "bug", "fail", "not working", "crash"],
        "suggested_response": "We're sorry to hear you're experiencing issues. A support ticket has been created, and our technical team will investigate this within the next hour. You can check updates on your ticket using our support portal."
    },
    {
        "label": "General Info",
        "keywords": ["info", "information", "about", "features", "what is", "closira", "services", "product"],
        "suggested_response": "Welcome to Closira! We are an AI-powered customer communication platform for SMBs, automating enquiries across WhatsApp, email, and calls. Learn more at https://closira.com/about."
    }
]

def process_enquiry_task(enquiry_id: int):
    """
    Asynchronous worker logic running in FastAPI background task.
    Evaluates the enquiry message against standard business SOP rules.
    """
    db: Session = SessionLocal()
    try:
        # 1. Fetch Enquiry
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            logger.error(f"Worker task error: Enquiry with ID {enquiry_id} not found.")
            return

        # Emit task_processed milestone (start)
        logger.info(
            f"Background task processing started for Enquiry ID {enquiry.id}",
            extra={
                "event": "task_processed",
                "enquiry_id": enquiry.id,
                "status": "processing"
            }
        )

        message_lower = enquiry.message.lower()
        matched_sop = None

        # 2. Evaluate Keyword SOP Matching
        for sop in SOP_RULES:
            for kw in sop["keywords"]:
                if kw in message_lower:
                    matched_sop = sop
                    break
            if matched_sop:
                break

        # 3. Handle matched / fallback cases
        if matched_sop:
            # Success State: SOP Matched
            enquiry.status = "Qualified"
            enquiry.sop_label = matched_sop["label"]
            enquiry.suggested_response = matched_sop["suggested_response"]

            # Add Timeline Event
            event = TimelineEvent(
                enquiry_id=enquiry.id,
                status_update="Qualified",
                log_message=f"SOP matched: {matched_sop['label']}. Automatic suggested response prepared."
            )
            db.add(event)
            db.commit()

            # Structured JSON log
            logger.info(
                f"SOP matched: {matched_sop['label']} for Enquiry ID {enquiry.id}",
                extra={
                    "event": "sop_matched",
                    "enquiry_id": enquiry.id,
                    "sop_label": matched_sop["label"],
                    "channel": enquiry.channel,
                    "customer_name": enquiry.customer_name
                }
            )
        else:
            # Fallback/Escalation State: No SOP Matched
            enquiry.status = "Escalated"
            
            # Add Timeline Event
            event = TimelineEvent(
                enquiry_id=enquiry.id,
                status_update="Escalated",
                log_message="No matching SOP found. Automatically escalated to human agent."
            )
            db.add(event)
            db.commit()

            # Structured JSON log
            logger.info(
                f"No SOP matched. Automatic escalation triggered for Enquiry ID {enquiry.id}",
                extra={
                    "event": "escalation_triggered",
                    "enquiry_id": enquiry.id,
                    "reason": "No SOP matched keywords",
                    "channel": enquiry.channel,
                    "customer_name": enquiry.customer_name
                }
            )

        # Emit task_processed milestone (end)
        logger.info(
            f"Background task processing completed for Enquiry ID {enquiry.id}",
            extra={
                "event": "task_processed",
                "enquiry_id": enquiry.id,
                "status": "completed"
            }
        )

    except Exception as e:
        logger.error(
            f"Background task exception for Enquiry ID {enquiry_id}: {str(e)}",
            exc_info=True
        )
    finally:
        db.close()
