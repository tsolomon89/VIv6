
export interface Algo3Input {
    productName: string;
    productFeatures: string[];
    personaName: string;
    personaPainPoints: string[];
    tone: 'professional' | 'urgent' | 'empathetic';
    format: 'email' | 'linkedin' | 'blog';
}

export interface Algo3Output {
    headline: string;
    body: string;
    callToAction: string;
}

const TEMPLATES = {
    email: {
        professional: {
            headline: "Subject: Enhancing {{persona}} efficiency with {{product}}",
            body: "Dear {{persona}},\n\nI understand that {{pain_point}} is a significant challenge. {{product}} addresses this by {{feature}}.\n\nBest,\n[Your Name]",
            cta: "Schedule a demo"
        },
        urgent: {
            headline: "Subject: Solve {{pain_point}} today",
            body: "Hi {{persona}},\n\nDon't let {{pain_point}} slow you down. {{product}} can help you {{feature}} immediately.",
            cta: "Get started now"
        },
        empathetic: {
            headline: "Subject: I know {{pain_point}} is tough",
            body: "Hi {{persona}},\n\nWe see how {{pain_point}} affects teams like yours. {{product}} offers a way to {{feature}}.",
            cta: "Let's talk"
        }
    },
    linkedin: {
        professional: {
            headline: "{{product}} for {{persona}}",
            body: "Are you struggling with {{pain_point}}? {{product}} helps {{persona}}s {{feature}}.",
            cta: "Learn more"
        },
        urgent: {
            headline: "Stop {{pain_point}} now",
            body: "Immediate solution for {{persona}}s facing {{pain_point}}: {{product}}.",
            cta: "Click here"
        },
        empathetic: {
            headline: "Helping {{persona}}s succeed",
            body: "If {{pain_point}} is keeping you up at night, try {{product}}.",
            cta: "Message me"
        }
    },
    blog: {
        professional: {
            headline: "How {{product}} solves {{pain_point}} for {{persona}}s",
            body: "In today's market, {{persona}}s face {{pain_point}}. {{product}} provides a robust solution by {{feature}}...",
            cta: "Read full case study"
        },
        urgent: {
            headline: "Why {{persona}}s need {{product}} right now",
            body: "The cost of {{pain_point}} is rising. Discover how {{product}} automates {{feature}}...",
            cta: "Download whitepaper"
        },
        empathetic: {
            headline: "Overcoming {{pain_point}}: A guide for {{persona}}s",
            body: "We understand the frustration of {{pain_point}}. Here is how {{product}} can simplify your workflow...",
            cta: "Join our community"
        }
    }
};

export class Algo3Engine {
    static generate(input: Algo3Input): Algo3Output {
        const templateGroup = TEMPLATES[input.format];
        const template = templateGroup[input.tone];
        
        // Randomly select a pain point and feature if multiple are provided
        const painPoint = input.personaPainPoints[Math.floor(Math.random() * input.personaPainPoints.length)] || "workflow inefficiencies";
        const feature = input.productFeatures[Math.floor(Math.random() * input.productFeatures.length)] || "optimizing performance";

        return {
            headline: this.fill(template.headline, input, painPoint, feature),
            body: this.fill(template.body, input, painPoint, feature),
            callToAction: template.cta
        };
    }

    private static fill(text: string, input: Algo3Input, painPoint: string, feature: string): string {
        return text
            .replace(/{{persona}}/g, input.personaName)
            .replace(/{{product}}/g, input.productName)
            .replace(/{{pain_point}}/g, painPoint)
            .replace(/{{feature}}/g, feature);
    }
}
