from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import create_access_token
from backend.services.auth_service import authenticate_user, get_user_by_id
from backend.schemas.schemas import LoginRequest, LoginResponse, UserOut
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, body.email, body.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)}, remember_me=body.remember_me)
    return LoginResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/logout")
def logout():
    return {"message": "ok"}


@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user
