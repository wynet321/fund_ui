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
import {
  BASE_URL,
  YEAR_PERIODS,
  UI_CONSTANTS,
  API_ENDPOINTS,
  formatRate
} from '../constants';

export default function FundSearch() {
  const [fundList, setFundList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError(UI_CONSTANTS.SEARCH.ERROR_MESSAGES.EMPTY_INPUT);
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
      setError(UI_CONSTANTS.SEARCH.ERROR_MESSAGES.SEARCH_FAILED);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchByFundId = async (fundId) => {
    try {
      const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.RATE_PERIOD(fundId)}`);
      if (response.data && response.data.data) {
        setFundList([response.data.data]);
      } else {
        setFundList([]);
        setError(UI_CONSTANTS.SEARCH.ERROR_MESSAGES.NOT_FOUND_BY_ID);
      }
    } catch (err) {
      // If ID search fails, try name search
      await searchByFundName(fundId);
    }
  };

  const searchByFundName = async (fundName) => {
    try {
      const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.RATE_YEAR_NAME(fundName)}`);
      if (response.data && response.data.data) {
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setFundList(data);
      } else {
        setFundList([]);
        setError(UI_CONSTANTS.SEARCH.ERROR_MESSAGES.NOT_FOUND_BY_NAME);
      }
    } catch (err) {
      setFundList([]);
      setError(UI_CONSTANTS.SEARCH.ERROR_MESSAGES.NOT_FOUND);
    }
  };

  const sortFundsByYear = (funds) => {
    if (!funds || funds.length === 0) return funds;
    console.log(funds);
    const yearField = YEAR_PERIODS[selectedYear].value;
    return [...funds].sort((a, b) => {
      const rateA = a[yearField] || 0;
      const rateB = b[yearField] || 0;
      return rateB - rateA; // Descending order
    });
  };

  const sortedFundList = sortFundsByYear(fundList);

  return (
    <div>
      {/* <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {UI_CONSTANTS.APP_TITLE}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              {UI_CONSTANTS.NAVIGATION.FUND_COMPARISON}
            </Button>
            <Button color="inherit" component={Link} to="/search">
              {UI_CONSTANTS.NAVIGATION.FUND_SEARCH}
            </Button>
          </Box>
        </Toolbar>
      </AppBar> */}
      <Typography sx={{ marginTop: '20px', marginLeft: '20px' }} variant="h3" gutterBottom>
        {UI_CONSTANTS.FUND_SEARCH_TITLE}
      </Typography>

      <Box sx={{ margin: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label={UI_CONSTANTS.SEARCH.LABEL}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={UI_CONSTANTS.SEARCH.PLACEHOLDER}
          sx={{ minWidth: '300px' }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{ minWidth: '100px' }}
        >
          {loading ? <CircularProgress size={20} /> : UI_CONSTANTS.SEARCH.BUTTON_TEXT}
        </Button>

        <Select
          value={selectedYear}
          label="排序年限"
          size='small'
          onChange={(event) => setSelectedYear(event.target.value)}
          sx={{ minWidth: '120px' }}
        >
          {YEAR_PERIODS.map((row) => (
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
                <TableHead sx={{ background: UI_CONSTANTS.TABLE.STYLES.HEADER_BACKGROUND }}>
                  <TableRow>
                    <TableCell>{UI_CONSTANTS.TABLE.HEADERS.ID}</TableCell>
                    <TableCell>{UI_CONSTANTS.TABLE.HEADERS.NAME}</TableCell>
                    {YEAR_PERIODS.map((row) => (
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
                      {YEAR_PERIODS.map((yearItem) => {
                        return (
                          <TableCell key={yearItem.id} align="right">
                            {formatRate(row[yearItem.value])}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body1" color="text.secondary">
                {UI_CONSTANTS.SEARCH.ERROR_MESSAGES.NOT_FOUND}
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
