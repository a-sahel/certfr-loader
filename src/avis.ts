import { CVE, Documentation } from "./avis-types";

export interface Avis {
    reference: string;
    title: string;
    system: string;
    risks: string[];
    sources: string[];
    timestampFirstVersion: number;
    timestampLastVersion: number;
    affectedSys: string[];
    documentation: Documentation[];
    cve: CVE[];
}