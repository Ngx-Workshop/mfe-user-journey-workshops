import { readingBlocks } from '../../../../../src/app/features/workshop-journey/utils/reading-blocks';

describe('Lesson block mapping', () => {
  it('preserves serialized editor block identities, types, content and actions', () => {
    const blocks = [
      {
        blockId: 'body',
        sortIndex: 2,
        dataClean: '<b>Body</b>',
        componentInstanceName: 'ParagraphBlockComponent',
        savedAction: 'medium',
      },
      {
        blockId: 'title',
        sortIndex: 1,
        dataClean: 'Title',
        componentInstanceName: 'HeaderBlockComponent',
        savedAction: 'h2',
      },
    ];
    expect(readingBlocks(JSON.stringify(blocks))).toEqual(blocks);
  });
  it('adapts legacy HTML and empty pages without displaying the editor default heading', () => {
    expect(readingBlocks('<h2>Legacy lesson</h2>')[0].dataClean).toBe(
      '<h2>Legacy lesson</h2>'
    );
    expect(readingBlocks('[]')[0].dataClean).toBe(
      'This page has no content yet.'
    );
    expect(readingBlocks('')[0].componentInstanceName).toBe(
      'ParagraphBlockComponent'
    );
  });
  it('rejects malformed serialized blocks instead of dropping content', () => {
    expect(() => readingBlocks('[broken')).toThrow();
    expect(() =>
      readingBlocks('[{"dataClean":"Missing identity"}]')
    ).toThrow();
  });
});
