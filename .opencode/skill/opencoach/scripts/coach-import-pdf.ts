import * as fs from 'fs';
import * as path from 'path';
const PDFParser = require("pdf2json");

/**
 * OpenCoach: coach-import-pdf.ts
 * Uses pdf2json to extract text from a PDF, then converts it to our standard JSON.
 * Since this needs an LLM to "parse" the extracted text into our schema,
 * this script outputs the RAW TEXT to stdout for the Head Coach to handle.
 */

async function main() {
    const args = process.argv.slice(2);
    const pdfPath = args[0];

    if (!pdfPath) {
        console.error("Usage: coach-import-pdf <pdf_file_path>");
        process.exit(1);
    }

    if (!fs.existsSync(pdfPath)) {
        console.error(`Error: File ${pdfPath} not found.`);
        process.exit(1);
    }

    const pdfParser = new PDFParser(null, 1); // 1 = text content only

    pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parsing Error:", errData.parserError);
        process.exit(1);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        const rawText = pdfParser.getRawTextContent();
        
        console.log("--- START EXTRACTED TEXT ---");
        console.log(rawText);
        console.log("--- END EXTRACTED TEXT ---");
        
        console.log("\nINSTRUCTION FOR HEAD COACH:");
        console.log("Please map the text between the markers into a valid OpenCoach 'measures' or 'diet' JSON file.");
        console.log("Use './.opencode/skill/opencoach/router.sh save-session <type> <temp_json_path>' to commit it.");
    });

    pdfParser.loadPDF(pdfPath);
}

main();
