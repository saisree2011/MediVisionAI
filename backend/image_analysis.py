from backend.db import get_db_connection


def save_image_analysis(user_id, image_name, analysis):

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO medical_images
    (user_id, image_name, analysis)
    VALUES (%s, %s, %s)
    """

    cursor.execute(
        query,
        (user_id, image_name, analysis)
    )

    connection.commit()

    cursor.close()
    connection.close()

def get_user_image_history(user_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT image_id, image_name, analysis, uploaded_at
    FROM medical_images
    WHERE user_id = %s
    ORDER BY uploaded_at DESC
    """

    cursor.execute(query, (user_id,))
    images = cursor.fetchall()

    cursor.close()
    connection.close()

    return images