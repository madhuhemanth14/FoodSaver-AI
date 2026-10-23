// Diagnoses the email service using the REAL settings in server/.env.
//
//   npm run check:email                      -> tests SMTP connection + login only
//   npm run check:email -- you@gmail.com     -> also sends a real test OTP email
//
// Prints the actual SMTP result/error so you can see exactly why sending works
// or fails (wrong app password, blocked port, TLS, rejected recipient...).
require("dotenv").config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "diagnostic";
const sendEmail = require("../services/emailService");
const { probeRecipient } = require("../services/recipientCheck");

const mask = (v) => (v ? `${"*".repeat(Math.max(0, v.length - 2))}${v.slice(-2)}` : "(MISSING)");

(async () => {
  const pass = String(process.env.EMAIL_PASS || "").replace(/\s+/g, "");
  console.log("\n--- Email service diagnostic ---");
  console.log("SMTP_HOST   :", process.env.SMTP_HOST || "smtp.gmail.com (default)");
  console.log("SMTP_PORT   :", process.env.SMTP_PORT || "465 (default)");
  console.log("SMTP_SECURE :", process.env.SMTP_SECURE || "true for 465 (default)");
  console.log("EMAIL_USER  :", process.env.EMAIL_USER || "(MISSING)");
  console.log("EMAIL_PASS  :", pass ? `${pass.length} chars, ends with ...${pass.slice(-2)}` : "(MISSING)");
  console.log("(a Gmail App Password is exactly 16 letters once spaces are removed)\n");

  const to = process.argv[2];
  if (!to) {
    console.log("Tip: run `npm run check:email -- someone@gmail.com` to also send a real test email.");
  } else {
    console.log(`1) Asking the recipient's own mail server whether ${to} exists (port 25) ...`);
    const probe = await probeRecipient(to, { mailFrom: process.env.EMAIL_USER });
    if (probe.status === "not_found") console.log(`   -> MAILBOX DOES NOT EXIST (${probe.detail}). Signup would show "Email doesn't exist".\n`);
    else if (probe.status === "exists") console.log(`   -> mailbox exists (${probe.detail}).\n`);
    else console.log(`   -> INCONCLUSIVE (${probe.detail}).\n      Usually means outbound port 25 is blocked on this network/host, so a non-existent\n      address cannot be detected here. It is never treated as "doesn't exist".\n`);
    console.log(`2) Sending a test OTP email to ${to} through the email service ...`);
    const r = await sendEmail.sendTemplated({ to, subject: "FoodSaver AI - email service test", text: "Test OTP: 123456" });
    if (r.success) {
      console.log(`\nRESULT: SUCCESS — the email service accepted the message for ${to}. Check that inbox (and spam).`);
      console.log(`  accepted   : ${r.accepted.join(", ")}`);
      console.log(`  SMTP reply : ${r.smtpResponse}`);
      console.log(`  message id : ${r.messageId}`);
      if (probe.status === "unknown") {
        console.log(
          "\nNOTE: the mailbox check above was INCONCLUSIVE, so on THIS machine/network the signup page\n" +
            "cannot tell a real Gmail address from a made-up one: Gmail's SMTP accepts both and would only\n" +
            "bounce the fake one later. The OTP box will therefore open for any address Gmail accepts."
        );
      }
    }
    else console.log(`\nRESULT: FAILED (${r.errorKind === "recipient" ? "the recipient was refused" : "the EMAIL SERVICE has a problem, not the recipient"})\n  reason : ${r.errorReason}\n  detail : ${r.error}`);
  }
  process.exit(0);
})();
