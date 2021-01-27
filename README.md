# Cliente CLI ferramentas - SuccessFactors

Kit de ferramentas conectadas com a API do SuccessFactors para realizar operações em lote de forma facilitada

Versão testada: NodeJS v12.18.2

## Utilização

* Executar `npm install -g @4success/successfactors-cli-tools` para instalar.
* Abrir um terminal e testar se o comando está disponível com `4s-sf-tools help`
* Fazer o login com `4s-sf-tools login`. Tenha em mãos seu companyId, usuário e senha para autenticar na API OData.
* Para baixar fotos, utilize `4s-sf-tools download-profile-pictures` e siga as instruções.

## Instruções para instalação / execução em tempo de projeto

* Executar `yarn install `ou `npm install` - para instalar as dependências
* Executar `yarn run execute-ts help` ou  `npm run execute-ts help` - para ver os comandos disponíveis
* Executar `yarn run execute-ts login` ou  `npm run execute-ts login` - para fazer login
* Executar `yarn run execute-ts download-profile-pictures` ou  `npm run execute-ts download-profile-pictures` - para
  executar o script de importação de fotos
* Executar `yarn run execute-ts logout` ou  `npm run execute-ts logout` - para fazer logout e limpar as credenciais

O log de execução e o progresso poderá ser verificado no console.

### Usando Docker

Foi disponibilizado um arquivo Dockerfile com o ambiente já pré-configurado, caso você não tenha o node ou trabalhe com
uma versão diferente da testada. Para utilizar, use os seguintes comandos:

* `docker build -t node-js-12.18-alpine .`
* `docker run -it --rm -v $(pwd):/home/node --name download-fotos-successfactors node-js-12.18-alpine`

Após esse comando, será inicado uma sessão dentro do container, onde você pode executar os comandos:

* `npm install`
* `npm run execute-ts help`.
* `npm run execute-ts login`.
* `npm run execute-ts download-profile-pictures`.