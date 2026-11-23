import sys
import json
import os

try:
    import psycopg2
except ImportError:
    print("psycopg2 not found. Please run: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python log_activity.py '<json_payload>'", file=sys.stderr)
        sys.exit(1)
    
    try:
        data = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        print("Invalid JSON payload", file=sys.stderr)
        sys.exit(1)

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set", file=sys.stderr)
        sys.exit(1)

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO system_activity (id, action, resource_type, resource_id, actor_id, actor_name, actor_role, details)
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get("action", ""),
            data.get("resource_type"),
            data.get("resource_id"),
            data.get("actor_id"),
            data.get("actor_name", ""),
            data.get("actor_role", ""),
            json.dumps(data.get("details", {}))
        ))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()