import json
import logging
import sys
from datetime import datetime

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        # Standard fields
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        
        # Include any extra fields passed via extra={'key': 'value'}
        if hasattr(record, "event"):
            log_data["event"] = record.event
        if hasattr(record, "enquiry_id"):
            log_data["enquiry_id"] = record.enquiry_id
        if hasattr(record, "channel"):
            log_data["channel"] = record.channel
        if hasattr(record, "customer_name"):
            log_data["customer_name"] = record.customer_name
        if hasattr(record, "sop_label"):
            log_data["sop_label"] = record.sop_label
        if hasattr(record, "status"):
            log_data["status"] = record.status
        if hasattr(record, "reason"):
            log_data["reason"] = record.reason

        return json.dumps(log_data)

def setup_logger():
    logger = logging.getLogger("closira")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate handlers if already configured
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.propagate = False
        
    return logger

logger = setup_logger()
