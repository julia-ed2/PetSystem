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
        db.Enum('admin', 'veterinario', 'atendente', 'gerente'),
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