const puppeteer = require('puppeteer');
console.log('開始します');
const scrapeing_proengineer = async () => {
  const browser = await puppeteer.launch();

  // Yahooニュースの検索結果ページを開く
  const page = await browser.newPage();
  const url = 'https://news.yahoo.co.jp/search?p=【こつこつ防災】&ei=utf-8';
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // 各記事のタイトルとリンク先を取得
  const target = '.newsFeed_item_link';
  const links = await page.$$eval(target, items => {
    return items.map(item => {
      const titleElement = item.querySelector('.newsFeed_item_title'); // タイトル要素を探す
      const create_at = item.querySelector('.newsFeed_item_date');
      return {
        title: titleElement ? titleElement.textContent : '', // タイトルテキスト
        href: item.getAttribute('href'), // リンク先
        create_at: create_at ? create_at.textContent : ''
      };
    });
  });

  // 各記事のタイトルとリンク先を一覧で出力しブラウザを閉じる
  links.forEach(item => {
    console.log(`${item.title}: ${item.href}: ${item.create_at}`);
  });
  await browser.close();
}
scrapeing_proengineer();