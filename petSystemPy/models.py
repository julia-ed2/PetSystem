from datetime import datetime, time, date

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import synonym


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'USUARIO'

    id_usuario = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    login = db.Column(db.String(50), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    tipo_usuario = db.Column(
        db.Enum('admin', 'veterinario', 'atendente', 'gerente', 'cliente'),
        default='atendente',
        nullable=False,
    )
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    id_tutor = db.Column(db.Integer, db.ForeignKey('TUTOR.id_tutor'))

    id = synonym('id_usuario')
    email = synonym('login')
    senha = synonym('senha_hash')
    nivel_acesso = synonym('tipo_usuario')

    tutor = db.relationship('Tutor', foreign_keys=[id_tutor], backref='usuarios')

    @property
    def status(self):
        return 'ativo' if self.ativo else 'inativo'

    @status.setter
    def status(self, value):
        self.ativo = value == 'ativo'

    def __repr__(self):
        return f'<User {self.login}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'nivel_acesso': self.nivel_acesso,
        }


class Tutor(db.Model):
    __tablename__ = 'TUTOR'

    id_tutor = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    cpf = db.Column(db.String(11), unique=True, nullable=False, index=True)
    telefone = db.Column(db.String(20))
    endereco = db.Column(db.Text)
    login = db.Column(db.String(50), unique=True)
    senha_hash = db.Column(db.String(255))
    ativo = db.Column(db.Boolean, default=True, nullable=False)

    id = synonym('id_tutor')

    pets = db.relationship('Pet', backref='tutor', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Tutor {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cpf': self.cpf,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'login': self.login,
            'ativo': self.ativo,
        }


class Veterinario(db.Model):
    __tablename__ = 'VETERINARIO'

    id_veterinario = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    crmv = db.Column(db.String(20), unique=True, nullable=False)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(100), unique=True)
    ativo = db.Column(db.Boolean, default=True, nullable=False)

    id = synonym('id_veterinario')

    def __repr__(self):
        return f'<Veterinario {self.nome}>'


class Vacina(db.Model):
    __tablename__ = 'VACINA'

    id_vacina = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    fabricante = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    intervalo_dias = db.Column(db.Integer, nullable=False)
    ativa = db.Column(db.Boolean, default=True, nullable=False)

    id = synonym('id_vacina')

    def __repr__(self):
        return f'<Vacina {self.nome}>'


class Pet(db.Model):
    __tablename__ = 'PET'

    id_pet = db.Column(db.Integer, primary_key=True)
    id_tutor = db.Column(db.Integer, db.ForeignKey('TUTOR.id_tutor'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    especie = db.Column(db.String(50), nullable=False)
    raca = db.Column(db.String(50))
    idade = db.Column(db.Integer)
    sexo = db.Column(db.String(20))
    peso = db.Column(db.Numeric(6, 2))
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True, nullable=False)

    id = synonym('id_pet')

    agendamentos = db.relationship('Appointment', backref='pet', lazy=True)
    prontuarios = db.relationship('MedicalRecord', backref='pet', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Pet {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'especie': self.especie,
            'raca': self.raca,
            'idade': self.idade,
            'sexo': self.sexo,
            'peso': float(self.peso) if self.peso is not None else None,
            'tutor_id': self.id_tutor,
        }


class Appointment(db.Model):
    __tablename__ = 'AGENDAMENTO'

    id_agendamento = db.Column(db.Integer, primary_key=True)
    id_pet = db.Column(db.Integer, db.ForeignKey('PET.id_pet'), nullable=False)
    id_veterinario = db.Column(db.Integer, db.ForeignKey('VETERINARIO.id_veterinario'), nullable=False)
    tipo_agendamento = db.Column(db.String(100), nullable=False)
    data = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    observacoes = db.Column(db.Text)

    id = synonym('id_agendamento')
    pet_id = synonym('id_pet')

    veterinario_obj = db.relationship('Veterinario')

    @property
    def tutor_id(self):
        return self.pet.id_tutor if self.pet else None

    @property
    def veterinario(self):
        return self.veterinario_obj.nome if self.veterinario_obj else None

    @property
    def tipo(self):
        return self.tipo_agendamento

    @tipo.setter
    def tipo(self, value):
        self.tipo_agendamento = value

    @property
    def data_agendamento(self):
        if self.data and self.hora:
            return datetime.combine(self.data, self.hora)
        return None

    @data_agendamento.setter
    def data_agendamento(self, value):
        if isinstance(value, datetime):
            self.data = value.date()
            self.hora = value.time().replace(microsecond=0)
        elif isinstance(value, date):
            self.data = value

    @property
    def hora_agendamento(self):
        return self.hora

    @property
    def observacao(self):
        return self.observacoes

    @observacao.setter
    def observacao(self, value):
        self.observacoes = value

    def __repr__(self):
        return f'<Appointment {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'pet_id': self.pet_id,
            'pet_nome': self.pet.nome if self.pet else None,
            'tutor_id': self.tutor_id,
            'tutor_nome': self.pet.tutor.nome if self.pet and self.pet.tutor else None,
            'veterinario': self.veterinario,
            'tipo': self.tipo,
            'data_agendamento': self.data_agendamento.isoformat() if self.data_agendamento else None,
            'hora_agendamento': self.hora_agendamento.isoformat() if self.hora_agendamento else None,
            'observacao': self.observacao,
            'status': self.status,
        }


class MedicalRecord(db.Model):
    __tablename__ = 'PRONTUARIO'

    id_prontuario = db.Column(db.Integer, primary_key=True)
    id_pet = db.Column(db.Integer, db.ForeignKey('PET.id_pet'), nullable=False, unique=True)
    data_abertura = db.Column(db.Date)
    observacoes_gerais = db.Column(db.Text)

    id = synonym('id_prontuario')
    pet_id = synonym('id_pet')

    @property
    def data_consulta(self):
        return self.data_abertura

    @data_consulta.setter
    def data_consulta(self, value):
        self.data_abertura = value

    @property
    def veterinario(self):
        return None

    @property
    def diagnostico(self):
        return self.observacoes_gerais

    @diagnostico.setter
    def diagnostico(self, value):
        self.observacoes_gerais = value

    @property
    def procedimento(self):
        return None

    @procedimento.setter
    def procedimento(self, value):
        self.observacoes_gerais = value

    @property
    def medicacao(self):
        return None

    @medicacao.setter
    def medicacao(self, value):
        self.observacoes_gerais = value

    @property
    def observacao(self):
        return self.observacoes_gerais

    @observacao.setter
    def observacao(self, value):
        self.observacoes_gerais = value

    def __repr__(self):
        return f'<MedicalRecord {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'pet_id': self.pet_id,
            'pet_nome': self.pet.nome if self.pet else None,
            'veterinario': self.veterinario,
            'data_consulta': self.data_consulta.isoformat() if self.data_consulta else None,
            'diagnostico': self.diagnostico,
            'procedimento': self.procedimento,
            'medicacao': self.medicacao,
            'observacao': self.observacao,
        }


