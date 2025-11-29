#!/bin/bash
cd backend
uvicorn app.main:app --host localhost --port 8000 --reload
