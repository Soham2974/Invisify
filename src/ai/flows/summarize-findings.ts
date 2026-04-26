'use server';

/**
 * @fileOverview Summarizes the findings of the steganography detection engine.
 *
 * - summarizeFindings - A function that summarizes the findings.
 * - SummarizeFindingsInput - The input type for the summarizeFindings function.
 * - SummarizeFindingsOutput - The return type for the summarizeFindings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFindingsInputSchema = z.object({
  findings: z.string().describe('The raw findings from the steganography detection engine.'),
  type: z.string().describe('The type of content analyzed (emoji/text/image).'),
  severity: z.string().describe('The severity level of the detected anomalies (Safe, Low, Medium, High, Critical).'),
});
export type SummarizeFindingsInput = z.infer<typeof SummarizeFindingsInputSchema>;

const SummarizeFindingsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the steganography detection findings.'),
});
export type SummarizeFindingsOutput = z.infer<typeof SummarizeFindingsOutputSchema>;

export async function summarizeFindings(input: SummarizeFindingsInput): Promise<SummarizeFindingsOutput> {
  return summarizeFindingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFindingsPrompt',
  input: {schema: SummarizeFindingsInputSchema},
  output: {schema: SummarizeFindingsOutputSchema},
  prompt: `You are an expert cybersecurity analyst tasked with summarizing steganography detection findings.

  Given the raw findings, content type, and severity level, provide a concise and informative summary of the potential risks.

  Raw Findings: {{{findings}}}
  Content Type: {{{type}}}
  Severity Level: {{{severity}}}

  Summary:`,
});

/**
 * Generate a meaningful local summary when the AI is unavailable.
 * Parses the findings JSON and produces a human-readable description.
 */
function generateLocalSummary(input: SummarizeFindingsInput): string {
  try {
    const findings = JSON.parse(input.findings);
    const parts: string[] = [];

    if (input.severity === 'Safe') {
      return `No steganography or hidden threats were detected in the ${input.type.toLowerCase()} content. All checks for zero-width characters, homoglyphs, and emoji-based threats returned negative results, indicating a safe assessment.`;
    }

    // Text findings
    if (findings.text) {
      if (findings.text.zero_width?.present) {
        const chars = findings.text.zero_width.chars || [];
        parts.push(`Zero-width characters detected (${chars.length} types found). These invisible Unicode characters can hide data within visible text.`);
        if (findings.text.zero_width.verifiedPayload) {
          parts.push(`A verified hidden payload was extracted: "${findings.text.zero_width.verifiedPayload}".`);
        }
      }
      if (findings.text.homoglyphs?.present) {
        const count = findings.text.homoglyphs.detailed?.totalCount || 0;
        const cats = findings.text.homoglyphs.detailed?.categories || [];
        parts.push(`${count} homoglyph character(s) detected from ${cats.join(', ')} script(s). These visually similar characters from non-Latin scripts are used in phishing and IDN spoofing attacks.`);
      }
      if (findings.text.emoji_threats?.suspicious) {
        const reasons = findings.text.emoji_threats.reasons || [];
        parts.push(`Emoji-based steganography indicators found: ${reasons.slice(0, 3).join('; ')}.`);
      }
      if (findings.text.homoglyphs?.entropy?.suspicious) {
        parts.push(`High-entropy text detected. The string exhibits dense randomness typical of encrypted data, Base64 encoding, or obfuscated payloads.`);
      }
      if (findings.reasons && findings.reasons.includes('obfuscated_or_base64_payload_detected')) {
        parts.push(`Base64 or obfuscated payload detected. The string characteristics perfectly match an encoded structural block commonly used to hide binary text payloads.`);
      }
    }

    // Image findings
    if (findings.image) {
      if (findings.image.stego_analysis?.suspicious) {
        parts.push(`LSB steganography indicators detected in image data. Chi-square probability: ${findings.image.stego_analysis.chiSquareProbability?.toFixed(3) || 'N/A'}.`);
      }
      if (findings.image.stegoveritas_analysis?.trailingDataDetected) {
        parts.push(`Trailing data detected after image EOF marker (${findings.image.stegoveritas_analysis.trailingDataSize} bytes). This may indicate appended hidden data.`);
      }
    }

    // Ensemble
    if (findings.ensemble_confidence) {
      parts.push(`Ensemble confidence: ${(findings.ensemble_confidence * 100).toFixed(1)}% (${findings.detectors_triggered}/${findings.detectors_total} detectors triggered).`);
    }

    if (parts.length === 0) {
      return `${input.severity} risk level detected in ${input.type.toLowerCase()} content. Statistical analysis flagged potential anomalies that warrant further investigation.`;
    }

    return parts.join(' ');
  } catch (e) {
    return `${input.severity} risk level detected in ${input.type.toLowerCase()} content. Detailed analysis is available in the findings breakdown.`;
  }
}

const summarizeFindingsFlow = ai.defineFlow(
  {
    name: 'summarizeFindingsFlow',
    inputSchema: SummarizeFindingsInputSchema,
    outputSchema: SummarizeFindingsOutputSchema,
  },
  async input => {
    try {
      const resultPromise = prompt(input);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('API Timeout')), 5000));
      const { output } = await Promise.race([resultPromise, timeoutPromise]) as any;
      return output || { summary: generateLocalSummary(input) };
    } catch (e) {
      console.log("[AI Engine] Using local summary generator (API unavailable).");
      return { summary: generateLocalSummary(input) };
    }
  }
);
