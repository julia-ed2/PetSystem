



## DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE
## SOFTWARE
## SUMÁRIO
1 INTRODUÇÃO......................................................................................................... 2
2 DEFINIÇÕES DE REQUISITOS..............................................................................3
2.1 Requisitos Funcionais.......................................................................................3
2.2 Requisitos Não Funcionais...............................................................................5
2.3 Regras de Négocio............................................................................................8
2.4 Papéis de Usúario.............................................................................................9
2.5 Técnica de Levantamento Utilizada..................................................................10


## 1 INTRODUÇÃO

Este documento apresenta a especificação de requisitos para a informatização do sistema
web e mobile PetSystem, desenvolvido como parte do Projeto Integrador do curso de
Sistemas de Informação do Centro Universitário de Patos de Minas (UNIPAM).
O sistema proposto consiste em uma solução de gestão para clínica veterinária, com
abordagem web e possibilidade de integração com aplicativo mobile, visando atender às
necessidades identificadas junto à empresa parceira. A proposta surge da necessidade de
organizar e centralizar informações administrativas e operacionais, que muitas vezes são
mantidas de forma manual ou em sistemas não integrados, dificultando a gestão eficiente
da clínica.
O sistema PetSystem tem como objetivo principal auxiliar no controle das atividades da
clínica veterinária, incluindo cadastro de clientes e pets, agendamento de consultas,
registro de atendimentos, gerenciamento de serviços e controle financeiro básico. Além
disso, o sistema permitirá a geração de relatórios que apoiem a tomada de decisões e a
melhoria dos processos internos.
Este documento tem como finalidade descrever de forma clara e detalhada os requisitos
funcionais e não funcionais do sistema, servindo como base para o desenvolvimento,
validação e implementação da solução proposta.



## 2 DEFINIÇÕES DOS REQUISITOS
## 2.1 REQUISITOS FUNCIONAIS
RF01 – Cadastro de Tutores
O sistema deve permitir o cadastro de tutores com as seguintes informações obrigatórias:
nome, CPF, telefone e endereço.
RF02 – Cadastro de Pets
O sistema deve permitir o cadastro de pets vinculados a um tutor, contendo nome,
espécie, raça e idade (em formato numérico).
RF03 – Prontuário Digital
O sistema deve manter um prontuário digital para cada pet contendo histórico de
consultas, exames realizados, receitas e procedimentos, permitindo sua visualização e
impressão.
RF04 – Registro de Vacinas
O sistema deve permitir o registro de vacinas aplicadas durante o atendimento,
possibilitando cadastro e atualização de múltiplos pets de forma ágil.
RF05 – Notificações de Vacinas
O sistema deve notificar automaticamente os tutores quando uma vacina estiver próxima
do vencimento.
RF06 – Agendamento
O sistema deve permitir o agendamento de exames e cirurgias contendo data, horário e
veterinário responsável.
RF07 – Notificação de Chegada

O sistema deve notificar automaticamente o veterinário responsável quando um paciente
chegar na clínica, com exibição no sistema web e mobile e possibilidade de alerta sonoro.
RF08 – Comunicação Interna
O sistema deve possuir um painel de recados para comunicação entre funcionários.
RF09 – Comunicação com Clientes
O sistema deve permitir a comunicação com clientes por meio do aplicativo ou integração
com WhatsApp.
RF10 – Internação
O sistema deve permitir o envio de atualizações para tutores sobre pets internados.
RF11 – Controle de Produtos
O sistema deve permitir o cadastro de produtos com controle de entrada e saída,
organizados por nome e marca.
RF12 – Laudos Digitais
O sistema deve permitir a criação de laudos digitais, com possibilidade de vinculação ao
prontuário do pet e impressão.
RF13 – Controle Financeiro
O sistema deve permitir um controle financeiro básico, incluindo registro de consultas e
serviços, controle de receitas e integração com planilhas.
RF14 – Venda de Produtos (Opcional)
O sistema pode permitir a venda de produtos online para clientes da clínica.
RF15 – Aplicativo do Cliente

