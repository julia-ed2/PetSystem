-- ============================================
-- PetSystem Seed Data
-- Initial test data for all tables
-- ============================================

-- ============================================
-- TIER 1: Base Entities
-- ============================================

-- ADMIN USERS (password: admin123)
INSERT INTO USUARIO (nome, login, senha_hash, tipo_usuario, ativo, data_criacao) VALUES
('Admin Principal', 'admin@petsystem.com', 'pbkdf2:sha256:1000000$vBRSnNm4s8kuOhIh$835d77141788a2d1aca68ca4b4f3eaa54dc1361256b2cf82ed139e34f793b4f8', 'admin', TRUE, NOW()),
('Gerente Clínica', 'gerente@petsystem.com', 'pbkdf2:sha256:1000000$vBRSnNm4s8kuOhIh$835d77141788a2d1aca68ca4b4f3eaa54dc1361256b2cf82ed139e34f793b4f8', 'gerente', TRUE, NOW()),
('Atendente João', 'joao@petsystem.com', 'pbkdf2:sha256:1000000$vBRSnNm4s8kuOhIh$835d77141788a2d1aca68ca4b4f3eaa54dc1361256b2cf82ed139e34f793b4f8', 'atendente', TRUE, NOW());

-- TUTORS
INSERT INTO TUTOR (nome, cpf, telefone, endereco, ativo, data_criacao) VALUES
('Maria Silva', '12345678901', '11999998888', 'Rua A, 100 - São Paulo', TRUE, NOW()),
('João Santos', '98765432100', '11988887777', 'Avenida B, 200 - São Paulo', TRUE, NOW()),
('Ana Costa', '55544433322', '11977776666', 'Rua C, 300 - São Paulo', TRUE, NOW()),
('Carlos Oliveira', '11122233344', '11966665555', 'Avenida D, 400 - São Paulo', TRUE, NOW());

-- CLIENT USERS (linked to tutors above — password: cliente123)
INSERT INTO USUARIO (nome, login, senha_hash, tipo_usuario, ativo, id_tutor, data_criacao) VALUES
('Maria Silva',    'maria@petsystem.com',   'pbkdf2:sha256:1000000$mH0TqPkku1AyDGMZ$226fa80f70925b62160516c32da01505e528e1f7ed14cd41ddbddebff8093be7', 'cliente', TRUE, (SELECT id_tutor FROM TUTOR WHERE cpf='12345678901'), NOW()),
('João Santos',    'joaos@petsystem.com',   'pbkdf2:sha256:1000000$mH0TqPkku1AyDGMZ$226fa80f70925b62160516c32da01505e528e1f7ed14cd41ddbddebff8093be7', 'cliente', TRUE, (SELECT id_tutor FROM TUTOR WHERE cpf='98765432100'), NOW()),
('Ana Costa',      'ana@petsystem.com',     'pbkdf2:sha256:1000000$mH0TqPkku1AyDGMZ$226fa80f70925b62160516c32da01505e528e1f7ed14cd41ddbddebff8093be7', 'cliente', TRUE, (SELECT id_tutor FROM TUTOR WHERE cpf='55544433322'), NOW()),
('Carlos Oliveira','carlos@petsystem.com',  'pbkdf2:sha256:1000000$mH0TqPkku1AyDGMZ$226fa80f70925b62160516c32da01505e528e1f7ed14cd41ddbddebff8093be7', 'cliente', TRUE, (SELECT id_tutor FROM TUTOR WHERE cpf='11122233344'), NOW());

-- VETERINARIANS
INSERT INTO VETERINARIO (nome, crmv, telefone, email, ativo, data_criacao) VALUES
('Dr. Pedro Mendes', 'CRMV/SP 1234', '11999995555', 'pedro@clinica.com', TRUE, NOW()),
('Dra. Fernanda Lima', 'CRMV/SP 5678', '11999994444', 'fernanda@clinica.com', TRUE, NOW()),
('Dr. Lucas Ferreira', 'CRMV/SP 9012', '11999993333', 'lucas@clinica.com', TRUE, NOW());

