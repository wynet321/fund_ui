// API Configuration
export const BASE_URL = "http://localhost:9000/fund";

// Year Periods Configuration
export const YEAR_PERIODS = [
  { id: 0, name: "一年期", abbr: "one_year_rate", value: "oneYearRate" },
  { id: 1, name: "二年期", abbr: "two_year_rate", value: "twoYearRate" },
  { id: 2, name: "三年期", abbr: "three_year_rate", value: "threeYearRate" },
  { id: 3, name: "四年期", abbr: "four_year_rate", value: "fourYearRate" },
  { id: 4, name: "五年期", abbr: "five_year_rate", value: "fiveYearRate" },
  { id: 5, name: "六年期", abbr: "six_year_rate", value: "sixYearRate" },
  { id: 6, name: "七年期", abbr: "seven_year_rate", value: "sevenYearRate" },
  { id: 7, name: "八年期", abbr: "eight_year_rate", value: "eightYearRate" },
  { id: 8, name: "九年期", abbr: "nine_year_rate", value: "nineYearRate" },
  { id: 9, name: "十年期", abbr: "ten_year_rate", value: "tenYearRate" }
];

// Fund Types Configuration
export const FUND_TYPES = [
  { id: 0, name: "混合型", value: "混合型" },
  { id: 1, name: "股票型", value: "股票型" },
  { id: 2, name: "债券型", value: "债券型" },
  { id: 3, name: "QDII", value: "QDII" },
  { id: 4, name: "短期理财债券型", value: "短期理财债券型" }
];

// UI Constants
export const UI_CONSTANTS = {
  APP_TITLE: "基金查询系统",
  FUND_SEARCH_TITLE: "基金搜索",
  FUND_LIST_TITLE: "年限基金对比列表",
  NAVIGATION: {
    FUND_COMPARISON: "年限基金对比",
    FUND_SEARCH: "基金搜索",
    FUND_CHART: "价格走势图"
  },
  SEARCH: {
    PLACEHOLDER: "输入基金ID或名称进行搜索",
    LABEL: "基金ID或名称",
    BUTTON_TEXT: "搜索",
    ERROR_MESSAGES: {
      EMPTY_INPUT: "请输入基金ID或名称",
      NOT_FOUND: "未找到匹配的基金",
      NOT_FOUND_BY_ID: "未找到该基金ID",
      NOT_FOUND_BY_NAME: "未找到匹配的基金名称",
      SEARCH_FAILED: "搜索失败，请检查输入或稍后重试"
    }
  },
  TABLE: {
    HEADERS: {
      ID: "ID",
      NAME: "名称",
      COMPANY_NAME: "公司名称",
      TYPE: "类型"
    },
    STYLES: {
      HEADER_BACKGROUND: "lightblue"
    }
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    DEFAULT_PAGE_NUMBER: 0
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  RATE_PERIOD: (fundId) => `/api/rate/period/${fundId}`,
  RATE_YEAR_NAME: (fundName) => `/api/rate/year/name/${encodeURIComponent(fundName)}`,
  RATE_PERIOD_RATE: (type, page, size, sort) => `/api/rate/period_rate/${encodeURIComponent(type)}?page=${page}&size=${size}&sort=${sort},desc`,
  CHART_DATA: (fundId, period, startDate, endDate) => {
    let url = `/api/chart/data/${fundId}?period=${period}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return url;
  },
  FUND_SEARCH: (keyword, limit = 10) => `/api/fund/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`
};

// Utility Functions
export const getYearFieldName = (yearIndex) => {
  const yearFields = ['oneYearRate', 'twoYearRate', 'threeYearRate', 'fourYearRate', 'fiveYearRate', 'sixYearRate', 'sevenYearRate', 'eightYearRate', 'nineYearRate', 'tenYearRate'];
  return yearFields[yearIndex] || 'oneYearRate';
};

export const formatRate = (rate) => {
  return rate ? (rate * 100).toFixed(2) + '%' : '-';
};

export const convertAbbrToCamelCase = (abbr) => {
  return abbr.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};
