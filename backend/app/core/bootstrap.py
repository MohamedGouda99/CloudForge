import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import get_password_hash, verify_password
from app.models import User

logger = logging.getLogger(__name__)


def _get_default_email(username: str) -> str:
    """Ensure we always have a non-empty email for the admin account."""
    fallback = f"{username}@cloudforge.dev"
    configured = (settings.INITIAL_ADMIN_EMAIL or "").strip()
    return configured or fallback


def _sync_admin_password(user: User, plain_password: str) -> bool:
    """Ensure the stored password matches the configured default."""
    try:
        matches = verify_password(plain_password, user.hashed_password)
    except ValueError:
        matches = False
        logger.warning(
            "Stored password hash for user '%s' is invalid; forcing reset.",
            user.username,
        )

    if matches:
        return False

    user.hashed_password = get_password_hash(plain_password)
    logger.info("Reset password for default admin user '%s'.", user.username)
    return True


def ensure_default_admin() -> None:
    """
    Guarantee that the default admin user exists so testers can log in.

    The credentials are configurable through settings (environment variables).
    - INITIAL_ADMIN_USERNAME
    - INITIAL_ADMIN_PASSWORD
    - INITIAL_ADMIN_EMAIL
    """
    username = (settings.INITIAL_ADMIN_USERNAME or "").strip()
    password = (settings.INITIAL_ADMIN_PASSWORD or "").strip()

    if not username or not password:
        logger.warning(
            "Default admin credentials are not configured; skipping bootstrap."
        )
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()

        if not user:
            logger.info("Creating default admin user '%s'.", username)
            user = User(
                username=username,
                email=_get_default_email(username),
                full_name="CloudForge Administrator",
                hashed_password=get_password_hash(password),
                is_active=True,
                is_superuser=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return

        # Keep existing user active and ensure password matches configured default.
        updated = False

        if not user.is_active:
            user.is_active = True
            updated = True
            logger.info("Reactivating default admin user '%s'.", username)

        target_email = _get_default_email(username)
        if user.email != target_email:
            user.email = target_email
            updated = True

        if _sync_admin_password(user, password):
            updated = True

        if updated:
            db.add(user)
            db.commit()

    except Exception as exc:  # pragma: no cover - safety net for bootstrap
        logger.error("Failed to ensure default admin user: %s", exc)
    finally:
        db.close()
