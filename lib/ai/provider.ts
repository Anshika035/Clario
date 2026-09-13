import type { AiProvider } from "@/types/ai";

/**
 * Provider-agnostic AI contract.
 * OpenAI (or any later vendor) should implement this interface in a separate adapter.
 * Do not import vendor SDKs from UI or route files.
 */
export type { AiProvider };
