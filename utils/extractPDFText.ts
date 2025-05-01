import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export async function extractPDFText(url: string) {
  const res = await fetch(url);
  const blog = await res.blob();

  const arrayBuffer = await blog.arrayBuffer();

  const loader = new WebPDFLoader(
    new Blob([arrayBuffer], { type: "application/pdf" })
  );
  const docs = await loader.load();

  return docs.map((doc) => doc.pageContent).join("\n");
}
