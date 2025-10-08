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
  const [rateChange, setRateChange] = useState(null);
  const [dailyInvest, setDailyInvest] = useState('');
  const [investDays, setInvestDays] = useState('');
  const [investResult, setInvestResult] = useState(null);

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
        const raw = response.data;
        fundData = raw && raw.data !== undefined ? raw.data : raw;
      } else {
        // Search by name
        const response = await axios.get(`${BASE_URL}/api/rate/year/name/${encodeURIComponent(searchTerm.trim())}`);
        const raw = response.data;
        const data = raw && raw.data !== undefined ? raw.data : raw;
        fundData = Array.isArray(data) ? data[0] : data;
      }
      if (fundData) {
        // Fetch company name if companyId exists
        if (fundData.companyId) {
          try {
            const companyResponse = await axios.get(`${BASE_URL}/api/company/${fundData.companyId}`);
            const company = companyResponse.data;
            if (company) {
              fundData.companyName = company.name || company.abbr;
            }
          } catch (companyErr) {
            // Failed to fetch company info
            console.error("Failed to fetch company info:", companyErr)
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
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (fundId) => {
    try {
      // Try to fetch real data from API first
      try {
        const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.CHART_DATA(fundId, timePeriod, startDate, endDate)}`);

        // Handle different response structures
        let priceData = response.data;

        // Check if data is wrapped in a property
        if (priceData && !Array.isArray(priceData)) {
          // Try common wrapper properties
          if (priceData.data && Array.isArray(priceData.data)) {
            priceData = priceData.data;
          } else if (priceData.content && Array.isArray(priceData.content)) {
            priceData = priceData.content;
          }
        }

        if (priceData && Array.isArray(priceData) && priceData.length > 0) {
          // Transform the data to match chart format with both price and accumulatedPrice

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

            return {
              date: String(date),
              price: price,
              accumulatedPrice: accumulatedPrice,
            };
          });

          if (transformedData.length > 0) {
            setChartData(transformedData);
            // Calculate rate change between start and end date
            if (transformedData.length >= 2) {
              const startPrice = transformedData[0].accumulatedPrice;
              const endPrice = transformedData[transformedData.length - 1].accumulatedPrice;
              if (startPrice > 0) {
                const rate = ((endPrice - startPrice) / startPrice * 100).toFixed(2);
                setRateChange(rate);
              } else {
                setRateChange(null);
              }
            } else {
              setRateChange(null);
            }
          }
          return;
        }
      } catch (apiError) {
        // API not available
        console.error('API not available:', apiError);
      }
    } catch (err) {
      setError('获取图表数据失败');
    }
  };

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
  }, [timePeriod, selectedFund]);

  // Calculate investment result
  const calculateInvestment = () => {
    if (!dailyInvest || !investDays || chartData.length === 0) {
      setError('请输入每日投资金额和投资天数，并确保已加载图表数据');
      return;
    }

    const dailyAmount = parseFloat(dailyInvest);
    const days = parseInt(investDays);

    if (isNaN(dailyAmount) || dailyAmount <= 0) {
      setError('请输入有效的每日投资金额');
      return;
    }

    if (isNaN(days) || days <= 0) {
      setError('请输入有效的投资天数');
      return;
    }

    // Limit days to available data
    const actualDays = Math.min(days, chartData.length);
    let totalShares = 0;

    // Calculate total shares accumulated
    for (let i = 0; i < actualDays; i++) {
      const dayPrice = chartData[i].price;
      if (dayPrice > 0) {
        totalShares += dailyAmount / dayPrice;
      }
    }

    // Calculate final value using end date price
    const endPrice = chartData[chartData.length - 1].price;
    const finalValue = totalShares * endPrice;
    const totalInvested = dailyAmount * actualDays;
    const profit = finalValue - totalInvested;
    const profitRate = (profit / totalInvested * 100).toFixed(2);

    setInvestResult({
      totalInvested: totalInvested.toFixed(2),
      finalValue: finalValue.toFixed(2),
      profit: profit.toFixed(2),
      profitRate: profitRate,
      actualDays: actualDays,
      totalShares: totalShares.toFixed(4)
    });
    setError('');
  };

  // Fetch suggestions with debounce
  const fetchSuggestions = async (keyword) => {
    if (!keyword || keyword.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.FUND_SEARCH(keyword, 10)}`);

      // Try different response structures
      let funds = response.data;

      // Check if it's wrapped in a data property
      if (funds && funds.data && Array.isArray(funds.data)) {
        funds = funds.data;
      }

      // Ensure we always set an array
      if (Array.isArray(funds)) {
        setSuggestions(funds);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
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
        if (value.companyId) {
          try {
            const companyResponse = await axios.get(`${BASE_URL}/api/company/${value.companyId}`);
            const company = companyResponse.data;
            if (company) {
              value.companyName = company.name || company.abbr;
            }
          } catch (companyErr) {
            // Failed to fetch company info
            console.error('Failed to fetch company info:', companyErr);
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


  const renderChart = () => {
    if (chartData.length === 0) {
      return null;
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
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
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
              <Chip label={`ID: ${selectedFund.id}`} color="primary" variant="filled" />
              <Chip label={`名称: ${selectedFund.name}`} color="secondary" variant="filled" />
              {selectedFund.companyName && (
                <Chip
                  label={`公司: ${selectedFund.companyName}`}
                  color="info"
                  variant="filled"
                />
              )}
              {selectedFund.type && (
                <Chip label={`类型: ${selectedFund.type}`} color="default" variant="outlined" />
              )}
              {rateChange !== null && (
                <Chip
                  label={`涨跌幅: ${rateChange}%`}
                  color={parseFloat(rateChange) >= 0 ? "error" : "success"}
                  variant="filled"
                />
              )}
            </Box>

            {/* Investment Calculator */}
            {chartData.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  定投计算器
                </Typography>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="每日投资金额"
                      type="number"
                      value={dailyInvest}
                      onChange={(e) => setDailyInvest(e.target.value)}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      size="small"
                      helperText={`元`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="投资天数"
                      type="number"
                      value={investDays}
                      onChange={(e) => setInvestDays(e.target.value)}
                      InputProps={{
                        inputProps: { min: 1, step: 1 }
                      }}
                      size="small"
                      helperText={`最多 ${chartData.length} 天`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={calculateInvestment}
                      size="medium"
                      sx={{ height: '40px' }}
                    >
                      计算
                    </Button>
                  </Grid>
                </Grid>

                {/* Investment Result */}
                {investResult && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                      计算结果
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          投资天数: <strong>{investResult.actualDays}</strong> 天
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          总投资: <strong>¥{investResult.totalInvested}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          累计份额: <strong>{investResult.totalShares}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          最终价值: <strong>¥{investResult.finalValue}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color={parseFloat(investResult.profit) >= 0 ? 'success.main' : 'error.main'}>
                          收益: <strong>¥{investResult.profit}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color={parseFloat(investResult.profitRate) >= 0 ? 'success.main' : 'error.main'}>
                          收益率: <strong>{investResult.profitRate}%</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
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
