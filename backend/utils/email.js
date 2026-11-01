import nodemailer from "nodemailer";
import config from "../config/env.js";

let customTransporter = null;

export const setTransporter = (transporter) => {
  customTransporter = transporter;
};

export const getTransporter = () => {
  if (customTransporter) return customTransporter;

  if (process.env.NODE_ENV === "test" || process.env.EMAIL_TRANSPORT === "json") {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  if (!config.EMAIL_USER || !config.EMAIL_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
    connectionTimeout: 5000,
    socketTimeout: 5000,
  });
};

export const sendInviteEmail = async (to, tripTitle, inviteCode) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[EMAIL] Invite email skipped: Email credentials unconfigured.");
    return false;
  }

  const clientUrl = config.CLIENT_URL.replace(/\/+$/, "");
  const inviteLink = `${clientUrl}/join/${encodeURIComponent(inviteCode)}`;

  try {
    const info = await mailer.sendMail({
      from: config.EMAIL_USER || "noreply@splitsvilla.com",
      to,
      subject: `Join ${tripTitle} on SplitsVilla!`,
      html: `
        <h2>You're invited!</h2>
        <p>Join <strong>${tripTitle}</strong> on SplitsVilla</p>
        <p><a href="${inviteLink}">Click here to join</a></p>
        <p>Or use code: ${inviteCode}</p>
      `,
    });
    return info;
  } catch (err) {
    console.error("[EMAIL] Email send failed (non-blocking):", err.message);
    return false;
  }
};

export const sendBookingConfirmation = async (to, propertyTitle, dates) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[EMAIL] Booking confirmation skipped: Email credentials unconfigured.");
    return false;
  }

  try {
    const info = await mailer.sendMail({
      from: config.EMAIL_USER || "noreply@splitsvilla.com",
      to,
      subject: `Booking Confirmed: ${propertyTitle}`,
      html: `<h2>Your booking is confirmed!</h2><p>${propertyTitle} from ${dates}</p>`,
    });
    return info;
  } catch (err) {
    console.error("[EMAIL] Email send failed (non-blocking):", err.message);
    return false;
  }
};

export const sendPasswordResetEmail = async (to, resetToken) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[EMAIL] Password reset email skipped: Email credentials unconfigured.");
    return false;
  }

  const clientUrl = config.CLIENT_URL.replace(/\/+$/, "");
  const resetLink = `${clientUrl}/password-reset?token=${encodeURIComponent(resetToken)}`;

  try {
    const info = await mailer.sendMail({
      from: config.EMAIL_USER || "noreply@splitsvilla.com",
      to,
      subject: "Reset your SplitsVilla password",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your SplitsVilla password.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
    return info;
  } catch (err) {
    console.error("[EMAIL] Email send failed (non-blocking):", err.message);
    return false;
  }
};
