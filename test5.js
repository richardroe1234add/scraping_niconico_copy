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
        console.log(match)
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

//   const newsItems = await page.$$eval('ul li a', links => {
//     return links.map(link => {
//       const href = link.href;
//       const match = href.match(/https:\/\/www\.nicovideo\.jp\/watch_tmp\/sm(\d+)/);
//       return match ? {
//         title: link.textContent.trim(), // リンクのテキスト
//         href: match[1] // 正しい形のリンクから番号だけ抽出 (smを除外)
//       } : null;
//     }).filter(item => item !== null && item.title !== '');
//   });

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
    };
  });
console.log(adjustednewsItems[0])
console.log(adjustednewsItems[1])
console.log(adjustednewsItems[2])
console.log(adjustednewsItems[3])
console.log(adjustednewsItems[4])
console.log(adjustednewsItems[5])
console.log(adjustednewsItems[6])
console.log(adjustednewsItems[7])
console.log(adjustednewsItems[8])
console.log(adjustednewsItems[9])
console.log(adjustednewsItems[10])
//   // forEachでadjustedTagItemsを回す
  adjustedTagItems.forEach(item => {
    if(item.index === 8) {
        console.log(`Index: ${item.index}, Text: ${item.text}`);
    }
    // console.log(`Index: ${item.index}, Text: ${item.text}`);
  });

  await browser.close();
};

scrapeTags();