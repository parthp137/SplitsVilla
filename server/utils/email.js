import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendInviteEmail = async (to, tripTitle, inviteCode) => {
  const inviteLink = `${process.env.CLIENT_URL}/join/${inviteCode}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Join ${tripTitle} on SplitsVilla!`,
      html: `
        <h2>You're invited!</h2>
        <p>Join <strong>${tripTitle}</strong> on SplitsVilla</p>
        <p><a href="${inviteLink}">Click here to join</a></p>
        <p>Or use code: ${inviteCode}</p>
      `,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
};

export const sendBookingConfirmation = async (to, propertyTitle, dates) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Booking Confirmed: ${propertyTitle}`,
      html: `<h2>Your booking is confirmed!</h2><p>${propertyTitle} from ${dates}</p>`,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
};
