import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendMessageNotificationParams {
  receiverEmail: string;
  senderName: string;
  rideBeginning: string;
  rideDestination: string;
  rideStartTime: Date;
}

export async function sendMessageNotification({
  receiverEmail,
  senderName,
  rideBeginning,
  rideDestination,
  rideStartTime,
}: SendMessageNotificationParams) {
  const date = rideStartTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const time = rideStartTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",  //TODO: revert to this once verified"YideShare <yideshare@gmail.com>",
      to: "yideshare@gmail.com",  // TODO: revert to this once verified receiverEmail,
      subject: `${senderName} messaged you about a ride`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <p style="font-size: 16px; margin: 0 0 16px 0;">
            <strong>${senderName}</strong> just messaged you about your
            ride from <strong>${rideBeginning}</strong> to
            <strong>${rideDestination}</strong> on
            <strong>${date} at ${time}</strong>.
          </p>
          <p style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://yideshare.com"}"
               style="display: inline-block; padding: 12px 24px;
                      background-color: #0891b2; color: white;
                      text-decoration: none; border-radius: 6px;
                      font-weight: 500;">
              Check it out
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
            YideShare
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Messaging: Failed to send notification email: ", error);
  }
}