O sistema deve disponibilizar um aplicativo onde o cliente possa visualizar o histórico do
pet, acessar a carteira de vacinação, receber notificações e acompanhar o atendimento
## 2.2 REQUISITOS NÃO FUNCIONAIS
RNF01 – Usabilidade
O sistema deve possuir interface simples e intuitiva, permitindo que usuários com
conhecimento básico em informática consigam utilizá-lo sem treinamento prévio.
•Interface desenvolvida com HTML, CSS e JavaScript
•Protótipos previamente definidos no Figma
•Campos obrigatórios claramente identificados
•Mensagens de erro e sucesso exibidas de forma clara
RNF02 – Desempenho
O sistema deve responder rapidamente às ações do usuário.
•Tempo de resposta de até 2 segundos para operações comuns
•Utilização de Django otimizado para requisições web
•Consultas ao banco otimizadas (uso de índices, banco vai direto no dado)
•Redução de carregamento desnecessário de dados
RNF03 – Disponibilidade
O sistema deve estar disponível durante o uso da clínica.
•Sistema executado localmente (computadores da clínica)
•Disponibilidade durante horário de uso.
•Estrutura preparada para futura hospedagem contínua (24h)
RNF04 – Compatibilidade

O sistema deve funcionar em diferentes dispositivos e ambientes, garantindo acesso tanto
via navegador web quanto por aplicações mobile.
•Compatível com navegadores modernos (Chrome, Edge, etc.)
•Interface responsiva adaptável a diferentes tamanhos de tela
•Integração com aplicação mobile por meio de API REST
•Comunicação entre sistemas utilizando requisições HTTP e dados no formato
## JSON
RNF05 – Segurança
O sistema deve garantir a proteção dos dados dos usuários, conforme a
Lei Geral de Proteção de Dados.
•Autenticação de usuários com login e senha
•Senhas armazenadas de forma criptografada (hash – Django)
•Controle de acesso por tipo de usuário (admin, operador, cliente)
•Validação de dados no backend (Django)
•Proteção contra acesso não autorizado
RNF06 – Persistência de Dados
O sistema deve garantir armazenamento seguro e consistente dos dados.
•Utilização de banco de dados relacional (MySQL ou PostgreSQL)
•Armazenamento estruturado dos dados
•Possibilidade de realização de backup manual pelo administrador
•Garantia de integridade dos dados por meio de chaves primárias e estrangeiras
•Não deve ser possível cadastrar dados inconsistentes (ex: pet sem tutor válido)
RNF07 – Escalabilidade (Básica)
O sistema deve suportar crescimento moderado de dados e usuários, mantendo seu
funcionamento adequado.
•Estrutura preparada para aumento de cadastros (tutores, pets, atendimentos)

•Utilização de banco de dados relacional eficiente (MySQL ou PostgreSQL)
•Organização do código utilizando o framework Django
•Separação em módulos para facilitar futuras expansões
RNF08 – Manutenibilidade
O sistema deve ser fácil de manter e evoluir.
•Código versionado com Git
•Organização em módulos (Django Apps)
•Comentários e padronização de código
•Separação entre frontend e backend
RNF09 – Comunicação entre Web e Mobile
O sistema deve permitir a comunicação entre a aplicação web e a aplicação mobile por
meio de uma API REST.
•Backend desenvolvido com Django
•Utilização de Django REST Framework para criação da API
•Comunicação realizada por requisições HTTP
•Troca de dados no formato JSON
•Centralização dos dados em um único banco de dados (MySQL ou PostgreSQL),
garantindo a consistência das informações entre web e mobile, as mesmas
informações devem ser acessíveis tanto na aplicação web quanto na mobile e as
alterações realizadas em uma plataforma devem refletir na outra

