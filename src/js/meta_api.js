import { metadata, author } from "@/js/data_sample.js";
var parse = require("bibtex-parser");

export class META_API {

    static async dblp_getInfoByTitle(title, axios) {
        let baseUrl = "https://dblp.org/search/publ/api";
        title = title.replace(/ +/g, "+");
        return await new Promise((resolve) => {
            try {
                axios
                    .get(
                        baseUrl,
                        {
                            params: {
                                "q": title,
                                "format": "bib",
                                "h": 5,
                            },
                        },
                        {
                            timeout: 10000,
                        }
                    )
                    .then((response) => {
                        resolve(META_API.formatDblp(response.data));
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve([]);
                    });
            } catch (e) {
                resolve([]);
            }
        });
    }

    static formatDblp(data) {
        data = data.split('\n\n');
        let result = [];
        for (let item of data) {
            try {
                let parseContent = parse(item);
                for (let key in parseContent) {
                    result.push(parseContent[key]);
                    break;
                }
            }
            catch (e) {
                result.push({});
            }
        }
        let metadataList = [];
        for (let i = 0; i < result.length; i++) {
            let _metadata = JSON.parse(JSON.stringify(metadata));
            let authors = [];
            // remove {xxx} from title
            _metadata.title = result[i].TITLE.replace(/\{|\}/g, '');
            _metadata.abstract = "";
            _metadata.year = result[i].YEAR.toString();
            if (result[i].JOURNAL)
                _metadata.publisher = result[i].JOURNAL;
            else if (result[i].PUBLISHER)
                _metadata.publisher = result[i].PUBLISHER;
            if (result[i].BOOKTITLE)
                _metadata.containerTitle = result[i].BOOKTITLE;
            _metadata.url = result[i].URL ? result[i].URL : "";
            _metadata.DOI = result[i].DOI ? result[i].DOI : "";
            _metadata.pages = result[i].PAGES ? result[i].PAGES : "";
            _metadata.chapter = result[i].VOLUME ? result[i].VOLUME : "";
            _metadata.source = 'DBLP';
            _metadata.bibtex = data[i];
            _metadata.from = 'DBLP';
            if (result[i].AUTHOR) {
                let AUTHORs = result[i].AUTHOR.replace(/\n/g, ' ');
                // split by comma or and
                AUTHORs = AUTHORs.split(/,|\band\b/);
                for (let j = 0; j < AUTHORs.length; j++) {
                    let _author = JSON.parse(JSON.stringify(author));
                    _author.first = AUTHORs[j].replace(/\{|\}/g, '').trim();
                    _author.last = "";
                    _author.sequence = j == 0 ? 'first' : 'additional';
                    authors.push(_author);
                }
            }
            _metadata.authors = authors;
            metadataList.push(_metadata);
        }
        return metadataList;
    }

    static async cref_getInfoByTitle(title, axios) {
        let baseUrl = "https://api.crossref.org/works";
        title = title.replace(/ +/g, "+");
        return await new Promise((resolve) => {
            try {
                axios
                    .get(
                        baseUrl,
                        {
                            params: {
                                "query.bibliographic": title,
                            },
                        },
                        {
                            timeout: 10000,
                        }
                    )
                    .then((response) => {
                        resolve(META_API.formatCref(response.data.message.items));
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve([]);
                    });
            } catch (e) {
                resolve([]);
            }
        });
    }

    static formatCref(data) {
        let result = [];
        data.forEach((it) => {
            let _metadata = JSON.parse(JSON.stringify(metadata));
            let authors = [];
            _metadata.title = it.title[0];
            _metadata.DOI = it.DOI;
            _metadata.abstract = it.abstract;
            _metadata.ISSN = it.ISSN ? it.ISSN[0] : "";
            _metadata.containerTitle = it["container-title"]
                ? it["container-title"][0]
                : "";
            _metadata.createDate = it.created
                ? it.created["date-time"]
                : "";
            _metadata.language = it.language;
            _metadata.publisher = it.publisher;
            _metadata.source = it.source;
            _metadata.url = it.URL;
            if (it.author) {
                it.author.forEach((el) => {
                    let _author = JSON.parse(JSON.stringify(author));
                    _author.first = el.first || el.given;
                    _author.last = el.last || el.family;
                    _author.sequence = el.sequence;
                    authors.push(_author);
                });
            }
            _metadata.authors = authors;
            if (_metadata.createDate != "")
                _metadata.year = new Date(_metadata.createDate).getFullYear().toString();
            _metadata.from = 'CrossRef';
            result.push(_metadata);
        });

        return result;
    }

