# Integration Boundaries & External Synchronization

## 1. EXPA / GIS Integration

- **Role of EXPA**: Authoritative source of truth for global EP registration, global exchange statuses (`APP`, `ACC`, `APD`, `RE`, `FI`, `CO`), and official surveys.
- **Sync Architecture**:
  - **Read Sync**: Periodic ingestion into local staging tables (`expa_sync_runs`, `expa_sync_items`) with checksum deduplication.
  - **Manual Fallback**: Robust CSV/XLSX import engine mapping legacy exports directly into relational tables with dry-run validation.
  - **Data Reconciliation**: Side-by-side comparison screen highlighting discrepancies between local operational state and EXPA records.
  - **Gated Write Operations**: Direct EXPA status mutations are disabled by default. If enabled via verified MC credentials, all mutations require explicit human sign-off in the Approval Center.

## 2. Google Drive & Document Vault

- Used for contract archives, signed acceptance notes, and IAC audit packets.
- Ingestion pipeline extracts text and metadata for RAG indexing in `pgvector`.
- Access tokens scoped with least privilege.

## 3. Communication Channels (Email & WhatsApp)

- **Email**: Prepares drafted messages for user confirmation. Automated sends restricted to system transactional notifications (e.g., password reset, internal task assignments).
- **WhatsApp**: No unofficial browser scraping or personal account automation. Integration reserved strictly for verified WhatsApp Business Cloud API.
