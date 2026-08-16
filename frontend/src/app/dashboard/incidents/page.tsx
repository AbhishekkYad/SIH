'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const MOCK_INCIDENTS = [
  { id: 'INC-9942', unitId: 'UNIT-1002', category: 'Spoilage', reporter: 'Consumer (App)', status: 'NEW', evidenceCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' },
  { id: 'INC-9941', unitId: 'UNIT-1001', category: 'Packaging Defect', reporter: 'Retailer', status: 'IN_REVIEW', evidenceCid: 'QmTp2hEo8eXRp6wg7jXv1qE9RzT3fV4dJkLKmNgG1BqCw' },
  { id: 'INC-9938', unitId: 'UNIT-0892', category: 'Taste/Odor', reporter: 'Consumer (Web)', status: 'RESOLVED', evidenceCid: 'Qm...' },
];

export default function IncidentsPage() {
  const [incidents] = useState(MOCK_INCIDENTS);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.title}>Admin / Risk & Consumer Incidents</div>
      </div>

      <div className={styles.controls}>
        <input type="text" placeholder="Search incidents by ID or Unit..." className={styles.search} />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Unit Affected</th>
              <th>Category</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>IPFS Evidence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <tr key={inc.id}>
                <td style={{fontWeight: 600}}>{inc.id}</td>
                <td>{inc.unitId}</td>
                <td>{inc.category}</td>
                <td>{inc.reporter}</td>
                <td>
                  <span className={`${styles.status} ${inc.status === 'NEW' ? styles.statusNew : inc.status === 'IN_REVIEW' ? styles.statusReview : styles.statusResolved}`}>
                    {inc.status}
                  </span>
                </td>
                <td>
                  {inc.evidenceCid.length > 10 ? (
                    <a href={`https://ipfs.io/ipfs/${inc.evidenceCid}`} target="_blank" rel="noreferrer" className={styles.cidLink}>
                      {inc.evidenceCid.substring(0,10)}...
                    </a>
                  ) : '-'}
                </td>
                <td>
                  <button style={{background:'transparent', border:'none', cursor:'pointer', fontSize:'20px'}}>⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
