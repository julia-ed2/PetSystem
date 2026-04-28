from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    nivel_acesso = db.Column(
        db.Enum('admin', 'operador', 'cliente'),
        default='cliente',
        nullable=False
    )
    status = db.Column(
        db.Enum('ativo', 'inativo'),
        default='ativo',
        nullable=False
    )
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tutores = db.relationship('Tutor', backref='usuario', lazy=True)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'nivel_acesso': self.nivel_acesso,
            'status': self.status,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }


class Tutor(db.Model):
    """Pet owner/guardian model"""
    __tablename__ = 'tutores'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False, index=True)
    email = db.Column(db.String(100))
    telefone = db.Column(db.String(20), nullable=False)
    endereco = db.Column(db.String(255))
    usuario_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    pets = db.relationship('Pet', backref='tutor', lazy=True, cascade='all, delete-orphan')
    agendamentos = db.relationship('Appointment', backref='tutor', lazy=True)
    
    def __repr__(self):
        return f'<Tutor {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cpf': self.cpf,
            'email': self.email,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }


class Pet(db.Model):
    """Pet model"""
    __tablename__ = 'pets'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    especie = db.Column(
        db.Enum('cachorro', 'gato', 'passaro', 'roedor', 'reptil', 'outro'),
        nullable=False
    )
    raca = db.Column(db.String(100))
    idade = db.Column(db.Integer, nullable=False)
    cor = db.Column(db.String(50))
    peso = db.Column(db.Float)  # em kg
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutores.id'), nullable=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    agendamentos = db.relationship('Appointment', backref='pet', lazy=True)
    prontuarios = db.relationship('MedicalRecord', backref='pet', lazy=True, cascade='all, delete-orphan')
    vacinas = db.relationship('Vaccine', backref='pet', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Pet {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'especie': self.especie,
            'raca': self.raca,
            'idade': self.idade,
            'cor': self.cor,
            'peso': self.peso,
            'tutor_id': self.tutor_id,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }


class Appointment(db.Model):
    """Veterinary appointment model"""
    __tablename__ = 'agendamentos'
    
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'), nullable=False)
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutores.id'), nullable=False)
    veterinario = db.Column(db.String(100), nullable=False)
    tipo = db.Column(
        db.Enum('consulta', 'exame', 'cirurgia', 'vacinacao', 'banho', 'outro'),
        default='consulta',
        nullable=False
    )
    data_agendamento = db.Column(db.DateTime, nullable=False, index=True)
    hora_agendamento = db.Column(db.Time, nullable=False)
    observacao = db.Column(db.Text)
    status = db.Column(
        db.Enum('agendado', 'confirmado', 'concluido', 'cancelado'),
        default='agendado'
    )
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Appointment {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'pet_id': self.pet_id,
            'pet_nome': self.pet.nome if self.pet else None,
            'tutor_id': self.tutor_id,
            'tutor_nome': self.tutor.nome if self.tutor else None,
            'veterinario': self.veterinario,
            'tipo': self.tipo,
            'data_agendamento': self.data_agendamento.isoformat() if self.data_agendamento else None,
            'hora_agendamento': self.hora_agendamento.isoformat() if self.hora_agendamento else None,
            'observacao': self.observacao,
            'status': self.status,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }


class MedicalRecord(db.Model):
    """Medical record/prontuário model"""
    __tablename__ = 'prontuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'), nullable=False)
    veterinario = db.Column(db.String(100), nullable=False)
    data_consulta = db.Column(db.DateTime, default=datetime.utcnow)
    diagnostico = db.Column(db.Text)
    procedimento = db.Column(db.Text)
    medicacao = db.Column(db.Text)
    observacao = db.Column(db.Text)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }


class Vaccine(db.Model):
    """Vaccination record model"""
    __tablename__ = 'vacinas'
    
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'), nullable=False)
    nome_vacina = db.Column(db.String(100), nullable=False)
    data_aplicacao = db.Column(db.DateTime, nullable=False, index=True)
    proxima_dose = db.Column(db.DateTime)
    veterinario = db.Column(db.String(100))
    lote = db.Column(db.String(50))
    observacao = db.Column(db.Text)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Vaccine {self.nome_vacina}>'
    
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
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }
