import { ELibraryTemplatePage } from './app.po';

describe('ELibrary App', function() {
  let page: ELibraryTemplatePage;

  beforeEach(() => {
    page = new ELibraryTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
