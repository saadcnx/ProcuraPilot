declare module 'pdf-to-img' {
  export function pdf(
    data: Buffer | string,
    options?: { scale?: number }
  ): Promise<AsyncIterable<Buffer>>;
}