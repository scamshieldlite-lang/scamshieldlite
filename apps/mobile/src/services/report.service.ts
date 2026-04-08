import { apiClient } from "./api.service";
import type { ReportRequest, ReportResponse } from "@scamshieldlite/shared/";

export const reportService = {
  async submit(data: ReportRequest): Promise<ReportResponse> {
    const { data: response } = await apiClient.post<ReportResponse>(
      "/report",
      data,
    );
    return response;
  },
};
