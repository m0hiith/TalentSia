import jsPDF from "jspdf";
import "jspdf-autotable";
import { ResumeData, WorkExperience } from "@/store/resumeStore";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export type TemplateId = "professional" | "modern" | "minimal";

export interface TemplateInfo {
    id: TemplateId;
    name: string;
    description: string;
    preview: string; // emoji representation
}

export const TEMPLATES: TemplateInfo[] = [
    {
        id: "professional",
        name: "Professional",
        description: "Clean, traditional layout perfect for corporate roles",
        preview: "📄"
    },
    {
        id: "modern",
        name: "Modern",
        description: "Two-column design with colorful accents",
        preview: "🎨"
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Simple, ATS-optimized for maximum compatibility",
        preview: "✨"
    }
];

// Color palettes for different templates
const COLORS = {
    professional: {
        primary: [79, 70, 229] as [number, number, number],     // Indigo
        text: [31, 41, 55] as [number, number, number],         // Dark gray
        muted: [107, 114, 128] as [number, number, number],     // Gray
        accent: [99, 102, 241] as [number, number, number]      // Light indigo
    },
    modern: {
        primary: [16, 185, 129] as [number, number, number],    // Emerald
        text: [17, 24, 39] as [number, number, number],         // Almost black
        muted: [75, 85, 99] as [number, number, number],        // Slate
        accent: [5, 150, 105] as [number, number, number]       // Dark emerald
    },
    minimal: {
        primary: [0, 0, 0] as [number, number, number],         // Black
        text: [0, 0, 0] as [number, number, number],            // Black
        muted: [100, 100, 100] as [number, number, number],     // Gray
        accent: [50, 50, 50] as [number, number, number]        // Dark gray
    }
};

// ==================== PROFESSIONAL TEMPLATE ====================
const generateProfessionalPDF = (doc: jsPDF, resumeData: ResumeData) => {
    const colors = COLORS.professional;
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    const addSectionHeader = (title: string) => {
        doc.setFontSize(14);
        doc.setTextColor(...colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin, yPosition);
        yPosition += 2;
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, margin + contentWidth, yPosition);
        yPosition += 8;
    };

    // Header - Name
    doc.setFontSize(28);
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    const name = resumeData.fullName || "Your Name";
    doc.text(name, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Contact Info
    doc.setFontSize(10);
    doc.setTextColor(...colors.muted);
    doc.setFont("helvetica", "normal");
    const contactParts: string[] = [];
    if (resumeData.email) contactParts.push(resumeData.email);
    if (resumeData.phone) contactParts.push(resumeData.phone);
    if (contactParts.length > 0) {
        doc.text(contactParts.join(" | "), pageWidth / 2, yPosition, { align: "center" });
    }
    yPosition += 15;

    // Professional Summary
    if (resumeData.atsSummary) {
        addSectionHeader("Professional Summary");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(resumeData.atsSummary, contentWidth);
        doc.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 5 + 10;
    }

    // Skills Section
    if (resumeData.skills && resumeData.skills.length > 0) {
        addSectionHeader("Skills");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        const skillsText = resumeData.skills.join(" • ");
        const skillLines = doc.splitTextToSize(skillsText, contentWidth);
        doc.text(skillLines, margin, yPosition);
        yPosition += skillLines.length * 5 + 10;
    }

    // Work Experience Section
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        addSectionHeader("Work Experience");
        resumeData.workExperience.forEach((exp: WorkExperience) => {
            if (yPosition > 260) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFontSize(11);
            doc.setTextColor(...colors.text);
            doc.setFont("helvetica", "bold");
            doc.text(exp.role, margin, yPosition);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.primary);
            doc.text(` at ${exp.company}`, margin + doc.getTextWidth(exp.role), yPosition);
            yPosition += 5;
            doc.setFontSize(9);
            doc.setTextColor(...colors.muted);
            doc.text(exp.duration, margin, yPosition);
            yPosition += 5;
            if (exp.description) {
                doc.setFontSize(10);
                doc.setTextColor(...colors.text);
                const descLines = doc.splitTextToSize(exp.description, contentWidth);
                doc.text(descLines, margin, yPosition);
                yPosition += descLines.length * 5;
            }
            yPosition += 8;
        });
    } else if (resumeData.job_titles && resumeData.job_titles.length > 0) {
        addSectionHeader("Experience");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        doc.text(`${resumeData.experience_years} years of experience`, margin, yPosition);
        yPosition += 6;
        doc.text(`Previous roles: ${resumeData.job_titles.join(", ")}`, margin, yPosition);
        yPosition += 12;
    }

    // Education Section
    if (resumeData.education) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        addSectionHeader("Education");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        doc.text(resumeData.education, margin, yPosition);
        yPosition += 12;
    }

    // Interests
    if (resumeData.interests && resumeData.interests.length > 0) {
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
        }
        addSectionHeader("Career Interests");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        const interestsText = resumeData.interests
            .map(i => i.charAt(0).toUpperCase() + i.slice(1))
            .join(" • ");
        doc.text(interestsText, margin, yPosition);
    }
};

