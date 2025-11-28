from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.bootstrap import ensure_default_admin
from app.api.endpoints import auth, projects, resources, terraform, drift, icons, security, ai
import socketio

# Create database tables
Base.metadata.create_all(bind=engine)
ensure_default_admin()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO for real-time collaboration
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.ALLOWED_ORIGINS
)
socket_app = socketio.ASGIApp(sio, app)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(terraform.router, prefix="/api/terraform", tags=["terraform"])
app.include_router(security.router, prefix="/api/security", tags=["security"])
app.include_router(drift.router, prefix="/api/drift", tags=["drift"])
app.include_router(icons.router, prefix="/api", tags=["icons"])
app.include_router(ai.router, tags=["ai"])


@app.get("/")
async def root():
    return {
        "message": "CloudForge API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


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
