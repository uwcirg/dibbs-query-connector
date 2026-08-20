"use server";

import { isFhirResource } from "../../constants";

import { CustomQuery } from "./custom-query";
import { GetPhoneQueryFormats } from "../../utils/format-service";
import { auditable } from "../audit-logs/decorator";
import type { QueryTableResult } from "../../(pages)/queryBuilding/utils";
import type {
  QueryResponse,
  PatientDiscoveryRequest,
  PatientRecordsRequest,
  FullPatientRequest,
} from "../../models/entities/query";
import {
  getFhirServerConfigs,
  prepareFhirClient,
} from "../fhir-servers/service";
import type FHIRClient from "@/backend/fhir-servers/fhir-client";
import { getSavedQueryByName } from "../query-building/service";

class UploadService {
  @auditable
  static async postFHIRBundle(
    fhirServer: string,
    bundle: any
  ): Promise<{ status: number; ok: boolean; body: any}> {
    const fhirClient = await prepareFhirClient(fhirServer);
  
    // Get the server config to check for mutual TLS
    const serverConfigs = await getFhirServerConfigs();
    const serverConfig = serverConfigs.find(
      (config) => config.name === fhirServer,
    );

    // Handle discovery based on server configuration
    let response: Response;
    console.log(bundle);
    console.log(serverConfig);
    response = await fhirClient.postJson("", bundle);
    console.log(response.status);
    // Check for errors
    if (response.status !== 200) {
      let errorText = "Match request failed for unknown reason";
      let headerText = "Match request failed with unknown headers";
  
      try {
        errorText = await response.text();
      } catch {}
  
      try {
        headerText = JSON.stringify(
          Object.fromEntries(response.headers.entries()),
        );
      } catch {}
  
      console.error(
        `Patient search failed. Status: ${response.status} \n Body: ${errorText} \n Headers: ${headerText}`,
      );
    }

    const body = await response.json().catch(() => null);
    return { status: response.status, ok: response.ok, body };
  }

  /**
   * Handles standard patient discovery using direct FHIR search
   * @param fhirClient - The FHIR client instance
   * @param patientQuery - The patient search query string
   * @returns Promise resolving to the FHIR search response
   */
  private static async handleStandardDiscovery(
    fhirClient: FHIRClient,
    bundle: any,
  ): Promise<Response> {
    const endpoint = "/";
    return await fhirClient.postJson(endpoint, bundle);
  }
}

export const postFHIRBundle = UploadService.postFHIRBundle;