-- SERVICES
INSERT INTO SERVICO (nome, descricao, valor, ativo) VALUES
('Consulta Geral', 'Consulta clínica geral com veterinário', 150.00, TRUE),
('Vacinação', 'Aplicação de vacinas e imunizações', 80.00, TRUE),
('Banho e Tosa', 'Serviço de higiene e estética', 100.00, TRUE),
('Cirurgia (Castração)', 'Procedimento cirúrgico de castração', 500.00, TRUE),
('Atendimento de Emergência', 'Atendimento 24h para emergências', 200.00, TRUE);

-- PROCEDURES
INSERT INTO PROCEDIMENTO (nome, descricao, valor, ativo) VALUES
('Castração', 'Remoção de órgãos reprodutivos', 500.00, TRUE),
('Extração Dentária', 'Extração de dentes danificados', 300.00, TRUE),
('Sutura de Ferimentos', 'Fechamento de ferimentos com pontos', 200.00, TRUE),
('Limpeza de Ouvido', 'Limpeza profissional dos ouvidos', 100.00, TRUE);

-- EXAMS
INSERT INTO EXAME (nome, descricao, valor, ativo) VALUES
('Hemograma Completo', 'Análise completa de sangue', 150.00, TRUE),
('Ultrassom', 'Ultrassonografia abdominal', 300.00, TRUE),
('Radiografia', 'Radiografia (1 área)', 250.00, TRUE),
('Análise de Urina', 'Teste de urina completo', 80.00, TRUE),
('Teste FeLV/FIV (Gatos)', 'Teste para vírus felinos', 120.00, TRUE);

-- VACCINES
INSERT INTO VACINA (nome, fabricante, descricao, intervalo_dias, ativa) VALUES
('V4 (Tríplice + Parvovirose)', 'Laboratório X', 'Vacinação em cães', 30, TRUE),
('V5 (Tríplice + Parvovirose + Raiva)', 'Laboratório X', 'Vacinação completa em cães', 30, TRUE),
('Raiva', 'Laboratório Y', 'Vacina antirrábica', 365, TRUE),
('Tríplice Felina', 'Laboratório Z', 'Vacinação em gatos', 30, TRUE),
('Leucemia Felina', 'Laboratório Z', 'Vacinação contra leucemia em gatos', 30, TRUE);

-- PRODUCTS (Inventory)
INSERT INTO PRODUTO (nome, marca, categoria, descricao, quantidade_estoque, estoque_minimo, valor_unitario, ativo) VALUES
('Ração Premium Cão 15kg', 'MarcaA', 'Ração', 'Ração para cães adultos', 50, 10, 80.00, TRUE),
('Ração Premium Gato 5kg', 'MarcaA', 'Ração', 'Ração para gatos adultos', 30, 5, 60.00, TRUE),
('Coleira Antipulga Cão', 'MarcaB', 'Acessório', 'Coleira antiparasitária', 20, 5, 45.00, TRUE),
('Vermífugo Cão 10kg', 'MarcaC', 'Medicamento', 'Medicamento antiparasitário', 15, 5, 35.00, TRUE),
('Shampoo Hipoalergênico', 'MarcaD', 'Higiene', 'Shampoo para peles sensíveis', 25, 5, 50.00, TRUE),
('Brinquedo Kong', 'MarcaE', 'Acessório', 'Brinquedo interativo', 40, 10, 55.00, TRUE);

-- ============================================
-- TIER 2: Pet-related Data
-- ============================================

-- PETS
INSERT INTO PET (id_tutor, nome, especie, raca, idade, sexo, peso, observacoes, ativo, data_criacao) VALUES
(1, 'Rex', 'cao', 'Labrador', 3, 'macho', 35.50, 'Cão saudável, muito ativo', TRUE, NOW()),
(1, 'Luna', 'gato', 'Siamês', 2, 'femea', 3.20, 'Gato dócil e carinhoso', TRUE, NOW()),
(2, 'Max', 'cao', 'Poodle', 5, 'macho', 8.50, 'Pequeno, diagnóstico de diabetes', TRUE, NOW()),
(2, 'Bella', 'gato', 'Persa', 4, 'femea', 4.00, 'Alergias sazonais', TRUE, NOW()),
(3, 'Charlie', 'cao', 'Golden Retriever', 1, 'macho', 28.00, 'Filhote, primeira vacina', TRUE, NOW()),
(4, 'Mimi', 'gato', 'Angorá', 3, 'femea', 3.80, 'Frequente visitante da clínica', TRUE, NOW());

