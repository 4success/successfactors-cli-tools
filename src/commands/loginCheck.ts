import chalk from 'chalk';
import SuccessFactors from '../lib/successFactors';

const loginCheck = async () => {
    const sf = new SuccessFactors();

    if (await sf.checkLogin()) {
        process.stdout.write('\n');
        console.log(chalk.blue('Suas credenciais estão OK! Você está pronto para executar os comandos'));
    } else {
        process.stdout.write('\n');
        console.log(chalk.red('Erro na autenticação. Verifique suas credenciais e faça login novamente'));
    }
};

export default loginCheck;