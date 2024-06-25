const puppeteer = require('puppeteer');

const scrapeNewsItems = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://sonaeru.jp/news/'; // 対象のウェブページのURLに置き換えてください
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // h2タグで囲まれたaタグのリンクとテキストを抽出
  const newsItems = await page.$$eval('.list-main h2 a', links => {
    return links.map(link => ({
      title: link.textContent.trim(), // リンクのテキスト
      href: link.href // リンクのURL
    }));
  });

  console.log(newsItems);
  await browser.close();
};

scrapeNewsItems();

