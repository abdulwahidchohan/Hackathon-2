# Phase II — JWT verification (Better Auth shared secret)
# [From]: Hackathon spec — BETTER_AUTH_SECRET, Authorization: Bearer <token>

import os
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

BETTER_AUTH_SECRET = os.environ.get("BETTER_AUTH_SECRET", "change-me-in-production")
HTTPBearerScheme = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(HTTPBearerScheme)],
) -> str:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    try:
        # Debug: print token prefix
        # print(f"DEBUG: Token prefix: {credentials.credentials[:10]}...", flush=True)
        payload = jwt.decode(
            credentials.credentials,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"],
        )
        user_id = payload.get("userId") or payload.get("sub")
        if not user_id:
            print(f"DEBUG: Token missing userId/sub. Payload keys: {list(payload.keys())}", flush=True)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user identifier",
            )
        return str(user_id)
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: InvalidTokenError: {e}", flush=True)
        print(f"DEBUG: Secret used: {BETTER_AUTH_SECRET[:5]}...", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
