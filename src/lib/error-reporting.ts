/** 獨立版錯誤回報：僅寫入 console，不依賴任何外部平台。 */
export function reportAppError(error: unknown, context?: Record<string, unknown>) {
  console.error("[app-error]", context ?? {}, error);
}
