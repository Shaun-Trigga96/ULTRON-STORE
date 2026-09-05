const fs = require('fs');
const file = 'services/inventory-service/src/index.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    // 6. DB Schema check`;
const replacementStr = `    // 5.5 Redis Redlock Commit Sale (Transition from Locked to Sold)
    if (pathname === '/api/v1/inventory/commit-sale' && req.method === 'POST') {
      const body = await parseBody(req);
      const { imei, sessionId } = body;
      
      const { rows } = await query(
        "UPDATE ultron_inventory.inventory_items SET status = 'SOLD', active_lock_session_id = NULL, lock_expires_at = NULL WHERE imei = $1 AND active_lock_session_id = $2 RETURNING id",
        [imei, sessionId]
      );
      
      if (rows.length === 0) {
        return sendJson(res, 400, { success: false, error: 'Failed to commit sale. Lock invalid or IMEI mismatch.' });
      }
      
      return sendJson(res, 200, { success: true, message: 'Stock successfully committed as SOLD.' });
    }

    // 6. DB Schema check`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
