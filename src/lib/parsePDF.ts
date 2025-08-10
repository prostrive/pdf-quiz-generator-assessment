const MAX_PAGES = Number.parseInt(process.env.MAX_PAGES || "") || 10;

export async function parsePDF(
  file: File
): Promise<{ success: boolean; message?: string; context?: string }> {
  //dynamically import pdfjs-dist to avoid bundling issues and enable running on NodeJS environment
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    if (pdf.numPages > MAX_PAGES) {
      return {
        success: false,
        message: `PDF must not have more than ${MAX_PAGES} Pages.`,
      };
    }
    // Get all contents from all pages
    let assembledText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      text.items.forEach((item) => {
        if ("str" in item) {
          assembledText += item.str + " ";
        }
      });
      assembledText += "\n";
    }

    return {
      success: true,
      context: assembledText.trim(),
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return {
      success: false,
      message: "Failed to parse the PDF file. Please ensure it is a valid PDF.",
    };
  }
}
