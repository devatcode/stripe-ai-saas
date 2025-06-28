from flask import Flask, request, jsonify
from datetime import datetime, timedelta

app = Flask(__name__)

# Assuming you have MongoDB client setup like:
# from pymongo import MongoClient
# client = MongoClient("your-mongo-connection-string")
# db = client["your-db-name"]

db = {}  # placeholder for demonstration

@app.route('/admin/logs', methods=['GET'])
def get_admin_logs():
    email = request.headers.get("X-Admin-Email")
    owner_roles = {"owner@domain.com": "owner"}
    if email not in owner_roles:
        return jsonify({"error": "Not authorized"}), 403

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    admin_filter = request.args.get("admin", "")
    action_filter = request.args.get("action", "")
    sort_option = request.args.get("sort", "timestamp-desc")
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    query = {}
    if admin_filter:
        query["admin"] = {"$regex": admin_filter, "$options": "i"}
    if action_filter:
        query["action"] = {"$regex": action_filter, "$options": "i"}

    # Date filtering
    date_filter = {}
    date_format = "%Y-%m-%d"
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, date_format)
            date_filter["$gte"] = start_date
        except ValueError:
            pass
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, date_format) + timedelta(days=1)
            date_filter["$lt"] = end_date
        except ValueError:
            pass

    if date_filter:
        query["timestamp"] = date_filter

    sort_field, sort_dir = ("timestamp", -1) if sort_option == "timestamp-desc" else ("timestamp", 1)

    total = db.get("admin_logs", []).count_documents(query) if hasattr(db.get("admin_logs", []), "count_documents") else 0
    logs = []
    if hasattr(db.get("admin_logs", []), "find"):
        logs = list(
            db["admin_logs"]
            .find(query, {"_id": 0})
            .sort(sort_field, sort_dir)
            .skip((page - 1) * limit)
            .limit(limit)
        )
    return jsonify({"logs": logs, "totalPages": (total + limit - 1) // limit})


@app.route('/admin/logs/export', methods=['GET'])
def export_logs_csv():
    email = request.headers.get("X-Admin-Email")
    owner_roles = {"owner@domain.com": "owner"}
    if email not in owner_roles:
        return jsonify({"error": "Not authorized"}), 403

    admin_filter = request.args.get("admin", "")
    action_filter = request.args.get("action", "")
    sort_option = request.args.get("sort", "timestamp-desc")
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    query = {}
    if admin_filter:
        query["admin"] = {"$regex": admin_filter, "$options": "i"}
    if action_filter:
        query["action"] = {"$regex": action_filter, "$options": "i"}

    date_filter = {}
    date_format = "%Y-%m-%d"
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, date_format)
            date_filter["$gte"] = start_date
        except ValueError:
            pass
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, date_format) + timedelta(days=1)
            date_filter["$lt"] = end_date
        except ValueError:
            pass

    if date_filter:
        query["timestamp"] = date_filter

    sort_field, sort_dir = ("timestamp", -1) if sort_option == "timestamp-desc" else ("timestamp", 1)
    logs = []
    if hasattr(db.get("admin_logs", []), "find"):
        logs = list(
            db["admin_logs"]
            .find(query, {"_id": 0})
            .sort(sort_field, sort_dir)
        )

    import csv
    from io import StringIO
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Admin", "Role", "Action", "Timestamp"])
    for log in logs:
        writer.writerow([
            log.get("admin", ""),
            log.get("role", ""),
            log.get("action", ""),
            log.get("timestamp", "")
        ])

    from flask import Response
    return Response(output.getvalue(), mimetype='text/csv', headers={
        "Content-Disposition": "attachment; filename=admin_logs.csv"
    })

if __name__ == "__main__":
    app.run(debug=True)
