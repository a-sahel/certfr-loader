import { Observable } from "rxjs";
import Axios, { AxiosResponse } from "axios";
import { DefaultParsers } from "./avis-default-parsers";


class AvisLoader<T extends Avis> {
    private parsers: Parsers<T> = [];

    addParser(parser: Parser<T>) {
        this.parsers.push(parser);
    }

    get(id: number, year?: number): Observable<T> {
        return Observable.fromPromise(Axios.get(AvisLoader.toUrl(id, year)))
        .filter((value: AxiosResponse<any>) => value.status === 200)
        .map((value: AxiosResponse) => value.data)
        .map((value: string) => this.parse(value));
    }

    private parse(rawData: string): T {
        let avis = <T>{};

        this.parsers.forEach((parser: Parser<T>) => {
            parser(rawData, avis);
        });

        return avis;
    }

    static toId(id: number, year?: number): string {
        year = year ? year : (new Date()).getFullYear();
        let idStr = "" + id;
        if (idStr.length === 1) idStr = "00" + idStr;
        else if (idStr.length === 2) idStr = "0" + idStr;

        return `CERTFR-${year}-AVI-${idStr}`;
    }

    static toUrl(id: number, year?: number): string {
        return `https://cert.ssi.gouv.fr/avis/${AvisLoader.toId(id, year)}/`;
    }

    static init<T extends Avis>(parsers: Parsers<T> = DefaultParsers): AvisLoader<T> {
        const a = new AvisLoader<T>();
        a.parsers = parsers;
        return a;
    }
}

export default interface Avis {
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

export declare type Parser<T extends Avis> = (rawData: string, current: T) => void;
export declare type Parsers<T extends Avis> = Array<Parser<T>>;

export declare type CVE = { id: string; href: string; };
export declare type Documentation = { id: string; href: string; };
