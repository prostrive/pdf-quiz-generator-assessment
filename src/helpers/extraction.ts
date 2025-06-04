import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

const keySections = [
  "Abstract",
  "Acknowledgements",
  "Acronyms",
  "Activities",
  "Analysis",
  "Appendices",
  "Appendix",
  "Application",
  "Assumptions",
  "Background",
  "Benefits",
  "Bibliography",
  "Budget",
  "Challenges",
  "Checklist",
  "Collaboration",
  "Comparative Analysis",
  "Compliance",
  "Components",
  "Concept",
  "Conclusion",
  "Constraints",
  "Contents",
  "Context",
  "Contribution",
  "Cost Analysis",
  "Criteria",
  "Current State",
  "Data",
  "Data Collection",
  "Data Sources",
  "Deliverables",
  "Dependencies",
  "Deployment",
  "Design",
  "Discussion",
  "Documentation",
  "Environment",
  "Ethical Considerations",
  "Evaluation",
  "Executive Summary",
  "Experiments",
  "Feasibility",
  "Features",
  "Findings",
  "Flowchart",
  "Framework",
  "Future Work",
  "Goals",
  "Implementation",
  "Improvements",
  "Industry Standards",
  "Infrastructure",
  "Initiatives",
  "Input",
  "Insights",
  "Installation",
  "Instructions",
  "Integration",
  "Intended Audience",
  "Interface",
  "Introduction",
  "Issue",
  "Justification",
  "Key Findings",
  "Key Metrics",
  "Key Performance Indicators",
  "Lessons Learned",
  "Limitations",
  "Literature Review",
  "Management",
  "Market Analysis",
  "Method",
  "Methodology",
  "Metrics",
  "Milestones",
  "Mission",
  "Motivation",
  "Objectives",
  "Observations",
  "Opportunities",
  "Organizational Structure",
  "Outcome",
  "Overview",
  "Performance",
  "Planning",
  "Policy",
  "Potential Risks",
  "Principles",
  "Problem",
  "Problem Statement",
  "Process",
  "Product Description",
  "Project Description",
  "Project Plan",
  "Proposal",
  "Purpose",
  "References",
  "Regulations",
  "Related Work",
  "Requirements",
  "Research Design",
  "Resources",
  "Results",
  "Review",
  "Risks",
  "Roadmap",
  "Scope",
  "Significance",
  "Solution",
  "Specifications",
  "Stakeholders",
  "Statistical Analysis",
  "Strategy",
  "Summary",
  "Supporting Documents",
  "Survey",
  "SWOT Analysis",
  "System Architecture",
  "Target Audience",
  "Team",
  "Testing",
  "Timeline",
  "Tools",
  "Training",
  "Updates",
  "Use Case",
  "User Guide",
  "Validation",
  "Vision",
  "Workflow",
];


export interface ExtractedPdfText {
  text: string;                   
  pages: number;                   
  sections: Record<string, string>; 
}

const MAX_PAGE = 10;

// ----
// Set workerSrc ONCE, outside the function, at the module level.
// This ensures it is only set a single time per session/app
// and avoids redundant assignments or race conditions during multiple imports specially in SSR.
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

/**
 * Loads pdfjs-dist and sets the workerSrc global option only once.
 * Returns a cached promise for subsequent calls.
 * Ensures efficient and consistent initialization for PDF.js in Next.js or any React environment.
 */
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      const workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}
/**
 * Extracts text and key sections from a PDF file using pdfjs-dist.
 * - Only allows PDF files up to MAX_PAGE pages.
 * - Extracts only content for pages containing a key section header.
 * - Skips pages that do not contain a key section header.
 *
 * @param file The PDF File to extract text from
 * @returns ExtractedPdfText containing full text, page count, and sectioned text
 */
export async function extractPdfText(file: File): Promise<ExtractedPdfText> {
  // Use shared pdfjs instance with workerSrc set only once
  const pdfjs = await getPdfjs();

  // Only allow PDF files
  if (file.type !== "application/pdf") {
    throw new Error("Please upload a PDF file only.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  // Restrict to MAX_PAGE pages
  if (pdf.numPages > MAX_PAGE) {
    throw new Error(
      `PDF has more than ${MAX_PAGE} pages. Please upload a PDF with ${MAX_PAGE} pages or less.`
    );
  }

  const lowerKeySections = keySections.map((k) => k.toLowerCase());
  const sections: Record<string, string> = {};
  let fullText = "";

  // Only capture content for pages that match a key section
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    const pageTextClean = pageText.trim();
    fullText += pageTextClean + "\n";

    const lowerPageText = pageTextClean.toLowerCase();

    // If a key section header is found, store only that page's content under the section
    const matchedIndex = lowerKeySections.findIndex((section) =>
      lowerPageText.includes(section)
    );
    if (matchedIndex !== -1) {
      const sectionTitle = keySections[matchedIndex];
      // Only store the section if it contains the key section
      sections[sectionTitle] = pageTextClean;
    }
  }

  return {
    text: fullText.trim(),
    pages: pdf.numPages,
    sections,
  };
}