#!/usr/bin/env python3
"""Database initialization script for PetSystem.

This script handles:
1. Creating the database if it doesn't exist
2. Loading schema.sql (DDL - all tables)
3. Loading seed.sql (test data)

Usage:
    python init_db.py --help
    python init_db.py                    # Interactive mode
    python init_db.py --skip-seed        # Schema only, no test data
    python init_db.py --reset            # Drop and recreate everything
    python init_db.py --validate         # Check schema integrity
"""

import os
import sys
import argparse
import pymysql
from pathlib import Path
from dotenv import load_dotenv
from colorama import Fore, Style, init as colorama_init

# Initialize colorama for colored output
colorama_init(autoreset=True)

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
if DB_HOST == 'mysql':
    DB_HOST = '127.0.0.1'
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASS', os.getenv('DB_PASSWORD', 'PETSYSTEM123'))
DB_NAME = os.getenv('DB_NAME', 'petsystem')

# Get SQL files path
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
SQL_DIR = SCRIPT_DIR / 'sql'
SCHEMA_FILE = ROOT_DIR / 'database' / 'schema.sql'
SEED_FILE = SQL_DIR / 'seed.sql'


def print_header(msg):
    """Print a formatted header."""
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{msg}")
    print(f"{'='*60}{Style.RESET_ALL}\n")


def print_success(msg):
    """Print a success message."""
    print(f"{Fore.GREEN}✓ {msg}{Style.RESET_ALL}")


def print_error(msg):
    """Print an error message."""
    print(f"{Fore.RED}✗ {msg}{Style.RESET_ALL}")


def print_warning(msg):
    """Print a warning message."""
    print(f"{Fore.YELLOW}⚠ {msg}{Style.RESET_ALL}")


def print_info(msg):
    """Print an info message."""
    print(f"{Fore.BLUE}ℹ {msg}{Style.RESET_ALL}")


def connect_to_mysql(include_db=True):
    """Connect to MySQL server."""
    try:
        config = {
            'host': DB_HOST,
            'port': DB_PORT,
            'user': DB_USER,
            'password': DB_PASSWORD,
            'charset': 'utf8mb4',
        }
        if include_db:
            config['database'] = DB_NAME
        
        connection = pymysql.connect(**config)
        return connection
    except pymysql.Error as e:
        print_error(f"Failed to connect to MySQL: {e}")
        sys.exit(1)


def database_exists():
    """Check if database exists."""
    conn = connect_to_mysql(include_db=False)
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{DB_NAME}'")
        result = cursor.fetchone()
        return result is not None
    finally:
        cursor.close()
        conn.close()


