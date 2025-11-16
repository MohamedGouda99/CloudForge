from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect

from app.api.endpoints import pipelines, logs, workflows
from app.core.database import Base, engine
from app.models.workflow import NodeType, WorkflowNode

# Import node types to auto-register them
import app.nodes


def ensure_node_type_enum_values():
    """Ensure the Postgres enum backing workflow node types contains all registered values."""
    if engine.dialect.name != "postgresql":
        return

    enum_column = WorkflowNode.__table__.columns.node_type
    raw_name = getattr(enum_column.type, "name", None)
    if not raw_name:
        enum_class = getattr(enum_column.type, "enum_class", None)
        raw_name = enum_class.__name__ if enum_class else None
    if not raw_name:
        return

    candidates = [raw_name]
    lowered = raw_name.lower()
    if lowered not in candidates:
        candidates.append(lowered)

    with engine.begin() as connection:
        enum_name = None
        for candidate in candidates:
            exists = connection.execute(text("SELECT 1 FROM pg_type WHERE typname = :name"), {"name": candidate}).scalar()
            if exists:
                enum_name = candidate
                break
        if enum_name is None:
            enum_name = lowered

        for value in [member.value for member in NodeType]:
            # Note: ALTER TYPE doesn't support parameterized queries, must use string formatting
            # Check if value already exists first to avoid errors
            exists = connection.execute(
                text("SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = :type AND e.enumlabel = :label"),
                {"type": enum_name, "label": value}
            ).scalar()
            if not exists:
                # Safe to add since we validated the enum_name from database
                connection.execute(text(f"ALTER TYPE \"{enum_name}\" ADD VALUE '{value}'"))


ensure_node_type_enum_values()

# Create database tables
Base.metadata.create_all(bind=engine)


def migrate_legacy_node_types():
    """Migrate legacy node_type values and convert enum to lowercase."""
    if engine.dialect.name != "postgresql":
        return

    inspector = inspect(engine)
    if not inspector.has_table("workflow_nodes"):
        return

    with engine.begin() as connection:
        # First, temporarily change the column to text to allow any value
        try:
            connection.execute(text('ALTER TABLE workflow_nodes ALTER COLUMN node_type TYPE TEXT'))
        except Exception:
            pass

        # Update legacy uppercase values to new lowercase values
        legacy_map = {
            "infracost": "infracost_estimate",
            "INFRACOST": "infracost_estimate",
            "tfsec": "tfsec_scan",
            "TFSEC": "tfsec_scan",
            "terrascan": "terrascan_scan",
            "TERRASCAN": "terrascan_scan",
            "TERRAFORM_VALIDATE": "terraform_validate",
            "TERRAFORM_PLAN": "terraform_plan",
            "TERRAFORM_APPLY": "terraform_apply",
            "TERRAFORM_DESTROY": "terraform_destroy",
            "INFRACOST_ESTIMATE": "infracost_estimate",
            "TFSEC_SCAN": "tfsec_scan",
            "TERRASCAN_SCAN": "terrascan_scan",
            "CHECKOV_SCAN": "checkov_scan",
            "SLACK_NOTIFICATION": "slack_notification",
            "EMAIL_NOTIFICATION": "email_notification",
            "WEBHOOK_NOTIFICATION": "webhook_notification",
            "MANUAL_APPROVAL": "manual_approval",
            "CONDITIONAL": "conditional",
            "CUSTOM_SCRIPT": "custom_script",
            "HTTP_REQUEST": "http_request",
        }

        for old_value, new_value in legacy_map.items():
            connection.execute(
                text('UPDATE workflow_nodes SET node_type = :new WHERE node_type = :old'),
                {"new": new_value, "old": old_value},
            )

        # Now convert back to enum with the correct lowercase values
        try:
            connection.execute(text('DROP TYPE IF EXISTS nodetype_old CASCADE'))
            connection.execute(text('ALTER TYPE nodetype RENAME TO nodetype_old'))
            enum_values = ', '.join([f"'{member.value}'" for member in NodeType])
            connection.execute(text(f'CREATE TYPE nodetype AS ENUM ({enum_values})'))
            connection.execute(text('ALTER TABLE workflow_nodes ALTER COLUMN node_type TYPE nodetype USING node_type::text::nodetype'))
            connection.execute(text('DROP TYPE nodetype_old'))
        except Exception as e:
            print(f"Enum migration warning: {e}")


migrate_legacy_node_types()

app = FastAPI(title="CloudForge Pipeline Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:80",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pipelines.router, prefix="/api", tags=["pipelines"])
app.include_router(logs.router, prefix="/api", tags=["logs"])
app.include_router(workflows.router, prefix="/api", tags=["workflows"])


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "pipeline-service"}


@app.get("/")
def root():
    return {"message": "CloudForge Pipeline Service", "version": "1.0.0"}
