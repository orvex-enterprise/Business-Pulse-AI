import Parser from 'rss-parser';

const parser = new Parser();

export async function fetchIndustryNews(industry: string): Promise<{ title: string; contentSnippet: string }[]> {
  try {
    const encodedIndustry = encodeURIComponent(industry);
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodedIndustry}&hl=en-US&gl=US&ceid=US:en`);
    return feed.items.slice(0, 5).map(item => ({
      title: item.title || '',
      contentSnippet: item.contentSnippet || '',
    }));
  } catch (error) {
    console.error('[News API] Error fetching news:', error);
    return [];
  }
}
