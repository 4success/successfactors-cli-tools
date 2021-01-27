import Configstore from "configstore";
import {SuccessFactorsBasicCredentials} from "../data";
import inquirer from './inquirer';
import {Spinner} from "clui";
import axios from "axios";
import chalk from "chalk";
import moment, {Moment} from "moment";
import * as fs from "fs";
import papaparse from 'papaparse';
import got from "got";

const odata = require('odata-client');
const pkg = require('../../package.json');

type UserBasicData = {
    userId: string;
    username: string;
    defaultFullName: string;
}

interface CsvOutput extends UserBasicData {
    photoExists: boolean
    photoLastModifiedDate?: string;
}

interface Base64ImageDecodeResponse {
    type: string;
    data: Buffer
}

type SfUserPhoto = {
    d: {
        __metadata: {
            uri: string,
            type: string;
        }
        photoType: number;
        userId: string;
        lastModifiedDateTime: string;
        width: string;
        photo: string;
        photoId: string;
        lastModified: string;
        lastModifiedWithTZ: string;
        mimeType: string;
        photoName: string | null;
        height: number;
    }
}

export default class SuccessFactors {
    private readonly credentials: SuccessFactorsBasicCredentials;
    private configStore: Configstore;

    constructor() {
        this.configStore = new Configstore(pkg.name);
        this.credentials = {
            apiHost: this.configStore.get('apiHost'),
            username: this.configStore.get('username'),
            companyId: this.configStore.get('companyId'),
            password: this.configStore.get('password'),
        };
    }

    private static decodeBase64Image(mimeType: string, dataString: string): Base64ImageDecodeResponse {
        const response: Base64ImageDecodeResponse = <Base64ImageDecodeResponse>{};
        response.type = mimeType;
        response.data = Buffer.from(dataString, 'base64');

        return response;
    }

    private static convertODataDate(odataDate: string): Moment | null {
        const regex = new RegExp(/(?<=Date\()(.*?)(?=\s*\))/gm);

        const options = regex.exec(odataDate);
        if (options && options.length > 0) {
            return moment(parseInt(options[0].split('+')[0]));
        }
        return null;
    }

    private static getFileSuffixForContentType(contentType: string) {
        switch (contentType) {
            case 'image/bmp':
                return 'bmp';
            case 'image/gif':
                return 'gif';
            case 'image/webp':
                return 'webapp';
            case 'image/svg+xml':
                return 'svg';
            case 'image/jpeg':
                return 'jpeg';
            case 'image/png':
                return 'png';
            default:
                throw Error('Invalid content type');
        }
    }

    async login(): Promise<boolean> {
        const credentials = await inquirer.askSuccessFactorsCredentials();

        const status = new Spinner('Autenticando, por favor aguarde...');
        process.stdout.write('\n');

        status.start();
        try {
            const url = `${credentials.host}/odata/v2`;

            const response = await axios.get(url, {
                auth: {
                    username: `${credentials.username}@${credentials.companyId}`,
                    password: credentials.password
                }
            });

            if (response.status === 200) {
                this.credentials.apiHost = credentials.host;
                this.credentials.companyId = credentials.companyId;
                this.credentials.username = credentials.username;
                this.credentials.password = credentials.password;
                this.updateCredentialsStore();

                status.stop();
                process.stdout.write('\n');
                return true;
            } else {
                status.stop();
                process.stdout.write('\n');
                return false;
            }
        } catch (e) {
            status.stop();
            process.stdout.write('\n');
            console.log(e.response.data);
        }
        return false;
    }

    logout() {
        this.credentials.apiHost = null;
        this.credentials.username = null;
        this.credentials.password = null;
        this.credentials.companyId = null;

        this.updateCredentialsStore();
    }

    async checkLogin() {
        try {
            const url = `${this.credentials.apiHost}/odata/v2`;

            const response = await axios.get(url, {
                auth: {
                    username: `${this.credentials.username}@${this.credentials.companyId}`,
                    password: this.credentials.password as string
                }
            });

            return response.status === 200;
        } catch (e) {
            return false;
        }
    }

    async downloadProfileImagesToFolder() {
        const folderToSaveImages = await inquirer.askFolder();
        if (!fs.existsSync(folderToSaveImages.path)) {
            console.log(`O diretório ${folderToSaveImages.path} não existe! Verifique e tente novamente`);
            process.exit(1);
        }

        const execFolder = `${folderToSaveImages.path}/${moment().format('YYYYMMDDHHmmss')}`;
        fs.mkdirSync(execFolder);
        fs.mkdirSync(`${execFolder}/photos`);

        let csvOutput: CsvOutput[] = [];
        const users = await this.getUsersBasicData();

        const status = new Spinner('Buscando dados dos usuários...');

        status.start();

        const packageSize = 1000;
        let pageCounter = 1;
        let totalPages = Math.round(users.length / packageSize);
        while (users.length) {
            const promises = [];
            const chunkedUsers = users.splice(0, packageSize);
            for (let i = 0; i < chunkedUsers.length; i++) {
                let user = chunkedUsers[i];
                promises.push(this.saveUserPhoto(user, `${execFolder}/photos`));
            }

            status.message(`Baixando pacote de ${promises.length} fotos (${pageCounter} / ${totalPages})`)
            try {
                const responses = await Promise.all(promises);
                csvOutput = csvOutput.concat(responses);
            } catch (e) {
                console.log(chalk.red(e.message));
            }
            pageCounter++;
        }

        status.stop();
        process.stdout.write('\n');

        console.log(`Items processados: ${csvOutput.length}`);
        console.log(`Items com foto: ${csvOutput.filter(value => value.photoExists).length}`);
        console.log(`Items sem foto: ${csvOutput.filter(value => !value.photoExists).length}`);

        const csv = papaparse.unparse(csvOutput);

        fs.writeFileSync(`${execFolder}/summary.csv`, csv);
        console.log(chalk.yellowBright(`Resumo salvo em ${execFolder}/summary.csv`));
    }

