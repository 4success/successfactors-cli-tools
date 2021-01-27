import inquirer from 'inquirer';

export interface InputCredentialsRequest {
  host: string;
  companyId: string;
  username: string;
  password: string;
}

export interface InputFolder {
  path: string;
}

export default {
  askFolder: (): Promise<InputFolder> => {
    const questions = [
      {
        name: 'path',
        type: 'input',
        message: 'Qual será o diretório que as fotos deverão ser salvas?',
        validate: (value: string) => {
          if (value.length) {
            return true;
          } else {
            return 'Por favor,entre com o caminho do diretório';
          }
        },
      },
    ];
    return inquirer.prompt(questions);
  },
  askSuccessFactorsCredentials: (): Promise<InputCredentialsRequest> => {
    const questions = [
      {
        name: 'host',
        type: 'list',
        choices: [
          {
            name: 'DC4 Production - https://api4.successfactors.com (Chandler, Arizona, US)',
            value: 'https://api4.successfactors.com',
          },
          {
            name: 'DC4 Preview - https://api4preview.sapsf.com (Chandler, Arizona, US)',
            value: 'https://api4preview.sapsf.com',
          },
          {
            name: 'DC8 Production - https://api8.successfactors.com (Ashburn, Virginia, US)',
            value: 'https://api8.successfactors.com',
          },
          {
            name: 'DC8 Preview - https://api8preview.sapsf.com (Ashburn, Virginia, US',
            value: 'https://api8preview.sapsf.com',
          },
          { name: 'DC19 Production - https://api19.sapsf.com (Brasil)', value: 'https://api19.sapsf.com' },
          {
            name: 'DC19 Preview - https://api19preview.sapsf.com (Brasil)',
            value: 'https://api19preview.sapsf.com',
          },
        ],
        message: 'Selecione seu datacenter (URL):',
        validate: (value: string) => {
          if (value.length) {
            return true;
          } else {
            return 'Por favor, selecione o seu datacenter';
          }
        },
      },
      {
        name: 'companyId',
        type: 'input',
        message: 'Entre com o seu código de empresa (companyId) do SucessFactors:',
        validate: (value: string) => {
          if (value.length) {
            return true;
          } else {
            return 'O código da empresa é obrigatório para seguir com o processo de login..';
          }
        },
      },
      {
        name: 'username',
        type: 'input',
        message: 'Entre com o usuário (case-sensitive) que será usado na conexão:',
        validate: (value: string) => {
          if (value.length) {
            return true;
          } else {
            return 'Por favor, entre com um usuário (case-sensitive)';
          }
        },
      },
      {
        name: 'password',
        type: 'password',
        message: 'Entre com a sua senha:',
        validate: (value: string) => {
          if (value.length) {
            return true;
          } else {
            return 'Por favor, entre com a sua senha';
          }
        },
      },
    ];
    return inquirer.prompt(questions);
  },
};