## 2.3 REGRAS DE NEGÓCIO
RN01 – CPF único do tutor
Cada tutor deve possuir um CPF único no sistema.
Regra: Não é permitido cadastrar dois tutores com o mesmo CPF
RN02 – Pet deve estar vinculado a um tutor
Todo pet cadastrado deve estar obrigatoriamente associado a um tutor.
Regra: Não é permitido cadastrar pet sem tutor
RN03 – Exclusão de tutor
Um tutor não poderá ser excluído caso possua pets cadastrados.
Regra: Deve remover ou transferir os pets antes da exclusão
RN04 – Idade do pet
A idade do pet deve ser um valor numérico válido.
Regra: Deve ser maior que zero, não pode conter letras
RN05 – Agendamento de consultas
Não é permitido agendar duas consultas no mesmo horário para o mesmo veterinário.
Regra: Horários devem ser únicos por profissional
RN06 – Atualização de estoque
A quantidade de produtos deve ser atualizada conforme entrada e saída.
Regra: Não permitir estoque negativo
RN07 – Acesso por perfil de usuário
As funcionalidades do sistema devem respeitar o perfil do usuário.

Regra:  Administrador: acesso total
Operador: acesso limitado
Cliente: acesso restrito
RN08 – Registro de prontuário
Os dados do prontuário devem ser vinculados ao pet correto.
Regra: Não permitir registro sem vínculo com pet
RN09 – Vacinação
A data da vacina deve ser registrada corretamente.
## Regra:
Não permitir datas inválidas ou futuras incoerentes

## 2.4 PAPEIS DE USUÁRIO

## •    Referência
## •    ADMINISTRADOR
## •    Atributos
## •    Nome
## •    Login
## •    Senha
-    Tipo de usuário (adm)
## •    Eventos
-    Cadastrar, editar e excluir tutores
-    Cadastrar, editar e excluir pets
-    Gerenciar usuários
-    Controlar estoque
-    Visualizar relatórios
## •    Serviços
-    Acesso total ao sistema
-    Controle completo das funcionalidades
-    Subpontos de
vista
-    Funcional: realiza todas as operações do sistema
-    Acesso: acesso total a todas as funcionalidades
-    Interface: visualiza todos os módulos e telas do sistema
-    Segurança: controle completo com autenticação e
permissões elevadas

## •    Referência
## •    OPERADOR
## •    Atributos
## •    Nome
## •    Login
## •    Senha
-    Tipo de usuário (operador)
## •    Eventos
-    Cadastrar e editar tutores
-    Cadastrar e editar pets
-    Realizar atendimentos
-    Consultar dados
## •    Serviços
-    Acesso parcial ao sistema
-    Não possui permissão para excluir dados críticos ou gerenciar
usuários
-    Subpontos de
vista
-    Funcional: realiza cadastros e atendimentos
-    Acesso: acesso parcial, sem permissões administrativas
-    Interface: visualiza apenas módulos operacionai
-    Segurança: acesso restrito conforme perfil definido


-    Referência•    CLIENTE
## •    Atributos •    Nome
## •    CPF
## •    Telefone
-    Login e senha (se aplicável)
-    Eventos •Visualizar dados pessoais
•Visualizar dados dos pets
•Acompanhar atendimentos
-    Serviços •    Acesso restrito às próprias informações
-    Não pode alterar dados de outros usuários
-    Subpontos de
vista
-    Funcional: consulta seus dados e dos seus pets
-    Acesso: acesso limitado às próprias informações
-    Interface: visualiza apenas informações pessoais e
relacionadas
-    Segurança: não possui acesso a dados de outros usuários


2.5 Técnica de levantamento utilizada
-    Entrevista com funcionários da clínica veterinária PetZoo
-    Observação do uso do sistema atual da clínica
(SimplesVet)
-    Análise e identificação de problemas no processo atual
-    Essas técnicas permitiram compreender o funcionamento atual da clínica e
identificar melhorias para o desenvolvimento do sistema proposto.