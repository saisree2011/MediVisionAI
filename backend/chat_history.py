from backend.db import get_db_connection


def create_conversation(user_id, title):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO conversations (user_id, title)
    VALUES (%s, %s)
    """

    cursor.execute(query, (user_id, title))

    conversation_id = cursor.lastrowid

    connection.commit()

    cursor.close()
    connection.close()

    return conversation_id


def save_message(conversation_id, sender, message):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO messages (conversation_id, sender, message)
    VALUES (%s, %s, %s)
    """

    cursor.execute(query, (conversation_id, sender, message))

    connection.commit()

    cursor.close()
    connection.close()


def get_user_conversations(user_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT conversation_id, title, created_at
    FROM conversations
    WHERE user_id = %s
    ORDER BY created_at DESC
    """

    cursor.execute(query, (user_id,))
    conversations = cursor.fetchall()

    cursor.close()
    connection.close()

    return conversations


def get_conversation_messages(conversation_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT sender, message
    FROM messages
    WHERE conversation_id = %s
    ORDER BY message_id ASC
    """

    cursor.execute(query, (conversation_id,))
    messages = cursor.fetchall()

    cursor.close()
    connection.close()

    return messages