    static async semanticScholar_getInfoByTitle(title, axios) {
        let baseUrl =
            "https://api.semanticscholar.org/graph/v1/paper/search";
        title = title.replace(/ +/g, " ");
        return await new Promise((resolve) => {
            try {
                axios
                    .get(
                        baseUrl,
                        {
                            params: {
                                query: title,
                                fields: "url,title,abstract,authors,year,venue,fieldsOfStudy",
                            },
                        },
                        {
                            timeout: 10000,
                        }
                    )
                    .then((response) => {
                        resolve(META_API.formatSemanticScholar(response.data.data));
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve([]);
                    });
            } catch (e) {
                resolve([]);
            }
        });
    }

    static formatSemanticScholar(data) {
        let result = [];
        data.forEach((it) => {
            let _metadata = JSON.parse(JSON.stringify(metadata));
            let authors = [];
            _metadata.title = it.title;
            _metadata.abstract = it.abstract;
            _metadata.year = it.year.toString();
            _metadata.publisher = it.venue;
            _metadata.url = it.url;
            _metadata.source = 'Semantic Scholar';
            it.authors.forEach((el, idx) => {
                let _author = JSON.parse(JSON.stringify(author));
                let name = el['name'].split(" ");
                _author.first = name[0];
                if (name.length > 1)
                    _author.last = name.slice(1).join(" ");
                _author.sequence = idx == 0 ? 'first' : 'additional';
                authors.push(_author);
            });
            _metadata.authors = authors;
            _metadata.from = 'Semantic Scholar';
            result.push(_metadata);
        });

        return result;
    }

    static async dataCite_getInfoByTitle(title, axios) {
        let baseUrl =
            "https://api.datacite.org/dois";
        title = title.replace(/ +/g, " ");
        return await new Promise((resolve) => {
            try {
                axios
                    .get(
                        baseUrl,
                        {
                            params: {
                                "query": `titles.title:"${title}"`,
                            },
                        },
                        {
                            timeout: 10000,
                        }
                    )
                    .then((response) => {
                        resolve(META_API.formatDataCite(response.data.data));
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve([]);
                    });
            } catch (e) {
                resolve([]);
            }
        });
    }

    static formatDataCite(data) {
        let result = [];
        data.forEach((it) => {
            let _metadata = JSON.parse(JSON.stringify(metadata));
            let authors = [];
            _metadata.title = it.attributes.titles[0].title;
            _metadata.DOI = it.id;
            _metadata.abstract = it.attributes.descriptions[0] ? it.attributes.descriptions[0].description : "";
            _metadata.year = it.attributes.publicationYear.toString();
            _metadata.publisher = it.attributes.publisher;
            _metadata.source = 'DataCite';
            _metadata.url = it.url;
            it.attributes.creators.forEach((el, idx) => {
                let _author = JSON.parse(JSON.stringify(author));
                _author.first = el.givenName;
                _author.last = el.familyName;
                _author.sequence = idx == 0 ? 'first' : 'additional';
                authors.push(_author);
            });
            _metadata.authors = authors;
            _metadata.from = 'Data Cite';
            result.push(_metadata);
        });

        return result;
    }

    static titleSimilar(s, t, f) {
        if (!s || !t) {
            return 0
        }
        var l = s.length > t.length ? s.length : t.length
        var n = s.length
        var m = t.length
        var d = []
        f = f || 3
        var min = function (a, b, c) {
            return a < b ? (a < c ? a : c) : (b < c ? b : c)
        }
        var i, j, si, tj, cost
        if (n === 0) return m
        if (m === 0) return n
        for (i = 0; i <= n; i++) {
            d[i] = []
            d[i][0] = i
        }
        for (j = 0; j <= m; j++) {
            d[0][j] = j
        }
        for (i = 1; i <= n; i++) {
            si = s.charAt(i - 1)
            for (j = 1; j <= m; j++) {
                tj = t.charAt(j - 1)
                if (si === tj) {
                    cost = 0
                } else {
                    cost = 1
                }
                d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
            }
        }
        let res = (1 - d[n][m] / l)
        return res.toFixed(f)
    }
}