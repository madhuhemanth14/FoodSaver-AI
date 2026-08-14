# FoodSaver AI - Database Design

## Database

MongoDB

## 1. User

Fields:

- _id
- name
- email
- password
- phone
- role
- location
- profileImage
- createdAt
- updatedAt

Roles:

- donor
- ngo
- admin

## 2. Food

Fields:

- _id
- userId
- name
- category
- quantity
- unit
- image
- purchaseDate
- expiryDate
- freshness
- status
- createdAt
- updatedAt

## 3. Donation

Fields:

- _id
- donorId
- foodId
- foodName
- quantity
- category
- image
- expiryDate
- ngoId
- pickupId
- status
- createdAt
- updatedAt

Donation Status:

- AVAILABLE
- ACCEPTED
- PICKUP_SCHEDULED
- PICKED_UP
- COMPLETED
- CANCELLED

## 4. FoodAnalysis

Fields:

- _id
- foodId
- foodType
- freshness
- predictedExpiry
- confidence
- image
- createdAt

## 5. NGO

Fields:

- _id
- name
- email
- phone
- address
- location
- serviceAreas
- acceptedFoodTypes
- status
- createdAt

## 6. Pickup

Fields:

- _id
- donationId
- donorId
- ngoId
- pickupAddress
- scheduledDate
- scheduledTime
- status
- assignedPerson
- trackingLocation
- createdAt
- updatedAt

## 7. Notification

Fields:

- _id
- userId
- title
- message
- type
- read
- createdAt

## Relationships

```text
User
 |
 +----> Food
 |
 +----> Donation
          |
          +----> NGO
          |
          +----> Pickup
                    |
                    +----> Notification

Food
 |
 +----> FoodAnalysis