-- MEDICAL RECORDS (Prontuários)
INSERT INTO PRONTUARIO (id_pet, data_abertura, observacoes_gerais) VALUES
(1, '2023-01-15', 'Prontuário de Rex - cão saudável'),
(2, '2023-02-20', 'Prontuário de Luna - gato ativo'),
(3, '2022-06-10', 'Prontuário de Max - acompanhamento diabetes'),
(4, '2023-03-05', 'Prontuário de Bella - acompanhamento alergias'),
(5, '2025-01-01', 'Prontuário de Charlie - filhote novo'),
(6, '2024-05-12', 'Prontuário de Mimi - frequentista');

-- ============================================
-- TIER 3: Appointments & Scheduling
-- ============================================

-- APPOINTMENTS (Atendimentos)
INSERT INTO ATENDIMENTO (id_pet, id_veterinario, data_hora, tipo_atendimento, status, queixa_principal, diagnostico, observacoes) VALUES
(1, 1, '2025-04-20 10:00:00', 'consulta', 'concluido', 'Checkup rotineiro', 'Animal saudável', 'Sem intercorrências'),
(2, 2, '2025-04-21 14:30:00', 'consulta', 'concluido', 'Limpeza dentária', 'Tártaro leve', 'Recomendada limpeza profissional'),
(3, 1, '2025-04-22 09:00:00', 'retorno', 'concluido', 'Controle diabetes', 'Diabetes controlada', 'Continuar insulina'),
(5, 2, '2025-04-23 15:00:00', 'preventivo', 'concluido', 'Primeira consulta', 'Filhote saudável', 'Agendar primeira vacinação'),
(6, 3, '2025-04-24 11:30:00', 'emergencia', 'concluido', 'Vômitos frequentes', 'Intoxicação alimentar', 'Medicação prescrita');

-- SCHEDULING (Agendamentos)
INSERT INTO AGENDAMENTO (id_pet, id_veterinario, data, hora, tipo_agendamento, status, observacoes) VALUES
(1, 1, '2025-05-10', '10:00:00', 'consulta', 'agendado', 'Próximo checkup'),
(2, 2, '2025-05-15', '14:30:00', 'preventivo', 'agendado', 'Vacinação reforço'),
(3, 1, '2025-05-20', '09:00:00', 'retorno', 'agendado', 'Controle diabetes'),
(4, 3, '2025-05-22', '16:00:00', 'consulta', 'confirmado', 'Avaliação alergias'),
(5, 2, '2025-05-25', '10:30:00', 'preventivo', 'agendado', 'Segunda vacina');

-- ============================================
-- TIER 4: Medical Records
-- ============================================

-- PRESCRIPTIONS
INSERT INTO RECEITA (id_atendimento, data_emissao, orientacoes) VALUES
(3, '2025-04-22', 'Aplicar medicação conforme descrito. Retornar para avaliação em 30 dias.'),
(6, '2025-04-24', 'Medicação por 7 dias. Dieta leve por 48h. Se piorar, retornar imediatamente.');

-- PRESCRIPTION ITEMS
INSERT INTO ITEM_RECEITA (id_receita, medicamento, dosagem, frequencia, duracao, observacoes) VALUES
(1, 'Insulina NPH', '10 UI', '2 vezes ao dia', '30 dias', 'Aplicar via subcutânea'),
(2, 'Metoclopramida', '10mg', '3 vezes ao dia', '7 dias', 'Via oral'),
(2, 'Complexo B', '1 ampola', '1 vez ao dia', '5 dias', 'Injeção intramuscular');