// ==================== MODERN TEMPLATE ====================
const generateModernPDF = (doc: jsPDF, resumeData: ResumeData) => {
    const colors = COLORS.modern;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftColWidth = 65;
    const rightColStart = 75;
    const contentWidth = pageWidth - rightColStart - 15;
    let leftY = 20;
    let rightY = 20;

    // Left sidebar background
    doc.setFillColor(240, 253, 244); // Light green
    doc.rect(0, 0, leftColWidth + 5, pageHeight, "F");

    // Top accent bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 8, "F");

    // Name (centered in left panel)
    leftY = 30;
    doc.setFontSize(16);
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    const nameParts = (resumeData.fullName || "Your Name").split(" ");
    nameParts.forEach(part => {
        doc.text(part, 35, leftY, { align: "center" });
        leftY += 7;
    });
    leftY += 5;

    // Contact in left panel
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "normal");
    if (resumeData.email) {
        doc.text(resumeData.email, 35, leftY, { align: "center" });
        leftY += 5;
    }
    if (resumeData.phone) {
        doc.text(resumeData.phone, 35, leftY, { align: "center" });
        leftY += 5;
    }
    leftY += 10;

    // Skills in left panel
    if (resumeData.skills && resumeData.skills.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(...colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("SKILLS", 10, leftY);
        leftY += 2;
        doc.setDrawColor(...colors.primary);
        doc.line(10, leftY, 60, leftY);
        leftY += 6;

        doc.setFontSize(8);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        resumeData.skills.slice(0, 12).forEach(skill => {
            doc.text("• " + skill, 10, leftY);
            leftY += 5;
        });
        leftY += 8;
    }

    // Education in left panel
    if (resumeData.education) {
        doc.setFontSize(10);
        doc.setTextColor(...colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("EDUCATION", 10, leftY);
        leftY += 2;
        doc.setDrawColor(...colors.primary);
        doc.line(10, leftY, 60, leftY);
        leftY += 6;

        doc.setFontSize(8);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        const eduLines = doc.splitTextToSize(resumeData.education, 55);
        doc.text(eduLines, 10, leftY);
        leftY += eduLines.length * 4 + 8;
    }

    // Interests in left panel
    if (resumeData.interests && resumeData.interests.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(...colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("INTERESTS", 10, leftY);
        leftY += 2;
        doc.setDrawColor(...colors.primary);
        doc.line(10, leftY, 60, leftY);
        leftY += 6;

        doc.setFontSize(8);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        resumeData.interests.forEach(interest => {
            const formatted = interest.charAt(0).toUpperCase() + interest.slice(1);
            doc.text("• " + formatted, 10, leftY);
            leftY += 5;
        });
    }

    // Right column content
    rightY = 20;

    // Professional Summary
    if (resumeData.atsSummary) {
        doc.setFontSize(12);
        doc.setTextColor(...colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("PROFESSIONAL SUMMARY", rightColStart, rightY);
        rightY += 3;
        doc.setDrawColor(...colors.primary);
        doc.line(rightColStart, rightY, rightColStart + contentWidth, rightY);
        rightY += 8;

        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(resumeData.atsSummary, contentWidth);
        doc.text(summaryLines, rightColStart, rightY);
        rightY += summaryLines.length * 5 + 12;
    }

    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(...colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("EXPERIENCE", rightColStart, rightY);
        rightY += 3;
        doc.setDrawColor(...colors.primary);
        doc.line(rightColStart, rightY, rightColStart + contentWidth, rightY);
        rightY += 8;

        resumeData.workExperience.forEach((exp: WorkExperience) => {
            if (rightY > 260) {
                doc.addPage();
                // Re-draw sidebar on new page
                doc.setFillColor(240, 253, 244);
                doc.rect(0, 0, leftColWidth + 5, pageHeight, "F");
                rightY = 20;
            }

            doc.setFontSize(11);
            doc.setTextColor(...colors.accent);
            doc.setFont("helvetica", "bold");
            doc.text(exp.role, rightColStart, rightY);
            rightY += 5;

            doc.setFontSize(9);
            doc.setTextColor(...colors.text);
            doc.setFont("helvetica", "normal");
            doc.text(`${exp.company} | ${exp.duration}`, rightColStart, rightY);
            rightY += 5;

            if (exp.description) {
                doc.setFontSize(9);
                doc.setTextColor(...colors.text);
                const descLines = doc.splitTextToSize(exp.description, contentWidth);
                doc.text(descLines, rightColStart, rightY);
                rightY += descLines.length * 4;
            }
            rightY += 8;
        });
    } else if (resumeData.job_titles && resumeData.job_titles.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(...colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("EXPERIENCE", rightColStart, rightY);
        rightY += 3;
        doc.setDrawColor(...colors.primary);
        doc.line(rightColStart, rightY, rightColStart + contentWidth, rightY);
        rightY += 8;

        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        doc.text(`${resumeData.experience_years} years of professional experience`, rightColStart, rightY);
        rightY += 6;
        const rolesText = doc.splitTextToSize(`Roles: ${resumeData.job_titles.join(", ")}`, contentWidth);
        doc.text(rolesText, rightColStart, rightY);
    }
};

// ==================== MINIMAL TEMPLATE ====================
const generateMinimalPDF = (doc: jsPDF, resumeData: ResumeData) => {
    const colors = COLORS.minimal;
    let yPosition = 25;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const contentWidth = pageWidth - 2 * margin;

    const addSection = (title: string) => {
        yPosition += 5;
        doc.setFontSize(11);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin, yPosition);
        yPosition += 6;
    };

    // Name
    doc.setFontSize(24);
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    doc.text(resumeData.fullName || "Your Name", margin, yPosition);
    yPosition += 8;

    // Contact - simple line
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.muted);
    const contact = [resumeData.email, resumeData.phone].filter(Boolean).join(" | ");
    if (contact) {
        doc.text(contact, margin, yPosition);
        yPosition += 10;
    }

    // Thin line separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, margin + contentWidth, yPosition);
    yPosition += 8;

    // Summary
    if (resumeData.atsSummary) {
        addSection("Summary");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(resumeData.atsSummary, contentWidth);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 5;
    }

    // Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        addSection("Experience");

        resumeData.workExperience.forEach((exp: WorkExperience) => {
            if (yPosition > 265) {
                doc.addPage();
                yPosition = 25;
            }

            doc.setFontSize(10);
            doc.setTextColor(...colors.text);
            doc.setFont("helvetica", "bold");
            doc.text(`${exp.role} — ${exp.company}`, margin, yPosition);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.muted);
            doc.text(exp.duration, pageWidth - margin, yPosition, { align: "right" });
            yPosition += 5;

            if (exp.description) {
                doc.setTextColor(...colors.text);
                const descLines = doc.splitTextToSize(exp.description, contentWidth);
                doc.text(descLines, margin, yPosition);
                yPosition += descLines.length * 4;
            }
            yPosition += 5;
        });
    } else if (resumeData.job_titles && resumeData.job_titles.length > 0) {
        addSection("Experience");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        doc.text(`${resumeData.experience_years} years | ${resumeData.job_titles.join(", ")}`, margin, yPosition);
        yPosition += 10;
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
        addSection("Skills");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        const skillsText = resumeData.skills.join(", ");
        const skillLines = doc.splitTextToSize(skillsText, contentWidth);
        doc.text(skillLines, margin, yPosition);
        yPosition += skillLines.length * 5 + 5;
    }

    // Education
    if (resumeData.education) {
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 25;
        }
        addSection("Education");
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        doc.text(resumeData.education, margin, yPosition);
    }
};

// ==================== MAIN EXPORT FUNCTION ====================
export const generateResumePDF = (resumeData: ResumeData, templateId: TemplateId = "professional"): void => {
    const doc = new jsPDF();

    switch (templateId) {
        case "modern":
            generateModernPDF(doc, resumeData);
            break;
        case "minimal":
            generateMinimalPDF(doc, resumeData);
            break;
        case "professional":
        default:
            generateProfessionalPDF(doc, resumeData);
            break;
    }

    // Save the PDF
    const templateSuffix = templateId.charAt(0).toUpperCase() + templateId.slice(1);
    const fileName = `${(resumeData.fullName || "resume").replace(/\s+/g, "_")}_${templateSuffix}_Resume.pdf`;
    doc.save(fileName);
};

export default generateResumePDF;