def create_database():
    """Create the database."""
    conn = connect_to_mysql(include_db=False)
    cursor = conn.cursor()
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        conn.commit()
        print_success(f"Database '{DB_NAME}' created or verified")
    except pymysql.Error as e:
        print_error(f"Failed to create database: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()


def drop_database():
    """Drop the database (CAREFUL!)."""
    conn = connect_to_mysql(include_db=False)
    cursor = conn.cursor()
    try:
        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
        conn.commit()
        print_success(f"Database '{DB_NAME}' dropped")
    except pymysql.Error as e:
        print_error(f"Failed to drop database: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()


def load_schema():
    """Load schema.sql into database."""
    if not SCHEMA_FILE.exists():
        print_error(f"Schema file not found: {SCHEMA_FILE}")
        sys.exit(1)
    
    conn = connect_to_mysql(include_db=True)
    cursor = conn.cursor()
    try:
        print_info("Loading schema.sql...")
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Split by semicolon and execute statements
        statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        
        for i, statement in enumerate(statements, 1):
            try:
                cursor.execute(statement)
            except pymysql.Error as e:
                # Some statements may error (like IF NOT EXISTS), that's ok
                if 'already exists' not in str(e).lower() and 'duplicate' not in str(e).lower():
                    print_warning(f"Statement {i} warning: {e}")
        
        conn.commit()
        print_success(f"Schema loaded: {len(statements)} statements executed")
    except Exception as e:
        print_error(f"Failed to load schema: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()


def load_seed():
    """Load seed.sql into database."""
    if not SEED_FILE.exists():
        print_warning(f"Seed file not found: {SEED_FILE}")
        return
    
    conn = connect_to_mysql(include_db=True)
    cursor = conn.cursor()
    try:
        print_info("Loading seed.sql...")
        with open(SEED_FILE, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Split by semicolon and execute statements
        statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        
        for statement in statements:
            try:
                cursor.execute(statement)
            except pymysql.Error as e:
                # Some seed inserts may error if data already exists
                if 'duplicate' not in str(e).lower():
                    print_warning(f"Seed insert warning: {e}")
        
        conn.commit()
        print_success(f"Seed data loaded: {len(statements)} statements executed")
    except Exception as e:
        print_error(f"Failed to load seed: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()


def validate_schema():
    """Validate schema - check all tables exist."""
    conn = connect_to_mysql(include_db=True)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = %s ORDER BY TABLE_NAME
        """, (DB_NAME,))
        
        tables = [row[0] for row in cursor.fetchall()]
        
        print_info(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table}")
        
        # Expected tables
        expected_tables = [
            'USUARIO', 'TUTOR', 'VETERINARIO', 'SERVICO', 'PROCEDIMENTO', 'EXAME',
            'VACINA', 'PRODUTO', 'PET', 'PRONTUARIO', 'ATENDIMENTO', 'AGENDAMENTO',
            'INTERNACAO', 'RECEITA', 'ITEM_RECEITA', 'APLICACAO_VACINA', 'LAUDO',
            'ATENDIMENTO_PROCEDIMENTO', 'ATENDIMENTO_EXAME', 'ATUALIZACAO_INTERNACAO',
            'VENDA', 'ITEM_VENDA', 'MOVIMENTACAO_ESTOQUE', 'LANCAMENTO_FINANCEIRO',
            'NOTIFICACAO', 'RECADO_INTERNO', 'RECADO_DESTINATARIO'
        ]
        
        missing = set(expected_tables) - set(tables)
        if missing:
            print_warning(f"Missing tables: {', '.join(missing)}")
            return False
        
        print_success("Schema validation passed - all tables present")
        return True
        
    except Exception as e:
        print_error(f"Schema validation failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Initialize PetSystem database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''Examples:
  python init_db.py                    # Interactive mode
  python init_db.py --skip-seed        # Schema only
  python init_db.py --reset            # Drop and recreate
  python init_db.py --validate         # Check schema
        '''
    )
    
    parser.add_argument('--skip-seed', action='store_true',
                        help='Skip loading seed data')
    parser.add_argument('--reset', action='store_true',
                        help='Drop and recreate database')
    parser.add_argument('--validate', action='store_true',
                        help='Validate schema integrity')
    parser.add_argument('--no-confirm', action='store_true',
                        help='Skip confirmation prompts')
    
    args = parser.parse_args()
    
    print_header("PetSystem Database Initialization")
    
    print_info(f"Database Configuration:")
    print(f"  Host: {DB_HOST}")
    print(f"  Port: {DB_PORT}")
    print(f"  User: {DB_USER}")
    print(f"  Database: {DB_NAME}")
    print()
    
    # Validate option
    if args.validate:
        if not database_exists():
            print_error("Database does not exist")
            sys.exit(1)
        validate_schema()
        return
    
    # Reset option
    if args.reset:
        if not args.no_confirm:
            response = input(f"{Fore.RED}WARNING: This will DELETE all data. Continue? (y/N): {Style.RESET_ALL}")
            if response.lower() != 'y':
                print("Cancelled")
                return
        
        drop_database()
        create_database()
        load_schema()
        if not args.skip_seed:
            load_seed()
        print()
        validate_schema()
        return
    
    # Normal flow
    if database_exists():
        print_info(f"Database '{DB_NAME}' already exists")
    else:
        print_info(f"Database '{DB_NAME}' does not exist, creating...")
        create_database()
    
    # Load schema
    load_schema()
    
    # Load seed (if not skipped)
    if not args.skip_seed:
        load_seed()
    
    print()
    validate_schema()
    
    print_header("✓ Database initialization complete!")
    print_success("Ready to start development\n")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Cancelled by user{Style.RESET_ALL}")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)
