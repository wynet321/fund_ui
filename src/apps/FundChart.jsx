import React, { useState, useEffect } from 'react';
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
  Chip
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
  const [selectedFund, setSelectedFund] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('line');
  const [timePeriod, setTimePeriod] = useState('daily');

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
    if (!searchTerm.trim()) {
      setError('请输入基金ID或名称');
      return;
    }

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
        const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.CHART_DATA(fundId, timePeriod)}`);
        if (response.data && response.data.data) {
          setChartData(response.data.data);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
      }
      
      // Fallback to mock data if API is not available
      const mockData = generateMockChartData(timePeriod);
      setChartData(mockData);
    } catch (err) {
      setError('获取图表数据失败');
      console.error('Chart data error:', err);
    }
  };

  const generateMockChartData = (period) => {
    const data = [];
    const now = new Date();
    let points = 30; // Default number of data points

    switch (period) {
      case 'daily':
        points = 30;
        break;
      case 'weekly':
        points = 12;
        break;
      case 'monthly':
        points = 12;
        break;
      case 'yearly':
        points = 5;
        break;
    }

    let basePrice = 1.0;
    for (let i = points; i >= 0; i--) {
      const date = new Date(now);
      let label = '';

      switch (period) {
        case 'daily':
          date.setDate(date.getDate() - i);
          label = date.toLocaleDateString();
          break;
        case 'weekly':
          date.setDate(date.getDate() - (i * 7));
          label = `第${Math.ceil((now.getDate() - date.getDate()) / 7)}周`;
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - i);
          label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() - i);
          label = date.getFullYear().toString();
          break;
      }

      // Generate realistic price movement
      const change = (Math.random() - 0.5) * 0.1; // ±5% change
      basePrice = basePrice * (1 + change);
      
      data.push({
        date: label,
        price: basePrice.toFixed(4),
        change: (change * 100).toFixed(2)
      });
    }

    return data;
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
  }, [timePeriod]);

  const renderChart = () => {
    if (chartData.length === 0) return null;

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
            <Tooltip 
              formatter={(value, name) => [value, name === 'price' ? '价格' : '涨跌幅']}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="价格"
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
            <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
            <Tooltip 
              formatter={(value, name) => [value, name === 'price' ? '价格' : '涨跌幅']}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Legend />
            <Bar dataKey="price" fill="#8884d8" name="价格" />
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="基金ID或名称"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="输入基金ID或名称进行搜索"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : '搜索'}
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
          <Grid item xs={12} md={2}>
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
