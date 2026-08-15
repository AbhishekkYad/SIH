'use client';
import { useState } from 'react';
import styles from './KnowledgeFAQ.module.css';

interface Article {
  id: string;
  img: string;
  tag1: string;
  tag2: string;
  title: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    img: '/images/logineko/users-and-equipment-on-fields-768x408.jpg',
    tag1: '#Traceability',
    tag2: '#DAGArchitecture',
    title: 'Self-Managed Farm Setup: The architecture behind every verified grain batch',
    authorName: 'Dr. Elena Ristova',
    authorRole: 'Supply Chain Protocol Lead',
    authorAvatar: '/images/logineko/elena-ristova-author-150x150.jpg',
  },
  {
    id: '2',
    img: '/images/logineko/field-operations-at-logineko-768x432.jpg',
    tag1: '#SmartContracts',
    tag2: '#Hyperledger',
    title: 'Multi-Parent Lineage Blending: Preserving farm identity through industrial sortex milling',
    authorName: 'Predrag Baroš',
    authorRole: 'Fabric Chaincode Architect',
    authorAvatar: '/images/logineko/predrag-baros-author-150x150.jpg',
  },
  {
    id: '3',
    img: '/images/logineko/organic-crop-prices-oats-768x432.webp',
    tag1: '#DualQR',
    tag2: '#FSSAITrust',
    title: 'Dual-QR Packaging Security: Eliminating counterfeit barcodes and label cloning',
    authorName: 'Slobodan Barački',
    authorRole: 'Field Verification Director',
    authorAvatar: '/images/logineko/slobodan-baracki-author-150x150.jpg',
  },
];

interface FAQItem {
  id: string;
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'q1',
    q: 'How does FoodTrace prevent QR code cloning and counterfeit packaging?',
    a: 'FoodTrace employs a dual-identity architecture: an open GS1 Digital Link outer QR code on the packaging for consumer journey exploration, paired with a concealed, one-time-verifiable cryptographic credential under a tamper-evident scratch seal. Duplicating the outer QR code yields provenance data but fails physical authenticity proof.',
  },
  {
    id: 'q2',
    q: 'How does FoodTrace handle batch blending and multi-farm processing?',
    a: 'FoodTrace models transformations through a directed acyclic graph (DAG). When grain from five different farm batches is blended during sortex cleaning and milling, the resulting output child batch records cryptographic edges to all five parent batch IDs, preserving full backward lineage and forward blast-radius calculation.',
  },
  {
    id: 'q3',
    q: 'What ledger technology does FoodTrace use and why?',
    a: 'FoodTrace implements a hybrid architecture: Hyperledger Fabric v2.5 for permissioned, multi-organization consensus where state transitions cannot be rewritten, PostgreSQL with graph extensions for sub-millisecond query performance, and IPFS for decentralized storage of heavy compliance media such as pesticide lab assay PDFs and soil test certificates.',
  },
  {
    id: 'q4',
    q: 'How does consumer anomaly feedback trigger an automated POS quarantine in < 200ms?',
    a: 'When consumer incident reports (taste anomalies, broken seals, allergen discrepancies) exceed standard baseline frequency (+300% deviation), the risk engine executes recursive DAG traversal. It traces the root cause upstream to specific milling units and automatically issues a targeted quarantine directive to retail POS terminals for only the affected lot units.',
  },
];

export default function KnowledgeFAQ() {
  const [openId, setOpenId] = useState<string | null>('q1');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className={styles.blockKnowledge} id="knowledge">
      <div className="container">
        <header className="section-intro">
          <span className="eyebrow">KNOWLEDGE BASE &amp; RESEARCH</span>
          <h2 className="heading-2">
            Insights on <strong>food safety, verification, and cryptography.</strong>
          </h2>
          <p className="lead">
            Explore whitepapers, architectural guides, and answers to common ecosystem questions.
          </p>
        </header>

        {/* 3 Knowledge Article Cards */}
        <div className={styles.knowledgeGrid} role="list">
          {ARTICLES.map((art) => (
            <article key={art.id} className={styles.knowledgeCard}>
              <div className={styles.cardImageWrap}>
                <img src={art.img} alt={art.title} loading="lazy" />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.tagRow}>
                  <span className="chip chip--green">{art.tag1}</span>
                  <span className="chip">{art.tag2}</span>
                </div>
                <h3 className={styles.cardTitle}>{art.title}</h3>
                <div className={styles.cardFooter}>
                  <div className={styles.authorAvatar}>
                    <img src={art.authorAvatar} alt={art.authorName} />
                  </div>
                  <div>
                    <div className={styles.authorName}>{art.authorName}</div>
                    <div className={styles.authorRole}>{art.authorRole}</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className={styles.faqSection}>
          <div className={styles.faqHeader}>
            <span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h3 className="heading-3">Understanding the FoodTrace Platform</h3>
          </div>

          <div className={styles.faqList}>
            {FAQS.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className={styles.faqCard}>
                  <button
                    className={styles.faqQuestionBtn}
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className={styles.faqIcon}>{isOpen ? '−' : '+'}</span>
                  </button>

                  {isOpen && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
