import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Autocomplete
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';
import { BASE_URL, UI_CONSTANTS, API_ENDPOINTS } from '../constants';

const FundChart = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedFund, setSelectedFund] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('line');
  const [timePeriod, setTimePeriod] = useState('daily');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  // Date filters - default to 1 month ago to today
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };
  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  const timePeriods = [
    { value: 'daily', label: '日线' },
    { value: 'weekly', label: '周线' },
    { value: 'monthly', label: '月线' },
    { value: 'yearly', label: '年线' }
  ];

  const chartTypes = [
    { value: 'line', label: '折线图' },
    { value: 'bar', label: '柱状图' }
  ];

  const handleSearch = async () => {
    // If a fund is already selected, just refresh the chart with current date filters
    if (selectedFund) {
      setLoading(true);
      setError('');
      try {
        await fetchChartData(selectedFund.id);
      } catch (err) {
        setError('获取图表数据失败');
        console.error('Chart refresh error:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise, search for a new fund
    if (!searchTerm.trim()) {
      setError('请输入基金ID或名称');
      return;
    }

    // Clear suggestions when search button is clicked
    setSuggestions([]);

    setLoading(true);
    setError('');

    try {
      // Search for fund by ID or name
      let fundData;
      if (/^\d+$/.test(searchTerm.trim())) {
        // Search by ID
        const response = await axios.get(`${BASE_URL}/api/rate/period/${searchTerm.trim()}`);
        fundData = response.data?.data;
      } else {
        // Search by name
        const response = await axios.get(`${BASE_URL}/api/rate/year/name/${encodeURIComponent(searchTerm.trim())}`);
        const data = response.data?.data;
        fundData = Array.isArray(data) ? data[0] : data;
      }

      if (fundData) {
        // Fetch company name if companyId exists
        if (fundData.companyId && !fundData.companyName) {
          try {
            const companyResponse = await axios.get(`${BASE_URL}/api/company/${fundData.companyId}`);
            if (companyResponse.data) {
              fundData.companyName = companyResponse.data.name || companyResponse.data.abbr;
            }
          } catch (companyErr) {
            console.log('Failed to fetch company info:', companyErr);
          }
        }
        setSelectedFund(fundData);
        await fetchChartData(fundData.id);
      } else {
        setError('未找到匹配的基金');
        setSelectedFund(null);
        setChartData([]);
      }
    } catch (err) {
      setError('搜索失败，请检查输入或稍后重试');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (fundId) => {
    try {
      // Try to fetch real data from API first
      try {
        const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.CHART_DATA(fundId, timePeriod, startDate, endDate)}`);
        console.log('Chart API Response:', response.data);
        console.log('Response type:', typeof response.data);
        console.log('Is Array?', Array.isArray(response.data));

        // Handle different response structures
        let priceData = response.data;

        // Check if data is wrapped in a property
        if (priceData && !Array.isArray(priceData)) {
          console.log('Response keys:', Object.keys(priceData));
          // Try common wrapper properties
          if (priceData.data && Array.isArray(priceData.data)) {
            priceData = priceData.data;
          } else if (priceData.content && Array.isArray(priceData.content)) {
            priceData = priceData.content;
          }
        }

        if (priceData && Array.isArray(priceData) && priceData.length > 0) {
          // Transform the data to match chart format with both price and accumulatedPrice
          console.log('Processing price data array, length:', priceData.length);
          console.log('First item:', priceData[0]);

          const transformedData = priceData.map(item => {
            // Handle nested priceIdentity structure
            let date = item.priceIdentity?.priceDate || item.priceDate || item.date;

            // Convert date to string if it's not already
            if (date && typeof date !== 'string') {
              // If it's a Date object or ISO string, format it
              date = new Date(date).toLocaleDateString('zh-CN');
            }

            const price = parseFloat(item.price) || 0;
            const accumulatedPrice = parseFloat(item.accumulatedPrice) || 0;

            console.log('Item:', { date, price, accumulatedPrice, dateType: typeof date });

            return {
              date: String(date),
              price: price,
              accumulatedPrice: accumulatedPrice,
            };
          });
          console.log('Transformed chart data:', transformedData);
          console.log('Sample transformed item:', transformedData[0]);

          if (transformedData.length > 0) {
            setChartData(transformedData);
          } else {
            console.log('No data after transformation');
          }
          return;
        } else {
          console.log('Data is not an array after unwrapping or is empty:', priceData);
          console.log('Array?', Array.isArray(priceData), 'Length:', priceData?.length);
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
      }

      // Fallback to mock data if API is not available
      // const mockData = generateMockChartData(timePeriod, startDate, endDate);
      // setChartData(mockData);
    } catch (err) {
      setError('获取图表数据失败');
      console.error('Chart data error:', err);
    }
  };

  // const generateMockChartData = (period, start, end) => {
  //   const data = [];
  //   const startDateTime = new Date(start);
  //   const endDateTime = new Date(end);
  //   const daysDiff = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60 * 24));

  //   let points = daysDiff;
  //   let increment = 1; // days

  //   switch (period) {
  //     case 'daily':
  //       increment = 1;
  //       break;
  //     case 'weekly':
  //       increment = 7;
  //       points = Math.ceil(daysDiff / 7);
  //       break;
  //     case 'monthly':
  //       increment = 30;
  //       points = Math.ceil(daysDiff / 30);
  //       break;
  //     case 'yearly':
  //       increment = 365;
  //       points = Math.ceil(daysDiff / 365);
  //       break;
  //   }

  //   let basePrice = 1.0;
  //   for (let i = 0; i <= points; i++) {
  //     const date = new Date(startDateTime);
  //     date.setDate(startDateTime.getDate() + (i * increment));

  //     // Skip if date is beyond end date
  //     if (date > endDateTime) break;

  //     let label = '';

  //     switch (period) {
  //       case 'daily':
  //         label = date.toLocaleDateString();
  //         break;
  //       case 'weekly':
  //         // Get the first day of the week (Monday)
  //         const dayOfWeek = date.getDay();
  //         const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  //         const firstDayOfWeek = new Date(date);
  //         firstDayOfWeek.setDate(date.getDate() + diff);
  //         label = firstDayOfWeek.toLocaleDateString();
  //         break;
  //       case 'monthly':
  //         label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  //         break;
  //       case 'yearly':
  //         label = date.getFullYear().toString();
  //         break;
  //     }

  //     // Generate realistic price movement
  //     // const change = (Math.random() - 0.5) * 0.1; // ±5% change
  //     // basePrice = basePrice * (1 + change);
  //     // const accumulatedPrice = basePrice * 1.2; // Accumulated price is typically higher

  //     data.push({
  //       date: label,
  //       price: parseFloat(basePrice.toFixed(4)),
  //       accumulatedPrice: parseFloat(accumulatedPrice.toFixed(4))
  //       // change: (change * 100).toFixed(2)
  //     });
  //   }

  //   return data;
  // };

  const handleTimePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setTimePeriod(newPeriod);
    if (selectedFund) {
      fetchChartData(selectedFund.id);
    }
  };

  // Auto-fetch chart data when time period changes
  useEffect(() => {
    if (selectedFund) {
      fetchChartData(selectedFund.id);
    }
  }, [timePeriod]);

  // Fetch suggestions with debounce
  const fetchSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.FUND_SEARCH(keyword, 10)}`);
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);

      // Try different response structures
      let funds = response.data;

      // Check if it's wrapped in a data property
      if (funds && funds.data && Array.isArray(funds.data)) {
        funds = funds.data;
      }

      // Ensure we always set an array
      if (Array.isArray(funds)) {
        console.log('Setting suggestions:', funds);
        console.log('Number of suggestions:', funds.length);
        setSuggestions(funds);
      } else {
        console.log('Response is not an array:', funds);
        console.log('Response keys:', Object.keys(funds || {}));
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (event, value, reason) => {
    setSearchTerm(value);

    if (reason === 'input') {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer for 1 second
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 1000);
    } else if (reason === 'clear') {
      setSuggestions([]);
    }
  };

  // Handle selection from autocomplete
  const handleAutocompleteChange = async (event, value) => {
    setSelectedValue(value);
    if (value) {
      if (typeof value === 'string') {
        setSearchTerm(value);
      } else if (value.id) {
        // If a fund object is selected, fetch its data immediately
        setSearchTerm(value.name);

        // Fetch company name if companyId exists
        if (value.companyId && !value.companyName) {
          try {
            const companyResponse = await axios.get(`${BASE_URL}/api/company/${value.companyId}`);
            if (companyResponse.data) {
              value.companyName = companyResponse.data.name || companyResponse.data.abbr;
            }
          } catch (companyErr) {
            console.log('Failed to fetch company info:', companyErr);
          }
        }

        setSelectedFund(value);
        fetchChartData(value.id);
        setSuggestions([]);
      }
    } else {
      setSearchTerm('');
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('State update - suggestions count:', suggestions.length);
  }, [suggestions]);

  // Debug: Log chart data changes
  useEffect(() => {
    console.log('Chart data updated, length:', chartData.length);
    if (chartData.length > 0) {
      console.log('First chart data item:', chartData[0]);
      console.log('All chart data:', chartData);
    }
  }, [chartData]);

  const renderChart = () => {
    console.log('renderChart called, chartData.length:', chartData.length);
    if (chartData.length === 0) {
      console.log('No chart data, returning null');
      return null;
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
      console.log('Rendering line chart with data:', commonProps);
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'price') return [value, '单位净值'];
                if (name === 'accumulatedPrice') return [value, '累计净值'];
                return [value, name];
              }}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              strokeWidth={2}
              name="单位净值"
              dot={true}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accumulatedPrice"
              stroke="#82ca9d"
              strokeWidth={2}
              name="累计净值"
              dot={true}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'price') return [value, '单位净值'];
                if (name === 'accumulatedPrice') return [value, '累计净值'];
                return [value, name];
              }}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Legend />
            <Bar dataKey="price" fill="#8884d8" name="单位净值" />
            <Bar dataKey="accumulatedPrice" fill="#82ca9d" name="累计净值" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        基金价格走势图
      </Typography>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Autocomplete
              freeSolo
              openOnFocus
              clearOnBlur={false}
              selectOnFocus
              handleHomeEndKeys
              value={selectedValue}
              options={suggestions}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if (option && option.name) {
                  return `${option.name} (${option.id})`;
                }
                return '';
              }}
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                if (typeof option === 'string' && typeof value === 'string') {
                  return option === value;
                }
                return option.id === value.id;
              }}
              filterOptions={(options) => options}
              inputValue={searchTerm}
              onInputChange={handleInputChange}
              onChange={handleAutocompleteChange}
              loading={loadingSuggestions}
              noOptionsText="未找到匹配的基金"
              loadingText="搜索中..."
              ListboxProps={{
                style: { maxHeight: '400px' }
              }}
              renderOption={(props, option) => {
                console.log('Rendering option:', option);
                return (
                  <li {...props} key={option.id || option}>
                    {typeof option === 'string' ? option : `${option.name} (${option.id})`}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="基金ID或名称"
                  variant="outlined"
                  placeholder="输入基金ID或名称进行搜索"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="开始日期"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="结束日期"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : (selectedFund ? '刷新' : '搜索')}
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>时间周期</InputLabel>
              <Select
                value={timePeriod}
                label="时间周期"
                onChange={handleTimePeriodChange}
              >
                {timePeriods.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <FormControl fullWidth>
              <InputLabel>图表类型</InputLabel>
              <Select
                value={chartType}
                label="图表类型"
                onChange={(e) => setChartType(e.target.value)}
              >
                {chartTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Fund Info */}
      {selectedFund && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              基金信息
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`ID: ${selectedFund.id}`} color="primary" />
              <Chip label={`名称: ${selectedFund.name}`} color="secondary" />
              {selectedFund.companyName && (
                <Chip label={`公司: ${selectedFund.companyName}`} color="default" />
              )}
              {selectedFund.type && (
                <Chip label={`类型: ${selectedFund.type}`} color="default" />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Chart Display */}
      {chartData.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {timePeriods.find(p => p.value === timePeriod)?.label}价格走势
          </Typography>
          {renderChart()}
        </Paper>
      )}

      {/* No Data Message */}
      {!loading && !error && !selectedFund && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            请输入基金ID或名称开始查看价格走势图
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default FundChart;
