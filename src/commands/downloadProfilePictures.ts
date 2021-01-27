import SuccessFactors from "../lib/successFactors";
import chalk from "chalk";
import {Spinner} from "clui";


const downloadProfilePictures = async () => {
    const sf = new SuccessFactors();

    const status = new Spinner('Verificando login...');
    status.start();
    if (!await sf.checkLogin()) {
        console.log(chalk.red('Erro na autenticação. Verifique suas credenciais e faça login novamente'));
        process.exit();
    }
    status.stop();
    process.stdout.write('\n');

    try {
        await sf.downloadProfileImagesToFolder();
    } catch (e) {
        console.log(chalk.red(e.message));
    }
};

export default downloadProfilePictures;