// services/emailTemplates.js
//
// Every function here returns { subject, text, html }. Controllers call
// emailService.sendTemplated({ to, ...buildXTemplate(data) }).
// Keeping all copy here means no controller has a giant inline string,
// per the spec's request for a clean templates module.

const BRAND = "FoodSaver AI";

function wrap(title, bodyHtml) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
    <div style="background:#16a34a; padding: 20px 24px; border-radius: 8px 8px 0 0;">
      <h1 style="color:#fff; margin:0; font-size:20px;">${BRAND}</h1>
    </div>
    <div style="border:1px solid #e5e7eb; border-top:none; border-radius:0 0 8px 8px; padding:24px;">
      <h2 style="margin-top:0; font-size:18px; color:#111827;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top:24px; font-size:13px; color:#6b7280;">Regards,<br/>${BRAND} Team</p>
    </div>
  </div>`;
}

function row(label, value) {
  if (value === undefined || value === null || value === "") return "";
  return `<tr><td style="padding:4px 12px 4px 0; color:#6b7280; font-size:14px;">${label}</td><td style="padding:4px 0; font-size:14px; font-weight:600;">${value}</td></tr>`;
}

function table(rows) {
  return `<table style="border-collapse:collapse; margin:12px 0;">${rows.join("")}</table>`;
}

// ============================================================
// 1. Welcome email (to newly registered user)
// ============================================================
function welcomeUserTemplate({ name, email, role }) {
  const subject = "Welcome to FoodSaver AI - Registration Successful";
  const text = `Hello ${name},

Welcome to FoodSaver AI!

Your account has been successfully registered.

Account Type: ${role}
Email: ${email}

You can now use FoodSaver AI to donate food, track donations, connect with NGOs, and help reduce food waste.

Thank you for joining FoodSaver AI.

Regards,
FoodSaver AI Team`;

  const html = wrap(
    "Welcome to FoodSaver AI!",
    `<p>Hello ${name},</p>
     <p>Your account has been successfully registered.</p>
     ${table([row("Account Type", role), row("Email", email)])}
     <p>You can now use FoodSaver AI to donate food, track donations, connect with NGOs, and help reduce food waste.</p>`
  );
  return { subject, text, html };
}

// ============================================================
// 2. Admin: new user registered
// ============================================================
function adminNewUserTemplate({ name, email, phone, role, registeredAt, userId }) {
  const subject = "New User Registered - FoodSaver AI";
  const text = `A new user has registered on FoodSaver AI.

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Role: ${role}
Registration Date: ${registeredAt}
User ID: ${userId}

Please check the Admin Dashboard for more details.`;

  const html = wrap(
    "New User Registered",
    `<p>A new user has registered on FoodSaver AI.</p>
     ${table([
       row("Name", name),
       row("Email", email),
       row("Phone", phone || "Not provided"),
       row("Role", role),
       row("Registration Date", registeredAt),
       row("User ID", userId),
     ])}
     <p>Please check the Admin Dashboard for more details.</p>`
  );
  return { subject, text, html };
}

// ============================================================
// 3. Donor: donation submitted
// ============================================================
function donationSubmittedDonorTemplate(d) {
  const subject = "FoodSaver AI - Donation Submitted Successfully";
  const text = `Your food donation has been successfully submitted to FoodSaver AI.

Donation ID: ${d.donationId}
Food Items: ${d.foodItems}
Quantity: ${d.quantity}
Donation Date: ${d.donationDate}
Expiry: ${d.expiryDate || "Not specified"}
Location: ${d.location || "Not specified"}
AI Analysis: ${d.aiResult || "Not available"}
Status: ${d.status}

Thank you for helping reduce food waste.

Regards,
FoodSaver AI Team`;

  const html = wrap(
    "Donation Submitted Successfully",
    `<p>Hello ${d.donorName},</p>
     <p>Your food donation has been successfully submitted to FoodSaver AI. Thank you for helping reduce food waste.</p>
     ${table([
       row("Donation ID", d.donationId),
       row("Food Items", d.foodItems),
       row("Quantity", d.quantity),
       row("Donation Date", d.donationDate),
       row("Expiry", d.expiryDate || "Not specified"),
       row("Location", d.location || "Not specified"),
       row("AI Analysis", d.aiResult || "Not available"),
       row("Status", d.status),
     ])}`
  );
  return { subject, text, html };
}

// ============================================================
// 3B. Admin: new donation
// ============================================================
function donationSubmittedAdminTemplate(d) {
  const subject = "New Food Donation - FoodSaver AI";
  const text = `A new food donation has been submitted.

