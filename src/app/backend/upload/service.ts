"use server";

import { auditable } from "../audit-logs/decorator";
import {
  getFhirServerConfigs,
  prepareFhirClient,
} from "../fhir-servers/service";
import type FHIRClient from "@/backend/fhir-servers/fhir-client";

class UploadService {
  private static getPatientEntryFromBundle(bundle: unknown) {
    const patientEntry = bundle.entry.find(
      (entry) => entry.resource.resourceType === "Patient",
    );
    return patientEntry;
  }

  private static getObservationEntriesFromBundle(bundle: unknown) {
    const observationEntries = bundle.entry.filter(
      (entry) => entry.resource.resourceType === "Observation",
    );
    return observationEntries;
  }

  private static getDiagnosticReportEntriesFromBundle(bundle: unknown) {
    const diagnosticReportEntries = bundle.entry.filter(
      (entry) => entry.resource.resourceType === "DiagnosticReport",
    );
    return diagnosticReportEntries;
  }

  private static async replaceEntryIdInBundle(oldid: string, newid: string, bundle: unknown) {
    const bundleString = JSON.stringify(bundle);
    const newBundle = JSON.parse(bundleString.replaceAll(oldid, newid));
    return newBundle;
  }

  private static async postFHIRResource(fhirClient: FHIRClient, resource: unknown) {
    let response: Response;
    response = await fhirClient.postJson("/"+resource?.resourceType, resource);
    console.log(response.status);
    // Check for errors
    if (!response.ok) {
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

  private static async handleFHIRBundle(fhirClient: FHIRClient, bundle: unknown) {
    const patientEntry = this.getPatientEntryFromBundle(bundle);
    console.log(patientEntry);
    const patientRef = patientEntry.fullUrl;
    const resource = patientEntry.resource;
    const response = await this.postFHIRResource(fhirClient, resource);
    console.log(response);
    const patientId = response.body.id;
    const newPatientRef = `${response.body.resourceType}/${patientId}`;
    const newBundle = await this.replaceEntryIdInBundle(patientRef, newPatientRef, bundle);

    const observations = this.getObservationEntriesFromBundle(bundle);
    let observationBundle = newBundle;
    for (const observation of observations) {
      const observationRef = observation.fullUrl;
      const observationResource = observation.resource;
      const observationResponse = await this.postFHIRResource(fhirClient, observationResource);
      const observationId = observationResponse.body.id;
      const newObservationRef = `${observationResponse.body.resourceType}/${observationId}`;
      observationBundle = await this.replaceEntryIdInBundle(observationRef, newObservationRef, observationBundle);
    }

    const diagnosticReports = this.getDiagnosticReportEntriesFromBundle(bundle);
    let diagnosticReportBundle = observationBundle;
    for (const diagnosticReport of diagnosticReports) {
      const diagnosticReportRef = diagnosticReport.fullUrl;
      const diagnosticReportResource = diagnosticReport.resource;
      const diagnosticReportResponse = await this.postFHIRResource(fhirClient, diagnosticReportResource);
      const diagnosticReportId = diagnosticReportResponse.body.id;
      const newDiagnosticReportRef = `${diagnosticReportResponse.body.resourceType}/${diagnosticReportId}`;
      diagnosticReportBundle = await this.replaceEntryIdInBundle(diagnosticReportRef, newDiagnosticReportRef, diagnosticReportBundle);
    }

    const finalBundle = diagnosticReportBundle;
    return finalBundle;
  }


  @auditable
  static async postFHIRBundle(
    fhirServer: string,
    bundle: unknown
  ): Promise<{ status: number; ok: boolean; body: unknown}> {
    const fhirClient = await prepareFhirClient(fhirServer);
  
    // Get the server config to check for mutual TLS
    const serverConfigs = await getFhirServerConfigs();
    const serverConfig = serverConfigs.find(
      (config) => config.name === fhirServer,
    );

    return {status : 200, ok: true, body: await UploadService.handleFHIRBundle(fhirClient, bundle)};
  }

  /**
   * Handles standard patient discovery using direct FHIR search
   * @param fhirClient - The FHIR client instance
   * @param patientQuery - The patient search query string
   * @returns Promise resolving to the FHIR search response
   */
  private static async handleStandardDiscovery(
    fhirClient: FHIRClient,
    bundle: unknown,
  ): Promise<Response> {
    const endpoint = "/";
    return await fhirClient.postJson(endpoint, bundle);
  }
}

export const postFHIRBundle = UploadService.postFHIRBundle;