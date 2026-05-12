# PetSystem API Documentation

## Overview
The PetSystem API provides RESTful endpoints for managing pets, tutors (owners), appointments, and medical records with JWT-based authentication.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Access tokens expire in 1 hour. Use the refresh token to obtain new access tokens.

---

## Authentication Endpoints (`/api/auth`)

### 1. Register User
**POST** `/auth/register`

Register a new user with system access.

**Request Body:**
```json
{
  "nome": "Admin User",
  "login": "admin",
  "password": "admin123",
  "tipo": "admin"  // Optional: admin, veterinario, atendente, gerente (default: atendente)
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registro bem-sucedido!",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": 1,
    "nome": "Admin User",
    "login": "admin",
    "tipo": "admin"
  }
}
```

**Error Responses:**
- `400`: Missing required fields, weak password
- `409`: Login already exists
- `500`: Internal server error

---

### 2. Login
**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "login": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": 1,
    "nome": "Admin User",
    "login": "admin",
    "tipo": "admin"
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `404`: User not found

---

### 3. Get Current User
**GET** `/auth/me`

Requires: `@require_auth`

Get information about the currently authenticated user.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "nome": "Admin User",
    "login": "admin",
    "tipo": "admin"
  }
}
```

---

### 4. Logout
**POST** `/auth/logout`

Requires: `@jwt_required`

Logout the current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Desconectado com sucesso"
}
```

---

## Tutores Endpoints (`/api/tutores`)

Tutores are pet owners. Only users with `admin` or `atendente` roles can create tutores.

### 1. List Tutores
**GET** `/tutores`

Requires: `@require_auth`

List all tutores with optional filtering.

**Query Parameters:**
- `nome`: Filter by name (case-insensitive)
- `cpf`: Filter by CPF
- `ativo`: Filter by active status (true/false, default: true)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "telefone": "11999999999",
      "endereco": "Rua A, 123",
      "login": "joao",
      "ativo": true,
      "pets_count": 2
    }
  ]
}
```

---

### 2. Get Tutor by ID
**GET** `/tutores/<id>`

Requires: `@require_auth`

Get a specific tutor with their associated pets.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    "telefone": "11999999999",
    "endereco": "Rua A, 123",
    "login": "joao",
    "ativo": true,
    "pets": [
      {
        "id": 1,
        "nome": "Rex",
        "especie": "Cachorro"
      }
    ]
  }
}
```

**Error Response:**
- `404`: Tutor not found

---

### 3. Create Tutor
**POST** `/tutores`

Requires: `@require_role('admin', 'atendente')`

Create a new tutor.

**Request Body:**
```json
{
  "nome": "Maria Silva",
  "cpf": "987.654.321-00",  // CPF will be cleaned (dots/dashes removed)
  "telefone": "11988888888",
  "endereco": "Rua B, 456",
  "login": "maria",  // Optional
  "ativo": true  // Optional, default: true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tutor criado com sucesso",
  "data": {
    "id": 2,
    "nome": "Maria Silva",
    "cpf": "98765432100",
    "telefone": "11988888888",
    "endereco": "Rua B, 456",
    "ativo": true
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `409`: CPF already exists
- `403`: Insufficient permissions

---

### 4. Update Tutor
**PUT** `/tutores/<id>`

Requires: `@require_auth`

Update tutor information. Only provided fields will be updated.

**Request Body:**
```json
{
  "nome": "Maria Silva Updated",
  "telefone": "11987654321",
  "endereco": "Rua C, 789"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tutor atualizado com sucesso",
  "data": {
    "id": 2,
    "nome": "Maria Silva Updated",
    "cpf": "98765432100",
    "telefone": "11987654321",
    "endereco": "Rua C, 789",
    "ativo": true
  }
}
```

---

### 5. Delete Tutor
**DELETE** `/tutores/<id>`

Requires: `@require_role('admin')`

Soft delete tutor (marks as inactive).

**Response (200):**
```json
{
  "success": true,
  "message": "Tutor deletado com sucesso"
}
```

**Error Response:**
- `404`: Tutor not found

---

## Pets Endpoints (`/api/pets`)

### 1. List Pets
**GET** `/pets`

Requires: `@require_auth`

List all pets with optional filtering.

**Query Parameters:**
- `tutor_id`: Filter by tutor ID
- `especie`: Filter by species
- `nome`: Filter by name
- `ativo`: Filter by active status (true/false, default: true)

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "nome": "Rex",
      "especie": "Cachorro",
      "raca": "Poodle",
      "idade": 3,
      "sexo": "M",
      "peso": "8.5",
      "tutor_id": 1,
      "tutor_nome": "João Silva",
      "ativo": true
    }
  ]
}
```

