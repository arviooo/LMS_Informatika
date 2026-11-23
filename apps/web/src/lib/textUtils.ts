/**
 * Menghapus sintaks Markdown/HTML dasar (seperti **teks**, *teks*, __teks__, # judul, <u>teks</u>)
 * sehingga judul atau ringkasan tugas selalu tampil rapi tanpa tanda bintang (**) mentah.
 */
export function stripMarkdown(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/<\/?u>/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\*\*/g, '')
    .trim();
}
