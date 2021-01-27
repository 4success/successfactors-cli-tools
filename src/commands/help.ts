import chalk from 'chalk';
import {CommandsInterface} from '../data';

const showHelpMenu = () => {
    let maxSize = 0;

    const logHelpCommand = (commandName: string, description: string) => {
        const dotsQtd: number = maxSize - commandName.length;
        let dots = '';

        for (let i = 0; i < dotsQtd + 10; i++) {
            dots += '.';
        }
        return console.log(chalk.yellow.underline(commandName), chalk.gray(dots), chalk.whiteBright(description));
    };

    const commands: CommandsInterface = {
        'login': 'Login com sua conta em uma instância SuccessFactors',
        'logout': 'Faz o Logout e apaga suas credenciais',
        'login-check': 'Valida se suas credenciais estão corretas',
        'download-profile-pictures': 'Baixa fotos do perfil dos colaboradores para um diretório',
    };

    console.log(chalk.yellow.underline('Comandos disponíveis\n'));

    Object.keys(commands).forEach((key: string) => {
        if (key.length > maxSize) {
            maxSize = key.length;
        }
    });

    Object.keys(commands).forEach((key: string) => {
        logHelpCommand(key, commands[key]);
    });
};

export default showHelpMenu;