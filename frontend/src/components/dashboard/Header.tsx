import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.welcome}>
        👋 Welcome, <strong>admin</strong>
      </div>
      <div className={styles.actions}>
        <div className={styles.org}>
          [Organisation: <span>Admin</span>]
        </div>
        <div className={styles.avatar}>A</div>
      </div>
    </header>
  );
}
