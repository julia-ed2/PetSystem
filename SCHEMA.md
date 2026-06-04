# Schema do PetSystem - Documentação DDL

**Data**: 29/04/2026  
**Status**: Fase 0 - Planejamento & Documentação  
**Banco**: MySQL 8.0  
**Encoding**: UTF-8  

---

## 📋 Índice

1. [Entidades Base](#entidades-base)
2. [Entidades Relacionadas a Pets](#entidades-relacionadas-a-pets)
3. [Entidades de Atendimento](#entidades-de-atendimento)
4. [Entidades de Prescrição e Vacinação](#entidades-de-prescrição-e-vacinação)
5. [Entidades de Procedimentos e Exames](#entidades-de-procedimentos-e-exames)
6. [Entidades de Internação](#entidades-de-internação)
7. [Entidades de Vendas](#entidades-de-vendas)
8. [Entidades Financeiras](#entidades-financeiras)
9. [Entidades de Comunicação](#entidades-de-comunicação)
10. [DDL Completo](#ddl-completo)
11. [Índices](#índices)
12. [Constraints](#constraints)

---

## Entidades Base

### USUARIO
Usuários do sistema (administradores, veterinários, atendentes)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_usuario | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(150) | NOT NULL | Nome completo |
| login | VARCHAR(50) | NOT NULL, UNIQUE | Login de acesso |
| senha_hash | VARCHAR(255) | NOT NULL | Hash SHA-256 da senha |
| tipo_usuario | ENUM('admin','veterinario','atendente','gerente') | NOT NULL | Tipo de usuário |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |
| id_tutor | INT | FK (TUTOR), NULL | Associação opcional com tutor |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| data_atualizacao | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Data última atualização |

---

### TUTOR
Proprietários dos animais

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_tutor | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(150) | NOT NULL | Nome completo |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE | CPF sem formatação |
| telefone | VARCHAR(11) | NULL | Telefone com DDD |
| endereco | VARCHAR(255) | NULL | Endereço completo |
| login | VARCHAR(50) | NULL, UNIQUE | Login (se cliente web) |
| senha_hash | VARCHAR(255) | NULL | Hash da senha (se cliente web) |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

---

### VETERINARIO
Profissionais veterinários

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_veterinario | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(150) | NOT NULL | Nome completo |
| crmv | VARCHAR(20) | NOT NULL, UNIQUE | CRMV (Conselho Regional) |
| telefone | VARCHAR(11) | NULL | Contato direto |
| email | VARCHAR(100) | NULL, UNIQUE | Email profissional |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

---

### SERVICO
Serviços oferecidos pela clínica

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_servico | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome do serviço |
| descricao | TEXT | NULL | Descrição detalhada |
| valor | DECIMAL(10,2) | NOT NULL, CHECK (valor > 0) | Valor em R$ |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |

---

### PROCEDIMENTO
Procedimentos cirúrgicos/clínicos

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_procedimento | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome do procedimento |
| descricao | TEXT | NULL | Descrição e técnica |
| valor | DECIMAL(10,2) | NOT NULL, CHECK (valor > 0) | Valor base |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |

---

### EXAME
Tipos de exames laboratoriais/diagnósticos

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_exame | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome do exame |
| descricao | TEXT | NULL | Descrição e indicações |
| valor | DECIMAL(10,2) | NOT NULL, CHECK (valor > 0) | Valor do exame |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |

---

### VACINA
Catálogo de vacinas

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_vacina | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome comercial |
| fabricante | VARCHAR(100) | NOT NULL | Laboratório/Fabricante |
| descricao | TEXT | NULL | Indicações e características |
| intervalo_dias | INT | NOT NULL, CHECK (intervalo_dias > 0) | Dias entre doses |
| ativa | BOOLEAN | DEFAULT TRUE | Se está em uso |

---

### PRODUTO
Produtos em estoque (medicamentos, alimentos, etc)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_produto | INT | PK, AUTO_INCREMENT | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome do produto |
| marca | VARCHAR(100) | NULL | Marca/Fabricante |
| descricao | TEXT | NULL | Descrição e uso |
| quantidade_estoque | INT | NOT NULL, DEFAULT 0 | Quantidade disponível |
| estoque_minimo | INT | NOT NULL, DEFAULT 0 | Quantidade mínima alerta |
| valor_unitario | DECIMAL(10,2) | NOT NULL, CHECK (valor_unitario >= 0) | Preço unitário |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |

---

## Entidades Relacionadas a Pets

### PET
Animais de estimação

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_pet | INT | PK, AUTO_INCREMENT | Identificador único |
| id_tutor | INT | FK (TUTOR), NOT NULL | Proprietário |
| nome | VARCHAR(100) | NOT NULL | Nome do animal |
| especie | ENUM('cao','gato','passaro','roedor','outro') | NOT NULL | Espécie |
| raca | VARCHAR(50) | NULL | Raça |
| idade | INT | NULL | Idade em anos |
| sexo | ENUM('macho','femea','nao_informado') | NULL | Sexo |
| peso | DECIMAL(6,2) | NULL, CHECK (peso > 0) | Peso em kg |
| observacoes | TEXT | NULL | Características especiais |
| ativo | BOOLEAN | DEFAULT TRUE | Status ativo/inativo |
| data_criacao | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de registro |

---

### PRONTUARIO
Histórico médico único por pet (one-to-one com PET)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_prontuario | INT | PK, AUTO_INCREMENT | Identificador único |
| id_pet | INT | FK (PET), NOT NULL, UNIQUE | Referência ao pet |
| data_abertura | DATE | NOT NULL | Data de abertura |
| observacoes_gerais | TEXT | NULL | Histórico geral |

---

## Entidades de Atendimento

### ATENDIMENTO
Consultas e atendimentos clínicos

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_atendimento | INT | PK, AUTO_INCREMENT | Identificador único |
| id_pet | INT | FK (PET), NOT NULL | Animal atendido |
| id_veterinario | INT | FK (VETERINARIO), NOT NULL | Profissional responsável |
| data_hora | DATETIME | NOT NULL | Data e hora do atendimento |
| tipo_atendimento | ENUM('consulta','retorno','emergencia','preventivo') | NOT NULL | Tipo |
| status | ENUM('agendado','em_progresso','concluido','cancelado') | NOT NULL, DEFAULT 'agendado' | Status |
| queixa_principal | TEXT | NOT NULL | Motivo da consulta |
| diagnostico | TEXT | NULL | Diagnóstico realizado |
| observacoes | TEXT | NULL | Notas adicionais |

---

### AGENDAMENTO
Marcações de consultas futuras

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_agendamento | INT | PK, AUTO_INCREMENT | Identificador único |
| id_pet | INT | FK (PET), NOT NULL | Animal a ser atendido |
| id_veterinario | INT | FK (VETERINARIO), NOT NULL | Veterinário designado |
| data | DATE | NOT NULL | Data da consulta |
| hora | TIME | NOT NULL | Hora da consulta |
| tipo_agendamento | ENUM('consulta','retorno','emergencia','preventivo') | NOT NULL | Tipo |
| status | ENUM('agendado','confirmado','realizado','cancelado','nao_compareceu') | NOT NULL, DEFAULT 'agendado' | Status |
| observacoes | TEXT | NULL | Notas |

---

## Entidades de Prescrição e Vacinação

### RECEITA
Prescrições médicas

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_receita | INT | PK, AUTO_INCREMENT | Identificador único |
| id_atendimento | INT | FK (ATENDIMENTO), NOT NULL | Atendimento gerador |
| data_emissao | DATE | NOT NULL | Data de emissão |
| orientacoes | TEXT | NULL | Instruções gerais |

---

### ITEM_RECEITA
Itens/medicamentos de uma receita

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_item_receita | INT | PK, AUTO_INCREMENT | Identificador único |
| id_receita | INT | FK (RECEITA), NOT NULL | Receita pai |
| medicamento | VARCHAR(100) | NOT NULL | Nome do medicamento |
| dosagem | VARCHAR(50) | NOT NULL | Dosagem (ex: 500mg) |
| frequencia | VARCHAR(50) | NOT NULL | Frequência (ex: 12 em 12h) |
| duracao | VARCHAR(50) | NOT NULL | Duração do tratamento |
| observacoes | TEXT | NULL | Notas especiais |

---

### VACINA (já descrita acima)

### APLICACAO_VACINA
Registros de vacinação aplicada

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_aplicacao_vacina | INT | PK, AUTO_INCREMENT | Identificador único |
| id_pet | INT | FK (PET), NOT NULL | Animal vacinado |
| id_vacina | INT | FK (VACINA), NOT NULL | Vacina aplicada |
| id_atendimento | INT | FK (ATENDIMENTO), NULL | Atendimento em que foi aplicada |
| data_aplicacao | DATE | NOT NULL | Data de aplicação |
| data_proxima_dose | DATE | NULL | Data prevista próxima dose |
| lote | VARCHAR(50) | NULL | Número do lote |
| observacoes | TEXT | NULL | Observações |

---

## Entidades de Procedimentos e Exames

### ATENDIMENTO_PROCEDIMENTO
Procedimentos executados em um atendimento

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_atendimento_procedimento | INT | PK, AUTO_INCREMENT | Identificador único |
| id_atendimento | INT | FK (ATENDIMENTO), NOT NULL | Atendimento |
| id_procedimento | INT | FK (PROCEDIMENTO), NOT NULL | Procedimento realizado |
| observacoes | TEXT | NULL | Resultado/observações |
| valor_cobrado | DECIMAL(10,2) | NULL | Valor final cobrado |

---

### ATENDIMENTO_EXAME
Exames solicitados em atendimento

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_atendimento_exame | INT | PK, AUTO_INCREMENT | Identificador único |
| id_atendimento | INT | FK (ATENDIMENTO), NOT NULL | Atendimento |
| id_exame | INT | FK (EXAME), NOT NULL | Exame solicitado |
| resultado | TEXT | NULL | Resultado do exame |
| data_realizacao | DATE | NULL | Data da realização |
| observacoes | TEXT | NULL | Interpretação/notas |

---

### LAUDO
Laudos/relatórios diagnósticos

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_laudo | INT | PK, AUTO_INCREMENT | Identificador único |
| id_pet | INT | FK (PET), NOT NULL | Animal |
| id_atendimento | INT | FK (ATENDIMENTO), NULL | Atendimento associado |
| id_veterinario | INT | FK (VETERINARIO), NOT NULL | Veterinário responsável |
| titulo | VARCHAR(150) | NOT NULL | Título do laudo |
| descricao | TEXT | NOT NULL | Conteúdo completo |
| data_emissao | DATE | NOT NULL | Data de emissão |

---

## Entidades de Internação

### INTERNACAO
Registro de internações

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_internacao | INT | PK, AUTO_INCREMENT | Identificador único |
| id_pet | INT | FK (PET), NOT NULL | Animal internado |
| id_veterinario_responsavel | INT | FK (VETERINARIO), NOT NULL | Veterinário responsável |
| data_entrada | DATETIME | NOT NULL | Quando entrou |
| data_saida | DATETIME | NULL | Quando saiu |
| status | ENUM('em_progresso','concluida','cancelada','obito') | NOT NULL, DEFAULT 'em_progresso' | Status |
| motivo | TEXT | NOT NULL | Motivo da internação |
| observacoes | TEXT | NULL | Observações gerais |

---

### ATUALIZACAO_INTERNACAO
Histórico de atualizações durante internação

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_atualizacao_internacao | INT | PK, AUTO_INCREMENT | Identificador único |
| id_internacao | INT | FK (INTERNACAO), NOT NULL | Internação |
| id_usuario | INT | FK (USUARIO), NOT NULL | Usuário que registrou |
| descricao | TEXT | NOT NULL | Atualização/status |
| data_hora | DATETIME | NOT NULL | Quando foi registrada |
| enviada_ao_tutor | BOOLEAN | DEFAULT FALSE | Se notificou tutor |

---

## Entidades de Vendas

### VENDA
Vendas de produtos

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_venda | INT | PK, AUTO_INCREMENT | Identificador único |
| id_tutor | INT | FK (TUTOR), NOT NULL | Cliente |
| data_venda | DATE | NOT NULL | Data da venda |
| canal_venda | ENUM('presencial','online','telefone') | NOT NULL | Canal de venda |
| status | ENUM('pendente','concluida','cancelada') | NOT NULL, DEFAULT 'concluida' | Status |
| valor_total | DECIMAL(10,2) | NOT NULL, CHECK (valor_total >= 0) | Valor total |

---

### ITEM_VENDA
Itens de uma venda

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_item_venda | INT | PK, AUTO_INCREMENT | Identificador único |
| id_venda | INT | FK (VENDA), NOT NULL | Venda |
| id_produto | INT | FK (PRODUTO), NOT NULL | Produto vendido |
| quantidade | INT | NOT NULL, CHECK (quantidade > 0) | Quantidade |
| valor_unitario | DECIMAL(10,2) | NOT NULL, CHECK (valor_unitario >= 0) | Preço unitário |
| subtotal | DECIMAL(10,2) | NOT NULL, CHECK (subtotal >= 0) | Quantidade × Preço |

---

### MOVIMENTACAO_ESTOQUE
Histórico de movimentações de estoque

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_movimentacao | INT | PK, AUTO_INCREMENT | Identificador único |
| id_produto | INT | FK (PRODUTO), NOT NULL | Produto |
| id_usuario | INT | FK (USUARIO), NOT NULL | Usuário que fez |
| tipo_movimentacao | ENUM('entrada','saida','ajuste','devolucao') | NOT NULL | Tipo |
| quantidade | INT | NOT NULL | Quantidade movimentada |
| data_hora | DATETIME | NOT NULL | Quando foi feita |
| observacoes | TEXT | NULL | Motivo/notas |

---

## Entidades Financeiras

### LANCAMENTO_FINANCEIRO
Movimentações financeiras (receitas/despesas)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_lancamento | INT | PK, AUTO_INCREMENT | Identificador único |
| id_pet | INT | FK (PET), NULL | Pet relacionado (opcional) |
| id_tutor | INT | FK (TUTOR), NULL | Tutor relacionado (opcional) |
| id_atendimento | INT | FK (ATENDIMENTO), NULL | Atendimento relacionado (opcional) |
| id_servico | INT | FK (SERVICO), NULL | Serviço relacionado (opcional) |
| tipo_lancamento | ENUM('receita','despesa','devolucao') | NOT NULL | Tipo de lançamento |
| categoria | VARCHAR(50) | NOT NULL | Categoria (ex: consulta, medicamento, etc) |
| descricao | TEXT | NOT NULL | Descrição detalhada |
| valor | DECIMAL(10,2) | NOT NULL, CHECK (valor > 0) | Valor em R$ |
| data_lancamento | DATE | NOT NULL | Data do lançamento |
| forma_pagamento | ENUM('dinheiro','cartao_credito','cartao_debito','pix','boleto','cheque') | NOT NULL | Forma de pagamento |

---

## Entidades de Comunicação

### NOTIFICACAO
Notificações para tutores e usuários

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_notificacao | INT | PK, AUTO_INCREMENT | Identificador único |
| id_tutor | INT | FK (TUTOR), NULL | Tutor destinatário (opcional) |
| id_usuario | INT | FK (USUARIO), NULL | Usuário destinatário (opcional) |
| id_pet | INT | FK (PET), NULL | Pet relacionado (opcional) |
| tipo_notificacao | ENUM('consulta','vacina','medicamento','resultado_exame','internacao','geral') | NOT NULL | Tipo |
| titulo | VARCHAR(150) | NOT NULL | Título da notificação |
| mensagem | TEXT | NOT NULL | Corpo da mensagem |
| canal | ENUM('email','sms','app','push') | NOT NULL | Canal de envio |
| data_envio | DATETIME | NOT NULL | Quando foi enviada |
| lida | BOOLEAN | DEFAULT FALSE | Se foi lida |

---

### RECADO_INTERNO
Recados entre usuários do sistema

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_recado | INT | PK, AUTO_INCREMENT | Identificador único |
| id_usuario_remetente | INT | FK (USUARIO), NOT NULL | Quem enviou |
| titulo | VARCHAR(150) | NOT NULL | Título do recado |
| mensagem | TEXT | NOT NULL | Conteúdo |
| data_criacao | DATETIME | NOT NULL | Quando foi criado |
| ativo | BOOLEAN | DEFAULT TRUE | Se ainda é válido |

---

### RECADO_DESTINATARIO
Rastreamento de leitura de recados

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id_recado_destinatario | INT | PK, AUTO_INCREMENT | Identificador único |
| id_recado | INT | FK (RECADO_INTERNO), NOT NULL | Recado |
| id_usuario_destinatario | INT | FK (USUARIO), NOT NULL | Quem recebeu |
| lido | BOOLEAN | DEFAULT FALSE | Se foi lido |
| data_leitura | DATETIME | NULL | Quando foi lido |

---

## DDL Completo

```sql
-- ============================================
-- TIER 1: Entidades Base (sem FK externas)
-- ============================================

CREATE TABLE USUARIO (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  login VARCHAR(50) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('admin','veterinario','atendente','gerente') NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  id_tutor INT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE TUTOR (
  id_tutor INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  telefone VARCHAR(11),
  endereco VARCHAR(255),
  login VARCHAR(50) UNIQUE,
  senha_hash VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VETERINARIO (
  id_veterinario INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  crmv VARCHAR(20) NOT NULL UNIQUE,
  telefone VARCHAR(11),
  email VARCHAR(100) UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE SERVICO (
  id_servico INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PROCEDIMENTO (
  id_procedimento INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE EXAME (
  id_exame INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VACINA (
  id_vacina INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  fabricante VARCHAR(100) NOT NULL,
  descricao TEXT,
  intervalo_dias INT NOT NULL CHECK (intervalo_dias > 0),
  ativa BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PRODUTO (
  id_produto INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  marca VARCHAR(100),
  descricao TEXT,
  quantidade_estoque INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 2: Entidades com FK para TIER 1
-- ============================================

CREATE TABLE PET (
  id_pet INT PRIMARY KEY AUTO_INCREMENT,
  id_tutor INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  especie ENUM('cao','gato','passaro','roedor','outro') NOT NULL,
  raca VARCHAR(50),
  idade INT,
  sexo ENUM('macho','femea','nao_informado'),
  peso DECIMAL(6,2) CHECK (peso > 0),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_tutor (id_tutor),
  INDEX idx_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PRONTUARIO (
  id_prontuario INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT NOT NULL UNIQUE,
  data_abertura DATE NOT NULL,
  observacoes_gerais TEXT,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ATENDIMENTO (
  id_atendimento INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT NOT NULL,
  id_veterinario INT NOT NULL,
  data_hora DATETIME NOT NULL,
  tipo_atendimento ENUM('consulta','retorno','emergencia','preventivo') NOT NULL,
  status ENUM('agendado','em_progresso','concluido','cancelado') NOT NULL DEFAULT 'agendado',
  queixa_principal TEXT NOT NULL,
  diagnostico TEXT,
  observacoes TEXT,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_veterinario) REFERENCES VETERINARIO(id_veterinario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_pet (id_pet),
  INDEX idx_veterinario (id_veterinario),
  INDEX idx_data_hora (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE AGENDAMENTO (
  id_agendamento INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT NOT NULL,
  id_veterinario INT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  tipo_agendamento ENUM('consulta','retorno','emergencia','preventivo') NOT NULL,
  status ENUM('agendado','confirmado','realizado','cancelado','nao_compareceu') NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_veterinario) REFERENCES VETERINARIO(id_veterinario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_pet (id_pet),
  INDEX idx_veterinario (id_veterinario),
  INDEX idx_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE INTERNACAO (
  id_internacao INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT NOT NULL,
  id_veterinario_responsavel INT NOT NULL,
  data_entrada DATETIME NOT NULL,
  data_saida DATETIME,
  status ENUM('em_progresso','concluida','cancelada','obito') NOT NULL DEFAULT 'em_progresso',
  motivo TEXT NOT NULL,
  observacoes TEXT,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_veterinario_responsavel) REFERENCES VETERINARIO(id_veterinario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_pet (id_pet),
  INDEX idx_data_entrada (data_entrada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 3: Entidades relacionadas com ATENDIMENTO
-- ============================================

CREATE TABLE RECEITA (
  id_receita INT PRIMARY KEY AUTO_INCREMENT,
  id_atendimento INT NOT NULL,
  data_emissao DATE NOT NULL,
  orientacoes TEXT,
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_atendimento (id_atendimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ITEM_RECEITA (
  id_item_receita INT PRIMARY KEY AUTO_INCREMENT,
  id_receita INT NOT NULL,
  medicamento VARCHAR(100) NOT NULL,
  dosagem VARCHAR(50) NOT NULL,
  frequencia VARCHAR(50) NOT NULL,
  duracao VARCHAR(50) NOT NULL,
  observacoes TEXT,
  FOREIGN KEY (id_receita) REFERENCES RECEITA(id_receita) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_receita (id_receita)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE APLICACAO_VACINA (
  id_aplicacao_vacina INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT NOT NULL,
  id_vacina INT NOT NULL,
  id_atendimento INT,
  data_aplicacao DATE NOT NULL,
  data_proxima_dose DATE,
  lote VARCHAR(50),
  observacoes TEXT,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_vacina) REFERENCES VACINA(id_vacina) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_pet (id_pet),
  INDEX idx_vacina (id_vacina),
  INDEX idx_data_aplicacao (data_aplicacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE LAUDO (
  id_laudo INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT NOT NULL,
  id_atendimento INT,
  id_veterinario INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_veterinario) REFERENCES VETERINARIO(id_veterinario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_pet (id_pet),
  INDEX idx_data_emissao (data_emissao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ATENDIMENTO_PROCEDIMENTO (
  id_atendimento_procedimento INT PRIMARY KEY AUTO_INCREMENT,
  id_atendimento INT NOT NULL,
  id_procedimento INT NOT NULL,
  observacoes TEXT,
  valor_cobrado DECIMAL(10,2),
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_procedimento) REFERENCES PROCEDIMENTO(id_procedimento) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_atendimento (id_atendimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ATENDIMENTO_EXAME (
  id_atendimento_exame INT PRIMARY KEY AUTO_INCREMENT,
  id_atendimento INT NOT NULL,
  id_exame INT NOT NULL,
  resultado TEXT,
  data_realizacao DATE,
  observacoes TEXT,
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_exame) REFERENCES EXAME(id_exame) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_atendimento (id_atendimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 4: Internação - Atualizações
-- ============================================

CREATE TABLE ATUALIZACAO_INTERNACAO (
  id_atualizacao_internacao INT PRIMARY KEY AUTO_INCREMENT,
  id_internacao INT NOT NULL,
  id_usuario INT NOT NULL,
  descricao TEXT NOT NULL,
  data_hora DATETIME NOT NULL,
  enviada_ao_tutor BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_internacao) REFERENCES INTERNACAO(id_internacao) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_internacao (id_internacao),
  INDEX idx_data_hora (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 5: Vendas e Movimentação de Estoque
-- ============================================

CREATE TABLE VENDA (
  id_venda INT PRIMARY KEY AUTO_INCREMENT,
  id_tutor INT NOT NULL,
  data_venda DATE NOT NULL,
  canal_venda ENUM('presencial','online','telefone') NOT NULL,
  status ENUM('pendente','concluida','cancelada') NOT NULL DEFAULT 'concluida',
  valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
  FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_tutor (id_tutor),
  INDEX idx_data_venda (data_venda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ITEM_VENDA (
  id_item_venda INT PRIMARY KEY AUTO_INCREMENT,
  id_venda INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  FOREIGN KEY (id_venda) REFERENCES VENDA(id_venda) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_venda (id_venda),
  INDEX idx_produto (id_produto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MOVIMENTACAO_ESTOQUE (
  id_movimentacao INT PRIMARY KEY AUTO_INCREMENT,
  id_produto INT NOT NULL,
  id_usuario INT NOT NULL,
  tipo_movimentacao ENUM('entrada','saida','ajuste','devolucao') NOT NULL,
  quantidade INT NOT NULL,
  data_hora DATETIME NOT NULL,
  observacoes TEXT,
  FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_produto (id_produto),
  INDEX idx_data_hora (data_hora),
  INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 6: Lançamentos Financeiros
-- ============================================

CREATE TABLE LANCAMENTO_FINANCEIRO (
  id_lancamento INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT,
  id_tutor INT,
  id_atendimento INT,
  id_servico INT,
  tipo_lancamento ENUM('receita','despesa','devolucao') NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_lancamento DATE NOT NULL,
  forma_pagamento ENUM('dinheiro','cartao_credito','cartao_debito','pix','boleto','cheque') NOT NULL,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_servico) REFERENCES SERVICO(id_servico) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_data_lancamento (data_lancamento),
  INDEX idx_tipo (tipo_lancamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 7: Comunicação
-- ============================================

CREATE TABLE NOTIFICACAO (
  id_notificacao INT PRIMARY KEY AUTO_INCREMENT,
  id_tutor INT,
  id_usuario INT,
  id_pet INT,
  tipo_notificacao ENUM('consulta','vacina','medicamento','resultado_exame','internacao','geral') NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensagem TEXT NOT NULL,
  canal ENUM('email','sms','app','push') NOT NULL,
  data_envio DATETIME NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_data_envio (data_envio),
  INDEX idx_tutor (id_tutor),
  INDEX idx_lida (lida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE RECADO_INTERNO (
  id_recado INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario_remetente INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensagem TEXT NOT NULL,
  data_criacao DATETIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario_remetente) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE RECADO_DESTINATARIO (
  id_recado_destinatario INT PRIMARY KEY AUTO_INCREMENT,
  id_recado INT NOT NULL,
  id_usuario_destinatario INT NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  data_leitura DATETIME,
  FOREIGN KEY (id_recado) REFERENCES RECADO_INTERNO(id_recado) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario_destinatario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_recado (id_recado),
  INDEX idx_destinatario (id_usuario_destinatario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FK para USUARIO.id_tutor
-- ============================================

ALTER TABLE USUARIO 
ADD CONSTRAINT fk_usuario_tutor 
FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor) ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## Índices

### Índices por Tabela

| Tabela | Índice | Colunas | Tipo | Justificativa |
|--------|--------|---------|------|---------------|
| USUARIO | pk | id_usuario | PRIMARY | Chave primária |
| USUARIO | uk | login | UNIQUE | Busca por login |
| USUARIO | idx_ativo | ativo | NORMAL | Filtros de usuários ativos |
| TUTOR | pk | id_tutor | PRIMARY | Chave primária |
| TUTOR | uk | cpf | UNIQUE | Busca por CPF |
| TUTOR | uk | login | UNIQUE | Busca por login |
| VETERINARIO | pk | id_veterinario | PRIMARY | Chave primária |
| VETERINARIO | uk | crmv | UNIQUE | Busca por CRMV |
| VETERINARIO | uk | email | UNIQUE | Busca por email |
| PET | pk | id_pet | PRIMARY | Chave primária |
| PET | fk | id_tutor | FOREIGN KEY | Join com TUTOR |
| PET | idx | nome | NORMAL | Busca por nome do pet |
| ATENDIMENTO | pk | id_atendimento | PRIMARY | Chave primária |
| ATENDIMENTO | fk | id_pet, id_veterinario | FOREIGN KEY | Joins |
| ATENDIMENTO | idx | data_hora | NORMAL | Ordenação e filtros de data |
| AGENDAMENTO | idx | data | NORMAL | Calendário e filtros de data |
| APLICACAO_VACINA | idx | data_aplicacao | NORMAL | Histórico de vacinação |
| VENDA | idx | data_venda | NORMAL | Relatórios financeiros |
| MOVIMENTACAO_ESTOQUE | idx | data_hora | NORMAL | Histórico de estoque |
| LANCAMENTO_FINANCEIRO | idx | data_lancamento, tipo | NORMAL | Relatórios financeiros |
| NOTIFICACAO | idx | data_envio, lida | NORMAL | Filtros de notificações |

---

## Constraints

### Primary Keys (PKs)
- Todas as tabelas possuem id_* como PK AUTO_INCREMENT

### Unique Keys (UKs)
- `USUARIO.login` - Login único
- `TUTOR.cpf` - CPF único
- `TUTOR.login` - Login único (se cliente web)
- `VETERINARIO.crmv` - CRMV único
- `VETERINARIO.email` - Email único
- `PRONTUARIO.id_pet` - Um prontuário por pet

### Check Constraints
- `SERVICO.valor > 0`
- `PROCEDIMENTO.valor > 0`
- `EXAME.valor > 0`
- `VACINA.intervalo_dias > 0`
- `PRODUTO.valor_unitario >= 0`
- `PET.peso > 0`
- `VENDA.valor_total >= 0`
- `ITEM_VENDA.quantidade > 0`
- `ITEM_VENDA.valor_unitario >= 0`
- `ITEM_VENDA.subtotal >= 0`
- `MOVIMENTACAO_ESTOQUE.quantidade != 0`
- `LANCAMENTO_FINANCEIRO.valor > 0`

### Foreign Keys (FKs)

| De | Para | Ação Delete | Ação Update | Obs |
|-------|-------|-----------|----------|-----|
| USUARIO.id_tutor | TUTOR | SET NULL | CASCADE | Opcional |
| PET.id_tutor | TUTOR | RESTRICT | CASCADE | Obrigatório |
| PRONTUARIO.id_pet | PET | RESTRICT | CASCADE | 1:1 |
| ATENDIMENTO.id_pet | PET | RESTRICT | CASCADE | |
| ATENDIMENTO.id_veterinario | VETERINARIO | RESTRICT | CASCADE | |
| AGENDAMENTO.id_pet | PET | RESTRICT | CASCADE | |
| AGENDAMENTO.id_veterinario | VETERINARIO | RESTRICT | CASCADE | |
| INTERNACAO.id_pet | PET | RESTRICT | CASCADE | |
| INTERNACAO.id_veterinario_responsavel | VETERINARIO | RESTRICT | CASCADE | |
| RECEITA.id_atendimento | ATENDIMENTO | RESTRICT | CASCADE | |
| ITEM_RECEITA.id_receita | RECEITA | CASCADE | CASCADE | Deleteção em cascata |
| APLICACAO_VACINA.id_pet | PET | RESTRICT | CASCADE | |
| APLICACAO_VACINA.id_vacina | VACINA | RESTRICT | CASCADE | |
| APLICACAO_VACINA.id_atendimento | ATENDIMENTO | SET NULL | CASCADE | Opcional |
| LAUDO.id_pet | PET | RESTRICT | CASCADE | |
| LAUDO.id_atendimento | ATENDIMENTO | SET NULL | CASCADE | Opcional |
| LAUDO.id_veterinario | VETERINARIO | RESTRICT | CASCADE | |
| ATENDIMENTO_PROCEDIMENTO.id_atendimento | ATENDIMENTO | CASCADE | CASCADE | |
| ATENDIMENTO_PROCEDIMENTO.id_procedimento | PROCEDIMENTO | RESTRICT | CASCADE | |
| ATENDIMENTO_EXAME.id_atendimento | ATENDIMENTO | CASCADE | CASCADE | |
| ATENDIMENTO_EXAME.id_exame | EXAME | RESTRICT | CASCADE | |
| ATUALIZACAO_INTERNACAO.id_internacao | INTERNACAO | CASCADE | CASCADE | |
| ATUALIZACAO_INTERNACAO.id_usuario | USUARIO | RESTRICT | CASCADE | |
| VENDA.id_tutor | TUTOR | RESTRICT | CASCADE | |
| ITEM_VENDA.id_venda | VENDA | CASCADE | CASCADE | |
| ITEM_VENDA.id_produto | PRODUTO | RESTRICT | CASCADE | |
| MOVIMENTACAO_ESTOQUE.id_produto | PRODUTO | RESTRICT | CASCADE | |
| MOVIMENTACAO_ESTOQUE.id_usuario | USUARIO | RESTRICT | CASCADE | |
| LANCAMENTO_FINANCEIRO.id_pet | PET | SET NULL | CASCADE | Opcional |
| LANCAMENTO_FINANCEIRO.id_tutor | TUTOR | SET NULL | CASCADE | Opcional |
| LANCAMENTO_FINANCEIRO.id_atendimento | ATENDIMENTO | SET NULL | CASCADE | Opcional |
| LANCAMENTO_FINANCEIRO.id_servico | SERVICO | SET NULL | CASCADE | Opcional |
| NOTIFICACAO.id_tutor | TUTOR | SET NULL | CASCADE | Opcional |
| NOTIFICACAO.id_usuario | USUARIO | SET NULL | CASCADE | Opcional |
| NOTIFICACAO.id_pet | PET | SET NULL | CASCADE | Opcional |
| RECADO_INTERNO.id_usuario_remetente | USUARIO | RESTRICT | CASCADE | |
| RECADO_DESTINATARIO.id_recado | RECADO_INTERNO | CASCADE | CASCADE | |
| RECADO_DESTINATARIO.id_usuario_destinatario | USUARIO | CASCADE | CASCADE | |

---

## Notações Importantes

### Tipos de Dados

- **INT**: Identificadores e quantidades
- **VARCHAR(n)**: Strings de comprimento limitado
- **TEXT**: Strings de comprimento ilimitado
- **DECIMAL(10,2)**: Valores monetários (10 dígitos, 2 casas decimais)
- **DATE**: Apenas data (YYYY-MM-DD)
- **TIME**: Apenas hora (HH:MM:SS)
- **DATETIME**: Data e hora (YYYY-MM-DD HH:MM:SS)
- **BOOLEAN**: Verdadeiro/Falso (armazenado como 0/1)
- **ENUM**: Valores predefinidos

### Padrões de Nomenclatura

- **Tabelas**: MAIUSCULA
- **Colunas**: minuscula com underscores
- **PK**: id_* ou id_tabela
- **FK**: id_tabela_referenciada
- **Índices**: idx_* ou uk_*

### Collation

- Todas as tabelas usam `utf8mb4_unicode_ci` para suportar caracteres especiais em português (acentos)

---

## Próximas Ações

1. ✅ **Documentação DDL** (CONCLUÍDA)
2. **Validação do Diagrama** - Revisar com time
3. **Aprovação Final** - Confirmar estrutura antes de implementar
4. **Criação de Migrations** - Gerar alembic migrations
5. **Testes de Integridade** - Validar constraints e relacionamentos

---

**Versão**: 1.0  
**Última Atualização**: 29/04/2026  
**Responsável**: Equipe de Backend
