"""
CloudForge AI Assistant API Endpoints
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models import User
from app.services.claude_assistant import chat_completion, generate_architecture

router = APIRouter(prefix="/api/assistant")


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "claude-sonnet-4-20250514"  # Default to Sonnet
    canvas_context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    model: str


class GenerateRequest(BaseModel):
    prompt: str
    provider: str = "aws"
    model: Optional[str] = "claude-sonnet-4-20250514"
    current_canvas: Optional[Dict[str, Any]] = None


class GenerateResponse(BaseModel):
    resources: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]
    explanation: str


@router.post("/chat", response_model=ChatResponse)
async def assistant_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Chat with the AI Assistant.

    Send a conversation history and get a response.
    The assistant understands CloudForge and can help with:
    - Architecture design
    - Terraform questions
    - Cloud best practices
    - Troubleshooting
    """
    if not request.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one message is required"
        )

    # Validate model selection
    valid_models = ["claude-sonnet-4-20250514", "claude-opus-4-20250514"]
    model = request.model if request.model in valid_models else "claude-sonnet-4-20250514"

    try:
        # Convert messages to dict format
        messages = [{"role": m.role, "content": m.content} for m in request.messages]

        response = chat_completion(
            messages=messages,
            model=model,
            canvas_context=request.canvas_context,
        )

        return ChatResponse(response=response, model=model)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/generate", response_model=GenerateResponse)
async def generate_architecture_endpoint(
    request: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate architecture from a natural language prompt.

    Describe what you want to build and get back:
    - Resources to add to your canvas
    - Connections between resources
    - Explanation of the architecture

    Example prompts:
    - "Create a VPC with public and private subnets"
    - "Add a web server with a load balancer"
    - "Set up a database with read replicas"
    """
    if not request.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt is required"
        )

    # Validate provider
    valid_providers = ["aws", "azure", "gcp"]
    provider = request.provider.lower() if request.provider.lower() in valid_providers else "aws"

    # Validate model
    valid_models = ["claude-sonnet-4-20250514", "claude-opus-4-20250514"]
    model = request.model if request.model in valid_models else "claude-sonnet-4-20250514"

    try:
        result = generate_architecture(
            prompt=request.prompt,
            provider=provider,
            model=model,
            current_canvas=request.current_canvas,
        )

        return GenerateResponse(
            resources=result.get("resources", []),
            connections=result.get("connections", []),
            explanation=result.get("explanation", ""),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.get("/models")
async def get_available_models(
    current_user: User = Depends(get_current_user),
):
    """
    Get available AI models.
    """
    return {
        "models": [
            {
                "id": "claude-sonnet-4-20250514",
                "name": "Claude Sonnet 4",
                "description": "Fast and efficient for most tasks",
                "recommended": True,
            },
            {
                "id": "claude-opus-4-20250514",
                "name": "Claude Opus 4",
                "description": "Most capable model for complex architecture",
                "recommended": False,
            },
        ],
        "default": "claude-sonnet-4-20250514",
    }
