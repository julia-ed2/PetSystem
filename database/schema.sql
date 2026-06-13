CREATE TABLE IF NOT EXISTS TUTOR (
    id_tutor INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    login VARCHAR(50) UNIQUE,
    senha_hash VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS USUARIO (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_tutor INT NULL,
    nome VARCHAR(150) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin','veterinario','atendente','gerente','cliente') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_usuario_tutor
        FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS VETERINARIO (
    id_veterinario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    crmv VARCHAR(20) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SERVICO (
    id_servico INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PROCEDIMENTO (
    id_procedimento INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS EXAME (
    id_exame INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS VACINA (
    id_vacina INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    descricao TEXT,
    intervalo_dias INT NOT NULL CHECK (intervalo_dias > 0),
    ativa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PET (
    id_pet INT PRIMARY KEY AUTO_INCREMENT,
    id_tutor INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(50),
    idade INT,
    sexo VARCHAR(20),
    peso DECIMAL(6,2) CHECK (peso > 0),
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_pet_tutor
        FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pet_tutor (id_tutor),
    INDEX idx_pet_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PRONTUARIO (
    id_prontuario INT PRIMARY KEY AUTO_INCREMENT,
    id_pet INT NOT NULL UNIQUE,
    data_abertura DATE,
    observacoes_gerais TEXT,
    CONSTRAINT fk_prontuario_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ATENDIMENTO (
    id_atendimento INT PRIMARY KEY AUTO_INCREMENT,
    id_pet INT NOT NULL,
    id_veterinario INT NOT NULL,
    data_hora DATETIME NOT NULL,
    tipo_atendimento VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    queixa_principal TEXT NOT NULL,
    diagnostico TEXT,
    observacoes TEXT,
    CONSTRAINT fk_atendimento_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_atendimento_vet
        FOREIGN KEY (id_veterinario) REFERENCES VETERINARIO(id_veterinario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_atendimento_pet (id_pet),
    INDEX idx_atendimento_vet (id_veterinario),
    INDEX idx_atendimento_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RECEITA (
    id_receita INT PRIMARY KEY AUTO_INCREMENT,
    id_atendimento INT NOT NULL,
    data_emissao DATE NOT NULL,
    orientacoes TEXT,
    CONSTRAINT fk_receita_atendimento
        FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_receita_atendimento (id_atendimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ITEM_RECEITA (
    id_item_receita INT PRIMARY KEY AUTO_INCREMENT,
    id_receita INT NOT NULL,
    medicamento VARCHAR(100) NOT NULL,
    dosagem VARCHAR(50) NOT NULL,
    frequencia VARCHAR(50) NOT NULL,
    duracao VARCHAR(50) NOT NULL,
    observacoes TEXT,
    CONSTRAINT fk_item_receita_receita
        FOREIGN KEY (id_receita) REFERENCES RECEITA(id_receita)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_item_receita_receita (id_receita)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ATENDIMENTO_EXAME (
    id_atendimento_exame INT PRIMARY KEY AUTO_INCREMENT,
    id_atendimento INT NOT NULL,
    id_exame INT NOT NULL,
    resultado TEXT,
    data_realizacao DATE,
    observacoes TEXT,
    CONSTRAINT fk_ate_exame_atend
        FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ate_exame_exame
        FOREIGN KEY (id_exame) REFERENCES EXAME(id_exame)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_ate_exame_atendimento (id_atendimento),
    INDEX idx_ate_exame_exame (id_exame)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ATENDIMENTO_PROCEDIMENTO (
    id_atendimento_procedimento INT PRIMARY KEY AUTO_INCREMENT,
    id_atendimento INT NOT NULL,
    id_procedimento INT NOT NULL,
    observacoes TEXT,
    valor_cobrado DECIMAL(10,2),
    CONSTRAINT fk_ate_proc_atend
        FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ate_proc_proc
        FOREIGN KEY (id_procedimento) REFERENCES PROCEDIMENTO(id_procedimento)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_ate_proc_atendimento (id_atendimento),
    INDEX idx_ate_proc_procedimento (id_procedimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS APLICACAO_VACINA (
    id_aplicacao_vacina INT PRIMARY KEY AUTO_INCREMENT,
    id_pet INT NOT NULL,
    id_vacina INT NOT NULL,
    id_atendimento INT NULL,
    data_aplicacao DATE NOT NULL,
    data_proxima_dose DATE,
    lote VARCHAR(50),
    observacoes TEXT,
    CONSTRAINT fk_aplicacao_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_aplicacao_vacina
        FOREIGN KEY (id_vacina) REFERENCES VACINA(id_vacina)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_aplicacao_atendimento
        FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_aplicacao_pet (id_pet),
    INDEX idx_aplicacao_vacina (id_vacina),
    INDEX idx_aplicacao_data (data_aplicacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LAUDO (
    id_laudo INT PRIMARY KEY AUTO_INCREMENT,
    id_pet INT NOT NULL,
    id_atendimento INT NULL,
    id_veterinario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    data_emissao DATE NOT NULL,
    CONSTRAINT fk_laudo_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_laudo_atendimento
        FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_laudo_vet
        FOREIGN KEY (id_veterinario) REFERENCES VETERINARIO(id_veterinario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_laudo_pet (id_pet),
    INDEX idx_laudo_data (data_emissao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LANCAMENTO_FINANCEIRO (
    id_lancamento INT PRIMARY KEY AUTO_INCREMENT,
    id_pet INT NULL,
    id_tutor INT NULL,
    id_atendimento INT NULL,
    id_servico INT NULL,
    tipo_lancamento VARCHAR(50) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    data_lancamento DATE NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pago',
    CONSTRAINT fk_lancamento_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_lancamento_tutor
        FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_lancamento_atendimento
        FOREIGN KEY (id_atendimento) REFERENCES ATENDIMENTO(id_atendimento)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_lancamento_servico
        FOREIGN KEY (id_servico) REFERENCES SERVICO(id_servico)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_lancamento_data (data_lancamento),
    INDEX idx_lancamento_tipo (tipo_lancamento),
    INDEX idx_lancamento_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS AGENDAMENTO (
    id_agendamento INT PRIMARY KEY AUTO_INCREMENT,
    id_pet INT NOT NULL,
    id_veterinario INT NOT NULL,
    tipo_agendamento VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    observacoes TEXT,
    CONSTRAINT fk_agendamento_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_agendamento_vet
        FOREIGN KEY (id_veterinario) REFERENCES VETERINARIO(id_veterinario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_agendamento_pet (id_pet),
    INDEX idx_agendamento_vet (id_veterinario),
    INDEX idx_agendamento_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS INTERNACAO (
    id_internacao INT PRIMARY KEY AUTO_INCREMENT,
    id_pet INT NOT NULL,
    id_veterinario_responsavel INT NOT NULL,
    data_entrada DATETIME NOT NULL,
    data_saida DATETIME,
    status VARCHAR(50) NOT NULL,
    motivo TEXT NOT NULL,
    observacoes TEXT,
    CONSTRAINT fk_internacao_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_internacao_vet
        FOREIGN KEY (id_veterinario_responsavel) REFERENCES VETERINARIO(id_veterinario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_internacao_pet (id_pet),
    INDEX idx_internacao_data (data_entrada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ATUALIZACAO_INTERNACAO (
    id_atualizacao_internacao INT PRIMARY KEY AUTO_INCREMENT,
    id_internacao INT NOT NULL,
    id_usuario INT NOT NULL,
    descricao TEXT NOT NULL,
    data_hora DATETIME NOT NULL,
    enviada_ao_tutor BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_atualizacao_internacao
        FOREIGN KEY (id_internacao) REFERENCES INTERNACAO(id_internacao)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_atualizacao_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_atualizacao_internacao (id_internacao),
    INDEX idx_atualizacao_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS NOTIFICACAO (
    id_notificacao INT PRIMARY KEY AUTO_INCREMENT,
    id_tutor INT NULL,
    id_usuario INT NULL,
    id_pet INT NULL,
    tipo_notificacao VARCHAR(50) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    canal VARCHAR(50) NOT NULL,
    data_envio DATETIME NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_notificacao_tutor
        FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_notificacao_pet
        FOREIGN KEY (id_pet) REFERENCES PET(id_pet)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_notificacao_data (data_envio),
    INDEX idx_notificacao_lida (lida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RECADO_INTERNO (
    id_recado INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_remetente INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data_criacao DATETIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_recado_remetente
        FOREIGN KEY (id_usuario_remetente) REFERENCES USUARIO(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_recado_data (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RECADO_DESTINATARIO (
    id_recado_destinatario INT PRIMARY KEY AUTO_INCREMENT,
    id_recado INT NOT NULL,
    id_usuario_destinatario INT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,
    data_leitura DATETIME,
    CONSTRAINT fk_recado_destinatario_recado
        FOREIGN KEY (id_recado) REFERENCES RECADO_INTERNO(id_recado)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recado_destinatario_usuario
        FOREIGN KEY (id_usuario_destinatario) REFERENCES USUARIO(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_recado_destinatario_recado (id_recado),
    INDEX idx_recado_destinatario_usuario (id_usuario_destinatario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PRODUTO (
    id_produto INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    categoria VARCHAR(50) NOT NULL DEFAULT 'Outro',
    descricao TEXT,
    quantidade_estoque INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_produto_ativo (ativo),
    INDEX idx_produto_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MOVIMENTACAO_ESTOQUE (
    id_movimentacao INT PRIMARY KEY AUTO_INCREMENT,
    id_produto INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo_movimentacao VARCHAR(50) NOT NULL,
    quantidade INT NOT NULL,
    data_hora DATETIME NOT NULL,
    observacoes TEXT,
    CONSTRAINT fk_mov_prod
        FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_mov_user
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_mov_produto (id_produto),
    INDEX idx_mov_usuario (id_usuario),
    INDEX idx_mov_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS VENDA (
    id_venda INT PRIMARY KEY AUTO_INCREMENT,
    id_tutor INT NOT NULL,
    data_venda DATE NOT NULL,
    canal_venda VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
    CONSTRAINT fk_venda_tutor
        FOREIGN KEY (id_tutor) REFERENCES TUTOR(id_tutor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_venda_tutor (id_tutor),
    INDEX idx_venda_data (data_venda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ITEM_VENDA (
    id_item_venda INT PRIMARY KEY AUTO_INCREMENT,
    id_venda INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT fk_item_venda_mae
        FOREIGN KEY (id_venda) REFERENCES VENDA(id_venda)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_item_venda_prod
        FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_item_venda_venda (id_venda),
    INDEX idx_item_venda_produto (id_produto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SHOW TABLES;