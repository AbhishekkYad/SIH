'use client';
import { useState } from 'react';
import styles from './KnowledgeFAQ.module.css';

interface KnowledgeArticle {
  title: string;
  excerpt: string;
  readTime: string;
  author: string;
  tag: string;
}

interface FAQItem {
  q: string;
  a: string;
}

const KNOWLEDGE_CATEGORIES: { id: string; label: string; articles: KnowledgeArticle[] }[] = [
  {
    id: 'traceability',
    label: 'Traceability',
    articles: [
      {
        title: 'What is food traceability?',
        excerpt: 'The capability to trace and follow a food product, feed, or food-producing substance through all stages of production, processing, and distribution.',
        readTime: '3 min read',
        author: 'Dr. Elena Ristova',
        tag: 'CORE FOUNDATION',
      },
      {
        title: 'Why is batch-level tracking important?',
        excerpt: 'Bulk mixing obfuscates contamination origins. Tracking parent-child batch transformations enables targeted recall isolation without discarding safe harvests.',
        readTime: '4 min read',
        author: 'Slobodan Baracki',
        tag: 'BATCH RECURSION',
      },
      {
        title: 'How does end-to-end traceability work?',
        excerpt: 'From seed sowing, soil health inputs, and harvest geofencing through milling, cold freight transit, retail shelf stock, and end-consumer smartphone scan.',
        readTime: '5 min read',
        author: 'Predrag Baros',
        tag: 'DAG LEDGER',
      },
    ],
  },
  {
    id: 'verification',
    label: 'Verification',
    articles: [
      {
        title: 'How does QR verification work?',
        excerpt: 'GS1 Digital Link dynamic QR codes bind a physical item to its digital twin on-chain, verifying cryptographic authenticity upon smartphone scan.',
        readTime: '3 min read',
        author: 'Tech Working Group',
        tag: 'GS1 DIGITAL LINK',
      },
      {
        title: 'What information can consumers verify?',
        excerpt: 'Origin farm cluster, harvest date, sortex purity, NABL pesticide test certificates, storage temperature adherence, and authorized retail chain.',
        readTime: '4 min read',
        author: 'Consumer Safety Council',
        tag: 'TRANSPARENCY',
      },
      {
        title: 'How are product records authenticated?',
        excerpt: 'Each supply chain handover is signed with W3C Decentralized Identifiers (DIDs) and validated across Hyperledger Fabric multi-org consensus.',
        readTime: '4 min read',
        author: 'Cryptography Team',
        tag: 'W3C DID',
      },
    ],
  },
  {
    id: 'supply-chain',
    label: 'Supply Chain',
    articles: [
      {
        title: 'What information is captured at each stage?',
        excerpt: 'Mass balance weight, moisture content, temperature telemetry, GPS checkpoints, laboratory analysis results, and responsible custodian IDs.',
        readTime: '4 min read',
        author: 'Logistics Operations',
        tag: 'DATA SCHEMA',
      },
      {
        title: 'How are stakeholders connected?',
        excerpt: 'Through a permissioned smart-contract layer that synchronizes state across disparate ERPs, APMC mandi registers, and warehouse management systems.',
        readTime: '5 min read',
        author: 'Integration Architecture',
        tag: 'INTEROPERABILITY',
      },
      {
        title: 'How are batches tracked across locations?',
        excerpt: 'Automated scan-in / scan-out custody protocols at logistics hubs and distribution centers stream live tracking events to the blockchain.',
        readTime: '4 min read',
        author: 'Field Ops Lead',
        tag: 'IOT SENSORS',
      },
    ],
  },
  {
    id: 'consumer',
    label: 'Consumer',
    articles: [
      {
        title: 'How do I scan a product?',
        excerpt: 'Open your standard smartphone camera app, point it at the QR code on the packaging, and tap the link to open the verifiable provenance timeline.',
        readTime: '2 min read',
        author: 'User Experience Team',
        tag: 'NO APP NEEDED',
      },
      {
        title: 'What happens after I report an issue?',
        excerpt: 'Your verified sensory report is logged with the batch ID. When complaint density crosses anomaly thresholds, automated quarantine protocols activate.',
        readTime: '4 min read',
        author: 'Quality Response Team',
        tag: 'AUTOMATED ESCALATION',
      },
      {
        title: 'How does consumer feedback affect accountability?',
        excerpt: 'Feedback directly influences supplier quality scoring, triggers targeted warehouse audits, and ensures substandard batches never repeat.',
        readTime: '3 min read',
        author: 'Policy & Safety Dept',
        tag: 'CLOSED LOOP',
      },
    ],
  },
];

