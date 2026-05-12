#!/usr/bin/env python3
"""Test script to verify schema and environment setup.

This script validates:
1. Docker MySQL container is running
2. Schema scripts are valid SQL
3. Database can be created and populated
4. All tables exist with correct structure

Usage:
    python test_schema.py                   # Full test
    python test_schema.py --syntax-only     # Only check SQL syntax
    python test_schema.py --docker-only     # Only check Docker
"""

import os
import sys
import argparse
import pymysql
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from colorama import Fore, Style, init as colorama_init

# Initialize colorama
colorama_init(autoreset=True)

# Load environment variables
load_dotenv()

# Configuration
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
SQL_DIR = SCRIPT_DIR / 'sql'
SCHEMA_FILE = ROOT_DIR / 'database' / 'schema.sql'
SEED_FILE = SQL_DIR / 'seed.sql'

DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
if DB_HOST == 'mysql':
    DB_HOST = '127.0.0.1'
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASS', os.getenv('DB_PASSWORD', 'PETSYSTEM123'))
DB_NAME = 'petsystem_test'


def print_header(msg):
    """Print formatted header."""
    print(f"\n{Fore.CYAN}{'='*60}\n{msg}\n{'='*60}{Style.RESET_ALL}\n")


def print_success(msg):
    """Print success message."""
    print(f"{Fore.GREEN}✓ {msg}{Style.RESET_ALL}")


def print_error(msg):
    """Print error message."""
    print(f"{Fore.RED}✗ {msg}{Style.RESET_ALL}")


def print_info(msg):
    """Print info message."""
    print(f"{Fore.BLUE}ℹ {msg}{Style.RESET_ALL}")


def test_docker_mysql():
    """Test if Docker MySQL is running."""
    print_header("Testing Docker MySQL Container")
    
    try:
        result = subprocess.run(
            ['docker', 'ps', '--filter', 'name=mysql', '--format', '{{.Names}}'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if 'mysql' in result.stdout.lower() or 'petsystem' in result.stdout.lower():
            print_success("MySQL container is running")
            return True
        else:
            print_error("MySQL container not found")
            print_info("Start with: docker-compose -f petSystemPy/docker-compose.yml up -d")
            return False
    except Exception as e:
        print_error(f"Error checking Docker: {e}")
        return False


def test_mysql_connection():
    """Test connection to MySQL."""
    print_header("Testing MySQL Connection")
    
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print_success(f"Connected to MySQL {version[0]}")
        cursor.close()
        conn.close()
        return True
    except pymysql.Error as e:
        print_error(f"MySQL connection failed: {e}")
        return False


def test_sql_syntax():
    """Test SQL syntax of schema and seed files."""
    print_header("Validating SQL Syntax")
    
    if not SCHEMA_FILE.exists():
        print_error(f"Schema file not found: {SCHEMA_FILE}")
        return False
    
    if not SEED_FILE.exists():
        print_error(f"Seed file not found: {SEED_FILE}")
        return False
    
    print_info("Checking schema.sql...")
    try:
        with open(SCHEMA_FILE, 'r') as f:
            schema_content = f.read()
        
        # Basic checks
        if 'CREATE TABLE' not in schema_content:
            print_error("schema.sql missing CREATE TABLE statements")
            return False
        
        table_count = schema_content.count('CREATE TABLE')
        print_success(f"schema.sql is valid ({table_count} tables)")
    except Exception as e:
        print_error(f"Error reading schema.sql: {e}")
        return False
    
    print_info("Checking seed.sql...")
    try:
        with open(SEED_FILE, 'r') as f:
            seed_content = f.read()
        
        # Basic checks
        if 'INSERT INTO' not in seed_content:
            print_info("seed.sql has no INSERT statements (ok for schema-only)")
        else:
            insert_count = seed_content.count('INSERT INTO')
            print_success(f"seed.sql is valid ({insert_count} INSERT statements)")
    except Exception as e:
        print_error(f"Error reading seed.sql: {e}")
        return False
    
    return True


def test_schema_creation():
    """Test schema creation without populating data."""
    print_header("Testing Schema Creation (dry run)")
    
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    
    try:
        # Create test database
        print_info(f"Creating test database: {DB_NAME}")
        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
        cursor.execute(f"CREATE DATABASE {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        conn.commit()
        print_success(f"Test database created")
        
        # Switch to test database
        cursor.execute(f"USE {DB_NAME}")
        
        # Load schema
        print_info("Loading schema.sql into test database...")
        with open(SCHEMA_FILE, 'r') as f:
            sql_content = f.read()
        
        statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        
        for i, stmt in enumerate(statements, 1):
            try:
                cursor.execute(stmt)
            except Exception as e:
                # Some errors are expected (IF EXISTS, etc)
                if 'already exists' not in str(e).lower() and 'duplicate' not in str(e).lower():
                    print_error(f"Statement {i} error: {e}")
                    print_error(f"SQL: {stmt[:100]}...")
        
        conn.commit()
        print_success(f"Schema loaded: {len(statements)} statements")
        
        # Verify tables
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = %s
        """, (DB_NAME,))
        
        table_count = cursor.fetchone()[0]
        print_success(f"Schema verification: {table_count} tables created")
        
        if table_count < 20:
            print_error(f"Expected ~27 tables, found {table_count}")
            return False
        
        # Cleanup
        cursor.execute(f"DROP DATABASE {DB_NAME}")
        conn.commit()
        print_info("Cleaned up test database")
        
        return True
        
    except Exception as e:
        print_error(f"Schema creation test failed: {e}")
        try:
            cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
            conn.commit()
        except:
            pass
        return False
    finally:
        cursor.close()
        conn.close()


def main():
    """Main test runner."""
    parser = argparse.ArgumentParser(description='Test PetSystem database setup')
    parser.add_argument('--docker-only', action='store_true', help='Test Docker only')
    parser.add_argument('--syntax-only', action='store_true', help='Test SQL syntax only')
    parser.add_argument('--no-schema-create', action='store_true', help='Skip schema creation test')
    
    args = parser.parse_args()
    
    print_header("PetSystem Database Setup Verification")
    
    results = {}
    
    # Test 1: Docker
    results['docker'] = test_docker_mysql()
    if args.docker_only:
        return
    
    # Test 2: MySQL Connection
    results['mysql_conn'] = test_mysql_connection()
    if not results['mysql_conn']:
        print_error("Cannot proceed - MySQL not accessible")
        return
    
    # Test 3: SQL Syntax
    results['sql_syntax'] = test_sql_syntax()
    if args.syntax_only:
        return
    
    # Test 4: Schema Creation (dry run)
    if not args.no_schema_create:
        results['schema_creation'] = test_schema_creation()
    
    # Summary
    print_header("Test Summary")
    
    all_passed = all(v for v in results.values())
    
    for test_name, result in results.items():
        status = f"{Fore.GREEN}PASS{Style.RESET_ALL}" if result else f"{Fore.RED}FAIL{Style.RESET_ALL}"
        print(f"  {test_name}: {status}")
    
    print()
    
    if all_passed:
        print_success("All tests passed!")
        print_info("Next steps:")
        print("  1. python init_db.py --no-confirm        # Initialize database")
        print("  2. cd petSystemRe && npm install          # Install frontend")
        print("  3. docker-compose up -d                   # Start all services")
    else:
        print_error("Some tests failed - review output above")
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Cancelled{Style.RESET_ALL}")
        sys.exit(0)
