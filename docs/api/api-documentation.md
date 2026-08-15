# FoodSaver AI - API Documentation

Base URL:

http://localhost:5000/api

## Authentication

### Register

POST /auth/register

### Login

POST /auth/login

### Current User

GET /auth/me

---

## Donations

### Create Donation

POST /donations

### Get Donations

GET /donations

### Get Donation

GET /donations/:id

### Update Donation

PUT /donations/:id

### Delete Donation

DELETE /donations/:id

---

## AI

### Analyze Food

POST /ai/analyze-food

### Predict Expiry

POST /ai/predict-expiry

---

## NGOs

### Get NGOs

GET /ngos

### Get Nearby NGOs

GET /ngos/nearby

### Get NGO Details

GET /ngos/:id

### Accept Donation

POST /ngos/:id/accept

---

## Pickups

### Create Pickup

POST /pickups

### Get Pickups

GET /pickups

### Get Pickup

GET /pickups/:id

### Update Pickup Status

PUT /pickups/:id/status

---

## Notifications

### Get Notifications

GET /notifications

### Mark Notification Read

PUT /notifications/:id/read

---

## Dashboard

### Dashboard Summary

GET /dashboard/summary

---

## Admin

### Users

GET /admin/users

### Donations

GET /admin/donations

### NGOs

GET /admin/ngos

### Pickups

GET /admin/pickups

### Analytics

GET /admin/analytics