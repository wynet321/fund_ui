import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  TextField,
  Box,
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import { Link } from 'react-router-dom';

const baseUrl = "http://localhost:9000/fund";
const year = [
  { id: 0, name: "一年期", abbr: "oneyearrate" },
  { id: 1, name: "三年期", abbr: "threeyearrate" },
  { id: 2, name: "五年期", abbr: "fiveyearrate" },
  { id: 3, name: "七年期", abbr: "sevenyearrate" },
  { id: 4, name: "十年期", abbr: "tenyearrate" }
];

export default function FundSearch() {
  const [fundList, setFundList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('请输入基金ID或名称');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Try to search by ID first (assuming it's numeric)
      if (/^\d+$/.test(searchTerm.trim())) {
        await searchByFundId(searchTerm.trim());
      } else {
        // Search by name (partial match)
        await searchByFundName(searchTerm.trim());
      }
    } catch (err) {
      setError('搜索失败，请检查输入或稍后重试');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchByFundId = async (fundId) => {
    try {
      const response = await axios.get(`${baseUrl}/api/rate/period/${fundId}`);
      if (response.data && response.data.data) {
        setFundList([response.data.data]);
      } else {
        setFundList([]);
        setError('未找到该基金ID');
      }
    } catch (err) {
      // If ID search fails, try name search
      await searchByFundName(fundId);
    }
  };

  const searchByFundName = async (fundName) => {
    try {
      const response = await axios.get(`${baseUrl}/api/rate/year/name/${encodeURIComponent(fundName)}`);
      if (response.data && response.data.data) {
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setFundList(data);
      } else {
        setFundList([]);
        setError('未找到匹配的基金名称');
      }
    } catch (err) {
      setFundList([]);
      setError('未找到匹配的基金');
    }
  };

  const sortFundsByYear = (funds) => {
    if (!funds || funds.length === 0) return funds;
    console.log(funds);
    const yearField = getYearField(selectedYear);
    return [...funds].sort((a, b) => {
      const rateA = a[yearField] || 0;
      const rateB = b[yearField] || 0;
      return rateB - rateA; // Descending order
    });
  };

  const getYearField = (yearIndex) => {
    const yearFields = ['oneYearRate', 'threeYearRate', 'fiveYearRate', 'sevenYearRate', 'tenYearRate'];
    return yearFields[yearIndex] || 'oneYearRate';
  };

  const sortedFundList = sortFundsByYear(fundList);

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            基金查询系统
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              年限基金对比
            </Button>
            <Button color="inherit" component={Link} to="/search">
              基金搜索
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Typography sx={{ marginTop: '20px', marginLeft: '20px' }} variant="h3" gutterBottom>
        基金搜索
      </Typography>

      <Box sx={{ margin: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="基金ID或名称"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="输入基金ID或名称进行搜索"
          sx={{ minWidth: '300px' }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{ minWidth: '100px' }}
        >
          {loading ? <CircularProgress size={20} /> : '搜索'}
        </Button>

        <Select
          value={selectedYear}
          label="排序年限"
          size='small'
          onChange={(event) => setSelectedYear(event.target.value)}
          sx={{ minWidth: '120px' }}
        >
          {year.map((row) => (
            <MenuItem key={row.id} value={row.id}>{row.name}</MenuItem>
          ))}
        </Select>
      </Box>

      {error && (
        <Alert severity="error" sx={{ margin: '0 20px 20px 20px' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div style={{ left: '50%', top: '50%', position: 'absolute' }}>
          <CircularProgress />
        </div>
      ) : hasSearched && (
        <Card sx={{ margin: '20px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              搜索结果 ({sortedFundList.length} 个基金)
            </Typography>
            {sortedFundList.length > 0 ? (
              <Table size='small'>
                <TableHead sx={{ background: 'lightblue' }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>名称</TableCell>
                    {year.map((row) => (
                      <TableCell key={row.id} align="right">{row.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedFundList.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.id}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">
                        {row.oneYearRate ? (row.oneYearRate * 100).toFixed(2) + '%' : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.threeYearRate ? (row.threeYearRate * 100).toFixed(2) + '%' : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.fiveYearRate ? (row.fiveYearRate * 100).toFixed(2) + '%' : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.sevenYearRate ? (row.sevenYearRate * 100).toFixed(2) + '%' : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.tenYearRate ? (row.tenYearRate * 100).toFixed(2) + '%' : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body1" color="text.secondary">
                未找到匹配的基金
              </Typography>
            )}
          </CardContent>
          <CardActions>
          </CardActions>
        </Card>
      )}
    </div>
  );
}
