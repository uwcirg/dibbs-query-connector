"use client";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Icon,
  Select,
} from "@trussworks/react-uswds";
import { Mode } from "@/app/constants";
import { DataContext } from "@/app/utils/DataProvider";
import { Patient } from "fhir/r4";
import { CustomUserQuery } from "@/app/models/entities/query";
import WithAuth from "@/app/ui/components/withAuth/WithAuth";
import {
  PatientDiscoveryResponse,
  PatientRecordsResponse,
} from "@/app/backend/query-execution/service";
import {
  postFHIRBundle
} from "@/app/backend/upload/service";
import { getFhirServerNames } from "@/app/backend/fhir-servers/service";
import Skeleton from "react-loading-skeleton";

const blankUserQuery = {
  queryId: "",
  queryName: "",
  conditionsList: [],
  valuesets: [],
};
/**
 * Client side parent component for the query page. Based on the mode, it will display the search
 * form, the results of the query, or the multiple patients view.
 * @returns - The Query component.
 */
const Query: React.FC = () => {
  const [selectedQuery, setSelectedQuery] = useState<CustomUserQuery>(
    structuredClone(blankUserQuery),
  );
  const [mode, setMode] = useState<Mode>("search");
  const [loading, setLoading] = useState<boolean>(false);
  const [fhirServer, setFhirServer] = useState<string>("");
  const [fhirServers, setFhirServers] = useState<string[]>([]);
  const [uncertainMatchError, setUncertainMatchError] =
    useState<boolean>(false);
  const ctx = useContext(DataContext);

  // CSV upload handling
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [jsonError, setJSONError] = useState<string>("");

  async function fetchFHIRServerNames() {
    const servers = await getFhirServerNames();
    setFhirServers(servers);
    setFhirServer(servers[0]);
  }

  useEffect(() => {
    fetchFHIRServerNames();
  }, []);

  // update the current page details when switching between modes,
  // so the SiteAlert displays the correct content
  useEffect(() => {
    ctx?.setCurrentPage(mode);
  }, [mode]);

  const [patientDiscoveryQueryResponse, setPatientDiscoveryQueryResponse] =
    useState<PatientDiscoveryResponse>();
  const [patientForQuery, setPatientForQueryResponse] = useState<Patient>();
  const [resultsQueryResponse, setResultsQueryResponse] =
    useState<PatientRecordsResponse>();

  const modeToCssContainerMap: { [mode in Mode]: string } = {
    search: "main-container",
    "patient-results": "main-container__wide",
    "select-query": "main-container",
    results: "main-container__wide",
  };

  async function handleJSONFile(file: File) {
    setJSONError("");
    async function parseJsonFile(file) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = event => resolve(JSON.parse(event.target.result))
        fileReader.onerror = error => reject(error)
        fileReader.readAsText(file)
      })
    }
    
    const object = await parseJsonFile(file);
    const res = await postFHIRBundle(fhirServer, object);
    const json = res.body;
    if (!res.ok) {
      setJSONError(JSON.stringify(json) || "Failed to parse JSON");
      return;
    } else {
      setJSONError(JSON.stringify(json))
    }
  }

  function triggerJSONPicker() {
    jsonInputRef.current?.click();
  }

  return (
    <WithAuth>
      <div className={modeToCssContainerMap[mode]}>
        <div className="usa-combo-box">
          <Select
            id="fhir_server"
            name="fhir_server"
            value={fhirServer}
            onChange={(event) => {
              setFhirServer(event.target.value as string);
            }}
            required
          >
            {fhirServers.map((fhirServer: string) => (
              <option key={fhirServer} value={fhirServer}>
                {fhirServer}
              </option>
            ))}
          </Select>
        </div>
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              void handleJSONFile(f);
              e.currentTarget.value = "";
            }
          }}
        />
        <Button
          type="button"
          secondary
          onClick={(e) => {
            e.preventDefault();
            triggerJSONPicker();
          }}
        >
          Upload FHIR JSON Bundle
        </Button>
      </div>
      {jsonError && (
        <div role="alert">
          <Icon.Error
            aria-label="warning icon indicating an error is present"
          />
          {jsonError}
        </div>
      )}
    </WithAuth>
  );
};

export default Query;

const SearchFormFallback = () => {
  return (
    <>
      <Skeleton className="margin-bottom-1" width={720} height={50} />
      <Skeleton className="margin-bottom-1" width={720} height={50} />
      <Skeleton className="margin-bottom-1" width={720} height={150} />
      <Skeleton width={720} height={750} />
    </>
  );
};
