
import { Html, Head, Preview, Body, Container, Section, Text, Button, Hr, Heading } from "@react-email/components";
import * as React from "react";

interface MonthlyPerformanceEmailProps {
    userName: string;
    month: string;
    score: number;
    revenue: string;
    runway: string;
    burnRate: string;
    dashboardLink: string;
}

export const MonthlyPerformanceEmail = ({
    userName = "Founder",
    month = "March 2026",
    score = 85,
    revenue = "$12,450",
    runway = "14 months",
    burnRate = "$5,200",
    dashboardLink = "https://excel.al/dashboard"
}: MonthlyPerformanceEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your {month} Financial Performance Review 🚀</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>AI CFO Report: {month}</Heading>
                    <Text style={text}>Hello {userName},</Text>
                    <Text style={text}>
                        Here is your AI-generated financial summary for this month.
                        Your Financial Health Score is <strong>{score}/100</strong>.
                    </Text>

                    <Section style={card}>
                        <Heading as="h3" style={cardTitle}>Key Metrics</Heading>
                        <Hr style={hr} />
                        <div style={statRow}>
                            <Text style={statLabel}>Revenue (Actual)</Text>
                            <Text style={statValue}>{revenue}</Text>
                        </div>
                        <div style={statRow}>
                            <Text style={statLabel}>Runway</Text>
                            <Text style={statValue}>{runway}</Text>
                        </div>
                        <div style={statRow}>
                            <Text style={statLabel}>Burn Rate</Text>
                            <Text style={statValue}>{burnRate}</Text>
                        </div>
                    </Section>

                    <Section style={ctaSection}>
                        <Text style={text}>
                            Thinking about hiring or increasing marketing spend?
                            See how it impacts your runway in the Decision Lab.
                        </Text>
                        <Button style={button} href={dashboardLink}>
                            Go to Decision Lab
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
    backgroundColor: "#f6f9fc",
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

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
};

const text = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left" as const,
    padding: "0 40px",
};

const card = {
    padding: "20px 40px",
    backgroundColor: "#f9fafb",
    margin: "20px 40px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
};

const cardTitle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: "10px",
    marginTop: "0",
};

const hr = {
    borderColor: "#e2e8f0",
    margin: "10px 0 20px",
};

const statRow = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
};

const statLabel = {
    color: "#718096",
    fontSize: "14px",
    margin: "0",
};

const statValue = {
    color: "#2d3748",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0",
};

const ctaSection = {
    textAlign: "center" as const,
    marginTop: "32px",
};

const button = {
    backgroundColor: "#4f46e5",
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

export default MonthlyPerformanceEmail;
