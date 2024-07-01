const puppeteer = require('puppeteer');

const scrapeTags = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://nicovideo.and-es.net/video?o=views&p=1'; // 対象のウェブページのURL
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // タグを抽出
  const tagItems = await page.$$eval('ul li', items => {
    return items.map((item, index) => {
      const links = Array.from(item.querySelectorAll('div.mt-1.flex.flex-wrap a'));
      return links.map(link => ({
        index: index, // liタグのインデックス
        text: link.textContent.trim(), // リンクのテキスト
      }));
    }).flat();
  });

  const newsItems = await page.$$eval('ul li', items => {
    return items.map((item, index) => {
      const links = Array.from(item.querySelectorAll('a.font-bold'));
      return links.map(link => {
        const href = link.href;
        const match = href.match(/https:\/\/www\.nicovideo\.jp\/watch_tmp\/sm(\d+)/);
        if (href.includes('https://www.nicovideo.jp/watch_tmp')) {
          return {
            index: index, // liタグのインデックス
            text: link.textContent.trim(), // リンクのテキスト
            href: href // リンクのURL
          };
        }
        return null;
      }).filter(link => link !== null);
    }).flat();
  });

  // インデックスを再割り当て
  let currentIndex = -1;
  let currentRealIndex = -1;
  const adjustedTagItems = tagItems.map((item, i, arr) => {
    if (i === 0 || arr[i - 1].index !== item.index) {
      currentRealIndex++;
      currentIndex = currentRealIndex;
    }
    return {
      ...item,
      index: currentIndex,
    };
  });

  currentIndex = -1;
  currentRealIndex = -1;
  const adjustednewsItems = newsItems.map((item, i, arr) => {
    if (i === 0 || arr[i - 1].index !== item.index) {
      currentRealIndex++;
      currentIndex = currentRealIndex;
    }
    return {
      ...item,
      index: currentIndex,
      href: item.href.replace('https://www.nicovideo.jp/watch_tmp/sm', '') // ここで指定の部分を削除
    };
  });

  // デバッグ用出力
  console.log(adjustednewsItems[0]);
  console.log(adjustednewsItems[1]);
  console.log(adjustednewsItems[3]);
  console.log(adjustednewsItems[4]);
  adjustedTagItems.forEach(item => {
    if(item.index === 8) {
        console.log(`Index: ${item.index}, Text: ${item.text}`);
    }
  });

  await browser.close();
};

scrapeTags();