Donation ID: ${d.donationId}
Donor Name: ${d.donorName}
Donor Email: ${d.donorEmail}
Donor Phone: ${d.donorPhone || "Not provided"}
Food Items: ${d.foodItems}
Quantity: ${d.quantity}
Location: ${d.location || "Not specified"}
Donation Date: ${d.donationDate}
Expiry: ${d.expiryDate || "Not specified"}
AI Result: ${d.aiResult || "Not available"}
Status: ${d.status}

Please check the Admin Dashboard.`;

  const html = wrap(
    "New Food Donation",
    `${table([
      row("Donation ID", d.donationId),
      row("Donor Name", d.donorName),
      row("Donor Email", d.donorEmail),
      row("Donor Phone", d.donorPhone || "Not provided"),
      row("Food Items", d.foodItems),
      row("Quantity", d.quantity),
      row("Location", d.location || "Not specified"),
      row("Donation Date", d.donationDate),
      row("Expiry", d.expiryDate || "Not specified"),
      row("AI Result", d.aiResult || "Not available"),
      row("Status", d.status),
    ])}
    <p>Please check the Admin Dashboard for more details.</p>`
  );
  return { subject, text, html };
}

// ============================================================
// 4. AI analysis completed (donor)
// ============================================================
function aiAnalysisCompleteTemplate(a) {
  const subject = "FoodSaver AI - Food Analysis Completed";
  const text = `Your food analysis has been completed.

Food: ${a.foodType}
AI Result: ${a.freshness}
Confidence: ${a.confidence != null ? a.confidence + "%" : "Not available"}
Recommendation: ${a.recommendation || "Not available"}
Analysis Date: ${a.analyzedAt}`;

  const html = wrap(
    "Food Analysis Completed",
    `${table([
      row("Food", a.foodType),
      row("AI Result", a.freshness),
      row("Confidence", a.confidence != null ? a.confidence + "%" : "Not available"),
      row("Recommendation", a.recommendation || "Not available"),
      row("Analysis Date", a.analyzedAt),
    ])}`
  );
  return { subject, text, html };
}

// ============================================================
// 6. Expiry reminder (donor)
// ============================================================
function expiryReminderTemplate(d) {
  const subject = "FoodSaver AI - Food Expiry Reminder";
  const text = `IMPORTANT FOOD EXPIRY REMINDER

Your donated food is approaching its predicted expiry time.

Donation ID: ${d.donationId}
Food: ${d.foodItems}
Quantity: ${d.quantity}
Expiry: ${d.expiryTime}
Remaining Time: ~${d.remainingTime}
Pickup Status: ${d.pickupStatus || "Not assigned"}

Please check the FoodSaver AI dashboard and take the required action.`;

  const html = wrap(
    "Food Expiry Reminder",
    `<p style="color:#b45309; font-weight:600;">Your donated food is approaching its predicted expiry time.</p>
     ${table([
       row("Donation ID", d.donationId),
       row("Food", d.foodItems),
       row("Quantity", d.quantity),
       row("Expiry", d.expiryTime),
       row("Remaining Time", `~${d.remainingTime}`),
       row("Pickup Status", d.pickupStatus || "Not assigned"),
     ])}
     <p>Please check the FoodSaver AI dashboard and take the required action.</p>`
  );
  return { subject, text, html };
}

// ============================================================
// 7. Expired - admin alert
// ============================================================
function expiredAdminAlertTemplate(d) {
  const subject = "URGENT - Food Donation Expired - FoodSaver AI";
  const text = `This food donation has reached its predicted expiry time.

Donation ID: ${d.donationId}
Donor Name: ${d.donorName}
Donor Email: ${d.donorEmail}
Food: ${d.foodItems}
Quantity: ${d.quantity}
Expiry: ${d.expiryTime}
Status: ${d.status}
Pickup Info: ${d.pickupInfo || "Not assigned"}