class Vaccine(db.Model):
    __tablename__ = 'APLICACAO_VACINA'

    id_aplicacao_vacina = db.Column(db.Integer, primary_key=True)
    id_pet = db.Column(db.Integer, db.ForeignKey('PET.id_pet'), nullable=False)
    id_vacina = db.Column(db.Integer, db.ForeignKey('VACINA.id_vacina'), nullable=False)
    id_atendimento = db.Column(db.Integer, db.ForeignKey('AGENDAMENTO.id_agendamento'))
    data_aplicacao = db.Column(db.Date, nullable=False)
    data_proxima_dose = db.Column(db.Date)
    lote = db.Column(db.String(50))
    observacoes = db.Column(db.Text)

    id = synonym('id_aplicacao_vacina')
    pet_id = synonym('id_pet')
    proxima_dose = synonym('data_proxima_dose')
    observacao = synonym('observacoes')

    vacina_obj = db.relationship('Vacina')

    @property
    def nome_vacina(self):
        return self.vacina_obj.nome if self.vacina_obj else None

    @nome_vacina.setter
    def nome_vacina(self, value):
        self._nome_vacina = value

    @property
    def veterinario(self):
        if self.id_atendimento and self.pet and self.pet.agendamentos:
            return None
        return None

    def __repr__(self):
        return f'<Vaccine {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'pet_id': self.pet_id,
            'pet_nome': self.pet.nome if self.pet else None,
            'nome_vacina': self.nome_vacina,
            'data_aplicacao': self.data_aplicacao.isoformat() if self.data_aplicacao else None,
            'proxima_dose': self.proxima_dose.isoformat() if self.proxima_dose else None,
            'veterinario': self.veterinario,
            'lote': self.lote,
            'observacao': self.observacao,
        }


class Produto(db.Model):
    __tablename__ = 'PRODUTO'

    id_produto = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    marca = db.Column(db.String(100))
    categoria = db.Column(db.String(50), nullable=False, default='Outro')
    descricao = db.Column(db.Text)
    quantidade_estoque = db.Column(db.Integer, nullable=False, default=0)
    estoque_minimo = db.Column(db.Integer, nullable=False, default=0)
    valor_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    ativo = db.Column(db.Boolean, default=True, nullable=False)

    id = synonym('id_produto')
    quantidade = synonym('quantidade_estoque')
    preco_unitario = synonym('valor_unitario')

    movimentacoes = db.relationship('MovimentacaoEstoque', backref='produto', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'marca': self.marca,
            'categoria': self.categoria or 'Outro',
            'descricao': self.descricao,
            'quantidade': self.quantidade,
            'estoque_minimo': self.estoque_minimo,
            'precoUnitario': float(self.valor_unitario) if self.valor_unitario is not None else 0,
            'ativo': self.ativo,
        }


