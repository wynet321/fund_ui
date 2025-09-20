import { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Typography, Select, MenuItem, CardActions, Button, Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, AppBar, Toolbar, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  BASE_URL,
  YEAR_PERIODS,
  FUND_TYPES,
  UI_CONSTANTS,
  API_ENDPOINTS,
  formatRate
} from '../constants';

export default function FundListByYear() {

  var React = require('react');
  const [fundList, setFundList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedFundType, setSelectedFundType] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFundListByYear(YEAR_PERIODS[selectedYear].value, FUND_TYPES[selectedFundType].value, UI_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE, UI_CONSTANTS.PAGINATION.DEFAULT_PAGE_NUMBER);
  }, [selectedYear, selectedFundType]);

  async function getFundListByYear(yearValue, type, pageSize, pageNumber) {
    setLoading(true)
    await axios.get(`${BASE_URL}${API_ENDPOINTS.RATE_PERIOD_RATE(type, pageNumber, pageSize, yearValue)}`).then((response) => {
      setFundList(response.data.data.content);
    })
    setLoading(false)
  };


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
        {UI_CONSTANTS.FUND_LIST_TITLE}
      </Typography>
      <Select
        sx={{ marginLeft: "20px" }}
        value={selectedYear}
        label="统计年限"
        size='small'
        onChange={(event) => setSelectedYear(event.target.value)}
      >
        {YEAR_PERIODS.map((row) => (
          <MenuItem key={row.id} value={row.id}>{row.name}</MenuItem>)
        )
        }
      </Select>
      <Select
        sx={{ marginLeft: "20px" }}
        value={selectedFundType}
        label="基金类型"
        size='small'
        onChange={(event) => setSelectedFundType(event.target.value)}
      >
        {FUND_TYPES.map((row) => (
          <MenuItem key={row.id} value={row.id}>{row.name}</MenuItem>)
        )
        }
      </Select>
      {loading ? <div style={{ left: '50%', top: '50%', position: 'absolute' }}><CircularProgress /></div> : <div>

        <Card sx={{ margin: '20px' }}>
          <CardContent>
            <Table size='small'>
              <TableHead sx={{ background: UI_CONSTANTS.TABLE.STYLES.HEADER_BACKGROUND }}>
                <TableRow>
                  <TableCell>{UI_CONSTANTS.TABLE.HEADERS.ID}</TableCell>
                  <TableCell>{UI_CONSTANTS.TABLE.HEADERS.NAME}</TableCell>
                  <TableCell>{UI_CONSTANTS.TABLE.HEADERS.COMPANY_NAME}</TableCell>
                  <TableCell>{UI_CONSTANTS.TABLE.HEADERS.TYPE}</TableCell>
                  {YEAR_PERIODS.map((row) => (<TableCell key={row.id} align="right">{row.name}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {fundList ? fundList.map((row) => (
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
                    <TableCell component="th" scope="row">
                      {row.companyName}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.type}
                    </TableCell>
                    {YEAR_PERIODS.map((yearItem) => {
                      const rate = row[yearItem.value];
                      return (
                        <TableCell key={yearItem.id} align="right">
                          {formatRate(rate)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )) : null}
              </TableBody>
            </Table>
          </CardContent>
          <CardActions>
          </CardActions>
        </Card></div>}
    </div>
  );
}