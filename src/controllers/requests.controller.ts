import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import db from "../DB/config";
import { type AuditEntry, writeAuditLogsToDb } from "../services/audit.service";

export const createRequests = async (req: Request, res: Response) => {
	try {
		const { factoryId, title, items } = req.body;
		const request_id = `R-${Math.floor(Math.random() * 1000)}`;
		const buyer_id = req.user.userId;
		const insertRequest = db.prepare(`
  INSERT INTO requests (id, buyer_id, factory_id, title)
  VALUES (?, ?, ?, ?)
`);

		const insertItem = db.prepare(`
  INSERT INTO request_items (id, request_id, doc_type)
  VALUES (?, ?, ?)
`);
		db.transaction(() => {
			insertRequest.run(request_id, buyer_id, factoryId, title);
			for (const item of items) {
				const itemId = randomUUID();

				insertItem.run(itemId, request_id, item.docType);
			}
		})();
		const entry: AuditEntry = {
			action: "CREATE_REQUEST",
			objectType: "Request",
			objectId: request_id,
			actorRole: "buyer",
			actorUserId: buyer_id,
			metadata: {
				factoryId,
				itemCount: items.length,
			},
		};

		writeAuditLogsToDb(entry);
		res.status(201).json({
			request_id,
			items,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
export const getAllRequests = async (req: Request, res: Response) => {
	try {
		const factory_id = req.user.factoryId;
		const query = `SELECT r.*, i.*
FROM requests r
JOIN request_items i ON i.request_id = r.id
WHERE r.factory_id = ?;
`;
		const smtm = db.prepare(query).all(factory_id);
		res.status(200).json({
			requests: smtm,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
export const requestItemsFullfilled = async (req: Request, res: Response) => {
	try {
		const { requestId, itemId } = req.params;
		const { evidenceId, versionId } = req.body;
		const factory_id = req.user.factoryId;

		const checkreqquery = db.prepare(`
  SELECT r.id
FROM requests r
JOIN request_items i ON i.request_id = r.id
WHERE r.id = ?
  AND i.id = ?
  AND r.factory_id = ?;
`);
		const checkequery = db.prepare(`
  SELECT id
FROM evidence
WHERE id = ?
  AND factory_id = ?;

`);
		const updatequery = db.prepare(`
UPDATE request_items
SET status = 'FULFILLED',
    fulfilled_evidence_version_id = ?,
    fulfilled_at = CURRENT_TIMESTAMP
WHERE id = ?;

`);
		db.transaction(() => {
			const reqRow = checkreqquery.get(requestId, itemId, factory_id);
			if (!reqRow) {
				throw new Error("Request item does not belong to this factory");
			}
			const evRow = checkequery.get(evidenceId, factory_id);
			if (!evRow) {
				throw new Error("Evidence does not belong to this factory");
			}
			const fulfilled_evidence_version_id = JSON.stringify({
				evidenceId,
				versionId,
			});
			updatequery.run(fulfilled_evidence_version_id, itemId);
			db.prepare(`
    UPDATE requests
    SET status = 'COMPLETE'
    WHERE id = ?
      AND NOT EXISTS (
        SELECT 1 FROM request_items
        WHERE request_id = ?
          AND status != 'FULFILLED'
      );
  `).run(requestId, requestId);
		})();
		const entry: AuditEntry = {
			action: "FULFILL_ITEM",
			objectType: "RequestItem",
			objectId: itemId as string,
			actorRole: req.user.role,
			actorUserId: req.user.userId,
			metadata: {
				requestId,
				factory_id,
				evidenceId,
				versionId,
				previousStatus: "PENDING",
				newStatus: "FULFILLED",
			},
		};

		writeAuditLogsToDb(entry);
		res.status(201).json({
			itemId,
			status: "FULFILLED",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
