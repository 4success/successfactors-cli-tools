#!/usr/bin/env node
import chalk from 'chalk';
import dotenv from 'dotenv';
import showHelpMenu from "./commands/help";
import login from "./commands/login";
import logout from "./commands/logout";
import loginCheck from "./commands/loginCheck";
import downloadProfilePictures from "./commands/downloadProfilePictures";

const parseArgs = require('minimist')(process.argv.slice(2));

dotenv.config({
    path: __dirname + '/../.env'
});

const run = async () => {
    switch (parseArgs['_'][0]) {
        case 'help':
            showHelpMenu();
            break;
        case 'login-check':
            await loginCheck();
            break;
        case 'login':
            await login();
            break;
        case 'logout':
            await logout();
            break;
        case 'download-profile-pictures':
            await downloadProfilePictures();
            break;
        default:
            console.log(chalk.red(`Comando inválido`));
            console.log(chalk.blue(`Dica: digite '4s-sf-tools help' para ver os comandos disponíveis`));
    }
}

run().finally(() => process.exit());

export default {};