from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()
SECRET_KEY = "very_secret"
ALGORITHM = "HS256"
fake_users = {"admin": {"password": "admin123"}}

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    user = fake_users.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=400, detail="Invalid login")
    token = jwt.encode(
        {"sub": req.username, "exp": datetime.utcnow() + timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {"access_token": token, "token_type": "bearer"}



# from fastapi import APIRouter, HTTPException, Depends
# from fastapi.security import OAuth2PasswordRequestForm
# from jose import jwt
# from datetime import datetime, timedelta
#
# router = APIRouter()
# SECRET_KEY = "very_secret"
# ALGORITHM = "HS256"
# fake_users = {"admin": {"password": "admin123"}}
#
# @router.post("/login")
# def login(form_data: OAuth2PasswordRequestForm = Depends()):
#     user = fake_users.get(form_data.username)
#     if not user or user["password"] != form_data.password:
#         raise HTTPException(status_code=400, detail="Invalid login")
#     token = jwt.encode({"sub": form_data.username, "exp": datetime.utcnow() + timedelta(hours=1)}, SECRET_KEY, algorithm=ALGORITHM)
#     return {"access_token": token, "token_type": "bearer"}