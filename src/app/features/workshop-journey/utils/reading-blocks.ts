import { NgxEditorJsBlock } from '@tmdjr/ngx-editor-js2';

/** Keep the document editor's serialized blocks intact; adapt legacy HTML pages. */
export function readingBlocks(html: string): NgxEditorJsBlock[] {
  if (!html.trim().startsWith('['))
    return [paragraph(html || 'This page has no content yet.')];
  const blocks: unknown = JSON.parse(html);
  if (!Array.isArray(blocks) || !blocks.every(isBlock))
    throw new Error('Invalid document blocks');
  return blocks.length
    ? blocks
    : [paragraph('This page has no content yet.')];
}

function isBlock(value: unknown): value is NgxEditorJsBlock {
  return (
    typeof value === 'object' &&
    value !== null &&
    'blockId' in value &&
    typeof value.blockId === 'string' &&
    'sortIndex' in value &&
    typeof value.sortIndex === 'number' &&
    Number.isFinite(value.sortIndex) &&
    'componentInstanceName' in value &&
    typeof value.componentInstanceName === 'string' &&
    'dataClean' in value &&
    typeof value.dataClean === 'string' &&
    (!('savedAction' in value) ||
      value.savedAction === undefined ||
      typeof value.savedAction === 'string')
  );
}

function paragraph(dataClean: string): NgxEditorJsBlock {
  return {
    blockId: 'workshop-page',
    sortIndex: 0,
    componentInstanceName: 'ParagraphBlockComponent',
    dataClean,
  };
}