Please check the Admin Dashboard and remove/cancel the expired donation if it has not already been collected.`;

  const html = wrap(
    "URGENT - Food Donation Expired",
    `${table([
      row("Donation ID", d.donationId),
      row("Donor Name", d.donorName),
      row("Donor Email", d.donorEmail),
      row("Food", d.foodItems),
      row("Quantity", d.quantity),
      row("Expiry", d.expiryTime),
      row("Status", d.status),
      row("Pickup Info", d.pickupInfo || "Not assigned"),
    ])}
    <p>Please check the Admin Dashboard and remove/cancel the expired donation if it has not already been collected.</p>`
  );
  return { subject, text, html };
}

// ============================================================
// 8. New pickup request - admin alert
// ============================================================
function newPickupAdminTemplate(p) {
  const subject = "New Pickup Request - FoodSaver AI";
  const text = `A new pickup request has been created.

Pickup ID: ${p.pickupId}
Donor Name: ${p.donorName}
Donor Email: ${p.donorEmail}
Donor Phone: ${p.donorPhone}
NGO: ${p.ngoName}
NGO Phone: ${p.ngoPhone || "Not available"}
Food Items: ${p.foodItems}
Quantity: ${p.quantity}
Pickup Date: ${p.pickupDate}
Pickup Time: ${p.pickupTime}
Pickup Address: ${p.address}
Notes: ${p.notes || "None"}
Status: ${p.status}

Please check the Admin Dashboard for more details.`;

  const html = wrap(
    "New Pickup Request",
    `${table([
      row("Pickup ID", p.pickupId),
      row("Donor Name", p.donorName),
      row("Donor Email", p.donorEmail),
      row("Donor Phone", p.donorPhone),
      row("NGO", p.ngoName),
      row("NGO Phone", p.ngoPhone || "Not available"),
      row("Food Items", p.foodItems),
      row("Quantity", p.quantity),
      row("Pickup Date", p.pickupDate),
      row("Pickup Time", p.pickupTime),
      row("Pickup Address", p.address),
      row("Notes", p.notes || "None"),
      row("Status", p.status),
    ])}`
  );
  return { subject, text, html };
}

// ============================================================
// 9. NGO pickup assignment
// ============================================================
function ngoPickupAssignedTemplate(p) {
  const subject = "FoodSaver AI - New Food Pickup Assigned";
  const text = `A food pickup has been assigned to your NGO.

NGO: ${p.ngoName}
Pickup ID: ${p.pickupId}
Donor Name: ${p.donorName}
Food Items: ${p.foodItems}
Quantity: ${p.quantity}
Pickup Date: ${p.pickupDate}
Pickup Time: ${p.pickupTime}
Pickup Address: ${p.address}
Donor Phone: ${p.donorPhone}
Notes: ${p.notes || "None"}

Please collect the food according to the scheduled pickup details.`;

  const html = wrap(
    "New Food Pickup Assigned",
    `<p>A food pickup has been assigned to ${p.ngoName}.</p>
     ${table([
       row("Pickup ID", p.pickupId),
       row("Donor Name", p.donorName),
       row("Food Items", p.foodItems),
       row("Quantity", p.quantity),
       row("Pickup Date", p.pickupDate),
       row("Pickup Time", p.pickupTime),
       row("Pickup Address", p.address),
       row("Donor Phone", p.donorPhone),
       row("Notes", p.notes || "None"),
     ])}
     <p>Please collect the food according to the scheduled pickup details.</p>`
  );
  return { subject, text, html };
}

// ============================================================
// 10. Donor: pickup confirmed
// ============================================================
function pickupConfirmedTemplate(p) {
  const subject = "FoodSaver AI - Pickup Confirmed";
  const text = `Your pickup has been confirmed.

NGO: ${p.ngoName}
Pickup Date: ${p.pickupDate}
Pickup Time: ${p.pickupTime}
Food: ${p.foodItems}
Quantity: ${p.quantity}
Address: ${p.address}
Status: Confirmed`;

  const html = wrap(
    "Pickup Confirmed",
    `${table([
      row("NGO", p.ngoName),
      row("Pickup Date", p.pickupDate),
      row("Pickup Time", p.pickupTime),
      row("Food", p.foodItems),
      row("Quantity", p.quantity),
      row("Address", p.address),
      row("Status", "Confirmed"),
    ])}`
  );
  return { subject, text, html };
}

// ============================================================
// 11. Donor: food collected
// ============================================================
function foodCollectedTemplate(p) {
  const subject = "FoodSaver AI - Food Collected Successfully";
  const text = `Your food has been collected.

