import Cheerio from "cheerio";
import { Parsers } from "..";

const months = ["janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"];


export const DefaultParsers: Parsers = {};

DefaultParsers["reference"] = (rawData: string, current: any): string => {
    return Cheerio.load(rawData)('.article-meta .meta-table tr').eq(0).children().last().text();
};

DefaultParsers["title"] = (rawData: string, current: any): string => {
    return Cheerio.load(rawData)('.article-meta .meta-table tr').eq(1).children().last().text();
};

DefaultParsers["risks"] = (rawData: string, current: any): string[] => {
    let risks: string[] = [];

    const $ = Cheerio.load(rawData);

    $('.article-content > div > div')
        .children('h2').
        filter((i, elt) => $(elt).text() === 'Risque(s)')
        .next()
        .children('li')
        .each((i, elt) => { risks.push($(elt).text()) });

    return risks;
};

DefaultParsers["sources"] = (rawData: string, current: any): string[] => {
    return Cheerio.load(rawData)('.article-meta .meta-table tr').eq(4).children().last().text().split('\n');
};

DefaultParsers["timestampFirstVersion"] = (rawData: string, current: any): number => {
    const d = Cheerio.load(rawData)('.article-meta .meta-table tr').eq(2).children().last().text().split(" ");

    const day = parseInt(d[0]);
    const year = parseInt(d[2]);
    const month = months.indexOf(d[1]);

    return new Date(year, month, day).getTime() / 1000 | 0;
};

DefaultParsers["timestampLastVersion"] = (rawData: string, current: any): number => {
    const d = Cheerio.load(rawData)('.article-meta .meta-table tr').eq(3).children().last().text().split(" ");

    const day = parseInt(d[0]);
    const year = parseInt(d[2]);
    const month = months.indexOf(d[1]);

    return new Date(year, month, day).getTime() / 1000 | 0;
};

DefaultParsers["impactedSystems"] = (rawData: string, current: any): string[] => {
    let impactedSystems: string[] = [];

    const $ = Cheerio.load(rawData);

    const targetElement = $('.article-content > div > div')
        .children('h2')
        .filter((i, elt) => $(elt).text() === 'Systèmes affectés')
        .next();

    if (targetElement.children('li').length === 0) {
        impactedSystems.push(targetElement.text());
    } else {
        targetElement.children('li')
            .each((i: number, elt: CheerioElement) => { impactedSystems.push($(elt).text()) });
    }

    return impactedSystems;
};

DefaultParsers["documentation"] = (rawData: string, current: any): any[] => {
    let documentation: any[] = [];

    const $ = Cheerio.load(rawData);

    $('.article-content > div > div')
        .children('h2').
        filter((i, elt) => $(elt).text() === 'Documentation')
        .next()
        .children('li')
        .filter((i, el) => !$(el).text().startsWith('Référence CVE CVE-'))
        .each((i, el) => {
            const splittedDoc = $(el).text().split('http');
            documentation.push({
                id: splittedDoc[0].trim(),
                href: `http${splittedDoc[1].trim()}`
            });
        });

    return documentation;
};

DefaultParsers["cve"] = (rawData: string, current: any): any[] => {
    let cve: any[] = [];
    const $ = Cheerio.load(rawData);

    $('.article-content > div > div')
        .children('h2').
        filter((i, elt) => $(elt).text() === 'Documentation')
        .next()
        .children('li')
        .filter((i: number, el: CheerioElement) => $(el).text().startsWith('Référence CVE CVE-'))
        .each((i: number, el: CheerioElement) => {
            const splittedCve = $(el).text().replace('Référence CVE ', '').split(/\s+/);
            cve.push({
                id: splittedCve[0].trim(),
                href: splittedCve[1].trim()
            });
        });
        
    return cve;
};


/*
export const DefaultParsers: Parsers<Avis> = [


    // System
    (rawData: string, current: Avis): void => {
        const title = current.title;
        let productsStr = "";

        if (title.startsWith("Multiples vulnérabilités dans le noyau Linux de ")) {
            productsStr = title.replace("Multiples vulnérabilités dans le noyau Linux de ", "");
        } else if (title.startsWith("Multiples vulnérabilités dans le noyau Linux d’")) {
            productsStr = title.replace("Multiples vulnérabilités dans le noyau Linux d’", "");
        } else if (title.startsWith("Multiples vulnérabilités dans les produits ")) {
            productsStr = title.replace("Multiples vulnérabilités dans les produits ", "");
        } else if (title.startsWith("Multiples vulnérabilités dans ")) {
            productsStr = title.replace("Multiples vulnérabilités dans ", "");
        } else if (title.startsWith("Vulnérabilité dans le noyau Linux d’")) {
            productsStr = title.replace("Vulnérabilité dans le noyau Linux d’", "");
        } else if (title.startsWith("Vulnérabilité dans le noyau Linux de ")) {
            productsStr = title.replace("Vulnérabilité dans le noyau Linux de ", "");
        } else if (title.startsWith("Vulnérabilité dans ")) {
            productsStr = title.replace("Vulnérabilité dans ", "");
        }

        current.products = productsStr.split(" et ");
    },
];
*/
