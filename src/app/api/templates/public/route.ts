import { handleApiError, jsonResponse } from "@/lib/api-utils";
import { getPublishedTemplates, mapTemplateRecord } from "@/lib/templates";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 24);

    const { templates } = await getPublishedTemplates({ limit });

    return jsonResponse({
      templates: templates.map((template) => mapTemplateRecord(template)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
