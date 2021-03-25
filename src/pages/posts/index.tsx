import Head from 'next/head'

import styles from './styles.module.scss'

export default function Posts() {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <a href="#">
            <time>25 de março de 2021</time>
            <strong>Is Java still worth learning?</strong>
            <p>Learning to program has become a differentiator, many schools and teaching centers are already adopting the discipline in their curriculum, however it is necessary ...</p>
          </a>
          <a href="#">
            <time>25 de março de 2021</time>
            <strong>Is Java still worth learning?</strong>
            <p>Learning to program has become a differentiator, many schools and teaching centers are already adopting the discipline in their curriculum, however it is necessary ...</p>
          </a>
          <a href="#">
            <time>25 de março de 2021</time>
            <strong>Is Java still worth learning?</strong>
            <p>Learning to program has become a differentiator, many schools and teaching centers are already adopting the discipline in their curriculum, however it is necessary ...</p>
          </a>
          <a href="#">
            <time>25 de março de 2021</time>
            <strong>Is Java still worth learning?</strong>
            <p>Learning to program has become a differentiator, many schools and teaching centers are already adopting the discipline in their curriculum, however it is necessary ...</p>
          </a>
        </div>
      </main>
    </>
  )
}