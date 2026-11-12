from backend.db import get_db_connection

def save_health_metrics(user_id, height, weight, bmi):
    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO health_metrics (user_id, height, weight, bmi)
    VALUES (%s, %s, %s, %s)
    """

    cursor.execute(query, (user_id, height, weight, bmi))
    connection.commit()

    cursor.close()
    connection.close()

def get_health_history(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT height, weight, bmi, recorded_at
    FROM health_metrics
    WHERE user_id = %s
    ORDER BY recorded_at DESC
    """

    cursor.execute(query, (user_id,))
    records = cursor.fetchall()

    cursor.close()
    connection.close()

    return records