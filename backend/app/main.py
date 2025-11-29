from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import ValidationError
from app.core.config import settings
from app.core.database import engine, Base
from app.core.bootstrap import ensure_default_admin
from app.core.logging import setup_logging, get_logger, RequestLoggingMiddleware
from app.api.endpoints import auth, projects, resources, terraform, drift, icons, security, ai, assistant
import socketio
import traceback

setup_logging()
logger = get_logger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

Base.metadata.create_all(bind=engine)
ensure_default_admin()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_url="/openapi.json" if settings.is_development else None
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if settings.is_production:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https:; "
                "frame-ancestors 'self';"
            )
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors() if settings.is_development else "Invalid input data"
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, 'request_id', 'unknown')
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={"extra_data": {"request_id": request_id, "traceback": traceback.format_exc()}}
    )

    if settings.is_production:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Please try again later.",
                "request_id": request_id
            }
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "message": str(exc),
                "request_id": request_id,
                "traceback": traceback.format_exc()
            }
        )


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.ALLOWED_ORIGINS
)
socket_app = socketio.ASGIApp(sio, app)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(terraform.router, prefix="/api/terraform", tags=["terraform"])
app.include_router(security.router, prefix="/api/security", tags=["security"])
app.include_router(drift.router, prefix="/api/drift", tags=["drift"])
app.include_router(icons.router, prefix="/api", tags=["icons"])
app.include_router(ai.router, tags=["ai"])
app.include_router(assistant.router, tags=["assistant"])


@app.get("/")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
async def root(request: Request):
    return {
        "message": "CloudForge API",
        "version": settings.VERSION,
        "docs": "/docs" if settings.is_development else None
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}


# Socket.IO events for real-time collaboration
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


@sio.event
async def join_project(sid, data):
    """Join a project room for real-time updates"""
    project_id = data.get('project_id')
    await sio.enter_room(sid, f"project_{project_id}")
    await sio.emit('user_joined', {'user': data.get('user')}, room=f"project_{project_id}")


@sio.event
async def leave_project(sid, data):
    """Leave a project room"""
    project_id = data.get('project_id')
    await sio.leave_room(sid, f"project_{project_id}")
    await sio.emit('user_left', {'user': data.get('user')}, room=f"project_{project_id}")


@sio.event
async def diagram_update(sid, data):
    """Broadcast diagram updates to all users in the project"""
    project_id = data.get('project_id')
    await sio.emit('diagram_updated', data, room=f"project_{project_id}", skip_sid=sid)


@sio.event
async def cursor_position(sid, data):
    """Broadcast cursor position for collaborative editing"""
    project_id = data.get('project_id')
    await sio.emit('cursor_moved', data, room=f"project_{project_id}", skip_sid=sid)