---

### 2. Get Pet by ID
**GET** `/pets/<id>`

Requires: `@require_auth`

Get a specific pet with tutor information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Rex",
    "especie": "Cachorro",
    "raca": "Poodle",
    "idade": 3,
    "sexo": "M",
    "peso": "8.5",
    "observacoes": "Alérgico a frutos do mar",
    "tutor_id": 1,
    "tutor_nome": "João Silva",
    "ativo": true
  }
}
```

---

### 3. Create Pet
**POST** `/pets`

Requires: `@require_auth`

Create a new pet.

**Request Body:**
```json
{
  "tutor_id": 1,
  "nome": "Bella",
  "especie": "Cachorro",
  "raca": "Dachshund",
  "idade": 2,
  "sexo": "F",
  "peso": "5.5",
  "observacoes": "Gosta de brincar",
  "ativo": true  // Optional, default: true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pet criado com sucesso",
  "data": {
    "id": 2,
    "nome": "Bella",
    "especie": "Cachorro",
    "raca": "Dachshund",
    "tutor_id": 1,
    "ativo": true
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `404`: Tutor not found

---

### 4. Update Pet
**PUT** `/pets/<id>`

Requires: `@require_auth`

Update pet information. Only provided fields will be updated.

**Request Body:**
```json
{
  "idade": 3,
  "peso": "6.0",
  "observacoes": "Vacinado em 2026"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pet atualizado com sucesso",
  "data": {
    "id": 2,
    "nome": "Bella",
    "especie": "Cachorro",
    "raca": "Dachshund",
    "idade": 3,
    "peso": "6.0",
    "ativo": true
  }
}
```

---

### 5. Delete Pet
**DELETE** `/pets/<id>`

Requires: `@require_role('admin', 'veterinario')`

Soft delete pet (marks as inactive).

**Response (200):**
```json
{
  "success": true,
  "message": "Pet deletado com sucesso"
}
```

---

## Appointments Endpoints (`/api/agendamentos`)

### 1. List Appointments
**GET** `/agendamentos`

Requires: `@require_auth`

List all appointments with optional filtering.

**Query Parameters:**
- `pet_id`: Filter by pet ID
- `veterinario_id`: Filter by veterinarian ID
- `status`: Filter by status (agendado, realizado, cancelado, etc.)
- `data_inicio`: Filter from date (ISO 8601 format)
- `data_fim`: Filter to date (ISO 8601 format)

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "pet_id": 1,
      "pet_nome": "Rex",
      "tutor_id": 1,
      "tutor_nome": "João Silva",
      "veterinario_id": 1,
      "veterinario_nome": "Dr. Silva",
      "tipo": "Consulta",
      "data": "2026-12-25",
      "hora": "14:30:00",
      "status": "agendado",
      "observacoes": "Verificar alergias"
    }
  ]
}
```

---

### 2. Get Appointment by ID
**GET** `/agendamentos/<id>`

Requires: `@require_auth`

Get a specific appointment.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "pet_id": 1,
    "pet_nome": "Rex",
    "tutor_id": 1,
    "tutor_nome": "João Silva",
    "veterinario_id": 1,
    "veterinario_nome": "Dr. Silva",
    "tipo": "Consulta",
    "data": "2026-12-25",
    "hora": "14:30:00",
    "status": "agendado",
    "observacoes": "Verificar alergias"
  }
}
```

---

### 3. Create Appointment
**POST** `/agendamentos`

Requires: `@require_role('admin', 'atendente', 'veterinario')`

Create a new appointment.

**Request Body:**
```json
{
  "pet_id": 1,
  "veterinario_id": 1,
  "tipo": "Consulta",
  "data": "2026-12-25",  // ISO 8601 date format
  "hora": "14:30:00",    // ISO 8601 time format
  "status": "agendado",  // Optional, default: agendado
  "observacoes": "Verificar alergias"  // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Agendamento criado com sucesso",
  "data": {
    "id": 1,
    "pet_id": 1,
    "veterinario_id": 1,
    "tipo": "Consulta",
    "data": "2026-12-25",
    "hora": "14:30:00",
    "status": "agendado"
  }
}
```

