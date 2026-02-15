
import { Html, Head, Preview, Body, Container, Section, Text, Button, Heading } from "@react-email/components";
import * as React from "react";

interface SmartAlertEmailProps {
    userName: string;
    alertType: "runway" | "burn_rate" | "profit_drop";
    message: string;
    value: string;
    threshold: string;
    dashboardLink: string;
}

export const SmartAlertEmail = ({
    userName = "Founder",
    alertType = "burn_rate",
    message = "Your monthly expenses have increased significantly.",
    value = "$15,200",
    threshold = "$12,000",
    dashboardLink = "https://excel.al/dashboard"
}: SmartAlertEmailProps) => {

    const isCritical = alertType === "runway";
    const accentColor = isCritical ? "#e53e3e" : "#d69e2e"; // Red or Yellow

    return (
        <Html>
            <Head />
            <Preview>⚠️ AI Alert: {message}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={{ ...alertHeader, borderLeftColor: accentColor }}>
                        <Heading style={h1}>Smart Alert</Heading>
                    </Section>

                    <Text style={text}>Hi {userName},</Text>
                    <Text style={text}>
                        Our AI engine detected a significant change in your financials:
                    </Text>

                    <Section style={alertBox}>
                        <Text style={alertMessage}>
                            <strong>{message}</strong>
                        </Text>
                        <Text style={alertDetail}>
                            Current: <strong>{value}</strong> (Threshold: {threshold})
                        </Text>
                    </Section>

                    <Section style={ctaSection}>
                        <Text style={text}>
                            We recommend reviewing your financial model immediately to adjust your strategy.
                        </Text>
                        <Button style={{ ...button, backgroundColor: accentColor }} href={dashboardLink}>
                            Review in AI Decision Lab
                        </Button>
                    </Section>

                    <Text style={footer}>
                        © 2026 Excel.al AI CFO. All rights reserved.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: "#fff5f5",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "600px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const alertHeader = {
    padding: "20px 40px",
    backgroundColor: "#fff",
    borderLeftWidth: "8px",
    borderLeftStyle: "solid",
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0",
};

const text = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left" as const,
    padding: "0 40px",
};

const alertBox = {
    backgroundColor: "#fffaf0",
    margin: "20px 40px",
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid #feebc8",
};

const alertMessage = {
    fontSize: "16px",
    color: "#744210",
    margin: "0 0 8px",
};

const alertDetail = {
    fontSize: "14px",
    color: "#975a16",
    margin: "0",
};

const ctaSection = {
    textAlign: "center" as const,
    marginTop: "32px",
    padding: "0 40px",
};

const button = {
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 24px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
    marginTop: "32px",
};

export default SmartAlertEmail;
