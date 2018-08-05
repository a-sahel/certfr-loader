import Axios, { AxiosResponse } from "axios";
import Cheerio from "cheerio";

export declare type Parser = (rawData: string, current: any) => any; // Parser type
export interface Parsers {
  [index: string]: Parser;
}

export class AvisLoader {
  // TODO: set it to default parsers?
  constructor(private parsers: Parsers = {}) {}

  // Add a new parser
  addParser(key: string, parser: Parser) {
    this.parsers[key] = parser;
  }

  // Get one avis
  async get(id: number, year?: number): Promise<any> {
    const response = await Axios.get(toUrl(id, year)); // Load the raw avis
    if (response.status === 200) {
      return this.parse(response.data);
    } else {
      throw Error(response.statusText);
    }
  }

  private parse(rawData: string): any {
    let avis: any = {};

    for (const key in this.parsers) {
      avis[key] = this.parsers[key](rawData, avis);
    }

    return avis;
  }
}

export function toId(id: number, year?: number): string {
  year = year ? year : new Date().getFullYear();
  let idStr = "" + id;
  if (idStr.length === 1) idStr = "00" + idStr;
  else if (idStr.length === 2) idStr = "0" + idStr;

  return `CERTFR-${year}-AVI-${idStr}`;
}

export function toUrl(id: number, year?: number): string {
  return `https://cert.ssi.gouv.fr/avis/${toId(id, year)}/`;
}

export async function lastId(): Promise<any> {
  const result = await Axios.get("https://cert.ssi.gouv.fr/avis/feed/");
  if (result.status === 200) {
    const $ = Cheerio.load(result.data, {
      xmlMode: true,
      normalizeWhitespace: true
    });
    const splittedCertId = $("title", $("item").first())
      .text()
      .trim()
      .split(":")[0]
      .trim()
      .split("-");
    return {
      year: parseInt(splittedCertId[1]),
      id: parseInt(splittedCertId[3])
    };
  } else {
    return null;
  }
}