-- VACCINES APPLIED
INSERT INTO APLICACAO_VACINA (id_pet, id_vacina, id_atendimento, data_aplicacao, data_proxima_dose, lote, observacoes) VALUES
(1, 2, 1, '2025-04-20', '2025-05-20', 'LT123456', 'Vacinação realizada sem reações'),
(2, 4, 2, '2025-04-21', '2025-05-21', 'LT654321', 'Reação local leve'),
(5, 1, 4, '2025-04-23', '2025-05-23', 'LT789012', 'Primeira dose - filhote');

-- MEDICAL REPORTS
INSERT INTO LAUDO (id_pet, id_atendimento, id_veterinario, titulo, descricao, data_emissao) VALUES
(1, 1, 1, 'Laudo de Consultoria - Rex', 'Cão em excelente estado de saúde. Sem alterações ao exame físico.', '2025-04-20'),
(3, 3, 1, 'Laudo de Monitoramento - Max', 'Diabetes mellitus em controle adequado com terapia insulínica. Glicemia dentro dos valores esperados.', '2025-04-22');

-- PROCEDURES PERFORMED
INSERT INTO ATENDIMENTO_PROCEDIMENTO (id_atendimento, id_procedimento, observacoes, valor_cobrado) VALUES
(1, 2, 'Limpeza geral dos dentes realizada', 150.00),
(6, 1, 'Tratamento local com antisséptico', 75.00);

-- EXAMS REQUESTED
INSERT INTO ATENDIMENTO_EXAME (id_atendimento, id_exame, resultado, data_realizacao, observacoes) VALUES
(3, 1, 'Hemácias 5.2M, Hemoglobina 13.5g/dL, Glóbulos Brancos 7.5K', '2025-04-22', 'Exame dentro dos valores normais'),
(6, 1, 'Hemácias 4.8M, Hemoglobina 12.8g/dL', '2025-04-24', 'Leve desidratação');

-- ============================================
-- TIER 5: Internations
-- ============================================

INSERT INTO INTERNACAO (id_pet, id_veterinario_responsavel, data_entrada, data_saida, status, motivo, observacoes) VALUES
(3, 1, '2025-04-10 18:30:00', '2025-04-12 14:00:00', 'concluida', 'Cirurgia de castração', 'Recuperação sem complicações');

INSERT INTO ATUALIZACAO_INTERNACAO (id_internacao, id_usuario, descricao, data_hora, enviada_ao_tutor) VALUES
(1, 1, 'Pet internado. Pré-cirurgia iniciada.', '2025-04-10 18:30:00', TRUE),
(1, 3, 'Cirurgia realizada com sucesso. Pet em recuperação.', '2025-04-11 10:00:00', TRUE),
(1, 3, 'Recuperação normal. Pet alimentando-se normalmente.', '2025-04-11 16:00:00', TRUE),
(1, 1, 'Alta autorizada. Retornar para avaliação em 7 dias.', '2025-04-12 14:00:00', TRUE);

-- ============================================
-- TIER 6: Sales & Inventory
-- ============================================

-- SALES
INSERT INTO VENDA (id_tutor, data_venda, canal_venda, status, valor_total) VALUES
(1, '2025-04-20', 'presencial', 'concluida', 240.00),
(2, '2025-04-21', 'presencial', 'concluida', 160.00),
(3, '2025-04-22', 'online', 'concluida', 320.00),
(4, '2025-04-23', 'presencial', 'concluida', 180.00);

-- SALE ITEMS
INSERT INTO ITEM_VENDA (id_venda, id_produto, quantidade, valor_unitario, subtotal) VALUES
(1, 1, 2, 80.00, 160.00),
(1, 5, 1, 50.00, 50.00),
(1, 6, 1, 55.00, 55.00),
(2, 2, 1, 60.00, 60.00),
(2, 3, 2, 45.00, 90.00),
(3, 1, 4, 80.00, 320.00),
(4, 4, 1, 35.00, 35.00),
(4, 5, 3, 50.00, 150.00);

