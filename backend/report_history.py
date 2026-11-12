from backend.db import get_db_connection

def get_user_reports(user_id):

    connection = get_db_connection()

    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT report_id, file_name, analysis, uploaded_at
    FROM medical_reports
    WHERE user_id = %s
    ORDER BY uploaded_at DESC
    """

    cursor.execute(query, (user_id,))

    reports = cursor.fetchall()

    cursor.close()
    connection.close()

    return reports