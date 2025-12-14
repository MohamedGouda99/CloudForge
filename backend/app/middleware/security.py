"""
Enhanced security middleware for production
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import re
import logging

logger = logging.getLogger(__name__)

# SQL Injection patterns
SQL_INJECTION_PATTERNS = [
    r"(\bunion\b.*\bselect\b)",
    r"(\bselect\b.*\bfrom\b)",
    r"(\binsert\b.*\binto\b)",
    r"(\bdelete\b.*\bfrom\b)",
    r"(\bdrop\b.*\btable\b)",
    r"(--)",
    r"(;.*--)",
    r"(\bor\b.*=.*)",
]

# XSS patterns
XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"on\w+\s*=",
]

class InputSanitizationMiddleware(BaseHTTPMiddleware):
    """Sanitize and validate all input to prevent injection attacks"""
    
    async def dispatch(self, request: Request, call_next):
        # Check query parameters
        for key, value in request.query_params.items():
            if self._is_suspicious(value):
                logger.warning(f"Suspicious query parameter detected: {key}={value[:50]}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected"
                )
        
        response = await call_next(request)
        return response
    
    def _is_suspicious(self, value: str) -> bool:
        """Check if input contains suspicious patterns"""
        value_lower = value.lower()
        
        # Check SQL injection patterns
        for pattern in SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        
        # Check XSS patterns
        for pattern in XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True
        
        return False


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Vodafone Enterprise identifier
        response.headers["X-Powered-By"] = "Vodafone CloudForge Enterprise"
        
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Limit request body size to prevent DoS attacks"""
    
    def __init__(self, app, max_upload_size: int = 10 * 1024 * 1024):  # 10 MB default
        super().__init__(app)
        self.max_upload_size = max_upload_size
    
    async def dispatch(self, request: Request, call_next):
        if request.method in ["POST", "PUT", "PATCH"]:
            content_length = request.headers.get("content-length")
            
            if content_length and int(content_length) > self.max_upload_size:
                logger.warning(f"Request body too large: {content_length} bytes")
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Request body too large. Maximum size: {self.max_upload_size} bytes"
                )
        
        response = await call_next(request)
        return response

