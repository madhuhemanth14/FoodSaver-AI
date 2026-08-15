# FoodSaver AI - System Architecture

## 1. Project Overview

FoodSaver AI is an AI-powered food donation platform that connects
surplus food donors with NGOs and people in need.

The system uses:
- React for the frontend
- Node.js and Express.js for the backend
- MongoDB for data storage
- Python for AI services

## 2. High-Level Architecture

```text
User
  |
  v
React Frontend
  |
  v
Node.js + Express Backend
  |
  +--------------------+
  |                    |
  v                    v
MongoDB            Python AI Service
                       |
                       +--> Food Analysis
                       |
                       +--> Freshness Detection
                       |
                       +--> Expiry Prediction