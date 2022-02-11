import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const { data } = post;

  function readTime(post: Post) {
    const postWordsCount = post.data.content.reduce((acc, content) => {
      const title = content.heading.split(/\s+/).length;
      const text = RichText.asText(content.body).split(/\s+/).length;
      const totalWords = title + text;

      return acc + totalWords;
    }, 0);
    // console.log(postWordsCount);

    const timeCalc = Math.ceil(postWordsCount / 200);

    return timeCalc;
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <main>
      <Header />
      <img src={data.banner.url} alt="banner" className={styles.banner} />

      <article className={`${commonStyles.container} ${styles.post}`}>
        <h1>{data.title}</h1>
        <header>
          <span>
            <FiCalendar />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>

          <span>
            <FiUser />
            {data.author}
          </span>

          <span>
            <FiClock />
            {`${readTime(post)} min`}
          </span>
        </header>

        {data.content.map(content => {
          return (
            <div key={content.heading}>
              <h2>{content.heading}</h2>

              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          );
        })}
      </article>
    </main>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', context.params.slug, {});

  const { data } = response;

  // console.log(JSON.stringify(data.content, null, 2));
  // console.log(data);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: data.content,
    },
  };

  // console.log(JSON.stringify(post, null, 2));
  // console.log(response);

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutes
  };
};
