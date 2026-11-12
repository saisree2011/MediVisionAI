from werkzeug.security import generate_password_hash, check_password_hash
from backend.db import get_db_connection


def register_user(name, email, password):

    connection = get_db_connection()
    cursor = connection.cursor()

    hashed_password = generate_password_hash(password)

    query = """
    INSERT INTO users (name, email, password)
    VALUES (%s, %s, %s)
    """

    cursor.execute(query, (name, email, hashed_password))

    connection.commit()

    cursor.close()
    connection.close()


def login_user(email, password):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = "SELECT * FROM users WHERE email = %s"

    cursor.execute(query, (email,))

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if user and check_password_hash(user["password"], password):
        return user

    return None