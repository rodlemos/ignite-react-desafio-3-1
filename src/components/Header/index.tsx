import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <header className={`${commonStyles.container} ${styles.header}`}>
      <Link href="/">
        <img src="/Logo.svg" alt="logo" />
      </Link>
    </header>
  );
}
