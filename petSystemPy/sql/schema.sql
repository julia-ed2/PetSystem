-- ============================================
-- PetSystem Database Schema
-- MySQL 8.0
-- ============================================

-- ============================================
-- TIER 1: Base Entities (no external FKs)
-- ============================================

CREATE TABLE IF NOT EXISTS USUARIO (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  login VARCHAR(50) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('admin','veterinario','atendente','gerente') NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  id_tutor INT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TUTOR (
  id_tutor INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  telefone VARCHAR(11),
  endereco VARCHAR(255),
  login VARCHAR(50) UNIQUE,
  senha_hash VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS VETERINARIO (
  id_veterinario INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  crmv VARCHAR(20) NOT NULL UNIQUE,
  telefone VARCHAR(11),
  email VARCHAR(100) UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SERVICO (
  id_servico INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  ativo BOOLEAN DEFAULT TRUE,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PROCEDIMENTO (
  id_procedimento INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  ativo BOOLEAN DEFAULT TRUE,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS EXAME (
  id_exame INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  ativo BOOLEAN DEFAULT TRUE,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS VACINA (
  id_vacina INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  fabricante VARCHAR(100) NOT NULL,
  descricao TEXT,
  intervalo_dias INT NOT NULL CHECK (intervalo_dias > 0),
  ativa BOOLEAN DEFAULT TRUE,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PRODUTO (
  id_produto INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  marca VARCHAR(100),
  descricao TEXT,
  quantidade_estoque INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  ativo BOOLEAN DEFAULT TRUE,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 2: Pet-related Entities
-- ============================================

CREATE TABLE IF NOT EXISTS PET (
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
  INDEX idx_nome (nome),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PRONTUARIO (
  id_prontuario INT PRIMARY KEY AUTO_INCREMENT,
  id_pet INT NOT NULL UNIQUE,
  data_abertura DATE NOT NULL,
  observacoes_gerais TEXT,
  FOREIGN KEY (id_pet) REFERENCES PET(id_pet) ON DELETE RESTRICT ON UPDATE CASCADE,
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 3: Appointment Entities
-- ============================================

CREATE TABLE IF NOT EXISTS ATENDIMENTO (
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
  INDEX idx_data_hora (data_hora),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS AGENDAMENTO (
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
  INDEX idx_data (data),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS INTERNACAO (
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
  INDEX idx_data_entrada (data_entrada),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 4: Prescriptions & Vaccines
-- ============================================

CREATE TABLE IF NOT EXISTS RECEITA (
  id_receita INT PRIMARY KEY AUTO_INCREMENT,
  id_atendimento INT NOT NULL,
  data_emissao DATE NOT NULL,
  orientacoes TEXT,
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_atendimento (id_atendimento),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ITEM_RECEITA (
  id_item_receita INT PRIMARY KEY AUTO_INCREMENT,
  id_receita INT NOT NULL,
  medicamento VARCHAR(100) NOT NULL,
  dosagem VARCHAR(50) NOT NULL,
  frequencia VARCHAR(50) NOT NULL,
  duracao VARCHAR(50) NOT NULL,
  observacoes TEXT,
  FOREIGN KEY (id_receita) REFERENCES RECEITA(id_receita) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_receita (id_receita),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS APLICACAO_VACINA (
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
  INDEX idx_data_aplicacao (data_aplicacao),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LAUDO (
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
  INDEX idx_data_emissao (data_emissao),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ATENDIMENTO_PROCEDIMENTO (
  id_atendimento_procedimento INT PRIMARY KEY AUTO_INCREMENT,
  id_atendimento INT NOT NULL,
  id_procedimento INT NOT NULL,
  observacoes TEXT,
  valor_cobrado DECIMAL(10,2),
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_procedimento) REFERENCES PROCEDIMENTO(id_procedimento) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_atendimento (id_atendimento),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ATENDIMENTO_EXAME (
  id_atendimento_exame INT PRIMARY KEY AUTO_INCREMENT,
  id_atendimento INT NOT NULL,
  id_exame INT NOT NULL,
  resultado TEXT,
  data_realizacao DATE,
  observacoes TEXT,
  FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_exame) REFERENCES EXAME(id_exame) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_atendimento (id_atendimento),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 5: Internation Updates
-- ============================================

CREATE TABLE IF NOT EXISTS ATUALIZACAO_INTERNACAO (
  id_atualizacao_internacao INT PRIMARY KEY AUTO_INCREMENT,
  id_internacao INT NOT NULL,
  id_usuario INT NOT NULL,
  descricao TEXT NOT NULL,
  data_hora DATETIME NOT NULL,
  enviada_ao_tutor BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_internacao) REFERENCES INTERNACAO(id_internacao) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_internacao (id_internacao),
  INDEX idx_data_hora (data_hora),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 6: Sales & Inventory
-- ============================================

CREATE TABLE IF NOT EXISTS VENDA (
  id_venda INT PRIMARY KEY AUTO_INCREMENT,
  id_tutor INT NOT NULL,
  data_venda DATE NOT NULL,
  canal_venda ENUM('presencial','online','telefone') NOT NULL,
  status ENUM('pendente','concluida','cancelada') NOT NULL DEFAULT 'concluida',
  valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
  FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_tutor (id_tutor),
  INDEX idx_data_venda (data_venda),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ITEM_VENDA (
  id_item_venda INT PRIMARY KEY AUTO_INCREMENT,
  id_venda INT NOT NULL,
  id_produto INT NOT NULL,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  FOREIGN KEY (id_venda) REFERENCES VENDA(id_venda) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_venda (id_venda),
  INDEX idx_produto (id_produto),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MOVIMENTACAO_ESTOQUE (
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
  INDEX idx_usuario (id_usuario),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 7: Financial
-- ============================================

CREATE TABLE IF NOT EXISTS LANCAMENTO_FINANCEIRO (
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
  INDEX idx_tipo (tipo_lancamento),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TIER 8: Communication
-- ============================================

CREATE TABLE IF NOT EXISTS NOTIFICACAO (
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
  INDEX idx_lida (lida),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RECADO_INTERNO (
  id_recado INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario_remetente INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensagem TEXT NOT NULL,
  data_criacao DATETIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario_remetente) REFERENCES USUARIO(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_data_criacao (data_criacao),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RECADO_DESTINATARIO (
  id_recado_destinatario INT PRIMARY KEY AUTO_INCREMENT,
  id_recado INT NOT NULL,
  id_usuario_destinatario INT NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  data_leitura DATETIME,
  FOREIGN KEY (id_recado) REFERENCES RECADO_INTERNO(id_recado) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario_destinatario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_recado (id_recado),
  INDEX idx_destinatario (id_usuario_destinatario),
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Final FKs Constraints (circular references)
-- ============================================

ALTER TABLE USUARIO 
ADD CONSTRAINT fk_usuario_tutor 
FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor) ON DELETE SET NULL ON UPDATE CASCADE;
