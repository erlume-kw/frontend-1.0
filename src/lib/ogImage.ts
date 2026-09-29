// Link-preview crawlers (WhatsApp especially, most aggressively on iOS) time out or refuse
// to fetch og:image when the file is heavy — an unresized upload can easily be 2MB+. This
// caps it to a reasonable preview size (auto quality) so it fetches fast and stays crisp,
// without cropping (c_limit preserves aspect ratio, only shrinks if the image is bigger).
export function capPreviewImage(url: string): string {
  return url.replace('/upload/', '/upload/w_1200,h_1200,c_limit,q_auto/');
}