Food: ${p.foodItems}
Quantity: ${p.quantity}
NGO: ${p.ngoName}
Pickup Date/Time: ${p.pickupDate} ${p.pickupTime}
Status: Picked Up`;

  const html = wrap(
    "Food Collected Successfully",
    `${table([
      row("Food", p.foodItems),
      row("Quantity", p.quantity),
      row("NGO", p.ngoName),
      row("Pickup Date/Time", `${p.pickupDate} ${p.pickupTime}`),
      row("Status", "Picked Up"),
    ])}`
  );
  return { subject, text, html };
}

// ============================================================
// 12. Donor: donation/pickup completed
// ============================================================
function pickupCompletedTemplate(p) {
  const subject = "FoodSaver AI - Donation Completed";
  const text = `Your donation has been completed successfully.

Food: ${p.foodItems}
Quantity: ${p.quantity}
NGO: ${p.ngoName}
Completion Date: ${p.completionDate}
Status: Completed

Thank you for helping reduce food waste.`;

  const html = wrap(
    "Donation Completed",
    `${table([
      row("Food", p.foodItems),
      row("Quantity", p.quantity),
      row("NGO", p.ngoName),
      row("Completion Date", p.completionDate),
      row("Status", "Completed"),
    ])}
    <p>Thank you for helping reduce food waste.</p>`
  );
  return { subject, text, html };
}

// ============================================================
// 13. Donor: pickup cancelled
// ============================================================
function pickupCancelledTemplate(p) {
  const subject = "FoodSaver AI - Pickup Cancelled";
  const text = `Your pickup has been cancelled.

Pickup ID: ${p.pickupId}
Food: ${p.foodItems}
Quantity: ${p.quantity}
NGO: ${p.ngoName}
Date/Time: ${p.pickupDate} ${p.pickupTime}
Status: Cancelled`;

  const html = wrap(
    "Pickup Cancelled",
    `${table([
      row("Pickup ID", p.pickupId),
      row("Food", p.foodItems),
      row("Quantity", p.quantity),
      row("NGO", p.ngoName),
      row("Date/Time", `${p.pickupDate} ${p.pickupTime}`),
      row("Status", "Cancelled"),
    ])}`
  );
  return { subject, text, html };
}

// ============================================================
// Password reset
// ============================================================
function passwordResetTemplate({ name, resetUrl }) {
  const subject = "Reset Your FoodSaver AI Password";
  const text = `Hello ${name || "there"},

We received a request to reset the password for your FoodSaver AI account.

Reset your password using this link (expires in about 15 minutes):
${resetUrl}

If you did not request a password reset, you can safely ignore this email — your password will not be changed.

Regards,
FoodSaver AI Team`;

  const html = wrap(
    "Reset Your Password",
    `<p>Hello ${name || "there"},</p>
     <p>We received a request to reset the password for your FoodSaver AI account. Click the button below to choose a new one.</p>
     <p style="margin:24px 0;">
       <a href="${resetUrl}" style="background:#16a34a; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:8px; font-size:14px; font-weight:600; display:inline-block;">Reset Password</a>
     </p>
     <p style="font-size:13px; color:#6b7280;">Or copy and paste this link into your browser:<br/>
       <a href="${resetUrl}" style="color:#16a34a; word-break:break-all;">${resetUrl}</a>
     </p>
     <p style="font-size:13px; color:#6b7280;">This link will expire in about 15 minutes.</p>
     <p style="font-size:13px; color:#6b7280;">If you did not request a password reset, you can safely ignore this email — your password will not be changed.</p>`
  );
  return { subject, text, html };
}

module.exports = {
  welcomeUserTemplate,
  adminNewUserTemplate,
  donationSubmittedDonorTemplate,
  donationSubmittedAdminTemplate,
  aiAnalysisCompleteTemplate,
  expiryReminderTemplate,
  expiredAdminAlertTemplate,
  newPickupAdminTemplate,
  ngoPickupAssignedTemplate,
  pickupConfirmedTemplate,
  foodCollectedTemplate,
  pickupCompletedTemplate,
  pickupCancelledTemplate,
  passwordResetTemplate,
};
