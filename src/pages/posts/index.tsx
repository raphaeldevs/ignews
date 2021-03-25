import { GetStaticProps } from 'next'
import Head from 'next/head'

import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic'

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

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient() 

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.content'],
    pageSize: 100
  })

  console.log(JSON.stringify(response, null, 2))

  return {
    props: {}
  }
}