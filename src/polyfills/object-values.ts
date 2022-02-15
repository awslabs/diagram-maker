// Polyfill for Object.values
if (!(Object as any).values) {
  (Object as any).values = (src: any) => Object.keys(src)
    .map((key: string) => src[key]);
}