**Error Responses:**
- `400`: Invalid date/time format or missing fields
- `404`: Pet or Veterinarian not found

---

### 4. Update Appointment
**PUT** `/agendamentos/<id>`

Requires: `@require_role('admin', 'atendente', 'veterinario')`

Update appointment information.

**Request Body:**
```json
{
  "tipo": "Vacinação",
  "data": "2026-12-26",
  "hora": "10:00:00",
  "status": "realizado",
  "observacoes": "Vacinado contra raiva"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Agendamento atualizado com sucesso",
  "data": {
    "id": 1,
    "tipo": "Vacinação",
    "data": "2026-12-26",
    "hora": "10:00:00",
    "status": "realizado",
    "observacoes": "Vacinado contra raiva"
  }
}
```

---

### 5. Delete/Cancel Appointment
**DELETE** `/agendamentos/<id>`

Requires: `@require_role('admin', 'atendente')`

Cancel appointment (marks status as 'cancelado').

**Response (200):**
```json
{
  "success": true,
  "message": "Agendamento cancelado com sucesso"
}
```

---

## Medical Records Endpoints (`/api/pets/<pet_id>/records`)

### 1. Get Medical Records
**GET** `/pets/<pet_id>/records`

Requires: `@require_auth`

Get all medical records for a pet.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pet_id": 1,
      "data_abertura": "2026-01-15",
      "observacoes_gerais": "Prontuário criado"
    }
  ]
}
```

---

### 2. Create Medical Record
**POST** `/pets/<pet_id>/records`

Requires: `@require_auth`

Create a new medical record for a pet.

**Request Body:**
```json
{
  "observacoes_gerais": "Prontuário criado para vacinação"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Prontuário criado com sucesso",
  "data": {
    "id": 1,
    "pet_id": 1,
    "data_abertura": "2026-01-15"
  }
}
```

---

## Vaccine Records Endpoints (`/api/pets/<pet_id>/vaccines`)

### 1. List Vaccines for Pet
**GET** `/pets/<pet_id>/vaccines`

Requires: `@require_auth`

Get all vaccine records for a pet.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pet_id": 1,
      "vacina_id": 1,
      "vacina_nome": "Raiva",
      "data_aplicacao": "2026-01-15",
      "veterinario_id": 1,
      "veterinario_nome": "Dr. Silva"
    }
  ]
}
```

---

### 2. Record Vaccine Application
**POST** `/pets/<pet_id>/vaccines`

Requires: `@require_auth`

Record a vaccine application for a pet.

**Request Body:**
```json
{
  "vacina_id": 1,
  "data_aplicacao": "2026-01-15",
  "veterinario_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Vacinação registrada com sucesso",
  "data": {
    "id": 1,
    "pet_id": 1,
    "vacina_id": 1,
    "data_aplicacao": "2026-01-15"
  }
}
```

---

## Health Check Endpoint

### Health Check
**GET** `/health`

No authentication required.

Check if the API is running.

**Response (200):**
```json
{
  "status": "ok",
  "environment": "development"
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"  // Optional machine-readable error code
}
```

**Common HTTP Status Codes:**
- `200`: OK - Request successful
- `201`: Created - Resource created successfully
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid JWT token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists (e.g., duplicate CPF)
- `422`: Unprocessable Entity - JWT parsing error
- `500`: Internal Server Error - Server error

---

## Testing

The API can be tested using:
- cURL
- Postman
- VS Code REST Client
- Python requests library

Example with cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'

# Use token from response in subsequent requests
curl -X GET http://localhost:5000/api/tutores \
  -H "Authorization: Bearer <access_token>"
```

---

## Role-Based Access Control

- **admin**: Full access to all endpoints including delete operations
- **veterinario**: Access to medical records, vaccines, and appointments
- **atendente**: Can create tutores and appointments, manage tutores
- **gerente**: (Reserved for future management features)

---

## Database Constraints

- **CPF**: Must be unique for each tutor
- **Login**: Must be unique for each user
- **Pet names**: Can be duplicated (different tutores can have pets with the same name)
- **Soft delete**: Deleted records are marked as inactive (ativo=false) rather than removed from database

---

Last Updated: 2026-05-12
