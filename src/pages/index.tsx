import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  const [posts, setPosts] = useState({ next_page, results });

  async function handleLoadMore() {
    const response = await fetch(posts.next_page);
    const newData = await response.json();

    setPosts({
      next_page: newData.next_page,
      results: [...results, ...newData.results],
    });
  }

  return (
    <main className={commonStyles.container}>
      <img src="/logo.svg" alt="logo" className={styles.logo} />
      <div className={styles.posts}>
        {posts.results.map(post => {
          return (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <footer>
                  <time>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>

                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </footer>
              </a>
            </Link>
          );
        })}
      </div>

      {next_page !== null && (
        <button
          type="button"
          className={styles.loadPostsButton}
          onClick={handleLoadMore}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
    }
  );

  // console.log(postsResponse);

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  // console.log(postsPagination);

  return {
    props: { postsPagination },
  };
};
