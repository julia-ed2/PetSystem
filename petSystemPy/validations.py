import re
from datetime import datetime
from models import User, Tutor, Pet


# Pre-defined valid values
ESPECIES_VALIDAS = ['cao', 'gato', 'passaro', 'roedor', 'outro']
TIPOS_AGENDAMENTO = ['consulta', 'retorno', 'emergencia', 'preventivo']
NIVEIS_ACESSO = ['admin', 'veterinario', 'atendente', 'gerente']


def validarEmail(email):
    """Validate email format"""
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(padrao, email) is not None


def validarCPF(cpf):
    """
    Validate CPF format and check digit algorithm.
    Accepts: 000.000.000-00 or 00000000000 format
    """
    cpf_limpo = re.sub(r'\D', '', cpf)
    
    # Check length
    if len(cpf_limpo) != 11:
        return False
    
    # Reject if all digits are the same
    if cpf_limpo == cpf_limpo[0] * 11:
        return False
    
    # Check first digit
    soma = sum(int(cpf_limpo[i]) * (10 - i) for i in range(9))
    primeiro_digito = 11 - (soma % 11)
    primeiro_digito = 0 if primeiro_digito > 9 else primeiro_digito
    
    if int(cpf_limpo[9]) != primeiro_digito:
        return False
    
    # Check second digit
    soma = sum(int(cpf_limpo[i]) * (11 - i) for i in range(10))
    segundo_digito = 11 - (soma % 11)
    segundo_digito = 0 if segundo_digito > 9 else segundo_digito
    
    if int(cpf_limpo[10]) != segundo_digito:
        return False
    
    return True


def verificarEmailUnico(email, usuario_id=None):
    """Check if email is unique in database"""
    query = User.query.filter_by(email=email)
    if usuario_id:
        query = query.filter(User.id != usuario_id)
    return query.first() is None


def verificarCPFUnico(cpf, tutor_id=None):
    """Check if CPF is unique in database"""
    cpf_limpo = re.sub(r'\D', '', cpf)
    query = Tutor.query.filter_by(cpf=cpf_limpo)
    if tutor_id:
        query = query.filter(Tutor.id != tutor_id)
    return query.first() is None


def validarIdadePet(idade):
    """Validate pet age (must be positive number)"""
    try:
        idade_num = int(idade)
        return idade_num >= 0
    except (ValueError, TypeError):
        return False


def validarDataFutura(data_str, formato='%Y-%m-%d'):
    """
    Validate date format and ensure it's not in the future.
    Returns: (is_valid, date_obj or None, error_message)
    """
    try:
        data = datetime.strptime(data_str, formato).date()
        hoje = datetime.utcnow().date()
        
        if data > hoje:
            return False, None, 'A data não pode ser no futuro.'
        
        return True, data, None
    except ValueError:
        return False, None, f'Formato de data inválido. Use {formato}'


def validarDataFuturaOuPresente(data_str, formato='%Y-%m-%d %H:%M'):
    """
    Validate date format and ensure it's not in the past.
    Used for agendamentos (can be future)
    Returns: (is_valid, datetime_obj or None, error_message)
    """
    try:
        data = datetime.strptime(data_str, formato)
        agora = datetime.utcnow()
        
        if data < agora:
            return False, None, 'A data não pode ser no passado.'
        
        return True, data, None
    except ValueError:
        return False, None, f'Formato de data inválido. Use {formato}'


def validarCadastroTutor(dados):
    """
    Comprehensive tutor registration validation.
    Returns: (is_valid, error_list)
    """
    erros = []
    
    # Nome
    if not dados.get('nome') or len(dados.get('nome', '').strip()) < 3:
        erros.append('Nome deve ter pelo menos 3 caracteres.')
    
    # Email (optional)
    if dados.get('email'):
        if not validarEmail(dados['email']):
            erros.append('E-mail inválido.')
        elif not verificarEmailUnico(dados['email']):
            erros.append('E-mail já cadastrado no sistema.')
    
    # CPF (required)
    if not dados.get('cpf'):
        erros.append('CPF é obrigatório.')
    elif not validarCPF(dados['cpf']):
        erros.append('CPF inválido.')
    elif not verificarCPFUnico(dados['cpf']):
        erros.append('CPF já cadastrado no sistema.')
    
    # Telefone (required)
    if not dados.get('telefone') or len(dados.get('telefone', '').strip()) < 10:
        erros.append('Telefone deve ter pelo menos 10 dígitos.')
    
    # Endereço (optional)
    if dados.get('endereco') and len(dados.get('endereco', '').strip()) < 5:
        erros.append('Endereço deve ter pelo menos 5 caracteres.')
    
    return (len(erros) == 0, erros)


def validarCadastroPet(dados):
    """
    Comprehensive pet registration validation.
    Returns: (is_valid, error_list)
    """
    erros = []
    
    if not dados.get('nome') or len(dados.get('nome', '').strip()) < 2:
        erros.append('Nome do pet deve ter pelo menos 2 caracteres.')
    
    if not dados.get('especie'):
        erros.append('Espécie é obrigatória.')
    elif dados.get('especie') not in ESPECIES_VALIDAS:
        erros.append(f'Espécie inválida. Opções válidas: {", ".join(ESPECIES_VALIDAS)}')
    
    if dados.get('raca') and len(dados.get('raca', '').strip()) < 2:
        erros.append('Raça deve ter pelo menos 2 caracteres.')
    
    if not dados.get('idade'):
        erros.append('Idade é obrigatória.')
    elif not validarIdadePet(dados.get('idade')):
        erros.append('Idade deve ser um número positivo.')
    
    if not dados.get('tutor_id'):
        erros.append('ID do tutor é obrigatório.')
    
    return (len(erros) == 0, erros)

def validarCadastroAgendamento(dados):
    """
    Comprehensive appointment validation.
    Returns: (is_valid, error_list)
    """
    erros = []
    
    if not dados.get('pet_id'):
        erros.append('ID do pet é obrigatório.')
    
    if not dados.get('tutor_id'):
        erros.append('ID do tutor é obrigatório.')
    
    if not dados.get('veterinario') or len(dados.get('veterinario', '').strip()) < 3:
        erros.append('Nome do veterinário deve ter pelo menos 3 caracteres.')
    
    if not dados.get('tipo'):
        erros.append('Tipo de agendamento é obrigatório.')
    elif dados.get('tipo') not in TIPOS_AGENDAMENTO:
        erros.append(f'Tipo inválido. Opções válidas: {", ".join(TIPOS_AGENDAMENTO)}')
    
    if not dados.get('data_agendamento'):
        erros.append('Data de agendamento é obrigatória.')
    
    if not dados.get('hora_agendamento'):
        erros.append('Hora de agendamento é obrigatória.')
    
    return (len(erros) == 0, erros)
