# Gemini temporary-error handling

- aiVisionService.js: up to 3 attempts with 1.2s/2.4s backoff for 429, 502, 503, 504, temporary 500s and network failures; final failure returns a clean friendly message, technical detail is logged server-side only.
- aiController.js: temporary failures return 503 + retryable:true; nothing is saved on failure.
- aiAnalysisService.js (client): shows "AI analysis service is temporarily unavailable. Please try again in a few seconds." for retryable errors.

# Donation form: automatic AI expiry estimate

- Form order: Food Type, Food Name, Quantity, Unit, Preparation Date, Preparation Time, then the AI result and read-only Estimated Expiry Date/Time.
- AI runs automatically (600 ms debounce) once food type, name, prep date and prep time are filled. No button. The photo is now optional.
- AI returns a shelf-life duration (`remainingHours`); the app computes expiry = prep date/time + hours locally. Changing only prep date/time recalculates instantly with no AI call; so do quantity, unit and description edits.
- Results are cached server-side by user + food type + name (+ photo hash), so the same input always returns the same result (temperature 0). The donation now stores freshnessScore, remainingHours, warnings and imageMatchesEntry, so reopening it never re-runs the AI.
- Photo vs. entered name: a strong mismatch shows a warning and asks the donor to keep their entry or switch to the photo's food; nothing is changed silently, and continuing is blocked until they choose.
- Fixed: AnalysisResult requires `remainingHours` but it was never saved (analysis save would fail); expiry fields in the form never updated after mount.
- Food types now match the AI categories (Cooked Meal, Fruit, Vegetable, Dairy, Bakery, Grain, Meat/Seafood, Beverage, Other).

# Profile Avatar Menu Update

- The top-right green user-initial avatar (for example, `S`) is now the account-menu trigger.
- Clicking the `S` avatar opens Edit Profile, Delete Profile, and Sign Out.
- Edit Profile and Delete Profile navigate to the role-specific Settings page.
- The small user/arrow control inside the dashboard header no longer contains the account dropdown; it only opens Settings.
- Signup/login, email OTP verification, and account deletion behavior are unchanged.

# Login redirect + NGO pickup status workflow

- Login: unregistered account now shows "Account not registered. Please register first." and goes to the Register page. Root cause: Login navigated to `/register`, which had no route, so the catch-all sent the user Home. Login now navigates to `/signup`, and `/register` is an alias route.
- Pickup status flow Pending -> Confirmed -> Picked Up -> Completed, enforced in `PUT /api/pickups/:id` (pickupController.updatePickup); invalid jumps return 400, a concurrent change returns 409. Pickup model gained confirmedAt / pickedUpAt / completedAt.
- NGO dashboard (Upcoming Pickups) and NGO Pickups page show one action button per status via components/pickup/PickupActions.jsx. GET /api/ngos/dashboard now also returns Picked Up and Completed pickups.

# Donor-confirmed pickup workflow, donation closing/expiry, date validation

- Flow: donor donates -> NGO accepts (PATCH /api/donations/:id/accept) -> NGO schedules (POST /api/pickups, needs an accepted donationId) -> "Pending Confirmation" -> DONOR confirms -> NGO marks Picked Up -> NGO marks Completed. Roles and transitions are enforced in pickupController.updatePickup (a donor can only confirm). Release before scheduling: PATCH /api/donations/:id/reject.
- Donation statuses added: Accepted, Closed. Scheduling closes the donation atomically; other NGOs get 409/403 and never see it in lists or by id. Unclaimed (Available/Accepted) donations past expiry become Expired on every fetch/accept/schedule/dashboard load (services/donationExpiry.js) and by the 5-minute scheduler. Records are kept.
- Pickup date+time validated as ONE instant against the real clock and against the food expiry (utils/pickupTime.js on the server, utils/pickupDateTime.js in the client). APP_TIMEZONE (default Asia/Kolkata) is used only when the client sends no exact instant.
- Pickup model: status default "Pending Confirmation", new pickupAt. Legacy "Pending" pickups are migrated on startup.
- Donors can no longer create pickups (POST /api/pickups returns 403 for donors); NGOs schedule only for donations they accepted.
