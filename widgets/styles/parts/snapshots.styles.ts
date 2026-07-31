import {css} from "lit"

export const snapshotsStyles = css`
  .snapshots-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.56);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 30;
  }
  .snapshots-overlay__dialog {
    width: min(1040px, 100%);
    max-height: 100%;
    overflow: auto;
    border: 1px solid #d6dce4;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.3);
    padding: 14px;
    display: grid;
    gap: 12px;
  }
  .snapshots-overlay__header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .snapshots-overlay__header h3 { margin: 0; font-size: 1.05rem; }
  .snapshots-overlay__actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
  .snapshots-overlay__empty {
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    color: #334155;
    padding: 12px;
    font-size: 0.9rem;
  }
  .snapshots-overlay__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; align-content: start; }
  .snapshots-overlay__snapshot-card {
    border: 1px solid #d6dce4;
    border-radius: 10px;
    padding: 10px;
    display: grid;
    gap: 8px;
    background: #ffffff;
  }
  .snapshots-overlay__snapshot-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .snapshots-overlay__snapshot-meta { display: grid; gap: 2px; min-width: 0; }
  .snapshots-overlay__snapshot-title { font-weight: 600; color: #0f172a; }
  .snapshots-overlay__snapshot-time { color: #475569; font-size: 0.8rem; }
  .snapshots-overlay__delete-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    background: #ffffff;
    cursor: pointer;
    line-height: 1;
  }
  .snapshots-overlay__delete-button:hover { background: #fef2f2; }
  .snapshots-overlay__snapshot-image {
    width: 100%;
    height: min(20vh, 190px);
    min-height: 140px;
    border: 1px solid #d6dce4;
    border-radius: 8px;
    object-fit: contain;
    background: #f8fafc;
  }
  .snapshots-overlay__snapshot-details { border-top: 1px solid #e2e8f0; padding-top: 6px; }
  .snapshots-overlay__snapshot-details::part(base) { border: none; border-radius: 0; padding: 0; }
  .snapshots-overlay__snapshot-details::part(header) { padding: 0 0 6px 0; color: #334155; font-size: 0.82rem; }
  .snapshots-overlay__snapshot-details::part(content) { padding: 0; }
  .snapshots-overlay__snapshot-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
    font-size: 0.82rem;
    color: #334155;
    font-variant-numeric: tabular-nums;
  }
  .snapshots-overlay__snapshot-grid strong { color: #0f172a; }
  @media (max-width: 600px) {
    .snapshots-overlay { padding: 8px; }
    .snapshots-overlay__dialog { padding: 10px; border-radius: 8px; }
    .snapshots-overlay__snapshot-image { height: min(18vh, 150px); min-height: 120px; }
  }
`
