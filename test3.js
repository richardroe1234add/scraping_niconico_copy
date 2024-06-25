const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(filepath);
      reject(err.message);
    });
  });
};

const scrapeNewsItems = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://nicovideo.and-es.net/video?o=views&p=1'; // 対象のウェブページのURLに置き換えてください
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // ulタグの下にあるliタグの中にあるaタグのリンクとテキストを抽出
  const newsItems = await page.$$eval('ul li a', links => {
    return links.map(link => {
      const href = link.href;
      const match = href.match(/https:\/\/www\.nicovideo\.jp\/watch_tmp\/sm(\d+)/);
      return match ? {
        title: link.textContent.trim(), // リンクのテキスト
        href: match[1] // 正しい形のリンクから番号だけ抽出 (smを除外)
      } : null;
    }).filter(item => item !== null && item.title !== '');
  });

  // spanタグの中身を出力
  const spans = await page.$$eval('ul li span.mr-2', spans => {
    return spans.map(span => span.textContent.trim());
  });

  const test = await page.$$eval('ul li div.mt-1.flex.flex-wrap.gap-2.block a', spans => {
    return spans.map(span => span.textContent.trim());
  });
console.log(test)
  // 日付をdatetime型に加工してnewsItemsに追加
  newsItems.forEach((item, index) => {
    const rawDate = spans[index].replace(/<!--.*?-->/g, '').trim();
    const formattedDate = rawDate.replace(/\//g, '-').replace(' ', 'T') + ':00';
    item.date = formattedDate;
  });

  const downloadPath = 'C:\\Users\\81903\\Desktop\\作成物\\新しいフォルダー\\スクレイピング\\picture';

  // 画像をダウンロードして保存
  for (const item of newsItems) {
    const imageUrl = `https://nicovideo.cdn.nimg.jp/thumbnails/${item.href}/${item.href}`;
    const filename = path.join(downloadPath, `${item.href}.jpg`);
    try {
      await downloadImage(imageUrl, filename);
      // console.log(`Downloaded: ${filename}`);
    } catch (err) {
      // console.error(`Error downloading ${imageUrl}: ${err}`);
    }
    // INSERT文の生成
    const insertQuery = `INSERT INTO niconico_data (title, No, date) VALUES ('${item.title}', ${item.href}, '${item.date}');`;
    console.log(insertQuery);
  }

  await browser.close();
};

scrapeNewsItems();