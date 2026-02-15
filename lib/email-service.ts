
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, react: React.ReactElement) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Email not sent.");
        return { error: "Configuration missing" };
    }

    try {
        const data = await resend.emails.send({
            from: 'AI CFO <onboarding@resend.dev>', // Update this with your verified domain later
            to,
            subject,
            react,
        });
        return { data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { error };
    }
}
