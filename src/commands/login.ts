import chalk from 'chalk';
import SuccessFactors from '../lib/successFactors';

const login = async () => {
  const sf = new SuccessFactors();

  const loginResult = await sf.login();

  process.stdout.write('\n');

  if (!loginResult) {
    console.log(chalk.red('Erro ao autenticar. Verifique suas credenciais'));
  } else {
    console.log(chalk.blue('Você está autenticado!'));
  }
};

export default login;