const FAQS: FAQItem[] = [
  {
    q: 'What is this platform?',
    a: 'A digital food traceability system that connects stakeholders across the supply chain and creates a verifiable journey for every product or batch.',
  },
  {
    q: 'How does product traceability work?',
    a: 'Each product or batch is connected to digital records that capture important events as it moves through the supply chain.',
  },
  {
    q: 'Who can use the platform?',
    a: 'Farmers, processors, manufacturers, warehouses, distributors, retailers and consumers can interact with the ecosystem according to their role and permissions.',
  },
  {
    q: 'How does QR verification work?',
    a: 'A QR code connects the physical product to its digital record, allowing authorised users or consumers to verify relevant product information.',
  },
  {
    q: 'Can consumers report a problem?',
    a: 'Yes. Consumers can scan the product and submit feedback about issues such as damaged packaging, poor quality, incorrect labelling or suspected contamination.',
  },
  {
    q: 'What happens when an issue is reported?',
    a: 'The feedback is associated with the relevant product or batch and can help identify the supply-chain layer that needs investigation or action.',
  },
  {
    q: 'Can businesses monitor their entire supply chain?',
    a: 'Yes. Businesses can view relevant product, batch, movement and verification information through a centralised interface.',
  },
  {
    q: 'Is every stakeholder allowed to see everything?',
    a: 'No. The ecosystem follows a permissioned model where access to information depends on the stakeholder’s role and responsibilities.',
  },
  {
    q: 'What is the benefit for consumers?',
    a: 'Consumers gain greater visibility into where their food comes from and can verify relevant product information before or after purchase.',
  },
  {
    q: 'What is the benefit for businesses?',
    a: 'Businesses gain better supply-chain visibility, stronger accountability, faster issue identification and an opportunity to build greater consumer trust.',
  },
];

export default function KnowledgeFAQ() {
  const [activeCategory, setActiveCategory] = useState<string>('traceability');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentCat = KNOWLEDGE_CATEGORIES.find((c) => c.id === activeCategory) || KNOWLEDGE_CATEGORIES[0];
  const filteredArticles = currentCat.articles.filter((a) =>
    searchQuery ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <section className={styles.section} id="knowledge">
      <div className="container">
        {/* Knowledge Base Header */}
        <div className={styles.header}>
          <span className="eyebrow">RESEARCH, PROTOCOLS &amp; STANDARDS</span>
          <h2 className={styles.title}>
            Knowledge Base: <strong>Mastering food traceability.</strong>
          </h2>
          <p className={styles.lead}>
            Explore verified architectural whitepapers, cryptographic protocols, and consumer safety guidelines across four key domains.
          </p>
        </div>

        {/* Category Tab Selector + Search Bar */}
        <div className={styles.controlsRow}>
          <div className={styles.catTabs}>
            {KNOWLEDGE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.catTab} ${activeCategory === cat.id ? styles.catTabActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.searchBar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search knowledge articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className={styles.articlesGrid}>
          {filteredArticles.map((art, idx) => (
            <div key={idx} className={styles.articleCard}>
              <div className={styles.artHead}>
                <span className={styles.artTag}>{art.tag}</span>
                <span className={styles.artTime}>{art.readTime}</span>
              </div>
              <h3 className={styles.artTitle}>{art.title}</h3>
              <p className={styles.artExcerpt}>{art.excerpt}</p>
              <div className={styles.artFooter}>
                <span className={styles.artAuthor}>By {art.author}</span>
                <span className={styles.artLink}>Read Whitepaper →</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ Section (Requirement 12) ── */}
        <div className={styles.faqWrap}>
          <div className={styles.faqHeader}>
            <span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className={styles.faqTitle}>
              Everything you need to know about <strong>FoodTrace</strong>.
            </h2>
            <p className={styles.faqLead}>
              Clear, professional answers to common questions about platform functionality, data privacy, and stakeholder integration.
            </p>
          </div>

          <div className={styles.faqList}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
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
