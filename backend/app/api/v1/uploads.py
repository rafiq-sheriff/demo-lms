"""Multipart uploads (course covers and resource files)."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import require_admin
from app.core.config import get_settings
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_CT = frozenset(
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    }
)
EXT_BY_CT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
RESOURCE_ALLOWED_CT = frozenset(
    {
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
        "application/vnd.ms-powerpoint",
        "application/vnd.ms-excel",
        "application/zip",
        "application/x-zip-compressed",
    }
)
RESOURCE_EXT_BY_CT = {
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/msword": ".doc",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.ms-excel": ".xls",
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
}


def _covers_dir() -> Path:
    root = Path(__file__).resolve().parent.parent.parent
    d = root / "uploads" / "covers"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _resources_dir() -> Path:
    root = Path(__file__).resolve().parent.parent.parent
    d = root / "uploads" / "resources"
    d.mkdir(parents=True, exist_ok=True)
    return d


@router.post("/course-cover")
async def upload_course_cover(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
) -> dict[str, str]:
    settings = get_settings()
    ct = (file.content_type or "").split(";")[0].strip().lower()
    if ct not in ALLOWED_CT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use JPEG, PNG, WebP, or GIF",
        )
    raw_name = file.filename or "image"
    ext = Path(raw_name).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = EXT_BY_CT.get(ct, ".jpg")

    name = f"{uuid.uuid4().hex}{ext}"
    dest = _covers_dir() / name
    try:
        data = await file.read()
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large (max 5 MB)",
            )
        dest.write_bytes(data)
    finally:
        await file.close()

    base = settings.public_base_url.rstrip("/")
    return {"url": f"{base}/files/covers/{name}"}


@router.post("/resource-file")
async def upload_resource_file(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
) -> dict[str, str]:
    settings = get_settings()
    ct = (file.content_type or "").split(";")[0].strip().lower()
    if ct not in RESOURCE_ALLOWED_CT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type for resource upload",
        )
    raw_name = file.filename or "resource"
    ext = Path(raw_name).suffix.lower()
    allowed_exts = {".pdf", ".txt", ".docx", ".pptx", ".xlsx", ".doc", ".ppt", ".xls", ".zip"}
    if ext not in allowed_exts:
        ext = RESOURCE_EXT_BY_CT.get(ct, ".bin")

    name = f"{uuid.uuid4().hex}{ext}"
    dest = _resources_dir() / name
    try:
        data = await file.read()
        if len(data) > 20 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large (max 20 MB)",
            )
        dest.write_bytes(data)
    finally:
        await file.close()

    base = settings.public_base_url.rstrip("/")
    return {"url": f"{base}/files/resources/{name}"}