-- INVENTORY MOVEMENTS
INSERT INTO MOVIMENTACAO_ESTOQUE (id_produto, id_usuario, tipo_movimentacao, quantidade, data_hora, observacoes) VALUES
(1, 1, 'entrada', 100, '2025-04-01 08:00:00', 'Recebimento de fornecedor'),
(2, 1, 'entrada', 50, '2025-04-02 09:00:00', 'Recebimento de fornecedor'),
(3, 3, 'saida', 2, '2025-04-20 14:30:00', 'Venda presencial'),
(1, 3, 'saida', 2, '2025-04-20 15:00:00', 'Venda presencial'),
(4, 1, 'entrada', 30, '2025-04-10 10:00:00', 'Recebimento de fornecedor'),
(4, 3, 'saida', 1, '2025-04-23 16:00:00', 'Venda presencial');

-- ============================================
-- TIER 7: Financial
-- ============================================

INSERT INTO LANCAMENTO_FINANCEIRO (id_pet, id_tutor, id_atendimento, id_servico, tipo_lancamento, categoria, descricao, valor, data_lancamento, forma_pagamento, status) VALUES
(1, 1, 1, 1, 'receita', 'consulta', 'Consulta geral com Dr. Pedro', 150.00, '2025-04-20', 'cartao_credito', 'Pago'),
(2, 1, 2, 1, 'receita', 'consulta', 'Consulta geral com Dra. Fernanda', 150.00, '2025-04-21', 'pix', 'Pago'),
(3, 2, 3, 1, 'receita', 'retorno', 'Retorno - Controle diabetes', 150.00, '2025-04-22', 'dinheiro', 'Pago'),
(5, 3, 4, 1, 'receita', 'consulta', 'Primeira consulta - Charlie', 150.00, '2025-04-23', 'cartao_debito', 'Pago'),
(6, 4, 5, 5, 'receita', 'emergencia', 'Atendimento emergência - Mimi', 200.00, '2025-04-24', 'pix', 'Pago'),
(NULL, 1, NULL, 2, 'receita', 'vacinacao', 'Venda de ração premium', 160.00, '2025-04-20', 'dinheiro', 'Pago');

-- ============================================
-- TIER 8: Communications
-- ============================================

INSERT INTO NOTIFICACAO (id_tutor, id_usuario, id_pet, tipo_notificacao, titulo, mensagem, canal, data_envio, lida) VALUES
(1, NULL, 1, 'consulta', 'Consulta Realizada', 'A consulta de Rex foi realizada com sucesso. Próxima: 10/05', 'email', '2025-04-20 10:30:00', TRUE),
(2, NULL, 3, 'medicamento', 'Receita Prescrita', 'Medicações prescritas para Max. Retirar na recepção.', 'sms', '2025-04-22 09:15:00', TRUE),
(3, NULL, 5, 'vacina', 'Vacinação Agendada', 'Próxima vacina de Charlie marcada para 25/05 às 10h30', 'email', '2025-04-23 15:45:00', FALSE),
(NULL, 1, NULL, 'geral', 'Backup Concluído', 'Sistema de backup foi executado com sucesso.', 'app', '2025-04-24 00:00:00', TRUE),
(4, NULL, 6, 'resultado_exame', 'Resultado do Exame', 'Resultado do hemograma disponível. Tudo normal!', 'email', '2025-04-25 09:00:00', FALSE);

INSERT INTO RECADO_INTERNO (id_usuario_remetente, titulo, mensagem, data_criacao, ativo) VALUES
(1, 'Importante: Reunião de Equipe', 'Reunião amanhã às 14h. Confirmar presença.', NOW(), TRUE),
(2, 'Lembrete: Reposição de Vacinas', 'Verificar estoque de vacinas. Fazer pedido se necessário.', NOW(), TRUE);

INSERT INTO RECADO_DESTINATARIO (id_recado, id_usuario_destinatario, lido, data_leitura) VALUES
(1, 2, TRUE, '2025-04-24 14:00:00'),
(1, 3, FALSE, NULL),
(2, 3, TRUE, '2025-04-24 09:30:00');
