
import { Resend } from 'resend';

// Remove top-level initialization
// const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(to: string, subject: string, react: React.ReactElement) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        console.warn("RESEND_API_KEY is not set or invalid. Email not sent.");
        return { error: "Configuration missing" };
    }

    const resend = new Resend(apiKey);

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
