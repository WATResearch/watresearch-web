import katex from 'katex'

export function InlineMath({ math }: { math: string }) {
  const html = katex.renderToString(math, { throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function BlockMath({ math }: { math: string }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false })
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
