import chalk from 'chalk';
import SuccessFactors from '../lib/successFactors';

const logout = () => {
    const th = new SuccessFactors();
    th.logout();
    console.log(chalk.blue('Credenciais apagadas!'));
};

export default logout;