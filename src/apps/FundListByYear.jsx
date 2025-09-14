import { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Typography, Select, MenuItem, CardActions, Button, Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, AppBar, Toolbar, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const baseUrl = "http://localhost:9000/fund";
const year = [
  { id: 0, name: "一年期", value: "oneYearRate" },
  { id: 1, name: "三年期", value: "threeYearRate" },
  { id: 2, name: "五年期", value: "fiveYearRate" },
  { id: 3, name: "七年期", value: "sevenYearRate" },
  { id: 4, name: "十年期", value: "tenYearRate" }
];
const fundTypes = [
  { id: 0, name: "混合型", value: "混合型" },
  { id: 1, name: "股票型", value: "股票型" },
  { id: 2, name: "债券型", value: "债券型" },
  { id: 3, name: "QDII", value: "QDII" },
  { id: 4, name: "短期理财债券型", value: "短期理财债券型" }
];

export default function FundListByYear() {

  var React = require('react');
  const [fundList, setFundList] = useState([]);
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedFundType, setSelectedFundType] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFundListByYear(year[selectedYear].value, fundTypes[selectedFundType].value, 50, 0);
  }, [selectedYear, selectedFundType]);

  async function getFundListByYear(yearValue, type, pageSize, pageNumber) {
    setLoading(true)
    await axios.get(`${baseUrl}/api/rate/periodrate/${encodeURIComponent(type)}?page=${pageNumber}&size=${pageSize}&sort=${yearValue},desc`).then((response) => {
      setFundList(response.data.data.content);
    })
    setLoading(false)
  };

  const getYearFieldName = (yearValue) => {
    const fieldMap = {
      0: 'oneYearRate',
      1: 'threeYearRate',
      2: 'fiveYearRate',
      3: 'sevenYearRate',
      4: 'tenYearRate'
    };
    return fieldMap[yearValue] || 'oneYearRate';
  };

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
        年限基金对比列表
      </Typography>
      <Select
        sx={{ marginLeft: "20px" }}
        value={selectedYear}
        label="统计年限"
        size='small'
        onChange={(event) => setSelectedYear(event.target.value)}
      >
        {year.map((row) => (
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
        {fundTypes.map((row) => (
          <MenuItem key={row.id} value={row.id}>{row.name}</MenuItem>)
        )
        }
      </Select>
      {loading ? <div style={{ left: '50%', top: '50%', position: 'absolute' }}><CircularProgress /></div> : <div>

        <Card sx={{ margin: '20px' }}>
          <CardContent>
            <Table size='small'>
              <TableHead sx={{ background: 'lightblue' }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>公司名称</TableCell>
                  <TableCell>类型</TableCell>
                  {year.map((row) => (<TableCell key={row.id} align="right">{row.name}</TableCell>))}
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
                    {year.map((yearItem) => {
                      const fieldName = getYearFieldName(yearItem.value);
                      const rate = row[fieldName];
                      return (
                        <TableCell key={yearItem.id} align="right">
                          {rate ? (rate * 100).toFixed(2) + '%' : '-'}
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