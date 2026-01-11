import type { Request, Response } from "express";

import db from "../DB/config";
import { type AuditEntry, writeAuditLogsToDb } from "../services/audit.service";

export const createEvidence = async (req: Request, res: Response) => {
	try {
		const { name, docType, expiry, notes } = req.body;
		const evidence_id = `E-${Math.floor(Math.random() * 1000)}`;
		const factory_id = req.user.factoryId;
		const equery = `
    INSERT INTO evidence (id, factory_id, name, doc_type)
    VALUES (?, ?, ?, ?)
  `;
		const esmtmt = db.prepare(equery);
		esmtmt.run(evidence_id, factory_id, name, docType);
		const evidence_v_id = `V-${Math.floor(Math.random() * 1000)}`;
		const evquery = `
    INSERT INTO evidence_versions (id, evidence_id, version_number, expiry, notes)
    VALUES (?, ?, ?, ?, ?)
  `;
		const evsmtmt = db.prepare(evquery);
		evsmtmt.run(evidence_v_id, evidence_id, 1, expiry, notes);
		const entry: AuditEntry = {
			action: "CREATE_EVIDENCE",
			objectType: "Evidence",
			objectId: evidence_id,
			actorRole: req.user.role,
			actorUserId: req.user.userId,
			metadata: {
				factoryId: factory_id,
				docType: docType,
				version: 1,
			},
		};

		writeAuditLogsToDb(entry);
		res.status(201).json({
			EvidenceId: evidence_id,
			VersionId: evidence_v_id,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
export const createEvidenceVersion = async (req: Request, res: Response) => {
	try {
		const { evidenceId } = req.params;
		const { expiry, notes } = req.body;
		const factory_id = req.user.factoryId;
		const evidence_v_id = `V-${Math.floor(Math.random() * 1000)}`;
		const evquery = `
  INSERT INTO evidence_versions (id, evidence_id, version_number, expiry, notes)
  VALUES (
    ?, 
    ?, 
    (SELECT COALESCE(MAX(version_number), 0) + 1 FROM evidence_versions WHERE evidence_id = ?), 
    ?, 
    ?
  )
`;

		const evsmtmt = db.prepare(evquery);

		evsmtmt.run(evidence_v_id, evidenceId, evidenceId, expiry, notes);
		const entry: AuditEntry = {
			action: "CREATE_EVIDENCE",
			objectType: "Version",
			objectId: evidenceId as string,
			actorRole: req.user.role,
			actorUserId: req.user.userId,
			metadata: {
				factoryId: factory_id,
			},
		};

		writeAuditLogsToDb(entry);
		res.status(201).json({
			message: "Version is Created",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
