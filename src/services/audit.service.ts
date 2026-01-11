import db from "../DB/config";

export interface AuditEntry {
	actorUserId: string;
	actorRole: string;
	action: string;
	objectType: string;
	objectId: string;
	metadata: object;
}
interface AuditLog {
	id: number;
	actorUserId: string;
	actorRole: string;
	action: string;
	objectType: string;
	objectId: string;
	metadata: Record<string, any>;
	timestamp: string;
}
interface RawAuditRow {
	id: number;
	actor_user_id: string;
	actor_role: string;
	action: string;
	object_type: string;
	object_id: string;
	metadata: string | null;
	timestamp: string;
}
export const writeAuditLogsToDb = (entry: AuditEntry) => {
	const query = `
    INSERT INTO audit_logs (actor_user_id, actor_role, action, object_type, object_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
	const stmt = db.prepare(query);
	stmt.run(
		entry.actorUserId,
		entry.actorRole,
		entry.action,
		entry.objectType,
		entry.objectId,
		JSON.stringify(entry.metadata),
	);
};

export const readAllAuditLogsToDb = (): AuditLog[] => {
	const query = `SELECT * FROM audit_logs ORDER BY timestamp DESC`;
	const rows = db.prepare(query).all() as RawAuditRow[];
	return rows.map((row) => ({
		id: row.id,
		actorUserId: row.actor_user_id,
		actorRole: row.actor_role,
		action: row.action,
		objectType: row.object_type,
		objectId: row.object_id,
		timestamp: row.timestamp,
		metadata: row.metadata ? JSON.parse(row.metadata) : {},
	}));
};