    private async saveUserPhoto(user: UserBasicData, folderToSaveImages: string): Promise<CsvOutput> {
        const defaultTimeout = 10 * 1000;
        try {
            // const CancelToken = axios.CancelToken;
            // const source = CancelToken.source();
            // const timeout = setTimeout(() => source.cancel('Timeout'), defaultTimeout);
            //
            // const res = await axios.get(`${this.credentials.apiHost}/odata/v2/Photo(photoType=1,userId='${user.userId}')`, {
            //     cancelToken: source.token,
            //     auth: {
            //         username: `${this.credentials.username}@${this.credentials.companyId}`,
            //         password: this.credentials.password as string
            //     },
            //     timeout: defaultTimeout
            // }).catch( error => {
            //     throw new Error( `Failed GET request for ${ user.username }` );
            // });

            const auth = 'Basic ' + Buffer.from(`${this.credentials.username}@${this.credentials.companyId}:${this.credentials.password}`).toString('base64');
            const res = await got(`${this.credentials.apiHost}/odata/v2/Photo(photoType=1,userId='${user.userId}')`, {
                headers: {
                    Authorization: auth,
                    Accept: 'application/json'
                },
                timeout: defaultTimeout
            });

            const userPhoto: SfUserPhoto = JSON.parse(res.body);
            const lastModifiedDate = SuccessFactors.convertODataDate(userPhoto.d.lastModifiedDateTime);

            const image = SuccessFactors.decodeBase64Image(userPhoto.d.mimeType, userPhoto.d.photo);
            const filename = `${folderToSaveImages}/${user.username}.${SuccessFactors.getFileSuffixForContentType(image.type)}`;
            fs.writeFileSync(filename, image.data);

            return {
                ...user,
                photoExists: true,
                photoLastModifiedDate: lastModifiedDate ? lastModifiedDate.toISOString() : undefined
            }
        } catch (e) {
            return {
                ...user,
                photoExists: false,
            };
        }
    }

    private async getUsersBasicData(): Promise<UserBasicData[]> {
        const auth = 'Basic ' + Buffer.from(`${this.credentials.username}@${this.credentials.companyId}:${this.credentials.password}`).toString('base64');
        const oDataConfig = {
            service: `${this.credentials.apiHost}/odata/v2`,
            format: 'json',
            headers: {
                Authorization: auth
            }
        };

        const q = odata(oDataConfig);

        console.log(chalk.whiteBright(`Contando usuários ativos...`));

        const countTotalUsersResponse = await q.resource('User/$count').filter(`status eq 't'`).get();
        const countTotalUsers = parseInt(countTotalUsersResponse.toJSON().body);
        console.log(chalk.whiteBright(`Total de usuários ativos: ${countTotalUsers}`));

        const status = new Spinner('Buscando dados dos usuários...');

        status.start();
        const users: UserBasicData[] = [];
        let pageCounter = 1;
        const totalPages = Math.round(countTotalUsers / 1000);
        let nextUrl: string | null = null;
        do {
            let oDataResponse: any;
            status.message(`Buscando página ${(pageCounter)} de ${totalPages}...`);

            if (!nextUrl) {
                const req = await odata(oDataConfig).resource('User')
                    .select('userId', 'username', 'defaultFullName')
                    .filter(`status eq 't'`)
                    .get();

                oDataResponse = JSON.parse(req.toJSON().body);
            } else {
                const req = await axios.get(nextUrl, {
                    auth: {
                        username: `${this.credentials.username}@${this.credentials.companyId}`,
                        password: this.credentials.password as string
                    }
                });
                oDataResponse = req.data;
            }

            for (let i = 0; i < oDataResponse.d.results.length; i++) {
                const result = oDataResponse.d.results[i];
                users.push({
                    userId: result.userId,
                    username: result.username,
                    defaultFullName: result.defaultFullName
                });
            }
            if (typeof oDataResponse.d['__next'] === 'undefined' || !oDataResponse.d['__next']) {
                break;
            }
            nextUrl = oDataResponse.d['__next'];
            pageCounter += 1;
        } while (true)
        status.message(`Busca finalizada!`);
        process.stdout.write('\n');
        status.stop();

        return users;
    }

    private updateCredentialsStore() {
        this.configStore.set('apiHost', this.credentials.apiHost);
        this.configStore.set('companyId', this.credentials.companyId);
        this.configStore.set('username', this.credentials.username);
        this.configStore.set('password', this.credentials.password);
    }
}