class MovimentacaoEstoque(db.Model):
    __tablename__ = 'MOVIMENTACAO_ESTOQUE'

    id_movimentacao = db.Column(db.Integer, primary_key=True)
    id_produto = db.Column(db.Integer, db.ForeignKey('PRODUTO.id_produto'), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey('USUARIO.id_usuario'), nullable=False)
    tipo_movimentacao = db.Column(db.Enum('entrada', 'saida', 'ajuste', 'devolucao'), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    data_hora = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    observacoes = db.Column(db.Text)

    id = synonym('id_movimentacao')
    tipo = synonym('tipo_movimentacao')

    usuario = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'produto_id': self.id_produto,
            'produto_nome': self.produto.nome if self.produto else None,
            'usuario_id': self.id_usuario,
            'usuario_nome': self.usuario.nome if self.usuario else None,
            'tipo': self.tipo,
            'quantidade': self.quantidade,
            'data_hora': self.data_hora.isoformat() if self.data_hora else None,
            'observacoes': self.observacoes,
        }


class Servico(db.Model):
    __tablename__ = 'SERVICO'

    id_servico = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    ativo = db.Column(db.Boolean, default=True)

    id = synonym('id_servico')

    def to_dict(self):
        return {
            'id': self.id_servico,
            'nome': self.nome,
            'descricao': self.descricao,
            'valor': float(self.valor) if self.valor is not None else None,
            'ativo': self.ativo,
        }


class Atendimento(db.Model):
    __tablename__ = 'ATENDIMENTO'

    id_atendimento = db.Column(db.Integer, primary_key=True)
    id_pet = db.Column(db.Integer, db.ForeignKey('PET.id_pet', ondelete='RESTRICT'), nullable=False)
    id_veterinario = db.Column(db.Integer, db.ForeignKey('VETERINARIO.id_veterinario', ondelete='RESTRICT'), nullable=False)
    data_hora = db.Column(db.DateTime, nullable=False)
    tipo_atendimento = db.Column(db.Enum('consulta', 'retorno', 'emergencia', 'preventivo'), nullable=False)
    status = db.Column(db.Enum('agendado', 'em_progresso', 'concluido', 'cancelado'), nullable=False, default='agendado')
    queixa_principal = db.Column(db.Text, nullable=False)
    diagnostico = db.Column(db.Text, nullable=True)
    observacoes = db.Column(db.Text, nullable=True)

    id = synonym('id_atendimento')

    def to_dict(self):
        return {
            'id': self.id_atendimento,
            'petId': self.id_pet,
            'veterinarioId': self.id_veterinario,
            'dataHora': self.data_hora.isoformat() if self.data_hora else None,
            'tipo': self.tipo_atendimento,
            'status': self.status,
            'queixaPrincipal': self.queixa_principal,
            'diagnostico': self.diagnostico,
            'observacoes': self.observacoes,
        }


class LancamentoFinanceiro(db.Model):
    __tablename__ = 'LANCAMENTO_FINANCEIRO'

    id_lancamento = db.Column(db.Integer, primary_key=True)
    id_pet = db.Column(db.Integer, db.ForeignKey('PET.id_pet', ondelete='SET NULL'), nullable=True)
    id_tutor = db.Column(db.Integer, db.ForeignKey('TUTOR.id_tutor', ondelete='SET NULL'), nullable=True)
    id_atendimento = db.Column(db.Integer, db.ForeignKey('ATENDIMENTO.id_atendimento', ondelete='SET NULL'), nullable=True)
    id_servico = db.Column(db.Integer, db.ForeignKey('SERVICO.id_servico', ondelete='SET NULL'), nullable=True)
    tipo_lancamento = db.Column(db.Enum('receita', 'despesa', 'devolucao'), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    data_lancamento = db.Column(db.Date, nullable=False)
    forma_pagamento = db.Column(db.Enum('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'cheque'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pago')

    id = synonym('id_lancamento')

    pet = db.relationship('Pet')
    tutor = db.relationship('Tutor')

    def to_dict(self):
        return {
            'id': self.id,
            'pet_id': self.id_pet,
            'tutor_id': self.id_tutor,
            'atendimento_id': self.id_atendimento,
            'servico_id': self.id_servico,
            'tipo': self.tipo_lancamento,
            'categoria': self.categoria,
            'descricao': self.descricao,
            'valor': float(self.valor) if self.valor is not None else 0,
            'data_lancamento': self.data_lancamento.isoformat() if self.data_lancamento else None,
            'forma_pagamento': self.forma_pagamento,
            'status': self.status,
            'pet_nome': self.pet.nome if self.pet else None,
            'tutor_nome': self.tutor.nome if self.tutor else None,
        }