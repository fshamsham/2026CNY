import { VideoData } from '../types';
import { SHEET_URL } from '../constants';

/**
 * Robust CSV parser that handles quoted fields, escaped quotes, and newlines within fields.
 */
function parseCSV(csv: string): string[][] {
  const result: string[][] = [];
  let currentColumn = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentColumn += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentColumn);
      currentColumn = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentColumn);
      if (currentRow.length > 0) {
        result.push(currentRow);
      }
      currentRow = [];
      currentColumn = '';
    } else {
      currentColumn += char;
    }
  }

  if (currentRow.length > 0 || currentColumn !== '') {
    currentRow.push(currentColumn);
    result.push(currentRow);
  }

  return result;
}

export async function fetchVideoData(): Promise<VideoData[]> {
  try {
    const cacheBuster = `&t=${Date.now()}`;
    const response = await fetch(`${SHEET_URL}${cacheBuster}`);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    if (rows.length < 1) {
      console.warn('Data fetch returned completely empty CSV.');
      return [];
    }

    // Attempt to find the header row (sometimes sheets have empty rows at the top)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const rowStr = rows[i].join(',').toLowerCase();
      if (rowStr.includes('videotitle') || rowStr.includes('videourl')) {
        headerRowIndex = i;
        break;
      }
    }

    // Default to the first row if no obvious header row found
    if (headerRowIndex === -1) {
      headerRowIndex = 0;
    }

    const headers = rows[headerRowIndex].map(h => h.trim());
    const dataRows = rows.slice(headerRowIndex + 1);
    
    const numericFields = [
      'views', 'likes', 'comments', 'durationsec', 
      'viewrank', 'dayssincepublished', 'viewsperday', 
      'trendingrank', 'rankmomentum'
    ];

    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      const cleanHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      headerMap[cleanHeader] = i;
    });

    const results = dataRows.map((row) => {
      const entry: any = {
        PublishDate: '',
        VideoTitle: '',
        ChannelName: '',
        ChannelAvatar: '',
        VideoDescription: '',
        Views: 0,
        Likes: 0,
        Comments: 0,
        VideoURL: '',
        Thumbnail: '',
        Duration: '',
        DurationSec: 0,
        ViewRank: 0,
        DaysSincePublished: 0,
        ViewsPerDay: 0,
        TrendingRank: 0,
        RankMomentum: 0,
        CreativeAdvice: '',
        LastDataUpdate: ''
      };

      const getVal = (key: string) => {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const idx = headerMap[cleanKey];
        return (idx !== undefined && row[idx] !== undefined) ? row[idx] : undefined;
      };

      Object.keys(entry).forEach(key => {
        const value = getVal(key);
        const lowerKey = key.toLowerCase();

        if (numericFields.includes(lowerKey)) {
          const str = String(value || '0').replace(/[^0-9.-]/g, '').trim();
          const num = parseFloat(str);
          entry[key] = isNaN(num) ? 0 : num;
        } else {
          entry[key] = value !== undefined ? String(value).trim() : '';
        }
      });

      // Fallback description
      if (!entry.VideoDescription && entry.CreativeAdvice) {
        entry.VideoDescription = entry.CreativeAdvice;
      }

      return entry as VideoData;
    }).filter(v => v.VideoTitle && (v.VideoURL || v.Thumbnail));

    if (results.length === 0) {
      console.warn('No valid video records found after filtering. Raw headers found:', headers);
    }

    return results;
  } catch (error) {
    console.error('CRITICAL: Error fetching or parsing data:', error);
    throw error;
  }
}